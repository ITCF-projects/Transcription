global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Builder;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Hosting;
global using System;
global using System.Collections.Generic;
global using Microsoft.Extensions.Configuration;
global using System.Linq;
global using System.Threading.Tasks;

using API;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Identity.Web;
using Common;
using Common.Impl;
using System.Text.Json.Nodes;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = long.MaxValue; // if don't set default value is: 30 MB
});
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = long.MaxValue; // if don't set default value is: 30 MB
});
builder.Services.AddHttpContextAccessor();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));


builder.Services.AddAuthorizationBuilder()
  .AddPolicy("api_auth_policy", policy =>
        policy
            .RequireAuthenticatedUser()
            .RequireClaim("http://schemas.microsoft.com/identity/claims/scope", "access_as_user"));


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddMySwaggerGen(builder.Configuration);
builder.Services.AddCors();
builder.Services.AddTransient<FileHandler>();
builder.Services.AddTransient<IFileSystem,FileSystem>();
builder.Services.AddTransient<IAuditLog, AuditLogger>();
builder.Services.AddTransient<IAuditLogSettings, AuditLogSettings>();

var app = builder.Build();
app.UseCors(options => options.WithOrigins("*").AllowAnyMethod().AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<AuditLogMiddleware>();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(setup =>
    {
        setup.SwaggerEndpoint($"/swagger/v1/swagger.json", "Version 1.0");
        setup.OAuthClientId(builder.Configuration["AzureAd:ClientId"]);
        setup.OAuthAppName("Transscribe API");
        setup.OAuthScopeSeparator(" ");
        setup.OAuthUsePkce();
    });
}

//app.UseHttpsRedirection();

app.MapPost("/transcription", async (IFormFile file, string language, string? costCenter, string? costActivity, IFormFile phrases, HttpContext context, FileHandler handler) =>
{
    //TODO: överväg att använda streaming API för stora filer, rimligen bör detta vara en bättre matchning för våra behov
    return await handler.AddFile(file, language, costCenter ?? "", costActivity ?? "", phrases);
}).RequireAuthorization("api_auth_policy").DisableAntiforgery();

app.MapGet("/transcriptions", (FileHandler handler) =>
{
    return handler.List();
}).RequireAuthorization("api_auth_policy");

app.MapGet("/result", (string identity, FileHandler handler) =>
{
    return handler.GetFile(identity);
}).RequireAuthorization("api_auth_policy");

app.MapGet("/costreport", (FileHandler handler) =>
{
    return handler.GetCostReport();
}).RequireAuthorization("api_auth_policy");

app.MapGet("/costreport/admin", (FileHandler handler) =>
{
    return handler.GetCostReportForAdmin();
}).RequireAuthorization("api_auth_policy");

app.MapGet("/status", (FileHandler handler) =>
{
    return handler.GetStatus();
}).RequireAuthorization("api_auth_policy");

app.MapDelete("/transcription", (Guid identity, FileHandler handler) =>
{
    handler.Delete(identity);
}).RequireAuthorization("api_auth_policy");

app.MapGet("/isadmin", (FileHandler handler) =>
{
    return handler.isGlobalAdmin();
}).RequireAuthorization("api_auth_policy");


app.Run();


namespace API
{
    public class AuditLogSettings(IHttpContextAccessor accessor, IFileSystem fs) : IAuditLogSettings
    {
        private readonly string _config = JsonNode.Parse(fs.File.OpenRead("appsettings.json"))?["AuditLogFile"]?.GetValue<string>() ?? throw new KeyNotFoundException();

        public string UserName => accessor.HttpContext?.User.Identity?.Name ?? "";
        public string AuditLogName => _config.Replace("{date}", DateTime.Now.ToString("yyyyMMdd"));
    }
}


using API;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Web;

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
            //.RequireRole("user")
            .RequireClaim("http://schemas.microsoft.com/identity/claims/scope", "access_as_user")
            );

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddMySwaggerGen(builder.Configuration);

builder.Services.AddCors();

builder.Services.AddTransient<FileHandler>();


var app = builder.Build();
app.UseCors(options => options.WithOrigins("*").AllowAnyMethod().AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

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

app.UseHttpsRedirection();

app.MapPost("/transcription", async (IFormFile file, string language, IFormFile phrases, HttpContext context, FileHandler handler) =>
{
    //TODO: överväg att använda streaming API för stora filer, rimligen bör detta vara en bättre matchning för våra behov
    return await handler.AddFile(file, language, phrases);
}).RequireAuthorization("api_auth_policy");

app.MapGet("/transcriptions", (FileHandler handler) =>
{
    return handler.List();
}).RequireAuthorization("api_auth_policy");

app.MapGet("/result", (string identity, FileHandler handler) =>
{
    return handler.GetFile(identity);
}).RequireAuthorization("api_auth_policy");

app.MapDelete("/transcription", (Guid identity, FileHandler handler) =>
{
    handler.Delete(identity);
}).RequireAuthorization("api_auth_policy");

app.Run();

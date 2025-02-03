using API;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Common;

public static class AppSetup
{
    public static void AddMySwaggerGen(this IServiceCollection services, IConfiguration configuration)
    {
        var clientId = configuration["AzureAd:ClientId"];
        var tenantId = configuration["AzureAd:TenantId"];

        services.AddSwaggerGen(setupAction =>
        {
            //setupAction.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
            //{
            //    Type = SecuritySchemeType.OAuth2,
            //    Flows = new OpenApiOAuthFlows
            //    {
            //        AuthorizationCode = new OpenApiOAuthFlow
            //        {
            //            AuthorizationUrl = new Uri($"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize"),
            //            TokenUrl = new Uri($"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token"),
            //            Scopes = new Dictionary<string, string>
            //                    {
            //                        { $"api://{clientId}/access_as_user", "Act as current user" }
            //                    }
            //        }
            //    }
            //});
            setupAction.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "bearer"
            });
            setupAction.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        new [] { "access_as_user" }
                    }
                });
        });
    }

    public static string GetCleanFilename(this IFormFile file, IFileSystem fs)
    {
        string untrustedFileName = fs.Path.GetFileName(file.FileName);
        if (string.IsNullOrWhiteSpace(untrustedFileName) ||
            fs.Path.GetInvalidFileNameChars().Any(untrustedFileName.Contains))
        {
            throw new ArgumentException("Filename is invalid", nameof(file));
        }
        return untrustedFileName;
    }
}

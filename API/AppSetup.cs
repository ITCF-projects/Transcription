using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;

public static class AppSetup
{
    public static void AddMySwaggerGen(this IServiceCollection services, IConfiguration configuration)
    {
        var clientId = configuration["AzureAd:ClientId"];
        var tenantId = configuration["AzureAd:TenantId"];

        services.AddSwaggerGen(setupAction =>
        {
            setupAction.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.OAuth2,
                Flows = new OpenApiOAuthFlows
                {
                    AuthorizationCode = new OpenApiOAuthFlow
                    {
                        AuthorizationUrl = new Uri($"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize"),
                        TokenUrl = new Uri($"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token"),
                        Scopes = new Dictionary<string, string>
                                {
                                    { $"api://{clientId}/access_as_user", "Act as current user" }
                                }
                    }
                }
            });
            setupAction.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
                        },
                        new [] { "access_as_user" }
                    }
                });
        });
    }

    public static string GetCleanFilename(this IFormFile file)
    {
        string untrustedFileName = Path.GetFileName(file.FileName);
        if (String.IsNullOrWhiteSpace(untrustedFileName) ||
            Path.GetInvalidFileNameChars().Any(untrustedFileName.Contains))
        {
            throw new ArgumentException("Filename is invalid", nameof(file));
        }
        return untrustedFileName;
    }
}

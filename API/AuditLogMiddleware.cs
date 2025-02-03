using Common;
using Common.Domain;

namespace API
{
    public class AuditLogMiddleware(RequestDelegate next, IAuditLog auditLog) 
    {
        public async Task InvokeAsync(HttpContext context)
        {
            await next(context);
            var item = new AuditRecord
            {
                User = context.User.Identity?.Name,
                Method = context.Request.Method,
                Url = $"{context.Request.Path.Value}{context.Request.QueryString.Value}",
                RequestLength = context.Request.Headers.ContentLength,
                Files = context.Request.HasFormContentType
                        ? context.Request.Form.Files.Select(x => x.FileName).ToArray()
                        : null,
                ResponseCode = context.Response.StatusCode,
                ResponseLength = context.Response.Headers.ContentLength,
                ResponseFile = context.Response.GetTypedHeaders().ContentDisposition?.FileName.ToString()
            };
            await auditLog.LogAsync(item);
        }
    }
}
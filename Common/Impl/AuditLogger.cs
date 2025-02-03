using System.Runtime.CompilerServices;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using Common.Domain;
namespace Common.Impl
{
    public class AuditLogger(IFileSystem fs, IAuditLogSettings settings) : IAuditLog
    {
        private readonly JsonSerializerOptions _options = new()
        {
            WriteIndented = false,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
            Encoder = JavaScriptEncoder.Create(UnicodeRanges.BasicLatin, UnicodeRanges.All),
        };

        public async Task LogAsync(AuditRecord item)
        {
            try
            {
                var content = JsonSerializer.Serialize(item, _options);
                await fs.File.AppendAllLinesAsync(settings.AuditLogName, [content]);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Failed to persist auditlog to {settings.AuditLogName} with error:{e}");
            }
        }
        public async Task LogAsync(string text, [CallerMemberName] string foo = "")
        {
            var item = new AuditRecord
            {
                User = settings.UserName,
                Method = foo,
                Message = text
            };
            await LogAsync(item);
        }
    }

}
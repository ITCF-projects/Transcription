
// main loop
using Common;
namespace FolderWatcher
{
    public class AuditLogSettings(AppConfig _config) : IAuditLogSettings
    {
        public string UserName => "FolderWatcher";
        public string AuditLogName => _config.AuditLogFile.Replace("{date}", DateTime.Now.ToString("yyyyMMdd"));
    }
}


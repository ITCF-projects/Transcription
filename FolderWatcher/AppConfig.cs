using Common;
using System.Text.Json;

namespace FolderWatcher
{
    public class AppConfig
    {
        public string FileBasePath { get; set; } = "/appdata/Users";
        public string UrlSe { get; set; } = "ws://transcribeSV:5000/";
        public string UrlEn { get; set; } = "ws://transcribeEN:5000/";
        public int DeleteDays { get; set; } = 1;
        public int SimultaneousTranscriptions { get; set; } = 2;
        public int CleanupIntervalSeconds { get; set; } = 15;
        public string CostCenterPath { get; set; } = "/appdata/CostCenters";
        public string EmailServer { get; set; } = "smtp.umu.se";
        public string EmailFromAddress{ get; set; } = "noreply@umu.se";
        public string EmailBody { get; set; } = "Test body";
        public string EmailSubject { get; set; } = "Test Subject";
        public string AuditLogFile { get; set; } = "/appdata/auditlog{date}-FolderWatcher.jsonl";


        internal static AppConfig Load(IFileSystem fs)
        {
            return JsonSerializer.Deserialize<AppConfig>(fs.File.OpenRead("appconfig.json")) ?? throw new Exception("Invalid path to AppConfig");
        }
    }
}
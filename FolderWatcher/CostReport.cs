using Common;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;

namespace FolderWatcher
{
    public class CostReport
    {
        private static readonly JsonSerializerOptions _options = new()
                {
                    WriteIndented = false,
                    Encoder = JavaScriptEncoder.Create(UnicodeRanges.BasicLatin, UnicodeRanges.All),
                };
        public string UserEPPN { get; set; } = "unknown";
        public string CostCenter { get; set; } = "unknown";
        public string CostActivity { get; set; } = "unknown";
        public Guid RequestID { get; set; }
        public DateTime Created { get; set; }
        public DateTime Started { get; set; }
        public DateTime Completed { get; set; }
        public double Length { get; set; }
        public string NotificationSentTo { get; set; } = "";

        public static CostReport CreateFrom(TranscriptionInfo source, string notificationSentTo, IFileSystem fs)
        {

            var item = new CostReport
            {
                UserEPPN = source.UserEPPN(fs),
                CostCenter = source.CostCenter,
                CostActivity = source.CostActivity,
                RequestID = source.RequestID(fs),
                Created = source.Created ?? throw new Exception("Invalid Created date"),
                Started = source.Started ?? throw new Exception("Invalid Started date"),
                Completed = source.Ended ?? throw new Exception("Invalid Ended date"),
                Length = source.AudioLength,
                NotificationSentTo = notificationSentTo,
            };
            return item;
        }
        public async Task Persist(string costCenterPath, IFileSystem fs)
        {
            try
            {
                var content = JsonSerializer.Serialize(this, _options);
                await fs.File.AppendAllLinesAsync(fs.Path.Combine(costCenterPath, "costreport.jsonl"), [content]);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Failed to persist cost report to {costCenterPath} with error:{e}");
            }
        }
    }
}
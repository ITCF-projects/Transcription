using Common;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;

namespace FolderWatcher
{
    public class TranscriptionResult
    {
        private static readonly JsonSerializerOptions _options = new ()
            {
                WriteIndented = false,
                Encoder = JavaScriptEncoder.Create(UnicodeRanges.BasicLatin, UnicodeRanges.All),
            };

        private string _location = "";
        public Guid TranscriptRequestID { get; set; }
        public DateTime TranscriptRequestCreated { get; set; }
        public DateTime TranscriptRequestStarted { get; set; }
        public DateTime TranscriptRequestCompleted { get; set; }
        public double AudioLength { get; set; }
        public string NotificationSentTo { get; set; } = "";


        public static TranscriptionResult CreateFrom(TranscriptionInfo source, string notificationSentTo, IFileSystem fs)
        {
            
            string dir = fs.Directory.GetParent(source.Directory(fs))?.ToString() ?? throw new Exception("Invalid source dir");
            var item = new TranscriptionResult
            {
                TranscriptRequestID = source.RequestID(fs),
                TranscriptRequestCreated = source.Created ?? throw new Exception("Invalid Created date"),
                TranscriptRequestStarted = source.Started ?? throw new Exception("Invalid Started date"),
                TranscriptRequestCompleted = source.Ended ?? throw new Exception("Invalid Ended date"),
                AudioLength = source.AudioLength,
                NotificationSentTo = notificationSentTo,
                _location = fs.Path.Combine(dir, "transcriptions.jsonl"),
            };
            return item;
        }
        public async Task Persist(IFileSystem fs)
        {
            var content = JsonSerializer.Serialize(this, _options);
            await fs.File.AppendAllLinesAsync(_location, [content]);
        }
    }
}
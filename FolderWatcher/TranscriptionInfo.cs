using Common;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;

namespace FolderWatcher
{
    public record TranscriptionInfo
    {
        private static readonly JsonSerializerOptions _options = new()
        {
            WriteIndented = true,
            Encoder = JavaScriptEncoder.Create(UnicodeRanges.BasicLatin, UnicodeRanges.All),
        };
        private string _fileContentOnDisk = "";
        private string _location = "";

        public string? Language { get; init; }
        public DateTime? Created { get; set; }
        public DateTime? Started { get; set; }
        public DateTime? Ended { get; set; }
        public string? Status { get; set; }
        public string? FileName { get; init; }
        public string? OriginalName { get; init; }
        public DateTime? Deleted { get; set; }
        public double AudioLength { get; set; }
        public int QueuePosition { get; internal set; }
        public string CostCenter { get; set; } = string.Empty;
        public string CostActivity { get; set; } = string.Empty;
        public string Email { get; init; } = "";


        public async Task Persist(string reason, IFileSystem fs)
        {
            try
            {
                var content = JsonSerializer.Serialize(this, _options);
                if (_fileContentOnDisk != content)
                {
                    Console.WriteLine($"Updating file {_location}. {reason}.");
                    await fs.File.WriteAllTextAsync(_location, content);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Exception while writing transcriptionInfo to {_location} with reason: {reason} and error: {e}");
            }
        }

        public static TranscriptionInfo Load(string path, IFileSystem fs)
        {
            try
            {
                //Cant handle the spam! Console.WriteLine($"Loading file {path}.");
                var content = fs.File.ReadAllText(path);
                var item = JsonSerializer.Deserialize<TranscriptionInfo>(content) ?? throw new Exception("Invalid path to TranscriptionInfo");
                item._fileContentOnDisk = content;
                item._location = path;
                return item;
            }
            catch(Exception e)
            {
                Console.WriteLine($"Exception while reading transcriptionInfo: {e}");
                return new TranscriptionInfo { Status = "Invalid", Deleted = DateTime.MaxValue }; //dont throw, it will cause service shutdown
            }
        }

        public string Directory(IFileSystem fs)
        {
            return fs.Path.GetDirectoryName(_location) ?? throw new Exception("Unable to get directory name");
        }
        public string UserEPPN(IFileSystem fs)
        {
            return Directory(fs).Split(fs.Path.DirectorySeparatorChar).Reverse().Skip(1).First();
        }

        public override string ToString()
        {
            return _location;
        }

        public Guid RequestID(IFileSystem fs)
        {
            return new Guid(Directory(fs).Split(fs.Path.DirectorySeparatorChar).Last());
        }

        internal static IEnumerable<string> List(string path, IFileSystem fs)
        {
            return fs.Directory.GetFiles(path, "transcription.json", System.IO.SearchOption.AllDirectories)
                .Where(s => fs.File.GetLastAccessTimeUtc(s).AddSeconds(1) < DateTime.UtcNow);
        }
    }
}
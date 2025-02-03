using System.Text.Json;
using Common;

namespace API
{
    public record TranscriptionInfo
    {
        public string? FileName { get; init; }
        public string? OriginalName { get; init; }
        public Guid Identity { get; set; }
        public string? Language { get; init; }
        public DateTime? Created { get; set; }
        public DateTime? Started { get; set; }
        public DateTime? Ended { get; set; }
        public DateTime? Deleted { get; set; }
        public string? Status { get; set; }
        public string? CostCenter { get; set; }
        public string? CostActivity { get; set; }
        internal string? PathToSelf { get; set; }
        public double? AudioLength { get; set; }
        public int QueuePosition { get; set; }
        public List<Entry> Results { get; set; } = [];

        internal static TranscriptionInfo Load(string? path, IFileSystem fs)
        {
            if (!fs.File.Exists(path))
            {
                return new TranscriptionInfo();
            }
            try
            {
                var dir = fs.Path.GetDirectoryName(path) ?? throw new AccessViolationException("Illegal path");
                var item =  JsonSerializer.Deserialize<TranscriptionInfo>(fs.File.OpenRead(path!)) ?? throw new Exception($"{path} could not be read!");
                item.PathToSelf = path;
                item.Identity = Guid.Parse(dir.Split(fs.Path.DirectorySeparatorChar).Last());
                var exclude = new[] { "dictionary.txt", "transcription.json", item.FileName ?? "" };
                item.Results = FilesInPath(dir, exclude, fs);
                return item;
            }
            catch (Exception e) 
            {
                Console.WriteLine($"Error loading {path}: {e}.");
                return new TranscriptionInfo();
            }
        }
        private static List<Entry> FilesInPath(string path, string[] filesToExclude, IFileSystem fs)
        {
            var c = fs.Path.DirectorySeparatorChar;
            return fs.Directory.GetFiles(path, "*", System.IO.SearchOption.AllDirectories)
                .Where(x => !filesToExclude.Contains(fs.Path.GetFileName(x)))
                .Select(s => new System.IO.FileInfo(s))
                .Select(s => new Entry
                {
                    FileName = s.Name,
                    Identity = string.Join(c, s.FullName.Split(c).Skip(s.FullName.Count(x => x == c) - 1)),
                    Size = s.Length,
                    LastWriteTimeUtc = s.LastWriteTimeUtc
                }).ToList();
        }

        internal TranscriptionInfo TransformForGui()
        {
            var fileName = FileName;
            // Do a switcharoo of filename/originalName to keep Gui oblivious of the actual filename on disk.
            // This is done to retain a good user experience even when using a secure filename on disk.
            return new TranscriptionInfo(this)
            {
                Results = Results.Select(x => x.TransformForGui(FileName ?? "", OriginalName ?? "")).ToList(),
                FileName = string.IsNullOrWhiteSpace(OriginalName)
                            ? FileName
                            :OriginalName,
                OriginalName = fileName
            };
        }
    }
}
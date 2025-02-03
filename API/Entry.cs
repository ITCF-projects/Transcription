namespace API
{
    public record Entry
    {

        public string? FileName { get; init; }
        public string? Identity { get; init; }
        public long Size { get; init; }
        public DateTime LastWriteTimeUtc { get; init; }

        internal Entry TransformForGui(string fileName, string originalName)
        {
            return new Entry(this)
            {
                FileName = string.IsNullOrWhiteSpace(originalName)
                ? FileName
                : FileName?.Replace(fileName, originalName) ?? "Illegal filename",
            };
        }
    }
}
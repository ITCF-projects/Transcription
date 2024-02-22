namespace API
{
    public record Entry
    {

        public string? FileName { get; init; }
        public string? Identity { get; init; }
        public long Size { get; init; }
        public DateTime LastWriteTimeUtc { get; init; }
    }
}
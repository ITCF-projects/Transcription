namespace Common.Domain
{
    public record AuditRecord
    {
        public AuditRecord()
        {
            Timestamp = DateTime.Now.ToString("HH:mm:ss");
        }
        public string Timestamp { get; private init; }
        public string? User { get; init; }
        public string Method { get; init; } = "";
        public string Url { get; init; } = "";
        public long? RequestLength { get; init; }
        public string[]? Files { get; init; }
        public int ResponseCode { get; init; }
        public long? ResponseLength { get; init; }
        public string? ResponseFile { get; init; }
        public string? Message { get; init; }
    }
}
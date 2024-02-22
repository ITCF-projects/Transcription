namespace API
{
    public record TranscriptionInfo
    {
        public string? FileName { get; init; }
        public Guid Identity { get; set; }
        public string? Language { get; init; }
        public DateTime? Created { get; set; }
        public DateTime? Started { get; set; }
        public DateTime? Ended { get; set; }
        public DateTime? Deleted { get; set; }
        public string? Status { get; set; }
        internal string? PathToSelf { get; set; }
        public double? AudioLength { get; set; }
        public List<Entry> Results { get; set; }
        
    }
}
using System.Text.Json;
using Common;
namespace API
{
    public class CostReport
    {
        public string UserEPPN { get; set; } = "unknown";
        public string CostCenter { get; set; } = "unknown";
        public string CostActivity { get; set; } = "unknown";
        public Guid RequestID { get; set; }
        public DateTime Created { get; set; }
        public DateTime Started { get; set; }
        public DateTime Completed { get; set; }
        public double Length { get; set; }

        public static IList<CostReport> LoadAll(string path, IFileSystem fs)
        {
            if (fs.File.Exists(path)) {
                var allLines = fs.File.ReadAllLines(path);
                return allLines.Select(s => 
                    JsonSerializer.Deserialize<CostReport>(s) ?? new CostReport()
                ).ToList();
            } else {
                return [];
            }
        }
    }
}


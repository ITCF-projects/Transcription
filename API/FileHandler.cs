using Microsoft.AspNetCore.StaticFiles;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;

namespace API
{
    //TODO: Gör Filehandler (och andra filhanterande operationer i appen) testbar genom att gömma File- och Directorybaserade operationer bakom mockbarara interface och injecera dessa med DI
    public class FileHandler
    {
        private readonly string folderPath;
        private readonly string incomingPath;
        private readonly string username;
        private readonly string email;


        /// <summary>
        /// Konstruktor, kräver giltig användare från kontext samt giltig filsökväg i konfiguration.
        /// </summary>
        /// <param name="context"></param>
        /// <param name="config"></param>
        /// <exception cref="ArgumentException"></exception>
        /// <exception cref="Exception"></exception>
        public FileHandler(IHttpContextAccessor context, IConfiguration config)
        {
            username = context?.HttpContext?.User?.Identity?.Name
                ?? throw new ArgumentException("Username is invalid", nameof(context));

            email = "kalle@kula.com" 
                ?? context?.HttpContext?.User?.Claims.FirstOrDefault(x => x.Type == "TODO").Value
                ?? throw new ArgumentException("Username is invalid", nameof(context));

            folderPath = Path.Combine(
                config["FileBasePath"] ?? throw new Exception("File basepath is invalid"),
                username);
            incomingPath = config["IncomingPath"] ?? throw new Exception("File basepath is invalid");
        }

        /// <summary>
        /// Get a file
        /// </summary>
        /// <param name="identity"></param>
        /// <returns></returns>
        /// <exception cref="ArgumentException"></exception>
        public async Task<IResult> GetFile(string identity)
        {
            if (!FileExists(identity))
                throw new ArgumentException("invalid file", nameof(identity));
            var path = Path.Combine(folderPath, identity);
            var bytes = await File.ReadAllBytesAsync(path);
            new FileExtensionContentTypeProvider().TryGetContentType(identity, out string? contentType);
            return Results.File(bytes, contentType, Path.GetFileName(identity));
        }

        private async Task CreatePersonInfoFile(string path, string filename, string language)
        {
            var info = new
            {
                Language = language,
                Started = default(string),
                Ended = default(string),
                Status = "new",
                FileName = filename,
                Created = DateTime.UtcNow
            };
            var filePath = Path.Combine(path, "transcription.json");
            var content = JsonSerializer.Serialize(info, new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = JavaScriptEncoder.Create(UnicodeRanges.BasicLatin, UnicodeRanges.All),
            });
            await File.AppendAllTextAsync(filePath, content);
        }
        
        /// <summary>
        /// Spara en lista med filer.
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        /// <exception cref="ArgumentException"></exception>
        public async Task<Guid> AddFile(IFormFile file, string language, IFormFile phrases)
        {
            var fileName = file.GetCleanFilename();
            var id = Guid.NewGuid();
            if (file.Length > 0)
            {
                var fileFolder = Path.Combine(folderPath, id.ToString());
                Directory.CreateDirectory(fileFolder);
                var filePath = Path.Combine(fileFolder, fileName);
                using var filestream = File.Create(filePath);
                using var phrasesStream = File.Create(Path.Combine(fileFolder, "dictionary.txt"));
                await file.CopyToAsync(filestream);
                await phrases.CopyToAsync(phrasesStream);
                await CreatePersonInfoFile(fileFolder, fileName, language);
                await CreateIncomingEntry(id);
            }
            return id;
        }

        /// <summary>
        /// Create incoming
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private async Task CreateIncomingEntry(Guid id)
        {
            var item = new
            {
                TranscriptRequestID = id,
                TranscriptRequestUserEPPN = username
            };

            var filePath = Path.Combine(incomingPath, $"{id}.json");
            var content = JsonSerializer.Serialize(item, new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = JavaScriptEncoder.Create(UnicodeRanges.BasicLatin, UnicodeRanges.All),
            });
            Directory.CreateDirectory(incomingPath);
            await File.AppendAllTextAsync(filePath, content);
        }
        
        /// <summary>
        /// Lista alla användarens filer
        /// </summary>
        /// <param name="filter">Filfilter, använd "*" för att få alla filer"</param>
        /// <returns></returns>
        public IEnumerable<TranscriptionInfo> List()
        {
            if (!Directory.Exists(folderPath))
                return new List<TranscriptionInfo>();

            return GetTranscriptions().Select(x =>
                {
                    var exclude = new[] { "dictionary.txt", "transcription.json", x.FileName };
                    x.Results = FilesInPath(Path.GetDirectoryName(x.PathToSelf), exclude);
                    return x;
                });

        }
        private List<Entry> FilesInPath(string path, string[] filesToExclude)
        {
            return Directory.GetFiles(path, "*", SearchOption.AllDirectories)
                .Where(x => !filesToExclude.Contains(Path.GetFileName(x)))
                .Select(s => new FileInfo(s))
                .Select(s => new Entry
                {
                    FileName = s.Name,
                    Identity = s.FullName[(folderPath.Length + 1)..],
                    Size = s.Length,
                    LastWriteTimeUtc = s.LastWriteTimeUtc
                }).ToList();
        }
        private List<TranscriptionInfo> GetTranscriptions()
        {
            return Directory.GetFiles(folderPath, "transcription.json", SearchOption.AllDirectories)
           .Select(s =>
           {
               try
               {
                   var item = JsonSerializer.Deserialize<TranscriptionInfo>(File.OpenRead(s))
                   ?? throw new Exception($"{s} could not be read!");
                   item.PathToSelf = s;
                   item.Identity = Guid.Parse(Path.GetDirectoryName(s).Split(Path.DirectorySeparatorChar).Last());
                   return item;
               }
               catch (Exception e)
               {
                   Console.WriteLine($"Failed to process{s} with error {e}");
                   return new TranscriptionInfo(); 
               }
               
           })
           .Where(x => !string.IsNullOrWhiteSpace(x?.PathToSelf))
           .ToList();
        }

        /// <summary>
        /// Ta bort ett directory
        /// </summary>
        /// <param name="identity"></param>
        public void DeleteFolder(string identity)
        {
            var path = Path.Combine(folderPath, identity);
            if (Directory.Exists(path))
                Directory.Delete(path, true);
        }

        /// <summary>
        /// Ta bort en fil
        /// </summary>
        /// <param name="identity">Filens identitet</param>
        /// <exception cref="ArgumentException">Vid ogiltigt argument</exception>
        public void Delete(Guid identity)
        {
            var path = Path.Combine(folderPath, identity.ToString());
            if (!Directory.Exists(path))
                throw new ArgumentException("invalid file", nameof(identity));
            Directory.Delete(path, true);
        }

        /// <summary>
        /// Verifiera att en fil existerar på disk innan vi behandlar identiteten
        /// </summary>
        /// <param name="identity"></param>
        /// <returns>huruvida filen existerar eller ej</returns>
        private bool FileExists(string identity)
        {
            //TODO: överväg att byta till Path.GetFilename(identity) som filter (risk vs prestanda...)
            var validFileIds = Directory.GetFiles(folderPath, "*.*", SearchOption.AllDirectories)
                .Select(s => s[(folderPath.Length + 1)..]);

            return validFileIds.Contains(identity);
        }
    }
}
using Microsoft.AspNetCore.StaticFiles;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using Common;

namespace API
{
    public class FileHandler(IHttpContextAccessor _context, IConfiguration _config, IFileSystem _fs, IAuditLog _auditLog)
    {
        private readonly string _username = _context?.HttpContext?.User?.Identity?.Name ?? throw new ArgumentException("Username is invalid", nameof(_context));
        private readonly string _statusPath = _config["FileBasePath"] ?? throw new Exception("File basepath is invalid");
        private readonly string _folderPath = _fs.Path.Combine(_config["FileBasePath"]!, _context?.HttpContext?.User?.Identity?.Name!);
        private readonly string _email = _context?.HttpContext?.User?.FindFirstValue(ClaimTypes.Email) ?? "";
        private readonly string _costReportPath = _config["CostReportPath"] ?? "";
        private readonly bool _isGlobalAdmin = _context?.HttpContext?.User?.IsInRole(_config["GlobalAdminRole"] ?? "") ?? false;
        private readonly List<string> _costCenterAdmin = _context?.HttpContext?.User?.Claims
                .Where(x => x.Type == ClaimTypes.Role)
                .Where(x => true /*TODO: add handling for claim prefix*/)
                .Select(s => s.Value /*TODO: remove role prefix from string*/)
                .ToList() ?? [];
        private readonly JsonSerializerOptions _options = new()
        {
            WriteIndented = true,
            Encoder = JavaScriptEncoder.Create(UnicodeRanges.BasicLatin, UnicodeRanges.All),
        };
        
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
            var path = _fs.Path.Combine(_folderPath, identity);
            var bytes = await _fs.File.ReadAllBytesAsync(path);
            new FileExtensionContentTypeProvider().TryGetContentType(identity, out string? contentType);
            return Results.File(bytes, contentType, _fs.Path.GetFileName(identity));
        }

        private async Task CreatePersonInfoFile(string path, string filename, string originalName, string language, string costCenter, string costActivity)
        {
            var info = new
            {
                Language = language,
                Started = default(string),
                Ended = default(string),
                Status = "new",
                FileName = filename,
                OriginalName = originalName,
                Created = DateTime.UtcNow,
                CostCenter = costCenter,
                CostActivity = costActivity,
                Email = _email
            };
            var filePath = _fs.Path.Combine(path, "transcription.json");
            var content = JsonSerializer.Serialize(info, _options);
            await _fs.File.AppendAllTextAsync(filePath, content);
        }
        
        /// <summary>
        /// Spara en lista med filer.
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        /// <exception cref="ArgumentException"></exception>
        public async Task<Guid> AddFile(IFormFile file, string language, string costCenter, string costActivity, IFormFile phrases)
        {
            var originalName = file.GetCleanFilename(_fs);
            var id = Guid.NewGuid();
            var fileName = $"{id:N}{_fs.Path.GetExtension(originalName)}";
            if (file.Length > 0)
            {
                var fileFolder = _fs.Path.Combine(_folderPath, id.ToString());
                _fs.Directory.CreateDirectory(fileFolder);
                var filePath = _fs.Path.Combine(fileFolder, fileName);
                using var filestream = _fs.File.Create(filePath);
                using var phrasesStream = _fs.File.Create(_fs.Path.Combine(fileFolder, "dictionary.txt"));
                await file.CopyToAsync(filestream);
                await phrases.CopyToAsync(phrasesStream);
                await CreatePersonInfoFile(fileFolder, fileName, originalName, language, costCenter, costActivity);
                await _auditLog.LogAsync($"Assigned id {id} to {originalName} with filename {fileName}.");
            }
            return id;
        }

        /// <summary>
        /// Lista alla användarens filer
        /// </summary>
        /// <param name="filter">Filfilter, använd "*" för att få alla filer"</param>
        /// <returns></returns>
        public IEnumerable<TranscriptionInfo> List()
        {
            if (!_fs.Directory.Exists(_folderPath))
                return [];

            return GetTranscriptions();

        }
        
        private List<TranscriptionInfo> GetTranscriptions()
        {
            return _fs.Directory.GetFiles(_folderPath, "transcription.json", System.IO.SearchOption.AllDirectories)
           .Select(s => TranscriptionInfo.Load(s,_fs))
           .Where(x => !string.IsNullOrWhiteSpace(x?.PathToSelf))
           .Select(x => x.TransformForGui())
           .ToList();
        }

        /// <summary>
        /// Ta bort ett directory
        /// </summary>
        /// <param name="identity"></param>
        public void DeleteFolder(string identity)
        {
            var path = _fs.Path.Combine(_folderPath, identity);
            if (_fs.Directory.Exists(path))
                _fs.Directory.Delete(path, true);
        }

        /// <summary>
        /// Ta bort en fil
        /// </summary>
        /// <param name="identity">Filens identitet</param>
        /// <exception cref="ArgumentException">Vid ogiltigt argument</exception>
        public void Delete(Guid identity)
        {
            var path = _fs.Path.Combine(_folderPath, identity.ToString());
            if (!_fs.Directory.Exists(path))
                throw new ArgumentException("invalid file", nameof(identity));
            _fs.Directory.Delete(path, true);
        }

        /// <summary>
        /// Verifiera att en fil existerar på disk innan vi behandlar identiteten
        /// </summary>
        /// <param name="identity"></param>
        /// <returns>huruvida filen existerar eller ej</returns>
        private bool FileExists(string identity)
        {
            //TODO: överväg att byta till Path.GetFilename(identity) som filter (risk vs prestanda...)
            var validFileIds = _fs.Directory.GetFiles(_folderPath, "*.*", System.IO.SearchOption.AllDirectories)
                .Select(s => s[(_folderPath.Length + 1)..]);

            return validFileIds.Contains(identity);
        }

        internal IList<CostReport> GetCostReport()
        {
            return CostReport.LoadAll(_costReportPath, _fs)
                .Where(x => x.UserEPPN == _username)
                .ToList();
        }

        internal IList<CostReport> GetCostReportForAdmin()
        {
            return CostReport.LoadAll(_costReportPath, _fs)
                .Where(x => _isGlobalAdmin || _costCenterAdmin.Contains(x.CostCenter))
                .ToList();
        }

        internal bool isGlobalAdmin()
        {
            return _isGlobalAdmin;
        }        

        internal IList<object> GetStatus()
        {
            if(!_isGlobalAdmin)
                return [];

            var items = _fs.Directory.GetDirectories(_statusPath)
                .SelectMany(s => _fs.Directory.GetFiles(s, "*.*", System.IO.SearchOption.AllDirectories))
                .Where(x => _fs.Path.GetFileName(x) != "transcriptions.jsonl")
                .ToList();
            return items.GroupBy(x => _fs.Path.GetDirectoryName(x) ?? "")
                .Select(s => new
                {
                    EPPN = s.Key.Split(_fs.Path.DirectorySeparatorChar).Reverse().Skip(1).First(),
                    Identity = s.Key.Split(_fs.Path.DirectorySeparatorChar).Last(),
                    Created = Relative(_fs.Directory.GetCreationTime(s.Key??"")),
                    UnixTime = (UInt32)(_fs.Directory.GetCreationTime(s.Key ?? "") - DateTime.UnixEpoch).TotalSeconds,
                    Files = s.Select(t => _fs.Path.GetFileName(t)).ToList(),
                    Info = TranscriptionInfo.Load(s.SingleOrDefault(x => x.EndsWith("transcription.json")), _fs)
                })
                .OrderBy(x => x.UnixTime)
                .Select(s => s as object)
                .ToList();
        }
        private static string Relative(DateTime? created)
        {
            var since = (DateTime.Now - created) ?? new TimeSpan();
            if ((int)since.TotalDays > 1)
                return $"{since.TotalDays:N0} days ago";
            if ((int)since.TotalHours > 1)
                return $"{since.TotalHours:N0} hours ago";
            if ((int)since.TotalMinutes > 1)
                return $"{since.TotalMinutes:N0} minutes ago";
            return $"{since.TotalSeconds:N0} seconds ago";
        }
    }
}
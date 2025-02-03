using FolderWatcher;
using Common;

internal class Cleanup(AppConfig _config, IAuditLog _auditLogger, IFileSystem _fs)
{
    private DateTime _lastCleanup = DateTime.MinValue; 

    public bool TimeToClean()
    {
        var timeSinceLastCleanup = DateTime.Now - _lastCleanup;
        return (timeSinceLastCleanup.TotalSeconds > _config.CleanupIntervalSeconds);
    }
    public async Task CleanExpired()
    {
        _lastCleanup = DateTime.Now;
        var foldersToRemove = _fs.Directory.GetFiles(_config.FileBasePath, "transcription.json", System.IO.SearchOption.AllDirectories)
            .Where(x => TranscriptionInfo.Load(x, _fs).Deleted < DateTime.Now)
            .Select(s => _fs.Path.GetDirectoryName(s) ?? throw new Exception("invalid directory name"))
            .ToList();
        foreach (var folder in foldersToRemove)
        {
            Console.WriteLine($"Removing folder {folder}.");
            _fs.Directory.Delete(folder, true);
            await _auditLogger.LogAsync($"Removed {folder} and all its content");
        }
    }

    public async Task StartupClean()
    {
        var stuckTranscribing = _fs.Directory.GetFiles(_config.FileBasePath, "transcription.json", System.IO.SearchOption.AllDirectories)
            .Select(x => TranscriptionInfo.Load(x, _fs))
            .Where(x => x.Status == "Transcribing")
            .ToList();
        foreach(var item in stuckTranscribing)
        {
            item.Status = "new";
            await item.Persist("File stuck in status \"Transcribing\" when service was shut down. Resetting to status \"new\"", _fs);
        }
    }
}
namespace Common
{
    public interface IFileSystem
    {
        public IFile File { get; }
        public IPath Path { get; }
        public IDirectory Directory { get; }
    }
    public interface IFile
    {
        string[] ReadAllLines(string path);
        Task<byte[]> ReadAllBytesAsync(string path);
        Task AppendAllTextAsync(string path, string content);
        System.IO.FileStream OpenRead(string path);
        bool Exists(string? path);
        Task AppendAllLinesAsync(string path, string[] content);
        System.IO.FileStream Create(string path);
        Task WriteAllTextAsync(string path, string content);
        string ReadAllText(string path);
        DateTime GetLastAccessTimeUtc(string path);
        void AppendAllText(string path, string content);

    }
    public interface IPath
    {
        string Combine(string first, string second);
        string GetFileName(string path);
        string GetExtension(string path);
        char[] GetInvalidFileNameChars();
        string? GetDirectoryName(string? path);
        char DirectorySeparatorChar { get; }

    }
    public interface IDirectory
    {
        void CreateDirectory(string path);
        bool Exists(string? path);
        string[] GetFiles(string path, string filter, System.IO.SearchOption options);
        void Delete(string path, bool recursive);
        string[] GetDirectories(string path);
        DateTime GetCreationTime(string path);
        DirectoryInfo? GetParent(string path);
    }
}
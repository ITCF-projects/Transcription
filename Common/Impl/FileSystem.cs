namespace Common.Impl
{
    public class FileSystem : IFileSystem, IFile, IPath, IDirectory
    {
        char IPath.DirectorySeparatorChar => Path.DirectorySeparatorChar;
        IFile IFileSystem.File => this;
        IPath IFileSystem.Path => this;
        IDirectory IFileSystem.Directory => this;

        Task IFile.AppendAllLinesAsync(string path, string[] content)
        {
            return File.AppendAllLinesAsync(path, content);
        }

        void IFile.AppendAllText(string path, string content)
        {
            File.AppendAllText(path, content);
        }

        Task IFile.AppendAllTextAsync(string path, string? content)
        {
            return File.AppendAllTextAsync(path, content);
        }

        string IPath.Combine(string first, string second)
        {
            return Path.Combine(first, second);
        }

        FileStream IFile.Create(string path)
        {
            return File.Create(path);
        }

        void IDirectory.CreateDirectory(string path)
        {
            Directory.CreateDirectory(path);
        }

        void IDirectory.Delete(string path, bool recursive)
        {
            Directory.Delete(path, recursive);
        }

        bool IDirectory.Exists(string? path)
        {
            return Directory.Exists(path);
        }

        bool IFile.Exists(string? path)
        {
            return File.Exists(path);
        }

        DateTime IDirectory.GetCreationTime(string path)
        {
            return Directory.GetCreationTime(path);
        }

        string[] IDirectory.GetDirectories(string path)
        {
            return Directory.GetDirectories(path);
        }

        string? IPath.GetDirectoryName(string? path)
        {
            return Path.GetDirectoryName(path);
        }

        string IPath.GetExtension(string path)
        {
            return Path.GetExtension(path);
        }

        string IPath.GetFileName(string path)
        {
            return Path.GetFileName(path);
        }

        string[] IDirectory.GetFiles(string path, string filter, SearchOption options)
        {
            return Directory.GetFiles(path, filter, options);
        }

        char[] IPath.GetInvalidFileNameChars()
        {
            return Path.GetInvalidFileNameChars();
        }

        DateTime IFile.GetLastAccessTimeUtc(string path)
        {
            return File.GetLastAccessTimeUtc(path);
        }

        DirectoryInfo? IDirectory.GetParent(string path)
        {
            return Directory.GetParent(path); 
        }

        FileStream IFile.OpenRead(string path)
        {
            return File.OpenRead(path);
        }

        Task<byte[]> IFile.ReadAllBytesAsync(string path)
        {
            return File.ReadAllBytesAsync(path);
        }

        string[] IFile.ReadAllLines(string path)
        {
            return File.ReadAllLines(path);
        }

        string IFile.ReadAllText(string path)
        {
            return File.ReadAllText(path);
        }

        Task IFile.WriteAllTextAsync(string path, string content)
        {
            return File.WriteAllTextAsync(path, content);
        }
    }
}
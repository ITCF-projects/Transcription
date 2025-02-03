using Common.Domain;
using System.Runtime.CompilerServices;
namespace Common
{
    public interface IAuditLog
    {
        Task LogAsync(AuditRecord item);
        Task LogAsync(string text, [CallerMemberName] string Method = "");
    }
}
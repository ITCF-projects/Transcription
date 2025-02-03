namespace Common
{
    public interface IAuditLogSettings
    {
        string UserName { get; }
        string AuditLogName { get; }
    }
}
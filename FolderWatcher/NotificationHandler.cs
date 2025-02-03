using System.Net.Mail;

namespace FolderWatcher
{
    public class NotificationHandler(AppConfig _config)
    {
           public string SendNotification(TranscriptionInfo item)
        {
            if (string.IsNullOrWhiteSpace(item.Email) ||
                string.IsNullOrWhiteSpace(_config.EmailServer) ||
                string.IsNullOrWhiteSpace(_config.EmailFromAddress) ||
                string.IsNullOrWhiteSpace(_config.EmailBody)
                )
            {
                return string.Empty;//no notification address
            }

            try
            {
                var smtpClient = new SmtpClient(_config.EmailServer)
                {
                    //Port = 587,
                    //Credentials = new NetworkCredential("username", "password"),
                    //EnableSsl = true,
                    UseDefaultCredentials = false,
                };
                
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_config.EmailFromAddress),
                    Subject = string.Format(_config.EmailSubject, Relative(item.Created), item.Status),
                    Body = _config.EmailBody,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(item.Email);

                smtpClient.Send(mailMessage);
            }
            catch(Exception ex)
            {
                Console.WriteLine($"error emailing {item.Email ?? "NULL"}: {ex}" );
                return string.Empty;
            }
            Console.WriteLine($"Emailed {item.Email}");
            return item.Email;
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
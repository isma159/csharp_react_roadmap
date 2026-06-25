using AIEmailClient.DTOs;
using MailKit.Net.Imap;
using MailKit.Security;

namespace AIEmailClient.Service;

public class LoginService
{
    public string Email { get; private set; } = "";
    public string Password { get; private set; } = "";
    public string ImapHost { get; private set; } = "";
    public int ImapPort { get; private set; } = 993;
    public bool IsLoggedIn { get; private set; } = false;

    public async Task<bool> VerifyCredentials(string email, string password, string imapHost)
    {

        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(password)) return false;

        try
        {
            using var client = new ImapClient();
            await client.ConnectAsync(imapHost, ImapPort, SecureSocketOptions.SslOnConnect);
            await client.AuthenticateAsync(email, password);
            await client.DisconnectAsync(true);

            Email = email;
            Password = password;
            ImapHost = imapHost;
            
            return true;
        }
        catch (AuthenticationException)
        {
            IsLoggedIn = false;
            return false;
        }
        catch (Exception)
        {
            IsLoggedIn = false;
            return false;
        }

    }

    public string SuggestImapHost(string email)
    {
        string domain = email.Split("@").LastOrDefault() ?? "";
        string domainName = domain.Split(".")[0];

        return domainName switch
        {
            "gmail" => "imap.gmail.com",
            "outlook" or "hotmail" or "live" => "outlook.office365.com",
            "yahoo" => "imap.mail.yahoo.com",
            _ => $"imap.{domainName}"
        };
    }
}
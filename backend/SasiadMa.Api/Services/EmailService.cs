using SendGrid;
using SendGrid.Helpers.Mail;

namespace SasiadMa.Api.Services;

public class EmailService : IEmailService
{
    private readonly SendGridClient _client;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _frontendUrl;

    public EmailService(IConfiguration config)
    {
        var apiKey = config["SendGrid:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("SendGrid API Key not configured");
        }

        _client = new SendGridClient(apiKey);
        _fromEmail = config["SendGrid:FromEmail"] ?? "noreply@sasiad-ma.pl";
        _fromName = config["SendGrid:FromName"] ?? "Sąsiad-Ma";
        _frontendUrl = config["FrontendUrl"] ?? "http://localhost:5173";
    }

    public async Task SendNewBookingRequestEmailAsync(
        string ownerEmail,
        string ownerName,
        string itemName,
        string borrowerName,
        DateTime from,
        DateTime to)
    {
        var subject = $"Nowa prośba o wypożyczenie: {itemName}";
        var htmlContent = $@"
            <h2>Cześć {ownerName}!</h2>
            <p><strong>{borrowerName}</strong> prosi o wypożyczenie: <strong>{itemName}</strong></p>
            <p>
                <strong>Okres:</strong> {from:yyyy-MM-dd} do {to:yyyy-MM-dd}
            </p>
            <p>
                <a href=""{_frontendUrl}/my-items-requests"" style=""background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;"">
                    Sprawdź prośbę
                </a>
            </p>
        ";

        await SendEmailAsync(ownerEmail, ownerName, subject, htmlContent);
    }

    public async Task SendBookingApprovedEmailAsync(
        string borrowerEmail,
        string borrowerName,
        string itemName,
        string ownerName)
    {
        var subject = $"Twoja prośba o {itemName} została zatwierdzona!";
        var htmlContent = $@"
            <h2>Cześć {borrowerName}!</h2>
            <p><strong>{ownerName}</strong> zaakceptował/a Twoją prośbę o <strong>{itemName}</strong>!</p>
            <p>Umów szczegóły przekazania przedmiotu.</p>
            <p>
                <a href=""{_frontendUrl}/my-bookings"" style=""background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;"">
                    Moje wypożyczenia
                </a>
            </p>
        ";

        await SendEmailAsync(borrowerEmail, borrowerName, subject, htmlContent);
    }

    public async Task SendBookingRejectedEmailAsync(
        string borrowerEmail,
        string borrowerName,
        string itemName,
        string? reason)
    {
        var subject = $"Twoja prośba o {itemName} została odrzucona";
        var reasonText = string.IsNullOrEmpty(reason)
            ? "Brak podanego powodu."
            : $"Powód: <strong>{reason}</strong>";

        var htmlContent = $@"
            <h2>Cześć {borrowerName}!</h2>
            <p>Niestety, Twoja prośba o <strong>{itemName}</strong> została odrzucona.</p>
            <p>{reasonText}</p>
            <p>
                <a href=""{_frontendUrl}/items"" style=""background-color: #6c757d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;"">
                    Przeglądaj dostępne przedmioty
                </a>
            </p>
        ";

        await SendEmailAsync(borrowerEmail, borrowerName, subject, htmlContent);
    }

    public async Task SendNewMessageEmailAsync(
        string recipientEmail,
        string recipientName,
        string senderName,
        string messagePreview)
    {
        var subject = $"Nowa wiadomość od {senderName}";
        var preview = messagePreview.Length > 100
            ? messagePreview.Substring(0, 100) + "..."
            : messagePreview;

        var htmlContent = $@"
            <h2>Cześć {recipientName}!</h2>
            <p>Otrzymałeś/aś nową wiadomość od <strong>{senderName}</strong>:</p>
            <blockquote style=""background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;"">
                {preview}
            </blockquote>
            <p>
                <a href=""{_frontendUrl}/messages"" style=""background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;"">
                    Otwórz wiadomości
                </a>
            </p>
            <p style=""color: #6c757d; font-size: 12px; margin-top: 30px;"">
                Możesz wyłączyć powiadomienia email o wiadomościach w ustawieniach profilu.
            </p>
        ";

        await SendEmailAsync(recipientEmail, recipientName, subject, htmlContent);
    }

    private async Task SendEmailAsync(
        string toEmail,
        string toName,
        string subject,
        string htmlContent)
    {
        try
        {
            var from = new EmailAddress(_fromEmail, _fromName);
            var to = new EmailAddress(toEmail, toName);
            var msg = new SendGridMessage()
            {
                From = from,
                Subject = subject,
                HtmlContent = htmlContent
            };

            msg.AddTo(to);

            var response = await _client.SendEmailAsync(msg);

            if (!response.IsSuccessStatusCode)
            {
                // Log error but don't throw
                Console.WriteLine($"SendGrid error: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            // Log error but don't throw
            Console.WriteLine($"Email sending failed: {ex.Message}");
        }
    }
}

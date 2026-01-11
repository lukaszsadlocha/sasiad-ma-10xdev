namespace SasiadMa.Api.Services;

public interface IEmailService
{
    /// <summary>
    /// Send email notification for new booking request to item owner
    /// </summary>
    Task SendNewBookingRequestEmailAsync(
        string ownerEmail,
        string ownerName,
        string itemName,
        string borrowerName,
        DateTime from,
        DateTime to);

    /// <summary>
    /// Send email notification when booking is approved
    /// </summary>
    Task SendBookingApprovedEmailAsync(
        string borrowerEmail,
        string borrowerName,
        string itemName,
        string ownerName);

    /// <summary>
    /// Send email notification when booking is rejected
    /// </summary>
    Task SendBookingRejectedEmailAsync(
        string borrowerEmail,
        string borrowerName,
        string itemName,
        string? reason);
}

using SasiadMa.Api.Models;

namespace SasiadMa.Api.DTOs.Bookings;

public class BookingResponse
{
    public int Id { get; set; }

    // Item information
    public int ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? ItemPhotoUrl { get; set; }

    // Borrower information
    public string BorrowerId { get; set; } = string.Empty;
    public string BorrowerName { get; set; } = string.Empty;
    public string? BorrowerAvatarUrl { get; set; }

    // Owner information
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string? OwnerAvatarUrl { get; set; }

    // Booking dates
    public DateTime RequestedFrom { get; set; }
    public DateTime RequestedTo { get; set; }

    // Notes and reasons
    public string? BorrowerNote { get; set; }
    public string? RejectionReason { get; set; }

    // Status and lifecycle
    public BookingStatus Status { get; set; }
    public DateTime? HandedOverAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

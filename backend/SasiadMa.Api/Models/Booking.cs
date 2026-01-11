namespace SasiadMa.Api.Models;

public class Booking
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public string BorrowerId { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;

    // Booking lifecycle dates
    public DateTime RequestedFrom { get; set; }
    public DateTime RequestedTo { get; set; }

    // Optional notes and reasons
    public string? BorrowerNote { get; set; }
    public string? RejectionReason { get; set; }

    // Booking status tracking
    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    // Lifecycle timestamps
    public DateTime? HandedOverAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    // Audit timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public Item Item { get; set; } = null!;
    public User Borrower { get; set; } = null!;
    public User Owner { get; set; } = null!;
}

/// <summary>
/// Booking lifecycle status enum
/// </summary>
public enum BookingStatus
{
    Pending = 0,      // Request submitted, awaiting owner response
    Approved = 1,     // Owner accepted, needs handover
    Rejected = 2,     // Owner declined
    InProgress = 3,   // Item handed over, borrowing active
    Returned = 4      // Item returned, booking complete
}

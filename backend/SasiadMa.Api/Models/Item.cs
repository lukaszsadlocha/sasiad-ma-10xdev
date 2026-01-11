namespace SasiadMa.Api.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public ItemStatus Status { get; set; } = ItemStatus.Available;

    public string OwnerId { get; set; } = string.Empty;
    public int CommunityId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public User Owner { get; set; } = null!;
    public Community Community { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public enum ItemStatus
{
    Available,
    Borrowed,
    Unavailable
}

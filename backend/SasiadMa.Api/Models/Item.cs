namespace SasiadMa.Api.Models;

// Placeholder - będzie w pełni zaimplementowany w Fazie 3
public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public int CommunityId { get; set; }

    // Relationships
    public User Owner { get; set; } = null!;
    public Community Community { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

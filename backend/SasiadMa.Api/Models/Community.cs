namespace SasiadMa.Api.Models;

public class Community
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AdminId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public User Admin { get; set; } = null!;
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<InviteLink> InviteLinks { get; set; } = new List<InviteLink>();
    public ICollection<Item> Items { get; set; } = new List<Item>();
}

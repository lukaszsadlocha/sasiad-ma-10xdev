using Microsoft.AspNetCore.Identity;

namespace SasiadMa.Api.Models;

public class User : IdentityUser
{
    public string PreferredName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public int? CommunityId { get; set; }
    public Community? Community { get; set; }

    public ICollection<Item> Items { get; set; } = new List<Item>();
    public ICollection<Booking> BookingsAsOwner { get; set; } = new List<Booking>();
    public ICollection<Booking> BookingsAsBorrower { get; set; } = new List<Booking>();
}

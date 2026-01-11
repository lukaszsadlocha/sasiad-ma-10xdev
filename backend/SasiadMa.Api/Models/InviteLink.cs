namespace SasiadMa.Api.Models;

public class InviteLink
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public int CommunityId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public Community Community { get; set; } = null!;
}

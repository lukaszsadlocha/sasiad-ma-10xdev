namespace SasiadMa.Api.DTOs.Users;

public class UserProfileResponse
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PreferredName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool EmailNotificationsEnabled { get; set; }
    public int? CommunityId { get; set; }
    public string? CommunityName { get; set; }
}

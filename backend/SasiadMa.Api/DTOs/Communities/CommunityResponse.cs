namespace SasiadMa.Api.DTOs.Communities;

public class CommunityResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AdminId { get; set; } = string.Empty;
    public string AdminName { get; set; } = string.Empty;
    public int MembersCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

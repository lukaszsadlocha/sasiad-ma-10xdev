namespace SasiadMa.Api.DTOs.Communities;

public class JoinCommunityResponse
{
    public int CommunityId { get; set; }
    public string CommunityName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

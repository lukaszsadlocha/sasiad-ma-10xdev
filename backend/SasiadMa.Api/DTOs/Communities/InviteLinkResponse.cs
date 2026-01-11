namespace SasiadMa.Api.DTOs.Communities;

public class InviteLinkResponse
{
    public string Token { get; set; } = string.Empty;
    public string FullUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

namespace SasiadMa.Api.DTOs.Messages;

public class ConversationDetailResponse
{
    public int Id { get; set; }
    public string OtherUserId { get; set; } = string.Empty;
    public string OtherUserName { get; set; } = string.Empty;
    public string? OtherUserAvatarUrl { get; set; }
    public List<MessageResponse> Messages { get; set; } = new();
}

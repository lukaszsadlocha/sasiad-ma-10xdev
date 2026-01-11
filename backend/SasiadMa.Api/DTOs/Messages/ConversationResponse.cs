namespace SasiadMa.Api.DTOs.Messages;

public class ConversationResponse
{
    public int Id { get; set; }
    public string OtherUserId { get; set; } = string.Empty;
    public string OtherUserName { get; set; } = string.Empty;
    public string? OtherUserAvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Last message info
    public string? LastMessageContent { get; set; }
    public DateTime? LastMessageSentAt { get; set; }
}

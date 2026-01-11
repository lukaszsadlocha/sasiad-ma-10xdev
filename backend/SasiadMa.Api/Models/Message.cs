namespace SasiadMa.Api.Models;

public class Message
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public Conversation Conversation { get; set; } = null!;
    public User Sender { get; set; } = null!;
}

using SasiadMa.Api.DTOs.Messages;

namespace SasiadMa.Api.Services;

public interface IMessageService
{
    Task<List<ConversationResponse>> GetMyConversationsAsync(string userId);
    Task<ConversationDetailResponse> GetConversationWithUserAsync(string currentUserId, string otherUserId);
    Task<MessageResponse> SendMessageAsync(SendMessageRequest request, string senderId);
}

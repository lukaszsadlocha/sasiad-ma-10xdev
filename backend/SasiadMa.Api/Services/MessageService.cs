using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SasiadMa.Api.Data;
using SasiadMa.Api.DTOs.Messages;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.Services;

public class MessageService : IMessageService
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;

    public MessageService(AppDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<List<ConversationResponse>> GetMyConversationsAsync(string userId)
    {
        var conversations = await _context.Conversations
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .Include(c => c.User1)
            .Include(c => c.User2)
            .Include(c => c.Messages)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();

        var result = new List<ConversationResponse>();

        foreach (var conv in conversations)
        {
            // Określ, kto jest "drugim użytkownikiem"
            var otherUser = conv.User1Id == userId ? conv.User2 : conv.User1;
            var lastMessage = conv.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();

            result.Add(new ConversationResponse
            {
                Id = conv.Id,
                OtherUserId = otherUser.Id,
                OtherUserName = otherUser.PreferredName,
                OtherUserAvatarUrl = otherUser.AvatarUrl,
                CreatedAt = conv.CreatedAt,
                UpdatedAt = conv.UpdatedAt,
                LastMessageContent = lastMessage?.Content,
                LastMessageSentAt = lastMessage?.SentAt
            });
        }

        return result;
    }

    public async Task<ConversationDetailResponse> GetConversationWithUserAsync(string currentUserId, string otherUserId)
    {
        // Sprawdź, czy użytkownicy istnieją
        var currentUser = await _userManager.FindByIdAsync(currentUserId);
        var otherUser = await _userManager.FindByIdAsync(otherUserId);

        if (currentUser == null || otherUser == null)
        {
            throw new InvalidOperationException("Użytkownik nie istnieje");
        }

        // Sprawdź, czy użytkownicy są w tej samej społeczności
        if (currentUser.CommunityId == null || currentUser.CommunityId != otherUser.CommunityId)
        {
            throw new InvalidOperationException("Możesz rozmawiać tylko z członkami swojej społeczności");
        }

        // Znajdź istniejącą konwersację (niezależnie od kolejności użytkowników)
        var conversation = await _context.Conversations
            .Where(c =>
                (c.User1Id == currentUserId && c.User2Id == otherUserId) ||
                (c.User1Id == otherUserId && c.User2Id == currentUserId))
            .Include(c => c.Messages)
                .ThenInclude(m => m.Sender)
            .FirstOrDefaultAsync();

        // Jeśli konwersacja nie istnieje, utwórz nową (ale bez wiadomości)
        if (conversation == null)
        {
            conversation = new Conversation
            {
                User1Id = currentUserId,
                User2Id = otherUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
        }

        // Przygotuj response
        var messages = conversation.Messages
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageResponse
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                SenderName = m.Sender.PreferredName,
                Content = m.Content,
                SentAt = m.SentAt
            })
            .ToList();

        return new ConversationDetailResponse
        {
            Id = conversation.Id,
            OtherUserId = otherUser.Id,
            OtherUserName = otherUser.PreferredName,
            OtherUserAvatarUrl = otherUser.AvatarUrl,
            Messages = messages
        };
    }

    public async Task<MessageResponse> SendMessageAsync(SendMessageRequest request, string senderId)
    {
        // Walidacja
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            throw new InvalidOperationException("Treść wiadomości nie może być pusta");
        }

        if (request.Content.Length > 1000)
        {
            throw new InvalidOperationException("Wiadomość nie może być dłuższa niż 1000 znaków");
        }

        // Sprawdź, czy użytkownicy istnieją
        var sender = await _userManager.FindByIdAsync(senderId);
        var recipient = await _userManager.FindByIdAsync(request.RecipientId);

        if (sender == null || recipient == null)
        {
            throw new InvalidOperationException("Użytkownik nie istnieje");
        }

        // Sprawdź, czy użytkownicy są w tej samej społeczności
        if (sender.CommunityId == null || sender.CommunityId != recipient.CommunityId)
        {
            throw new InvalidOperationException("Możesz wysyłać wiadomości tylko do członków swojej społeczności");
        }

        // Znajdź lub utwórz konwersację
        var conversation = await _context.Conversations
            .Where(c =>
                (c.User1Id == senderId && c.User2Id == request.RecipientId) ||
                (c.User1Id == request.RecipientId && c.User2Id == senderId))
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            conversation = new Conversation
            {
                User1Id = senderId,
                User2Id = request.RecipientId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
        }

        // Utwórz wiadomość
        var message = new Message
        {
            ConversationId = conversation.Id,
            SenderId = senderId,
            Content = request.Content,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);

        // Zaktualizuj czas ostatniej aktualizacji konwersacji
        conversation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new MessageResponse
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SenderName = sender.PreferredName,
            Content = message.Content,
            SentAt = message.SentAt
        };
    }
}

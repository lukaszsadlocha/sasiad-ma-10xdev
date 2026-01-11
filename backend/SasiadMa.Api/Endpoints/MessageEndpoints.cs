using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SasiadMa.Api.DTOs.Messages;
using SasiadMa.Api.Services;

namespace SasiadMa.Api.Endpoints;

public static class MessageEndpoints
{
    public static void MapMessageEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/messages")
            .RequireAuthorization()
            .WithTags("Messages");

        // GET /api/messages/conversations - Lista konwersacji
        group.MapGet("/conversations", async (
            [FromServices] IMessageService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Results.Unauthorized();
            }

            var result = await service.GetMyConversationsAsync(userId);
            return Results.Ok(result);
        })
        .WithName("GetMyConversations")
        .Produces<List<ConversationResponse>>();

        // GET /api/messages/conversations/{otherUserId} - Konwersacja z konkretnym użytkownikiem
        group.MapGet("/conversations/{otherUserId}", async (
            string otherUserId,
            [FromServices] IMessageService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Results.Unauthorized();
            }

            try
            {
                var result = await service.GetConversationWithUserAsync(userId, otherUserId);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("GetConversationWithUser")
        .Produces<ConversationDetailResponse>()
        .Produces(400);

        // POST /api/messages - Wyślij wiadomość
        group.MapPost("/", async (
            [FromBody] SendMessageRequest request,
            [FromServices] IMessageService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Results.Unauthorized();
            }

            try
            {
                var result = await service.SendMessageAsync(request, userId);
                return Results.Created($"/api/messages/{result.Id}", result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("SendMessage")
        .Produces<MessageResponse>(201)
        .Produces(400);
    }
}

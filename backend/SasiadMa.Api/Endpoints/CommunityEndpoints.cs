using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SasiadMa.Api.DTOs.Communities;
using SasiadMa.Api.Services;

namespace SasiadMa.Api.Endpoints;

public static class CommunityEndpoints
{
    public static void MapCommunityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/communities").WithTags("Communities");

        // POST /api/communities - Utworzenie społeczności (US-002)
        group.MapPost("/", async (
            [FromBody] CreateCommunityRequest request,
            [FromServices] ICommunityService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.CreateCommunityAsync(request, userId);
                return Results.Created($"/api/communities/{result.Id}", result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .RequireAuthorization()
        .WithName("CreateCommunity")
        .Produces<CommunityResponse>(201)
        .Produces(401)
        .Produces<object>(400);

        // POST /api/communities/{id}/invite-link - Generowanie linku zaproszeniowego (US-003)
        group.MapPost("/{id}/invite-link", async (
            int id,
            [FromServices] ICommunityService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.GenerateInviteLinkAsync(id, userId);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.StatusCode(403);
            }
        })
        .RequireAuthorization()
        .WithName("GenerateInviteLink")
        .Produces<InviteLinkResponse>(200)
        .Produces(401)
        .Produces(403)
        .Produces<object>(400);

        // POST /api/communities/join/{token} - Dołączenie do społeczności (US-004)
        group.MapPost("/join/{token}", async (
            string token,
            [FromServices] ICommunityService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.JoinCommunityAsync(token, userId);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .RequireAuthorization()
        .WithName("JoinCommunity")
        .Produces<JoinCommunityResponse>(200)
        .Produces(401)
        .Produces<object>(400);

        // GET /api/communities/my - Pobierz moją społeczność
        group.MapGet("/my", async (
            [FromServices] ICommunityService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var result = await service.GetMyCommunityAsync(userId);
            return result != null ? Results.Ok(result) : Results.NotFound();
        })
        .RequireAuthorization()
        .WithName("GetMyCommunity")
        .Produces<CommunityResponse>(200)
        .Produces(401)
        .Produces(404);

        // GET /api/communities/invite/{token} - Pobierz informacje o społeczności przez token
        // (dla strony rejestracji/dołączania)
        group.MapGet("/invite/{token}", async (
            string token,
            [FromServices] ICommunityService service) =>
        {
            var result = await service.GetCommunityByInviteTokenAsync(token);
            return result != null ? Results.Ok(result) : Results.NotFound();
        })
        .AllowAnonymous()
        .WithName("GetCommunityByInviteToken")
        .Produces<CommunityResponse>(200)
        .Produces(404);
    }
}

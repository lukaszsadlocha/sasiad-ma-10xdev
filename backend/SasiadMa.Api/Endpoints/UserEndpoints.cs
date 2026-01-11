using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SasiadMa.Api.DTOs.Users;
using SasiadMa.Api.Services;

namespace SasiadMa.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .RequireAuthorization()
            .WithTags("Users");

        // GET /api/users/profile - Pobierz profil użytkownika
        group.MapGet("/profile", async (
            [FromServices] IUserService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Results.Unauthorized();
            }

            var result = await service.GetUserProfileAsync(userId);
            return Results.Ok(result);
        });

        // PATCH /api/users/settings - Aktualizuj ustawienia użytkownika
        group.MapPatch("/settings", async (
            [FromBody] UpdateUserSettingsRequest request,
            [FromServices] IUserService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Results.Unauthorized();
            }

            var result = await service.UpdateUserSettingsAsync(userId, request);
            return Results.Ok(result);
        });
    }
}

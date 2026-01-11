using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SasiadMa.Api.DTOs.Items;
using SasiadMa.Api.Services;

namespace SasiadMa.Api.Endpoints;

public static class ItemEndpoints
{
    public static void MapItemEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/items")
            .RequireAuthorization()
            .WithTags("Items");

        // POST /api/items - Dodanie przedmiotu (US-005)
        group.MapPost("/", async (
            [FromForm] CreateItemRequest request,
            [FromForm] IFormFile? photo,
            [FromServices] IItemService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.CreateItemAsync(request, photo, userId);
                return Results.Created($"/api/items/{result.Id}", result);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .DisableAntiforgery() // Required for file upload
        .WithName("CreateItem")
        .Produces<ItemResponse>(201)
        .Produces(401)
        .Produces<object>(400);

        // GET /api/items - Lista przedmiotów w społeczności (US-006)
        group.MapGet("/", async (
            [FromServices] IItemService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var result = await service.GetCommunityItemsAsync(userId);
            return Results.Ok(result);
        })
        .WithName("GetCommunityItems")
        .Produces<List<ItemResponse>>(200)
        .Produces(401);

        // GET /api/items/{id} - Szczegóły przedmiotu (US-007)
        group.MapGet("/{id}", async (
            int id,
            [FromServices] IItemService service) =>
        {
            var result = await service.GetItemByIdAsync(id);
            return result != null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetItemById")
        .Produces<ItemResponse>(200)
        .Produces(404);

        // PATCH /api/items/{id}/status - Zmiana statusu (dostępny/niedostępny)
        group.MapPatch("/{id}/status", async (
            int id,
            [FromBody] UpdateItemStatusRequest request,
            [FromServices] IItemService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.UpdateItemStatusAsync(id, request.Status, userId);
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
        .WithName("UpdateItemStatus")
        .Produces<ItemResponse>(200)
        .Produces(401)
        .Produces(403)
        .Produces<object>(400);

        // GET /api/items/my - Moje przedmioty
        group.MapGet("/my", async (
            [FromServices] IItemService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var result = await service.GetMyItemsAsync(userId);
            return Results.Ok(result);
        })
        .WithName("GetMyItems")
        .Produces<List<ItemResponse>>(200)
        .Produces(401);
    }
}

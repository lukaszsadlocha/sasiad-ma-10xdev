using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SasiadMa.Api.DTOs.Bookings;
using SasiadMa.Api.Services;

namespace SasiadMa.Api.Endpoints;

public static class BookingEndpoints
{
    public static void MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bookings")
            .RequireAuthorization()
            .WithTags("Bookings");

        // POST /api/bookings - Rezerwacja przedmiotu (US-008)
        group.MapPost("/", async (
            [FromBody] CreateBookingRequest request,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.CreateBookingAsync(request, userId);
                return Results.Created($"/api/bookings/{result.Id}", result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("CreateBooking")
        .Produces<BookingResponse>(201)
        .Produces(401)
        .Produces<object>(400);

        // GET /api/bookings/my - Moje wypożyczenia (jako wypożyczający)
        group.MapGet("/my", async (
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var result = await service.GetMyBookingsAsync(userId);
            return Results.Ok(result);
        })
        .WithName("GetMyBookings")
        .Produces<List<BookingResponse>>(200)
        .Produces(401);

        // GET /api/bookings/my-items - Prośby oczekujące dla moich przedmiotów (jako właściciel)
        group.MapGet("/my-items", async (
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var result = await service.GetBookingsForMyItemsAsync(userId);
            return Results.Ok(result);
        })
        .WithName("GetMyItemsBookings")
        .Produces<List<BookingResponse>>(200)
        .Produces(401);

        // PATCH /api/bookings/{id}/approve - Akceptacja prośby (US-009)
        group.MapPatch("/{id}/approve", async (
            int id,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.ApproveBookingAsync(id, userId);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("ApproveBooking")
        .Produces<BookingResponse>(200)
        .Produces(401)
        .Produces<object>(400);

        // PATCH /api/bookings/{id}/reject - Odrzucenie prośby (US-009)
        group.MapPatch("/{id}/reject", async (
            int id,
            [FromBody] RejectBookingRequest request,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.RejectBookingAsync(id, request.Reason, userId);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("RejectBooking")
        .Produces<BookingResponse>(200)
        .Produces(401)
        .Produces<object>(400);

        // PATCH /api/bookings/{id}/hand-over - Potwierdzenie przekazania (US-010)
        group.MapPatch("/{id}/hand-over", async (
            int id,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.ConfirmHandOverAsync(id, userId);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("ConfirmHandOver")
        .Produces<BookingResponse>(200)
        .Produces(401)
        .Produces<object>(400);

        // PATCH /api/bookings/{id}/return - Potwierdzenie zwrotu (US-010)
        group.MapPatch("/{id}/return", async (
            int id,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            try
            {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Results.Unauthorized();
                }

                var result = await service.ConfirmReturnAsync(id, userId);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("ConfirmReturn")
        .Produces<BookingResponse>(200)
        .Produces(401)
        .Produces<object>(400);
    }
}

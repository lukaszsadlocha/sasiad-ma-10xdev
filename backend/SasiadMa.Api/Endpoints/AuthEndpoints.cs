using Microsoft.AspNetCore.Mvc;
using SasiadMa.Api.DTOs.Auth;
using SasiadMa.Api.Services;

namespace SasiadMa.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", async (
            [FromBody] RegisterRequest request,
            [FromServices] IAuthService authService) =>
        {
            try
            {
                var result = await authService.RegisterAsync(request);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("Register")
        .Produces<AuthResponse>(200)
        .Produces<object>(400);

        group.MapPost("/login", async (
            [FromBody] LoginRequest request,
            [FromServices] IAuthService authService) =>
        {
            try
            {
                var result = await authService.LoginAsync(request);
                return Results.Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Unauthorized();
            }
        })
        .WithName("Login")
        .Produces<AuthResponse>(200)
        .Produces(401);

        group.MapPost("/refresh", async (
            [FromBody] RefreshTokenRequest request,
            [FromServices] IAuthService authService) =>
        {
            try
            {
                var result = await authService.RefreshTokenAsync(request.RefreshToken);
                return Results.Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Unauthorized();
            }
        })
        .WithName("RefreshToken")
        .Produces<AuthResponse>(200)
        .Produces(401);
    }
}

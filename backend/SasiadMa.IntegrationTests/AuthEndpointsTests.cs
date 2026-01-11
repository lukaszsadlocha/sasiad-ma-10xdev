using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using SasiadMa.Api.DTOs.Auth;

namespace SasiadMa.IntegrationTests;

public class AuthEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthEndpointsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsCreatedWithTokens()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Test123!",
            PreferredName = "Test User",
            AcceptTerms = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        authResponse.Should().NotBeNull();
        authResponse!.AccessToken.Should().NotBeNullOrEmpty();
        authResponse.RefreshToken.Should().NotBeNullOrEmpty();
        authResponse.User.Email.Should().Be(request.Email);
        authResponse.User.PreferredName.Should().Be(request.PreferredName);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "duplicate@example.com",
            Password = "Test123!",
            PreferredName = "Test User",
            AcceptTerms = true
        };

        // First registration
        await _client.PostAsJsonAsync("/api/auth/register", request);

        // Act - Second registration with same email
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithoutAcceptingTerms_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "noterms@example.com",
            Password = "Test123!",
            PreferredName = "Test User",
            AcceptTerms = false
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithWeakPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "weak@example.com",
            Password = "123", // Too short, missing uppercase, no special char
            PreferredName = "Test User",
            AcceptTerms = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkWithTokens()
    {
        // Arrange - Register a user first
        var registerRequest = new RegisterRequest
        {
            Email = "login@example.com",
            Password = "Test123!",
            PreferredName = "Test User",
            AcceptTerms = true
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "login@example.com",
            Password = "Test123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        authResponse.Should().NotBeNull();
        authResponse!.AccessToken.Should().NotBeNullOrEmpty();
        authResponse.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithInvalidEmail_ReturnsUnauthorized()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "Test123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange - Register a user first
        var registerRequest = new RegisterRequest
        {
            Email = "wrongpass@example.com",
            Password = "Test123!",
            PreferredName = "Test User",
            AcceptTerms = true
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "wrongpass@example.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}

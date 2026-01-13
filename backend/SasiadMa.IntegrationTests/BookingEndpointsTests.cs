using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using SasiadMa.Api.DTOs.Auth;
using SasiadMa.Api.DTOs.Bookings;
using SasiadMa.Api.DTOs.Communities;
using SasiadMa.Api.DTOs.Items;
using SasiadMa.Api.Models;
using Xunit;

namespace SasiadMa.IntegrationTests;

public class BookingEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public BookingEndpointsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterAndGetTokenAsync(string email, string name, string? inviteToken = null)
    {
        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = "Test123!",
            PreferredName = name,
            AcceptTerms = true,
            InviteToken = inviteToken
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return authResponse!.AccessToken;
    }

    private async Task<string> CreateCommunityAndGetInviteTokenAsync(string ownerToken)
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerToken);

        var communityRequest = new CreateCommunityRequest
        {
            Name = "Test Community",
            Description = "Test Description"
        };

        var communityResponse = await _client.PostAsJsonAsync("/api/communities", communityRequest);
        var community = await communityResponse.Content.ReadFromJsonAsync<CommunityResponse>();

        var inviteResponse = await _client.PostAsync($"/api/communities/{community!.Id}/invite-link", null);
        var inviteLink = await inviteResponse.Content.ReadFromJsonAsync<InviteLinkResponse>();
        return inviteLink!.Token;
    }

    private async Task<int> CreateItemAsync(string token)
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateItemRequest
        {
            Name = "Test Item",
            Category = "Narzędzia ogrodowe",
            Description = "Test description"
        };

        var response = await _client.PostAsJsonAsync("/api/items", request);
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        return item!.Id;
    }

    [Fact]
    public async Task CreateBooking_WithValidData_ReturnsCreated()
    {
        // Arrange
        var ownerToken = await RegisterAndGetTokenAsync("owner1@example.com", "Owner 1");
        var inviteToken = await CreateCommunityAndGetInviteTokenAsync(ownerToken);
        var borrowerToken = await RegisterAndGetTokenAsync("borrower1@example.com", "Borrower 1", inviteToken);
        var itemId = await CreateItemAsync(ownerToken);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", borrowerToken);

        var request = new CreateBookingRequest
        {
            ItemId = itemId,
            RequestedFrom = DateTime.UtcNow.AddDays(1),
            RequestedTo = DateTime.UtcNow.AddDays(3),
            BorrowerNote = "Please, I need it"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bookings", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var booking = await response.Content.ReadFromJsonAsync<BookingResponse>();
        booking.Should().NotBeNull();
        booking!.Status.Should().Be(BookingStatus.Pending);
        booking.ItemId.Should().Be(itemId);
    }

    [Fact]
    public async Task CreateBooking_ForOwnItem_ReturnsBadRequest()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("ownitem@example.com", "Own Item User");
        var inviteToken = await CreateCommunityAndGetInviteTokenAsync(token);
        var itemId = await CreateItemAsync(token);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateBookingRequest
        {
            ItemId = itemId,
            RequestedFrom = DateTime.UtcNow.AddDays(1),
            RequestedTo = DateTime.UtcNow.AddDays(3)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bookings", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateBooking_WithInvalidDates_ReturnsBadRequest()
    {
        // Arrange
        var ownerToken = await RegisterAndGetTokenAsync("owner2@example.com", "Owner 2");
        var inviteToken = await CreateCommunityAndGetInviteTokenAsync(ownerToken);
        var borrowerToken = await RegisterAndGetTokenAsync("borrower2@example.com", "Borrower 2", inviteToken);
        var itemId = await CreateItemAsync(ownerToken);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", borrowerToken);

        var request = new CreateBookingRequest
        {
            ItemId = itemId,
            RequestedFrom = DateTime.UtcNow.AddDays(3),
            RequestedTo = DateTime.UtcNow.AddDays(1) // To before From
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bookings", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateBooking_ExceedingMaxDuration_ReturnsBadRequest()
    {
        // Arrange
        var ownerToken = await RegisterAndGetTokenAsync("owner3@example.com", "Owner 3");
        var inviteToken = await CreateCommunityAndGetInviteTokenAsync(ownerToken);
        var borrowerToken = await RegisterAndGetTokenAsync("borrower3@example.com", "Borrower 3", inviteToken);
        var itemId = await CreateItemAsync(ownerToken);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", borrowerToken);

        var request = new CreateBookingRequest
        {
            ItemId = itemId,
            RequestedFrom = DateTime.UtcNow.AddDays(1),
            RequestedTo = DateTime.UtcNow.AddDays(20) // More than 14 days
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bookings", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ApproveBooking_AsOwner_ChangesStatusToApproved()
    {
        // Arrange
        var ownerToken = await RegisterAndGetTokenAsync("owner4@example.com", "Owner 4");
        var inviteToken = await CreateCommunityAndGetInviteTokenAsync(ownerToken);
        var borrowerToken = await RegisterAndGetTokenAsync("borrower4@example.com", "Borrower 4", inviteToken);
        var itemId = await CreateItemAsync(ownerToken);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", borrowerToken);
        var createRequest = new CreateBookingRequest
        {
            ItemId = itemId,
            RequestedFrom = DateTime.UtcNow.AddDays(1),
            RequestedTo = DateTime.UtcNow.AddDays(3)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/bookings", createRequest);
        var booking = await createResponse.Content.ReadFromJsonAsync<BookingResponse>();

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerToken);

        // Act
        var response = await _client.PatchAsync($"/api/bookings/{booking!.Id}/approve", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<BookingResponse>();
        updated!.Status.Should().Be(BookingStatus.Approved);
    }

    [Fact]
    public async Task RejectBooking_AsOwner_ChangesStatusToRejected()
    {
        // Arrange
        var ownerToken = await RegisterAndGetTokenAsync("owner5@example.com", "Owner 5");
        var inviteToken = await CreateCommunityAndGetInviteTokenAsync(ownerToken);
        var borrowerToken = await RegisterAndGetTokenAsync("borrower5@example.com", "Borrower 5", inviteToken);
        var itemId = await CreateItemAsync(ownerToken);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", borrowerToken);
        var createRequest = new CreateBookingRequest
        {
            ItemId = itemId,
            RequestedFrom = DateTime.UtcNow.AddDays(1),
            RequestedTo = DateTime.UtcNow.AddDays(3)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/bookings", createRequest);
        var booking = await createResponse.Content.ReadFromJsonAsync<BookingResponse>();

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerToken);

        var rejectRequest = new RejectBookingRequest
        {
            Reason = "Not available on those dates"
        };

        // Act
        var response = await _client.PatchAsJsonAsync($"/api/bookings/{booking!.Id}/reject", rejectRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<BookingResponse>();
        updated!.Status.Should().Be(BookingStatus.Rejected);
        updated.RejectionReason.Should().Be("Not available on those dates");
    }

    [Fact]
    public async Task GetMyBookings_ReturnsBookingsAsBorrower()
    {
        // Arrange
        var ownerToken = await RegisterAndGetTokenAsync("owner6@example.com", "Owner 6");
        var inviteToken = await CreateCommunityAndGetInviteTokenAsync(ownerToken);
        var borrowerToken = await RegisterAndGetTokenAsync("borrower6@example.com", "Borrower 6", inviteToken);
        var itemId = await CreateItemAsync(ownerToken);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", borrowerToken);
        var createRequest = new CreateBookingRequest
        {
            ItemId = itemId,
            RequestedFrom = DateTime.UtcNow.AddDays(1),
            RequestedTo = DateTime.UtcNow.AddDays(3)
        };
        await _client.PostAsJsonAsync("/api/bookings", createRequest);

        // Act
        var response = await _client.GetAsync("/api/bookings/my");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var bookings = await response.Content.ReadFromJsonAsync<List<BookingResponse>>();
        bookings.Should().NotBeNull();
        bookings!.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task GetBookingsForMyItems_ReturnsBookingsAsOwner()
    {
        // Arrange
        var ownerToken = await RegisterAndGetTokenAsync("owner7@example.com", "Owner 7");
        var inviteToken = await CreateCommunityAndGetInviteTokenAsync(ownerToken);
        var borrowerToken = await RegisterAndGetTokenAsync("borrower7@example.com", "Borrower 7", inviteToken);
        var itemId = await CreateItemAsync(ownerToken);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", borrowerToken);
        var createRequest = new CreateBookingRequest
        {
            ItemId = itemId,
            RequestedFrom = DateTime.UtcNow.AddDays(1),
            RequestedTo = DateTime.UtcNow.AddDays(3)
        };
        await _client.PostAsJsonAsync("/api/bookings", createRequest);

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerToken);

        // Act
        var response = await _client.GetAsync("/api/bookings/my-items");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var bookings = await response.Content.ReadFromJsonAsync<List<BookingResponse>>();
        bookings.Should().NotBeNull();
        bookings!.Should().HaveCountGreaterThan(0);
    }
}

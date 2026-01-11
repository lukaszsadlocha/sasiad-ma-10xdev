using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using SasiadMa.Api.DTOs.Auth;
using SasiadMa.Api.DTOs.Communities;
using SasiadMa.Api.DTOs.Items;
using SasiadMa.Api.Models;

namespace SasiadMa.IntegrationTests;

public class ItemEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ItemEndpointsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterAndGetTokenAsync(string email, string name)
    {
        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = "Test123!",
            PreferredName = name,
            AcceptTerms = true
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return authResponse!.AccessToken;
    }

    private async Task<int> CreateCommunityAsync(string token)
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var communityRequest = new CreateCommunityRequest
        {
            Name = "Test Community",
            Description = "Test Description"
        };

        var response = await _client.PostAsJsonAsync("/api/communities", communityRequest);
        var community = await response.Content.ReadFromJsonAsync<CommunityResponse>();
        return community!.Id;
    }

    [Fact]
    public async Task CreateItem_WithValidData_ReturnsCreated()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("item1@example.com", "Item User 1");
        await CreateCommunityAsync(token);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateItemRequest
        {
            Name = "Test Item",
            Category = "Narzędzia ogrodowe",
            Description = "Test description for the item"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/items", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        item.Should().NotBeNull();
        item!.Name.Should().Be(request.Name);
        item.Category.Should().Be(request.Category);
        item.Description.Should().Be(request.Description);
        item.Status.Should().Be(ItemStatus.Available);
    }

    [Fact]
    public async Task CreateItem_WithoutCommunity_ReturnsBadRequest()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("nocommunity@example.com", "No Community User");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateItemRequest
        {
            Name = "Test Item",
            Category = "Narzędzia ogrodowe",
            Description = "Test description"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/items", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetItems_ReturnsItemsInCommunity()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("getitems@example.com", "Get Items User");
        await CreateCommunityAsync(token);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create an item first
        var createRequest = new CreateItemRequest
        {
            Name = "Test Item for List",
            Category = "Sport",
            Description = "Test description"
        };
        await _client.PostAsJsonAsync("/api/items", createRequest);

        // Act
        var response = await _client.GetAsync("/api/items");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var items = await response.Content.ReadFromJsonAsync<List<ItemResponse>>();
        items.Should().NotBeNull();
        items!.Should().HaveCountGreaterThan(0);
        items.Should().Contain(i => i.Name == "Test Item for List");
    }

    [Fact]
    public async Task GetItemById_ExistingItem_ReturnsItem()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("getbyid@example.com", "Get By Id User");
        await CreateCommunityAsync(token);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createRequest = new CreateItemRequest
        {
            Name = "Test Item By Id",
            Category = "Elektronika",
            Description = "Test description"
        };
        var createResponse = await _client.PostAsJsonAsync("/api/items", createRequest);
        var createdItem = await createResponse.Content.ReadFromJsonAsync<ItemResponse>();

        // Act
        var response = await _client.GetAsync($"/api/items/{createdItem!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        item.Should().NotBeNull();
        item!.Id.Should().Be(createdItem.Id);
        item.Name.Should().Be("Test Item By Id");
    }

    [Fact]
    public async Task GetItemById_NonExistentItem_ReturnsNotFound()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("notfound@example.com", "Not Found User");
        await CreateCommunityAsync(token);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/items/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetMyItems_ReturnsOnlyOwnItems()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("myitems@example.com", "My Items User");
        await CreateCommunityAsync(token);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create items
        var item1 = new CreateItemRequest
        {
            Name = "My Item 1",
            Category = "Kuchnia",
            Description = "Description 1"
        };
        var item2 = new CreateItemRequest
        {
            Name = "My Item 2",
            Category = "Książki",
            Description = "Description 2"
        };
        await _client.PostAsJsonAsync("/api/items", item1);
        await _client.PostAsJsonAsync("/api/items", item2);

        // Act
        var response = await _client.GetAsync("/api/items/my");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var items = await response.Content.ReadFromJsonAsync<List<ItemResponse>>();
        items.Should().NotBeNull();
        items!.Should().HaveCount(2);
        items.Should().Contain(i => i.Name == "My Item 1");
        items.Should().Contain(i => i.Name == "My Item 2");
    }
}

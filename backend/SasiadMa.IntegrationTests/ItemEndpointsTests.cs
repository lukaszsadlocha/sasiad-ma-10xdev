using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using SasiadMa.Api.DTOs.Auth;
using SasiadMa.Api.DTOs.Communities;
using SasiadMa.Api.DTOs.Items;
using SasiadMa.Api.Models;
using Xunit;

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

        var content = new MultipartFormDataContent
        {
            { new StringContent("Test Item"), "Name" },
            { new StringContent("Narzędzia ogrodowe"), "Category" },
            { new StringContent("Test description for the item"), "Description" }
        };

        // Act
        var response = await _client.PostAsync("/api/items", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var item = await response.Content.ReadFromJsonAsync<ItemResponse>();
        item.Should().NotBeNull();
        item!.Name.Should().Be("Test Item");
        item.Category.Should().Be("Narzędzia ogrodowe");
        item.Description.Should().Be("Test description for the item");
        item.Status.Should().Be(ItemStatus.Available);
    }

    [Fact]
    public async Task CreateItem_WithoutCommunity_ReturnsBadRequest()
    {
        // Arrange
        var token = await RegisterAndGetTokenAsync("nocommunity@example.com", "No Community User");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var content = new MultipartFormDataContent
        {
            { new StringContent("Test Item"), "Name" },
            { new StringContent("Narzędzia ogrodowe"), "Category" },
            { new StringContent("Test description"), "Description" }
        };

        // Act
        var response = await _client.PostAsync("/api/items", content);

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
        var content = new MultipartFormDataContent
        {
            { new StringContent("Test Item for List"), "Name" },
            { new StringContent("Sport"), "Category" },
            { new StringContent("Test description"), "Description" }
        };
        await _client.PostAsync("/api/items", content);

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

        var content = new MultipartFormDataContent
        {
            { new StringContent("Test Item By Id"), "Name" },
            { new StringContent("Elektronika"), "Category" },
            { new StringContent("Test description"), "Description" }
        };
        var createResponse = await _client.PostAsync("/api/items", content);
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
        var content1 = new MultipartFormDataContent
        {
            { new StringContent("My Item 1"), "Name" },
            { new StringContent("Kuchnia"), "Category" },
            { new StringContent("Description 1"), "Description" }
        };
        var content2 = new MultipartFormDataContent
        {
            { new StringContent("My Item 2"), "Name" },
            { new StringContent("Książki"), "Category" },
            { new StringContent("Description 2"), "Description" }
        };
        await _client.PostAsync("/api/items", content1);
        await _client.PostAsync("/api/items", content2);

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

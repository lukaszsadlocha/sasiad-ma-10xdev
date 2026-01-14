using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using SasiadMa.Api.Data;
using SasiadMa.Api.DTOs.Items;
using SasiadMa.Api.Models;
using SasiadMa.Api.Services;

namespace SasiadMa.UnitTests;

public class ItemServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly Mock<IStorageService> _storageServiceMock;
    private readonly ItemService _itemService;

    public ItemServiceTests()
    {
        // Setup in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);

        // Setup UserManager mock
        var store = new Mock<IUserStore<User>>();
        _userManagerMock = new Mock<UserManager<User>>(
            store.Object, null, null, null, null, null, null, null, null);

        // Setup StorageService mock
        _storageServiceMock = new Mock<IStorageService>();

        _itemService = new ItemService(
            _context,
            _userManagerMock.Object,
            _storageServiceMock.Object);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task CreateItemAsync_WithValidRequest_ShouldCreateItem()
    {
        // Arrange
        var userId = "user-123";
        var communityId = 1;

        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "Test User",
            CommunityId = communityId,
            Community = new Community { Id = communityId, Name = "Test Community" }
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new CreateItemRequest
        {
            Name = "Test Item",
            Category = "Tools",
            Description = "A test item description"
        };

        // Act
        var result = await _itemService.CreateItemAsync(request, null, userId);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Test Item");
        result.Category.Should().Be("Tools");
        result.Description.Should().Be("A test item description");
        result.Status.Should().Be(ItemStatus.Available);
        result.OwnerId.Should().Be(userId);
        result.OwnerName.Should().Be("Test User");
        result.CommunityId.Should().Be(communityId);

        var item = await _context.Items.FirstOrDefaultAsync();
        item.Should().NotBeNull();
        item!.Name.Should().Be("Test Item");
    }

    [Fact]
    public async Task CreateItemAsync_WithPhoto_ShouldUploadPhotoAndCreateItem()
    {
        // Arrange
        var userId = "user-123";
        var communityId = 1;
        var photoUrl = "https://storage.example.com/item-photo.jpg";

        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "Test User",
            CommunityId = communityId,
            Community = new Community { Id = communityId, Name = "Test Community" }
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new CreateItemRequest
        {
            Name = "Test Item",
            Category = "Tools",
            Description = "A test item description"
        };

        var photoMock = new Mock<IFormFile>();
        photoMock.Setup(p => p.FileName).Returns("photo.jpg");
        photoMock.Setup(p => p.Length).Returns(1024);

        _storageServiceMock
            .Setup(s => s.UploadItemPhotoAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync(photoUrl);

        // Act
        var result = await _itemService.CreateItemAsync(request, photoMock.Object, userId);

        // Assert
        result.Should().NotBeNull();
        result.PhotoUrl.Should().Be(photoUrl);

        _storageServiceMock.Verify(
            s => s.UploadItemPhotoAsync(It.IsAny<IFormFile>(), It.IsAny<string>()),
            Times.Once);

        var item = await _context.Items.FirstOrDefaultAsync();
        item!.PhotoUrl.Should().Be(photoUrl);
    }

    [Fact]
    public async Task CreateItemAsync_WhenUserDoesNotExist_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var request = new CreateItemRequest
        {
            Name = "Test Item",
            Category = "Tools",
            Description = "A test item description"
        };

        // Act & Assert
        var act = async () => await _itemService.CreateItemAsync(request, null, "non-existent-user");

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Użytkownik nie istnieje");
    }

    [Fact]
    public async Task CreateItemAsync_WhenUserNotInCommunity_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var userId = "user-123";
        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "Test User",
            CommunityId = null // User not in any community
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new CreateItemRequest
        {
            Name = "Test Item",
            Category = "Tools",
            Description = "A test item description"
        };

        // Act & Assert
        var act = async () => await _itemService.CreateItemAsync(request, null, userId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Musisz należeć do społeczności, aby dodać przedmiot");
    }

    [Fact]
    public async Task GetCommunityItemsAsync_ShouldReturnItemsFromUserCommunity()
    {
        // Arrange
        var userId = "user-123";
        var communityId = 1;

        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "Test User",
            CommunityId = communityId
        };

        var otherUser = new User
        {
            Id = "other-user",
            Email = "other@test.com",
            PreferredName = "Other User",
            CommunityId = communityId
        };

        var item1 = new Item
        {
            Id = 1,
            Name = "Item 1",
            Category = "Tools",
            OwnerId = userId,
            Owner = user,
            CommunityId = communityId,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        var item2 = new Item
        {
            Id = 2,
            Name = "Item 2",
            Category = "Books",
            OwnerId = "other-user",
            Owner = otherUser,
            CommunityId = communityId,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var item3 = new Item
        {
            Id = 3,
            Name = "Item 3",
            Category = "Sports",
            OwnerId = "someone-else",
            CommunityId = 2, // Different community
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.AddRange(user, otherUser);
        _context.Items.AddRange(item1, item2, item3);
        await _context.SaveChangesAsync();

        _userManagerMock.Setup(um => um.FindByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _itemService.GetCommunityItemsAsync(userId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(i => i.Name == "Item 1");
        result.Should().Contain(i => i.Name == "Item 2");
        result.Should().NotContain(i => i.Name == "Item 3");

        // Should be ordered by CreatedAt descending
        result[0].Name.Should().Be("Item 2");
        result[1].Name.Should().Be("Item 1");
    }

    [Fact]
    public async Task GetCommunityItemsAsync_WhenUserNotInCommunity_ShouldReturnEmptyList()
    {
        // Arrange
        var userId = "user-123";
        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "Test User",
            CommunityId = null
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _userManagerMock.Setup(um => um.FindByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _itemService.GetCommunityItemsAsync(userId);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetItemByIdAsync_WithValidId_ShouldReturnItem()
    {
        // Arrange
        var userId = "user-123";
        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "Test User"
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            Category = "Tools",
            Description = "A test item",
            OwnerId = userId,
            Owner = user,
            CommunityId = 1,
            Status = ItemStatus.Available
        };

        _context.Users.Add(user);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        // Act
        var result = await _itemService.GetItemByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Name.Should().Be("Test Item");
        result.OwnerName.Should().Be("Test User");
    }

    [Fact]
    public async Task GetItemByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        // Act
        var result = await _itemService.GetItemByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateItemStatusAsync_WithValidRequest_ShouldUpdateStatus()
    {
        // Arrange
        var userId = "user-123";
        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "Test User"
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            Category = "Tools",
            OwnerId = userId,
            Owner = user,
            CommunityId = 1,
            Status = ItemStatus.Available
        };

        _context.Users.Add(user);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        // Act
        var result = await _itemService.UpdateItemStatusAsync(1, ItemStatus.Unavailable, userId);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be(ItemStatus.Unavailable);

        var updatedItem = await _context.Items.FindAsync(1);
        updatedItem!.Status.Should().Be(ItemStatus.Unavailable);
    }

    [Fact]
    public async Task UpdateItemStatusAsync_WhenItemDoesNotExist_ShouldThrowInvalidOperationException()
    {
        // Act & Assert
        var act = async () => await _itemService.UpdateItemStatusAsync(999, ItemStatus.Unavailable, "user-123");

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Przedmiot nie istnieje");
    }

    [Fact]
    public async Task UpdateItemStatusAsync_WhenNotOwner_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var ownerId = "owner-123";
        var otherUserId = "other-456";

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@test.com",
            PreferredName = "Owner"
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            Category = "Tools",
            OwnerId = ownerId,
            Owner = owner,
            CommunityId = 1,
            Status = ItemStatus.Available
        };

        _context.Users.Add(owner);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        // Act & Assert
        var act = async () => await _itemService.UpdateItemStatusAsync(1, ItemStatus.Unavailable, otherUserId);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Tylko właściciel może zmienić status przedmiotu");
    }

    [Fact]
    public async Task GetMyItemsAsync_ShouldReturnOnlyUserItems()
    {
        // Arrange
        var userId = "user-123";
        var otherUserId = "other-456";

        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "Test User"
        };

        var otherUser = new User
        {
            Id = otherUserId,
            Email = "other@test.com",
            PreferredName = "Other User"
        };

        var userItem1 = new Item
        {
            Id = 1,
            Name = "My Item 1",
            Category = "Tools",
            OwnerId = userId,
            Owner = user,
            CommunityId = 1,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var userItem2 = new Item
        {
            Id = 2,
            Name = "My Item 2",
            Category = "Books",
            OwnerId = userId,
            Owner = user,
            CommunityId = 1,
            CreatedAt = DateTime.UtcNow
        };

        var otherItem = new Item
        {
            Id = 3,
            Name = "Other Item",
            Category = "Sports",
            OwnerId = otherUserId,
            Owner = otherUser,
            CommunityId = 1,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        _context.Users.AddRange(user, otherUser);
        _context.Items.AddRange(userItem1, userItem2, otherItem);
        await _context.SaveChangesAsync();

        // Act
        var result = await _itemService.GetMyItemsAsync(userId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(i => i.Name == "My Item 1");
        result.Should().Contain(i => i.Name == "My Item 2");
        result.Should().NotContain(i => i.Name == "Other Item");

        // Should be ordered by CreatedAt descending
        result[0].Name.Should().Be("My Item 2");
        result[1].Name.Should().Be("My Item 1");
    }
}

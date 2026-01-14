using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using SasiadMa.Api.Data;
using SasiadMa.Api.DTOs.Bookings;
using SasiadMa.Api.Models;
using SasiadMa.Api.Services;

namespace SasiadMa.UnitTests;

public class BookingServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly BookingService _bookingService;

    public BookingServiceTests()
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

        // Setup EmailService mock
        _emailServiceMock = new Mock<IEmailService>();

        _bookingService = new BookingService(
            _context,
            _userManagerMock.Object,
            _emailServiceMock.Object);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task CreateBookingAsync_WithValidRequest_ShouldCreateBooking()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";
        var communityId = 1;

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@test.com",
            PreferredName = "Owner",
            CommunityId = communityId
        };

        var borrower = new User
        {
            Id = borrowerId,
            Email = "borrower@test.com",
            PreferredName = "Borrower",
            CommunityId = communityId,
            Community = new Community { Id = communityId, Name = "Test Community" }
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            Category = "Tools",
            Description = "A test item",
            OwnerId = ownerId,
            Owner = owner,
            CommunityId = communityId,
            Status = ItemStatus.Available
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = item.Id,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3),
            BorrowerNote = "Need this for a project"
        };

        // Act
        var result = await _bookingService.CreateBookingAsync(request, borrowerId);

        // Assert
        result.Should().NotBeNull();
        result.ItemId.Should().Be(item.Id);
        result.BorrowerId.Should().Be(borrowerId);
        result.OwnerId.Should().Be(ownerId);
        result.Status.Should().Be(BookingStatus.Pending);
        result.BorrowerNote.Should().Be("Need this for a project");

        var booking = await _context.Bookings.FirstOrDefaultAsync();
        booking.Should().NotBeNull();
        booking!.Status.Should().Be(BookingStatus.Pending);
    }

    [Fact]
    public async Task CreateBookingAsync_WhenUserDoesNotExist_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var request = new CreateBookingRequest
        {
            ItemId = 1,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3)
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, "non-existent-user");

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Użytkownik nie istnieje");
    }

    [Fact]
    public async Task CreateBookingAsync_WhenUserNotInCommunity_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var userId = "user-123";
        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "User",
            CommunityId = null
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = 1,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3)
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, userId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Musisz należeć do społeczności, aby rezerwować przedmioty");
    }

    [Fact]
    public async Task CreateBookingAsync_WhenItemDoesNotExist_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var userId = "user-123";
        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "User",
            CommunityId = 1,
            Community = new Community { Id = 1, Name = "Test Community" }
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = 999, // Non-existent item
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3)
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, userId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Przedmiot nie istnieje");
    }

    [Fact]
    public async Task CreateBookingAsync_WhenItemNotAvailable_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";
        var communityId = 1;

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@test.com",
            PreferredName = "Owner",
            CommunityId = communityId
        };

        var borrower = new User
        {
            Id = borrowerId,
            Email = "borrower@test.com",
            PreferredName = "Borrower",
            CommunityId = communityId,
            Community = new Community { Id = communityId, Name = "Test Community" }
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            OwnerId = ownerId,
            Owner = owner,
            CommunityId = communityId,
            Status = ItemStatus.Borrowed // Item is already borrowed
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = item.Id,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3)
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, borrowerId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Przedmiot nie jest dostępny do rezerwacji");
    }

    [Fact]
    public async Task CreateBookingAsync_WhenBookingOwnItem_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var userId = "user-123";
        var communityId = 1;

        var user = new User
        {
            Id = userId,
            Email = "user@test.com",
            PreferredName = "User",
            CommunityId = communityId,
            Community = new Community { Id = communityId, Name = "Test Community" }
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            OwnerId = userId, // User owns this item
            Owner = user,
            CommunityId = communityId,
            Status = ItemStatus.Available
        };

        _context.Users.Add(user);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = item.Id,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3)
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, userId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Nie możesz rezerwować własnych przedmiotów");
    }

    [Fact]
    public async Task CreateBookingAsync_WhenDifferentCommunities_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@test.com",
            PreferredName = "Owner",
            CommunityId = 1
        };

        var borrower = new User
        {
            Id = borrowerId,
            Email = "borrower@test.com",
            PreferredName = "Borrower",
            CommunityId = 2, // Different community
            Community = new Community { Id = 2, Name = "Other Community" }
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            OwnerId = ownerId,
            Owner = owner,
            CommunityId = 1,
            Status = ItemStatus.Available
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = item.Id,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3)
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, borrowerId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Przedmiot należy do innej społeczności");
    }

    [Fact]
    public async Task CreateBookingAsync_WhenRequestedFromInPast_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";
        var communityId = 1;

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@test.com",
            PreferredName = "Owner",
            CommunityId = communityId
        };

        var borrower = new User
        {
            Id = borrowerId,
            Email = "borrower@test.com",
            PreferredName = "Borrower",
            CommunityId = communityId,
            Community = new Community { Id = communityId, Name = "Test Community" }
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            OwnerId = ownerId,
            Owner = owner,
            CommunityId = communityId,
            Status = ItemStatus.Available
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = item.Id,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(-1), // In the past
            RequestedTo = DateTime.UtcNow.Date.AddDays(3)
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, borrowerId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Data od nie może być w przeszłości");
    }

    [Fact]
    public async Task CreateBookingAsync_WhenRequestedToBeforeRequestedFrom_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";
        var communityId = 1;

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@test.com",
            PreferredName = "Owner",
            CommunityId = communityId
        };

        var borrower = new User
        {
            Id = borrowerId,
            Email = "borrower@test.com",
            PreferredName = "Borrower",
            CommunityId = communityId,
            Community = new Community { Id = communityId, Name = "Test Community" }
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            OwnerId = ownerId,
            Owner = owner,
            CommunityId = communityId,
            Status = ItemStatus.Available
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = item.Id,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(5),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3) // Before RequestedFrom
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, borrowerId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Data do musi być później niż data od");
    }

    [Fact]
    public async Task CreateBookingAsync_WhenDurationExceeds14Days_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";
        var communityId = 1;

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@test.com",
            PreferredName = "Owner",
            CommunityId = communityId
        };

        var borrower = new User
        {
            Id = borrowerId,
            Email = "borrower@test.com",
            PreferredName = "Borrower",
            CommunityId = communityId,
            Community = new Community { Id = communityId, Name = "Test Community" }
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            OwnerId = ownerId,
            Owner = owner,
            CommunityId = communityId,
            Status = ItemStatus.Available
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var request = new CreateBookingRequest
        {
            ItemId = item.Id,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(16) // 15 days duration
        };

        // Act & Assert
        var act = async () => await _bookingService.CreateBookingAsync(request, borrowerId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Rezerwacja nie może być dłuższa niż 14 dni");
    }

    [Fact]
    public async Task ApproveBookingAsync_WithValidBooking_ShouldApproveBooking()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";

        var owner = new User
        {
            Id = ownerId,
            Email = "owner@test.com",
            PreferredName = "Owner"
        };

        var borrower = new User
        {
            Id = borrowerId,
            Email = "borrower@test.com",
            PreferredName = "Borrower"
        };

        var item = new Item
        {
            Id = 1,
            Name = "Test Item",
            OwnerId = ownerId,
            Owner = owner
        };

        var booking = new Booking
        {
            Id = 1,
            ItemId = item.Id,
            Item = item,
            BorrowerId = borrowerId,
            Borrower = borrower,
            OwnerId = ownerId,
            Owner = owner,
            Status = BookingStatus.Pending,
            RequestedFrom = DateTime.UtcNow.Date.AddDays(1),
            RequestedTo = DateTime.UtcNow.Date.AddDays(3)
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // Act
        var result = await _bookingService.ApproveBookingAsync(booking.Id, ownerId);

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be(BookingStatus.Approved);

        var updatedBooking = await _context.Bookings.FindAsync(booking.Id);
        updatedBooking!.Status.Should().Be(BookingStatus.Approved);
    }

    [Fact]
    public async Task ApproveBookingAsync_WhenNotOwner_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";
        var otherUserId = "other-789";

        var owner = new User { Id = ownerId, Email = "owner@test.com", PreferredName = "Owner" };
        var borrower = new User { Id = borrowerId, Email = "borrower@test.com", PreferredName = "Borrower" };
        var item = new Item { Id = 1, Name = "Test Item", OwnerId = ownerId, Owner = owner };

        var booking = new Booking
        {
            Id = 1,
            ItemId = item.Id,
            Item = item,
            BorrowerId = borrowerId,
            Borrower = borrower,
            OwnerId = ownerId,
            Owner = owner,
            Status = BookingStatus.Pending
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // Act & Assert
        var act = async () => await _bookingService.ApproveBookingAsync(booking.Id, otherUserId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Tylko właściciel przedmiotu może zaakceptować rezerwację");
    }

    [Fact]
    public async Task ApproveBookingAsync_WhenNotPending_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var ownerId = "owner-123";
        var borrowerId = "borrower-456";

        var owner = new User { Id = ownerId, Email = "owner@test.com", PreferredName = "Owner" };
        var borrower = new User { Id = borrowerId, Email = "borrower@test.com", PreferredName = "Borrower" };
        var item = new Item { Id = 1, Name = "Test Item", OwnerId = ownerId, Owner = owner };

        var booking = new Booking
        {
            Id = 1,
            ItemId = item.Id,
            Item = item,
            BorrowerId = borrowerId,
            Borrower = borrower,
            OwnerId = ownerId,
            Owner = owner,
            Status = BookingStatus.Approved // Already approved
        };

        _context.Users.AddRange(owner, borrower);
        _context.Items.Add(item);
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // Act & Assert
        var act = async () => await _bookingService.ApproveBookingAsync(booking.Id, ownerId);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Rezerwacja jest już w statusie Approved");
    }
}

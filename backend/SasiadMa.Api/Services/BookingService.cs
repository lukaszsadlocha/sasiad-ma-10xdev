using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SasiadMa.Api.Data;
using SasiadMa.Api.DTOs.Bookings;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.Services;

public class BookingService : IBookingService
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;

    public BookingService(
        AppDbContext context,
        UserManager<User> userManager,
        IEmailService emailService)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, string userId)
    {
        // Get borrower user with community
        var borrower = await _context.Users
            .Include(u => u.Community)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (borrower == null)
        {
            throw new InvalidOperationException("Użytkownik nie istnieje");
        }

        if (borrower.CommunityId == null)
        {
            throw new InvalidOperationException("Musisz należeć do społeczności, aby rezerwować przedmioty");
        }

        // Get item with owner
        var item = await _context.Items
            .Include(i => i.Owner)
            .FirstOrDefaultAsync(i => i.Id == request.ItemId);

        if (item == null)
        {
            throw new InvalidOperationException("Przedmiot nie istnieje");
        }

        // Validation: item must be Available
        if (item.Status != ItemStatus.Available)
        {
            throw new InvalidOperationException("Przedmiot nie jest dostępny do rezerwacji");
        }

        // Validation: cannot book own items
        if (item.OwnerId == userId)
        {
            throw new InvalidOperationException("Nie możesz rezerwować własnych przedmiotów");
        }

        // Validation: borrower and owner must be in same community
        if (item.CommunityId != borrower.CommunityId)
        {
            throw new InvalidOperationException("Przedmiot należy do innej społeczności");
        }

        // Validation: dates must be valid
        if (request.RequestedFrom < DateTime.UtcNow.Date)
        {
            throw new InvalidOperationException("Data od nie może być w przeszłości");
        }

        if (request.RequestedTo <= request.RequestedFrom)
        {
            throw new InvalidOperationException("Data do musi być później niż data od");
        }

        // Validation: max 14 days
        var duration = (request.RequestedTo - request.RequestedFrom).Days;
        if (duration > 14)
        {
            throw new InvalidOperationException("Rezerwacja nie może być dłuższa niż 14 dni");
        }

        // Create booking
        var booking = new Booking
        {
            ItemId = request.ItemId,
            BorrowerId = userId,
            OwnerId = item.OwnerId,
            RequestedFrom = request.RequestedFrom,
            RequestedTo = request.RequestedTo,
            BorrowerNote = request.BorrowerNote,
            Status = BookingStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // Send email to owner
        try
        {
            await _emailService.SendNewBookingRequestEmailAsync(
                item.Owner.Email,
                item.Owner.PreferredName,
                item.Name,
                borrower.PreferredName,
                request.RequestedFrom,
                request.RequestedTo);
        }
        catch
        {
            // Log error but don't fail the booking creation
        }

        return await MapToBookingResponseAsync(booking);
    }

    public async Task<List<BookingResponse>> GetMyBookingsAsync(string userId)
    {
        var bookings = await _context.Bookings
            .Where(b => b.BorrowerId == userId)
            .Include(b => b.Item)
            .Include(b => b.Owner)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var responses = new List<BookingResponse>();
        foreach (var booking in bookings)
        {
            responses.Add(await MapToBookingResponseAsync(booking));
        }

        return responses;
    }

    public async Task<List<BookingResponse>> GetBookingsForMyItemsAsync(string userId)
    {
        var bookings = await _context.Bookings
            .Where(b => b.OwnerId == userId)
            .Include(b => b.Item)
            .Include(b => b.Borrower)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var responses = new List<BookingResponse>();
        foreach (var booking in bookings)
        {
            responses.Add(await MapToBookingResponseAsync(booking));
        }

        return responses;
    }

    public async Task<BookingResponse> ApproveBookingAsync(int bookingId, string userId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Item)
            .Include(b => b.Owner)
            .Include(b => b.Borrower)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            throw new InvalidOperationException("Rezerwacja nie istnieje");
        }

        // Verify caller is the owner
        if (booking.OwnerId != userId)
        {
            throw new InvalidOperationException("Tylko właściciel przedmiotu może zaakceptować rezerwację");
        }

        // Verify booking is in Pending status
        if (booking.Status != BookingStatus.Pending)
        {
            throw new InvalidOperationException($"Rezerwacja jest już w statusie {booking.Status}");
        }

        booking.Status = BookingStatus.Approved;
        booking.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Send email to borrower
        try
        {
            await _emailService.SendBookingApprovedEmailAsync(
                booking.Borrower.Email,
                booking.Borrower.PreferredName,
                booking.Item.Name,
                booking.Owner.PreferredName);
        }
        catch
        {
            // Log error but don't fail
        }

        return await MapToBookingResponseAsync(booking);
    }

    public async Task<BookingResponse> RejectBookingAsync(int bookingId, string? reason, string userId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Item)
            .Include(b => b.Owner)
            .Include(b => b.Borrower)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            throw new InvalidOperationException("Rezerwacja nie istnieje");
        }

        // Verify caller is the owner
        if (booking.OwnerId != userId)
        {
            throw new InvalidOperationException("Tylko właściciel przedmiotu może odrzucić rezerwację");
        }

        // Verify booking is in Pending status
        if (booking.Status != BookingStatus.Pending)
        {
            throw new InvalidOperationException($"Rezerwacja jest już w statusie {booking.Status}");
        }

        booking.Status = BookingStatus.Rejected;
        booking.RejectionReason = reason;
        booking.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Send email to borrower
        try
        {
            await _emailService.SendBookingRejectedEmailAsync(
                booking.Borrower.Email,
                booking.Borrower.PreferredName,
                booking.Item.Name,
                reason);
        }
        catch
        {
            // Log error but don't fail
        }

        return await MapToBookingResponseAsync(booking);
    }

    public async Task<BookingResponse> ConfirmHandOverAsync(int bookingId, string userId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Item)
            .Include(b => b.Owner)
            .Include(b => b.Borrower)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            throw new InvalidOperationException("Rezerwacja nie istnieje");
        }

        // Verify caller is the owner
        if (booking.OwnerId != userId)
        {
            throw new InvalidOperationException("Tylko właściciel przedmiotu może potwierdzić przekazanie");
        }

        // Verify booking is in Approved status
        if (booking.Status != BookingStatus.Approved)
        {
            throw new InvalidOperationException($"Rezerwacja musi być w statusie Zatwierdzone, a jest w statusie {booking.Status}");
        }

        // Update booking
        booking.Status = BookingStatus.InProgress;
        booking.HandedOverAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        // Update item status to Borrowed
        booking.Item.Status = ItemStatus.Borrowed;
        booking.Item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await MapToBookingResponseAsync(booking);
    }

    public async Task<BookingResponse> ConfirmReturnAsync(int bookingId, string userId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Item)
            .Include(b => b.Owner)
            .Include(b => b.Borrower)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            throw new InvalidOperationException("Rezerwacja nie istnieje");
        }

        // Verify caller is the owner
        if (booking.OwnerId != userId)
        {
            throw new InvalidOperationException("Tylko właściciel przedmiotu może potwierdzić zwrot");
        }

        // Verify booking is in InProgress status
        if (booking.Status != BookingStatus.InProgress)
        {
            throw new InvalidOperationException($"Rezerwacja musi być w statusie W trakcie, a jest w statusie {booking.Status}");
        }

        // Update booking
        booking.Status = BookingStatus.Returned;
        booking.ReturnedAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        // Update item status to Available
        booking.Item.Status = ItemStatus.Available;
        booking.Item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await MapToBookingResponseAsync(booking);
    }

    private async Task<BookingResponse> MapToBookingResponseAsync(Booking booking)
    {
        // Ensure all navigation properties are loaded
        var item = booking.Item ?? await _context.Items.FindAsync(booking.ItemId);
        var owner = booking.Owner ?? await _userManager.FindByIdAsync(booking.OwnerId);
        var borrower = booking.Borrower ?? await _userManager.FindByIdAsync(booking.BorrowerId);

        return new BookingResponse
        {
            Id = booking.Id,
            ItemId = booking.ItemId,
            ItemName = item?.Name ?? string.Empty,
            ItemPhotoUrl = item?.PhotoUrl,
            BorrowerId = booking.BorrowerId,
            BorrowerName = borrower?.PreferredName ?? string.Empty,
            BorrowerAvatarUrl = borrower?.AvatarUrl,
            OwnerId = booking.OwnerId,
            OwnerName = owner?.PreferredName ?? string.Empty,
            OwnerAvatarUrl = owner?.AvatarUrl,
            RequestedFrom = booking.RequestedFrom,
            RequestedTo = booking.RequestedTo,
            BorrowerNote = booking.BorrowerNote,
            RejectionReason = booking.RejectionReason,
            Status = booking.Status,
            HandedOverAt = booking.HandedOverAt,
            ReturnedAt = booking.ReturnedAt,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt
        };
    }
}

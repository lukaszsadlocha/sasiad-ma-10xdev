using SasiadMa.Api.DTOs.Bookings;

namespace SasiadMa.Api.Services;

public interface IBookingService
{
    /// <summary>
    /// Create a booking request (borrower action)
    /// </summary>
    Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, string userId);

    /// <summary>
    /// Get all bookings where the user is the borrower
    /// </summary>
    Task<List<BookingResponse>> GetMyBookingsAsync(string userId);

    /// <summary>
    /// Get all booking requests for items owned by the user
    /// </summary>
    Task<List<BookingResponse>> GetBookingsForMyItemsAsync(string userId);

    /// <summary>
    /// Approve a booking request (owner action)
    /// </summary>
    Task<BookingResponse> ApproveBookingAsync(int bookingId, string userId);

    /// <summary>
    /// Reject a booking request (owner action)
    /// </summary>
    Task<BookingResponse> RejectBookingAsync(int bookingId, string? reason, string userId);

    /// <summary>
    /// Confirm that the item has been handed over (owner action)
    /// </summary>
    Task<BookingResponse> ConfirmHandOverAsync(int bookingId, string userId);

    /// <summary>
    /// Confirm that the item has been returned (owner action)
    /// </summary>
    Task<BookingResponse> ConfirmReturnAsync(int bookingId, string userId);
}

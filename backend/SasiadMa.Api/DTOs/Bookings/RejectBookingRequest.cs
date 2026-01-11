using System.ComponentModel.DataAnnotations;

namespace SasiadMa.Api.DTOs.Bookings;

public class RejectBookingRequest
{
    [MaxLength(200, ErrorMessage = "Powód nie może przekraczać 200 znaków")]
    public string? Reason { get; set; }
}

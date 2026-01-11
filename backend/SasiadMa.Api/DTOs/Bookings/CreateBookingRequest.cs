using System.ComponentModel.DataAnnotations;

namespace SasiadMa.Api.DTOs.Bookings;

public class CreateBookingRequest
{
    [Required(ErrorMessage = "Identyfikator przedmiotu jest wymagany")]
    public int ItemId { get; set; }

    [Required(ErrorMessage = "Data od jest wymagana")]
    public DateTime RequestedFrom { get; set; }

    [Required(ErrorMessage = "Data do jest wymagana")]
    public DateTime RequestedTo { get; set; }

    [MaxLength(200, ErrorMessage = "Notatka nie może przekraczać 200 znaków")]
    public string? BorrowerNote { get; set; }
}

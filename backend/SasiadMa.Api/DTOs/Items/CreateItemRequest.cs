using System.ComponentModel.DataAnnotations;

namespace SasiadMa.Api.DTOs.Items;

public class CreateItemRequest
{
    [Required(ErrorMessage = "Nazwa przedmiotu jest wymagana")]
    [MaxLength(100, ErrorMessage = "Nazwa nie może przekraczać 100 znaków")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Kategoria jest wymagana")]
    public string Category { get; set; } = string.Empty;

    [Required(ErrorMessage = "Opis jest wymagany")]
    [MaxLength(300, ErrorMessage = "Opis nie może przekraczać 300 znaków")]
    public string Description { get; set; } = string.Empty;

    // Photo will be uploaded separately via IFormFile in the endpoint
}

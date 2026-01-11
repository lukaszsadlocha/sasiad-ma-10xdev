using System.ComponentModel.DataAnnotations;

namespace SasiadMa.Api.DTOs.Communities;

public class CreateCommunityRequest
{
    [Required(ErrorMessage = "Nazwa społeczności jest wymagana")]
    [MaxLength(100, ErrorMessage = "Nazwa nie może przekraczać 100 znaków")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(300, ErrorMessage = "Opis nie może przekraczać 300 znaków")]
    public string? Description { get; set; }
}

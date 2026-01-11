using System.ComponentModel.DataAnnotations;

namespace SasiadMa.Api.DTOs.Auth;

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required, MinLength(2), MaxLength(100)]
    public string PreferredName { get; set; } = string.Empty;

    [Required]
    public bool AcceptTerms { get; set; }

    public string? InviteToken { get; set; }
}

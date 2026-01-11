using System.ComponentModel.DataAnnotations;

namespace SasiadMa.Api.DTOs.Messages;

public class SendMessageRequest
{
    [Required]
    public string RecipientId { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string Content { get; set; } = string.Empty;
}

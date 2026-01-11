using System.ComponentModel.DataAnnotations;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.DTOs.Items;

public class UpdateItemStatusRequest
{
    [Required]
    public ItemStatus Status { get; set; }
}

namespace SasiadMa.Api.Models;

// Placeholder - będzie w pełni zaimplementowany w Fazie 4
public class Booking
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public string BorrowerId { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;

    // Relationships
    public Item Item { get; set; } = null!;
    public User Borrower { get; set; } = null!;
    public User Owner { get; set; } = null!;
}

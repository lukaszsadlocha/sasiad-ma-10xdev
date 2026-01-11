using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Community> Communities { get; set; }
    public DbSet<InviteLink> InviteLinks { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Conversation> Conversations { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // User - Community (1 user = 1 community MVP constraint)
        builder.Entity<User>()
            .HasOne(u => u.Community)
            .WithMany(c => c.Members)
            .HasForeignKey(u => u.CommunityId)
            .OnDelete(DeleteBehavior.SetNull);

        // Community - Admin
        builder.Entity<Community>()
            .HasOne(c => c.Admin)
            .WithMany()
            .HasForeignKey(c => c.AdminId)
            .OnDelete(DeleteBehavior.Restrict);

        // InviteLink unique token
        builder.Entity<InviteLink>()
            .HasIndex(i => i.Token)
            .IsUnique();

        // Item - Owner
        builder.Entity<Item>()
            .HasOne(i => i.Owner)
            .WithMany(u => u.Items)
            .HasForeignKey(i => i.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Item - Community
        builder.Entity<Item>()
            .HasOne(i => i.Community)
            .WithMany(c => c.Items)
            .HasForeignKey(i => i.CommunityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Booking - Item
        builder.Entity<Booking>()
            .HasOne(b => b.Item)
            .WithMany(i => i.Bookings)
            .HasForeignKey(b => b.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Booking - Borrower
        builder.Entity<Booking>()
            .HasOne(b => b.Borrower)
            .WithMany(u => u.BookingsAsBorrower)
            .HasForeignKey(b => b.BorrowerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Booking - Owner
        builder.Entity<Booking>()
            .HasOne(b => b.Owner)
            .WithMany(u => u.BookingsAsOwner)
            .HasForeignKey(b => b.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Conversation - User1
        builder.Entity<Conversation>()
            .HasOne(c => c.User1)
            .WithMany()
            .HasForeignKey(c => c.User1Id)
            .OnDelete(DeleteBehavior.Restrict);

        // Conversation - User2
        builder.Entity<Conversation>()
            .HasOne(c => c.User2)
            .WithMany()
            .HasForeignKey(c => c.User2Id)
            .OnDelete(DeleteBehavior.Restrict);

        // Message - Conversation
        builder.Entity<Message>()
            .HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Message - Sender
        builder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SasiadMa.Api.Data;
using SasiadMa.Api.DTOs.Items;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.Services;

public class ItemService : IItemService
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IStorageService _storageService;

    public ItemService(
        AppDbContext context,
        UserManager<User> userManager,
        IStorageService storageService)
    {
        _context = context;
        _userManager = userManager;
        _storageService = storageService;
    }

    public async Task<ItemResponse> CreateItemAsync(CreateItemRequest request, IFormFile? photo, string userId)
    {
        // Get user with community
        var user = await _context.Users
            .Include(u => u.Community)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new InvalidOperationException("Użytkownik nie istnieje");
        }

        if (user.CommunityId == null)
        {
            throw new InvalidOperationException("Musisz należeć do społeczności, aby dodać przedmiot");
        }

        // Create item
        var item = new Item
        {
            Name = request.Name,
            Category = request.Category,
            Description = request.Description,
            OwnerId = userId,
            CommunityId = user.CommunityId.Value,
            Status = ItemStatus.Available,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        // Upload photo if provided
        if (photo != null)
        {
            try
            {
                var photoUrl = await _storageService.UploadItemPhotoAsync(photo, item.Id.ToString());
                item.PhotoUrl = photoUrl;
                item.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Photo upload failed, but item is created
                // We could log this error or handle it differently
                // For now, we'll continue without the photo
            }
        }

        return new ItemResponse
        {
            Id = item.Id,
            Name = item.Name,
            Category = item.Category,
            Description = item.Description,
            PhotoUrl = item.PhotoUrl,
            Status = item.Status,
            OwnerId = item.OwnerId,
            OwnerName = user.PreferredName,
            OwnerAvatarUrl = user.AvatarUrl,
            CommunityId = item.CommunityId,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };
    }

    public async Task<List<ItemResponse>> GetCommunityItemsAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || user.CommunityId == null)
        {
            return new List<ItemResponse>();
        }

        var items = await _context.Items
            .Include(i => i.Owner)
            .Where(i => i.CommunityId == user.CommunityId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return items.Select(i => new ItemResponse
        {
            Id = i.Id,
            Name = i.Name,
            Category = i.Category,
            Description = i.Description,
            PhotoUrl = i.PhotoUrl,
            Status = i.Status,
            OwnerId = i.OwnerId,
            OwnerName = i.Owner.PreferredName,
            OwnerAvatarUrl = i.Owner.AvatarUrl,
            CommunityId = i.CommunityId,
            CreatedAt = i.CreatedAt,
            UpdatedAt = i.UpdatedAt
        }).ToList();
    }

    public async Task<ItemResponse?> GetItemByIdAsync(int id)
    {
        var item = await _context.Items
            .Include(i => i.Owner)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return null;
        }

        return new ItemResponse
        {
            Id = item.Id,
            Name = item.Name,
            Category = item.Category,
            Description = item.Description,
            PhotoUrl = item.PhotoUrl,
            Status = item.Status,
            OwnerId = item.OwnerId,
            OwnerName = item.Owner.PreferredName,
            OwnerAvatarUrl = item.Owner.AvatarUrl,
            CommunityId = item.CommunityId,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };
    }

    public async Task<ItemResponse> UpdateItemStatusAsync(int id, ItemStatus status, string userId)
    {
        var item = await _context.Items
            .Include(i => i.Owner)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new InvalidOperationException("Przedmiot nie istnieje");
        }

        // Only owner can update status
        if (item.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("Tylko właściciel może zmienić status przedmiotu");
        }

        item.Status = status;
        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new ItemResponse
        {
            Id = item.Id,
            Name = item.Name,
            Category = item.Category,
            Description = item.Description,
            PhotoUrl = item.PhotoUrl,
            Status = item.Status,
            OwnerId = item.OwnerId,
            OwnerName = item.Owner.PreferredName,
            OwnerAvatarUrl = item.Owner.AvatarUrl,
            CommunityId = item.CommunityId,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };
    }

    public async Task<List<ItemResponse>> GetMyItemsAsync(string userId)
    {
        var items = await _context.Items
            .Include(i => i.Owner)
            .Where(i => i.OwnerId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return items.Select(i => new ItemResponse
        {
            Id = i.Id,
            Name = i.Name,
            Category = i.Category,
            Description = i.Description,
            PhotoUrl = i.PhotoUrl,
            Status = i.Status,
            OwnerId = i.OwnerId,
            OwnerName = i.Owner.PreferredName,
            OwnerAvatarUrl = i.Owner.AvatarUrl,
            CommunityId = i.CommunityId,
            CreatedAt = i.CreatedAt,
            UpdatedAt = i.UpdatedAt
        }).ToList();
    }
}

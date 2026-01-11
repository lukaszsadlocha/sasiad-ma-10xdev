using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SasiadMa.Api.Data;
using SasiadMa.Api.DTOs.Users;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;

    public UserService(AppDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<UserProfileResponse> GetUserProfileAsync(string userId)
    {
        var user = await _context.Users
            .Include(u => u.Community)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new InvalidOperationException("Użytkownik nie istnieje");
        }

        return new UserProfileResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            PreferredName = user.PreferredName,
            AvatarUrl = user.AvatarUrl,
            EmailNotificationsEnabled = user.EmailNotificationsEnabled,
            CommunityId = user.CommunityId,
            CommunityName = user.Community?.Name
        };
    }

    public async Task<UserProfileResponse> UpdateUserSettingsAsync(string userId, UpdateUserSettingsRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Community)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new InvalidOperationException("Użytkownik nie istnieje");
        }

        // Aktualizuj ustawienia
        user.EmailNotificationsEnabled = request.EmailNotificationsEnabled;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new UserProfileResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            PreferredName = user.PreferredName,
            AvatarUrl = user.AvatarUrl,
            EmailNotificationsEnabled = user.EmailNotificationsEnabled,
            CommunityId = user.CommunityId,
            CommunityName = user.Community?.Name
        };
    }
}

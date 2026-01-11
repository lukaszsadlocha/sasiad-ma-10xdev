using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SasiadMa.Api.Data;
using SasiadMa.Api.DTOs.Communities;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.Services;

public class CommunityService : ICommunityService
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;

    public CommunityService(
        AppDbContext context,
        UserManager<User> userManager,
        IConfiguration configuration)
    {
        _context = context;
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<CommunityResponse> CreateCommunityAsync(CreateCommunityRequest request, string userId)
    {
        // Sprawdź czy użytkownik istnieje
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("Użytkownik nie istnieje");
        }

        // Sprawdź czy użytkownik już należy do społeczności (MVP: 1 użytkownik = 1 społeczność)
        if (user.CommunityId != null)
        {
            throw new InvalidOperationException("Już należysz do społeczności. W wersji MVP możesz być członkiem tylko jednej społeczności.");
        }

        // Utwórz społeczność
        var community = new Community
        {
            Name = request.Name,
            Description = request.Description,
            AdminId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Communities.Add(community);
        await _context.SaveChangesAsync();

        // Przypisz użytkownika do społeczności
        user.CommunityId = community.Id;
        await _userManager.UpdateAsync(user);

        return new CommunityResponse
        {
            Id = community.Id,
            Name = community.Name,
            Description = community.Description,
            AdminId = community.AdminId,
            AdminName = user.PreferredName,
            MembersCount = 1,
            CreatedAt = community.CreatedAt
        };
    }

    public async Task<InviteLinkResponse> GenerateInviteLinkAsync(int communityId, string userId)
    {
        // Sprawdź czy społeczność istnieje
        var community = await _context.Communities
            .Include(c => c.Admin)
            .FirstOrDefaultAsync(c => c.Id == communityId);

        if (community == null)
        {
            throw new InvalidOperationException("Społeczność nie istnieje");
        }

        // Sprawdź czy użytkownik jest adminem społeczności
        if (community.AdminId != userId)
        {
            throw new UnauthorizedAccessException("Tylko administrator może generować linki zaproszeniowe");
        }

        // Sprawdź czy już istnieje aktywny link zaproszeniowy (MVP: tylko 1 aktywny link)
        var existingLink = await _context.InviteLinks
            .FirstOrDefaultAsync(i => i.CommunityId == communityId && i.IsActive);

        if (existingLink != null)
        {
            // Zwróć istniejący link
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            return new InviteLinkResponse
            {
                Token = existingLink.Token,
                FullUrl = $"{frontendUrl}/invite/{existingLink.Token}",
                CreatedAt = existingLink.CreatedAt
            };
        }

        // Wygeneruj nowy unikalny token
        var token = Guid.NewGuid().ToString("N");

        var inviteLink = new InviteLink
        {
            Token = token,
            CommunityId = communityId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.InviteLinks.Add(inviteLink);
        await _context.SaveChangesAsync();

        var url = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        return new InviteLinkResponse
        {
            Token = inviteLink.Token,
            FullUrl = $"{url}/invite/{inviteLink.Token}",
            CreatedAt = inviteLink.CreatedAt
        };
    }

    public async Task<JoinCommunityResponse> JoinCommunityAsync(string token, string userId)
    {
        // Znajdź link zaproszeniowy
        var inviteLink = await _context.InviteLinks
            .Include(i => i.Community)
            .FirstOrDefaultAsync(i => i.Token == token && i.IsActive);

        if (inviteLink == null)
        {
            throw new InvalidOperationException("Link zaproszeniowy jest nieprawidłowy lub wygasł");
        }

        // Sprawdź czy użytkownik istnieje
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("Użytkownik nie istnieje");
        }

        // Sprawdź czy użytkownik już należy do społeczności (MVP: 1 użytkownik = 1 społeczność)
        if (user.CommunityId != null)
        {
            // Jeśli to ta sama społeczność, po prostu zwróć sukces
            if (user.CommunityId == inviteLink.CommunityId)
            {
                return new JoinCommunityResponse
                {
                    CommunityId = inviteLink.CommunityId,
                    CommunityName = inviteLink.Community.Name,
                    Message = "Już jesteś członkiem tej społeczności"
                };
            }

            throw new InvalidOperationException("Już należysz do innej społeczności. W wersji MVP możesz być członkiem tylko jednej społeczności.");
        }

        // Dołącz użytkownika do społeczności
        user.CommunityId = inviteLink.CommunityId;
        await _userManager.UpdateAsync(user);

        return new JoinCommunityResponse
        {
            CommunityId = inviteLink.CommunityId,
            CommunityName = inviteLink.Community.Name,
            Message = "Pomyślnie dołączono do społeczności"
        };
    }

    public async Task<CommunityResponse?> GetMyCommunityAsync(string userId)
    {
        var user = await _context.Users
            .Include(u => u.Community)
            .ThenInclude(c => c!.Admin)
            .Include(u => u.Community)
            .ThenInclude(c => c!.Members)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Community == null)
        {
            return null;
        }

        return new CommunityResponse
        {
            Id = user.Community.Id,
            Name = user.Community.Name,
            Description = user.Community.Description,
            AdminId = user.Community.AdminId,
            AdminName = user.Community.Admin.PreferredName,
            MembersCount = user.Community.Members.Count,
            CreatedAt = user.Community.CreatedAt
        };
    }

    public async Task<CommunityResponse?> GetCommunityByInviteTokenAsync(string token)
    {
        var inviteLink = await _context.InviteLinks
            .Include(i => i.Community)
            .ThenInclude(c => c.Admin)
            .Include(i => i.Community)
            .ThenInclude(c => c.Members)
            .FirstOrDefaultAsync(i => i.Token == token && i.IsActive);

        if (inviteLink == null)
        {
            return null;
        }

        return new CommunityResponse
        {
            Id = inviteLink.Community.Id,
            Name = inviteLink.Community.Name,
            Description = inviteLink.Community.Description,
            AdminId = inviteLink.Community.AdminId,
            AdminName = inviteLink.Community.Admin.PreferredName,
            MembersCount = inviteLink.Community.Members.Count,
            CreatedAt = inviteLink.Community.CreatedAt
        };
    }
}

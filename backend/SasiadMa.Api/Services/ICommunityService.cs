using SasiadMa.Api.DTOs.Communities;

namespace SasiadMa.Api.Services;

public interface ICommunityService
{
    Task<CommunityResponse> CreateCommunityAsync(CreateCommunityRequest request, string userId);
    Task<InviteLinkResponse> GenerateInviteLinkAsync(int communityId, string userId);
    Task<JoinCommunityResponse> JoinCommunityAsync(string token, string userId);
    Task<CommunityResponse?> GetMyCommunityAsync(string userId);
    Task<CommunityResponse?> GetCommunityByInviteTokenAsync(string token);
}

using SasiadMa.Api.DTOs.Users;

namespace SasiadMa.Api.Services;

public interface IUserService
{
    Task<UserProfileResponse> GetUserProfileAsync(string userId);
    Task<UserProfileResponse> UpdateUserSettingsAsync(string userId, UpdateUserSettingsRequest request);
}

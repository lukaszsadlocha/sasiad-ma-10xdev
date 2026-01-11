namespace SasiadMa.Api.Services;

public interface IStorageService
{
    Task<string> UploadItemPhotoAsync(IFormFile file, string itemId);
    Task<string> UploadAvatarAsync(IFormFile file, string userId);
    Task DeleteFileAsync(string bucket, string fileName);
}

using System.Net.Http.Headers;

namespace SasiadMa.Api.Services;

public class StorageService : IStorageService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly string _supabaseUrl;
    private readonly string _serviceKey;

    public StorageService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
        _supabaseUrl = configuration["Supabase:Url"] ?? throw new InvalidOperationException("Supabase URL not configured");
        _serviceKey = configuration["Supabase:ServiceKey"] ?? throw new InvalidOperationException("Supabase Service Key not configured");
    }

    public async Task<string> UploadItemPhotoAsync(IFormFile file, string itemId)
    {
        // Validate file
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required");
        }

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            throw new ArgumentException("Only JPG and PNG files are allowed");
        }

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
        {
            throw new ArgumentException("File size cannot exceed 5MB");
        }

        var bucket = "items-photos";
        var fileName = $"{itemId}_{Guid.NewGuid()}{extension}";

        return await UploadFileAsync(bucket, fileName, file);
    }

    public async Task<string> UploadAvatarAsync(IFormFile file, string userId)
    {
        // Validate file
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required");
        }

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            throw new ArgumentException("Only JPG and PNG files are allowed");
        }

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
        {
            throw new ArgumentException("File size cannot exceed 5MB");
        }

        var bucket = "avatars";
        var fileName = $"{userId}_{Guid.NewGuid()}{extension}";

        return await UploadFileAsync(bucket, fileName, file);
    }

    public async Task DeleteFileAsync(string bucket, string fileName)
    {
        var url = $"{_supabaseUrl}/storage/v1/object/{bucket}/{fileName}";

        var request = new HttpRequestMessage(HttpMethod.Delete, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceKey);

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Failed to delete file: {response.ReasonPhrase}");
        }
    }

    private async Task<string> UploadFileAsync(string bucket, string fileName, IFormFile file)
    {
        var url = $"{_supabaseUrl}/storage/v1/object/{bucket}/{fileName}";

        using var content = new MultipartFormDataContent();
        using var fileStream = file.OpenReadStream();
        using var streamContent = new StreamContent(fileStream);

        streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceKey);
        request.Content = streamContent;

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Failed to upload file: {response.ReasonPhrase}. Details: {errorContent}");
        }

        // Return public URL
        return $"{_supabaseUrl}/storage/v1/object/public/{bucket}/{fileName}";
    }
}

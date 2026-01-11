using SasiadMa.Api.DTOs.Items;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.Services;

public interface IItemService
{
    Task<ItemResponse> CreateItemAsync(CreateItemRequest request, IFormFile? photo, string userId);
    Task<List<ItemResponse>> GetCommunityItemsAsync(string userId);
    Task<ItemResponse?> GetItemByIdAsync(int id);
    Task<ItemResponse> UpdateItemStatusAsync(int id, ItemStatus status, string userId);
    Task<List<ItemResponse>> GetMyItemsAsync(string userId);
}

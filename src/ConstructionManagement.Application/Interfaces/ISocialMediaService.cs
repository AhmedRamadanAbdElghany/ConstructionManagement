using ConstructionManagement.Application.DTOs.SocialMedia;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces
{
    public interface ISocialMediaService
    {
        // Post operations
        Task<(IEnumerable<SocialMediaPostDto> Posts, int TotalCount)> GetPostsAsync(
            SocialMediaPlatform? platform = null, 
            int? sourceId = null,
            int page = 1, 
            int pageSize = 20);
        Task<SocialMediaPostDto?> GetPostByIdAsync(int id);
        Task<IEnumerable<SocialMediaPostDto>> GetTodaysPostsAsync();

        // Source management
        Task<IEnumerable<SocialMediaSourceDto>> GetSourcesAsync(bool activeOnly = true);
        Task<SocialMediaSourceDto> CreateSourceAsync(CreateSocialMediaSourceRequest request);
        Task<SocialMediaSourceDto> UpdateSourceAsync(int id, UpdateSocialMediaSourceRequest request);
        Task<bool> DeleteSourceAsync(int id);

        // Fetching operations
        Task<FetchResultDto> FetchPostsFromAllSourcesAsync();
        Task<FetchResultDto> FetchPostsFromSourceAsync(int sourceId);

        // Translation
        Task<bool> TranslatePostAsync(int postId);
        Task TranslateAllUntranslatedAsync();
    }
}

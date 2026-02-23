using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs.SocialMedia
{
    public class SocialMediaPostDto
    {
        public int Id { get; set; }
        public string Platform { get; set; } = string.Empty;
        public string OriginalPostId { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorHandle { get; set; }
        public string? AuthorProfileUrl { get; set; }
        public string? AuthorAvatarUrl { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ContentArabic { get; set; }
        public List<string> MediaUrls { get; set; } = new();
        public string PostUrl { get; set; } = string.Empty;
        public DateTime PostedAt { get; set; }
        public DateTime FetchedAt { get; set; }
        public int LikesCount { get; set; }
        public int CommentsCount { get; set; }
        public int SharesCount { get; set; }
        public bool IsConstructionRelated { get; set; }
        public string? MatchedKeywords { get; set; }
        public int? SourceId { get; set; }
        public string? SourceName { get; set; }
    }

    public class SocialMediaSourceDto
    {
        public int Id { get; set; }
        public string Platform { get; set; } = string.Empty;
        public string SourceType { get; set; } = string.Empty;
        public string SourceValue { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastFetchedAt { get; set; }
        public int FetchCount { get; set; }
        public int PostsCollected { get; set; }
        public string? LastError { get; set; }
    }

    public class CreateSocialMediaSourceRequest
    {
        public SocialMediaPlatform Platform { get; set; }
        public SocialMediaSourceType SourceType { get; set; }
        public string SourceValue { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
    }

    public class UpdateSocialMediaSourceRequest
    {
        public string SourceValue { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public bool IsActive { get; set; }
    }

    public class FetchResultDto
    {
        public int SourceId { get; set; }
        public string SourceName { get; set; } = string.Empty;
        public bool Success { get; set; }
        public int PostsFetched { get; set; }
        public int PostsSaved { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
    }

    public class SocialMediaStatsDto
    {
        public int TotalPosts { get; set; }
        public int TodaysPosts { get; set; }
        public int TotalSources { get; set; }
        public int ActiveSources { get; set; }
        public Dictionary<string, int> PostsByPlatform { get; set; } = new();
    }
}

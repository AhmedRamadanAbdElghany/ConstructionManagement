using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Social media platforms supported by the system
    /// </summary>
    public enum SocialMediaPlatform
    {
        Facebook = 1,
        Twitter = 2,
        LinkedIn = 3,
        Instagram = 4
    }

    /// <summary>
    /// Social media posts aggregated from various platforms - construction related content
    /// </summary>
    public class SocialMediaPost : BaseEntity
    {
        /// <summary>
        /// The platform this post came from
        /// </summary>
        public SocialMediaPlatform Platform { get; set; }

        /// <summary>
        /// Original post ID from the social media platform
        /// </summary>
        public string OriginalPostId { get; set; } = string.Empty;

        /// <summary>
        /// Author's display name
        /// </summary>
        public string AuthorName { get; set; } = string.Empty;

        /// <summary>
        /// Author's username/handle
        /// </summary>
        public string? AuthorHandle { get; set; }

        /// <summary>
        /// URL to author's profile
        /// </summary>
        public string? AuthorProfileUrl { get; set; }

        /// <summary>
        /// URL to author's avatar image
        /// </summary>
        public string? AuthorAvatarUrl { get; set; }

        /// <summary>
        /// Original post content
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Translated content in Arabic
        /// </summary>
        public string? ContentArabic { get; set; }

        /// <summary>
        /// JSON array of media URLs (images/videos)
        /// </summary>
        public string? MediaUrls { get; set; }

        /// <summary>
        /// Direct link to the original post
        /// </summary>
        public string PostUrl { get; set; } = string.Empty;

        /// <summary>
        /// When the post was originally published
        /// </summary>
        public DateTime PostedAt { get; set; }

        /// <summary>
        /// When this post was fetched by our system
        /// </summary>
        public DateTime FetchedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Number of likes/reactions
        /// </summary>
        public int LikesCount { get; set; } = 0;

        /// <summary>
        /// Number of comments
        /// </summary>
        public int CommentsCount { get; set; } = 0;

        /// <summary>
        /// Number of shares/retweets
        /// </summary>
        public int SharesCount { get; set; } = 0;

        /// <summary>
        /// Whether this post was identified as construction-related
        /// </summary>
        public bool IsConstructionRelated { get; set; } = true;

        /// <summary>
        /// Keywords that matched for construction relevance
        /// </summary>
        public string? MatchedKeywords { get; set; }

        /// <summary>
        /// Source that this post was fetched from
        /// </summary>
        public int? SocialMediaSourceId { get; set; }
        [ForeignKey(nameof(SocialMediaSourceId))]
        public virtual SocialMediaSource? Source { get; set; }
    }
}

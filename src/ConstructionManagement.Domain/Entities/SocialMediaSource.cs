using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Type of social media source to track
    /// </summary>
    public enum SocialMediaSourceType
    {
        Account = 1,    // Track a specific account/user
        Hashtag = 2,    // Track posts with a hashtag
        Keyword = 3     // Track posts containing keywords
    }

    /// <summary>
    /// Configured sources for fetching social media content
    /// </summary>
    public class SocialMediaSource : BaseEntity
    {
        /// <summary>
        /// The social media platform
        /// </summary>
        public SocialMediaPlatform Platform { get; set; }

        /// <summary>
        /// Type of source (account, hashtag, or keyword)
        /// </summary>
        public SocialMediaSourceType SourceType { get; set; }

        /// <summary>
        /// The value to track (username, hashtag, or keyword)
        /// </summary>
        public string SourceValue { get; set; } = string.Empty;

        /// <summary>
        /// Human-readable name for this source
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// Whether this source is actively being fetched
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// When this source was last fetched
        /// </summary>
        public DateTime? LastFetchedAt { get; set; }

        /// <summary>
        /// Number of times this source has been fetched
        /// </summary>
        public int FetchCount { get; set; } = 0;

        /// <summary>
        /// Number of posts collected from this source
        /// </summary>
        public int PostsCollected { get; set; } = 0;

        /// <summary>
        /// Last error message if fetch failed
        /// </summary>
        public string? LastError { get; set; }

        /// <summary>
        /// Navigation to posts from this source
        /// </summary>
        public virtual ICollection<SocialMediaPost> Posts { get; set; } = new List<SocialMediaPost>();
    }
}

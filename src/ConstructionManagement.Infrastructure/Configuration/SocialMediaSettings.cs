namespace ConstructionManagement.Infrastructure.Configuration
{
    /// <summary>
    /// Configuration settings for social media integrations
    /// </summary>
    public class SocialMediaSettings
    {
        public FacebookSettings Facebook { get; set; } = new();
        public TwitterSettings Twitter { get; set; } = new();
        public LinkedInSettings LinkedIn { get; set; } = new();
        public InstagramSettings Instagram { get; set; } = new();
        public List<string> ConstructionKeywords { get; set; } = new();
        public int FetchIntervalHours { get; set; } = 24;
        public int MaxPostsPerFetch { get; set; } = 100;
    }

    public class FacebookSettings
    {
        public string AppId { get; set; } = string.Empty;
        public string AppSecret { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string ApiVersion { get; set; } = "v18.0";
        public string BaseUrl { get; set; } = "https://graph.facebook.com";
    }

    public class TwitterSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string ApiSecretKey { get; set; } = string.Empty;
        public string BearerToken { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.twitter.com/2";
    }

    public class LinkedInSettings
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.linkedin.com/v2";
    }

    public class InstagramSettings
    {
        public string AppId { get; set; } = string.Empty;
        public string AppSecret { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://graph.instagram.com";
    }
}
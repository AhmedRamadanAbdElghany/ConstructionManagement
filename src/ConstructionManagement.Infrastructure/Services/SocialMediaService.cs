using ConstructionManagement.Application.DTOs.SocialMedia;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Configuration;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ConstructionManagement.Infrastructure.Services
{
    /// <summary>
    /// Service for managing social media posts and sources with actual API integrations
    /// </summary>
    public class SocialMediaService : ISocialMediaService
    {
        private readonly IRepository<SocialMediaPost> _postRepository;
        private readonly IRepository<SocialMediaSource> _sourceRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITranslationService _translationService;
        private readonly SocialMediaSettings _settings;
        private readonly HttpClient _httpClient;
        private readonly ILogger<SocialMediaService> _logger;

        public SocialMediaService(
            IRepository<SocialMediaPost> postRepository,
            IRepository<SocialMediaSource> sourceRepository,
            IUnitOfWork unitOfWork,
            ITranslationService translationService,
            IOptions<SocialMediaSettings> settings,
            HttpClient httpClient,
            ILogger<SocialMediaService> logger)
        {
            _postRepository = postRepository;
            _sourceRepository = sourceRepository;
            _unitOfWork = unitOfWork;
            _translationService = translationService;
            _settings = settings.Value;
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<(IEnumerable<SocialMediaPostDto> Posts, int TotalCount)> GetPostsAsync(
            SocialMediaPlatform? platform = null,
            int? sourceId = null,
            int page = 1,
            int pageSize = 20)
        {
            var query = _postRepository.AsQueryable()
                .Include(p => p.Source)
                .Where(p => p.IsConstructionRelated);

            if (platform.HasValue)
            {
                query = query.Where(p => p.Platform == platform.Value);
            }

            if (sourceId.HasValue)
            {
                query = query.Where(p => p.SocialMediaSourceId == sourceId.Value);
            }

            var totalCount = await query.CountAsync();

            var posts = await query
                .OrderByDescending(p => p.PostedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (posts.Select(MapPostToDto), totalCount);
        }

        public async Task<SocialMediaPostDto?> GetPostByIdAsync(int id)
        {
            var post = await _postRepository.AsQueryable()
                .Include(p => p.Source)
                .FirstOrDefaultAsync(p => p.Id == id);

            return post == null ? null : MapPostToDto(post);
        }

        public async Task<IEnumerable<SocialMediaPostDto>> GetTodaysPostsAsync()
        {
            var today = DateTime.UtcNow.Date;
            var posts = await _postRepository.AsQueryable()
                .Include(p => p.Source)
                .Where(p => p.IsConstructionRelated && p.FetchedAt >= today)
                .OrderByDescending(p => p.PostedAt)
                .Take(50)
                .ToListAsync();

            return posts.Select(MapPostToDto);
        }

        public async Task<IEnumerable<SocialMediaSourceDto>> GetSourcesAsync(bool activeOnly = true)
        {
            var query = _sourceRepository.AsQueryable();
            
            if (activeOnly)
            {
                query = query.Where(s => s.IsActive);
            }

            var sources = await query.OrderBy(s => s.DisplayName ?? s.SourceValue).ToListAsync();
            return sources.Select(MapSourceToDto);
        }

        public async Task<SocialMediaSourceDto> CreateSourceAsync(CreateSocialMediaSourceRequest request)
        {
            var source = new SocialMediaSource
            {
                Platform = request.Platform,
                SourceType = request.SourceType,
                SourceValue = request.SourceValue,
                DisplayName = request.DisplayName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _sourceRepository.AddAsync(source);
            await _unitOfWork.SaveChangesAsync();

            return MapSourceToDto(source);
        }

        public async Task<SocialMediaSourceDto> UpdateSourceAsync(int id, UpdateSocialMediaSourceRequest request)
        {
            var source = await _sourceRepository.GetByIdAsync(id);
            if (source == null) throw new KeyNotFoundException("Source not found");

            source.SourceValue = request.SourceValue;
            source.DisplayName = request.DisplayName;
            source.IsActive = request.IsActive;
            source.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
            return MapSourceToDto(source);
        }

        public async Task<bool> DeleteSourceAsync(int id)
        {
            var source = await _sourceRepository.GetByIdAsync(id);
            if (source == null) return false;

            source.IsActive = false;
            source.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<FetchResultDto> FetchPostsFromAllSourcesAsync()
        {
            var sources = await _sourceRepository.AsQueryable()
                .Where(s => s.IsActive)
                .ToListAsync();

            var totalFetched = 0;
            var totalSaved = 0;
            var errors = new List<string>();

            foreach (var source in sources)
            {
                try
                {
                    var result = await FetchPostsFromSourceAsync(source.Id);
                    totalFetched += result.PostsFetched;
                    totalSaved += result.PostsSaved;
                    if (!string.IsNullOrEmpty(result.ErrorMessage))
                        errors.Add($"{source.DisplayName}: {result.ErrorMessage}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to fetch from source {SourceId}", source.Id);
                    errors.Add($"{source.DisplayName}: {ex.Message}");
                }
            }

            return new FetchResultDto
            {
                SourceId = 0,
                SourceName = "All Sources",
                Success = errors.Count == 0,
                PostsFetched = totalFetched,
                PostsSaved = totalSaved,
                ErrorMessage = errors.Count > 0 ? string.Join("; ", errors) : null,
                FetchedAt = DateTime.UtcNow
            };
        }

        public async Task<FetchResultDto> FetchPostsFromSourceAsync(int sourceId)
        {
            var source = await _sourceRepository.GetByIdAsync(sourceId);
            if (source == null)
            {
                return new FetchResultDto
                {
                    SourceId = sourceId,
                    SourceName = "Unknown",
                    Success = false,
                    ErrorMessage = "Source not found"
                };
            }

            try
            {
                var (posts, fetched, errorMessage) = await FetchFromPlatformAsync(source);
                
                var saved = 0;
                foreach (var post in posts)
                {
                    // Check if post already exists
                    var exists = await _postRepository.AsQueryable()
                        .AnyAsync(p => p.OriginalPostId == post.OriginalPostId && p.Platform == post.Platform);
                    
                    if (!exists)
                    {
                        await _postRepository.AddAsync(post);
                        saved++;
                    }
                }

                source.LastFetchedAt = DateTime.UtcNow;
                source.FetchCount++;
                source.PostsCollected += saved;
                source.LastError = errorMessage;
                
                await _unitOfWork.SaveChangesAsync();

                return new FetchResultDto
                {
                    SourceId = sourceId,
                    SourceName = source.DisplayName ?? source.SourceValue,
                    Success = string.IsNullOrEmpty(errorMessage),
                    PostsFetched = fetched,
                    PostsSaved = saved,
                    ErrorMessage = errorMessage,
                    FetchedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching posts from source {SourceId}", sourceId);
                
                source.LastError = ex.Message;
                source.LastFetchedAt = DateTime.UtcNow;
                await _unitOfWork.SaveChangesAsync();

                return new FetchResultDto
                {
                    SourceId = sourceId,
                    SourceName = source.DisplayName ?? source.SourceValue,
                    Success = false,
                    ErrorMessage = ex.Message,
                    FetchedAt = DateTime.UtcNow
                };
            }
        }

        public async Task<bool> TranslatePostAsync(int postId)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null) return false;

            try
            {
                post.ContentArabic = await _translationService.TranslateAsync(post.Content, "ar");
                post.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Translation failed for post {PostId}", postId);
                return false;
            }
        }

        public async Task TranslateAllUntranslatedAsync()
        {
            var posts = await _postRepository.AsQueryable()
                .Where(p => p.ContentArabic == null && p.IsConstructionRelated)
                .Take(100)
                .ToListAsync();

            if (posts.Count == 0) return;

            try
            {
                var contents = posts.Select(p => p.Content).ToList();
                var translations = await _translationService.TranslateBatchAsync(contents, "ar");

                for (int i = 0; i < posts.Count && i < translations.Count; i++)
                {
                    posts[i].ContentArabic = translations[i];
                    posts[i].UpdatedAt = DateTime.UtcNow;
                }

                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Batch translation failed");
            }
        }

        #region Platform-Specific Fetching

        private async Task<(List<SocialMediaPost> Posts, int Fetched, string? Error)> FetchFromPlatformAsync(SocialMediaSource source)
        {
            return source.Platform switch
            {
                SocialMediaPlatform.Facebook => await FetchFromFacebookAsync(source),
                SocialMediaPlatform.Twitter => await FetchFromTwitterAsync(source),
                SocialMediaPlatform.LinkedIn => await FetchFromLinkedInAsync(source),
                SocialMediaPlatform.Instagram => await FetchFromInstagramAsync(source),
                _ => (new List<SocialMediaPost>(), 0, $"Unsupported platform: {source.Platform}")
            };
        }

        #region Facebook API

        private async Task<(List<SocialMediaPost> Posts, int Fetched, string? Error)> FetchFromFacebookAsync(SocialMediaSource source)
        {
            var posts = new List<SocialMediaPost>();
            
            if (string.IsNullOrEmpty(_settings.Facebook.AccessToken))
            {
                return (posts, 0, "Facebook access token not configured");
            }

            try
            {
                var baseUrl = $"{_settings.Facebook.BaseUrl}/{_settings.Facebook.ApiVersion}";
                string endpoint;

                if (source.SourceType == SocialMediaSourceType.Account)
                {
                    // Get posts from a page or user
                    endpoint = $"{baseUrl}/{source.SourceValue}/posts?fields=id,message,created_time,from,attachments{{media_url}},permalink_url,reactions.summary(true),comments.summary(true),shares&limit={_settings.MaxPostsPerFetch}&access_token={_settings.Facebook.AccessToken}";
                }
                else if (source.SourceType == SocialMediaSourceType.Hashtag)
                {
                    // Search for hashtag
                    var hashtag = source.SourceValue.StartsWith("#") ? source.SourceValue.Substring(1) : source.SourceValue;
                    endpoint = $"{baseUrl}/ig_hashtag_search?user_id={_settings.Facebook.AppId}&q={hashtag}&access_token={_settings.Facebook.AccessToken}";
                }
                else
                {
                    // Keyword search via Graph API
                    endpoint = $"{baseUrl}/search?q={Uri.EscapeDataString(source.SourceValue)}&type=post&limit={_settings.MaxPostsPerFetch}&access_token={_settings.Facebook.AccessToken}";
                }

                var response = await _httpClient.GetAsync(endpoint);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Facebook API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                    return (posts, 0, $"Facebook API error: {response.StatusCode}");
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                var fbResponse = JsonSerializer.Deserialize<FacebookPostsResponse>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (fbResponse?.Data == null) return (posts, 0, null);

                foreach (var fbPost in fbResponse.Data)
                {
                    var content = fbPost.Message ?? "";
                    if (!IsConstructionRelated(content)) continue;

                    var mediaUrls = new List<string>();
                    if (fbPost.Attachments?.Data != null)
                    {
                        mediaUrls.AddRange(fbPost.Attachments.Data
                            .Where(a => !string.IsNullOrEmpty(a.MediaUrl))
                            .Select(a => a.MediaUrl!));
                    }

                    posts.Add(new SocialMediaPost
                    {
                        Platform = SocialMediaPlatform.Facebook,
                        OriginalPostId = fbPost.Id,
                        AuthorName = fbPost.From?.Name ?? "Unknown",
                        AuthorHandle = fbPost.From?.Id,
                        AuthorProfileUrl = $"https://facebook.com/{fbPost.From?.Id}",
                        Content = content,
                        MediaUrls = mediaUrls.Count > 0 ? JsonSerializer.Serialize(mediaUrls) : null,
                        PostUrl = fbPost.PermalinkUrl ?? $"https://facebook.com/{fbPost.Id}",
                        PostedAt = fbPost.CreatedTime,
                        FetchedAt = DateTime.UtcNow,
                        LikesCount = fbPost.Reactions?.Summary?.TotalCount ?? 0,
                        CommentsCount = fbPost.Comments?.Summary?.TotalCount ?? 0,
                        SharesCount = fbPost.Shares?.Count ?? 0,
                        IsConstructionRelated = true,
                        MatchedKeywords = GetMatchedKeywords(content),
                        SocialMediaSourceId = source.Id
                    });
                }

                return (posts, fbResponse.Data.Count, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching from Facebook");
                return (posts, 0, ex.Message);
            }
        }

        #endregion

        #region Twitter/X API

        private async Task<(List<SocialMediaPost> Posts, int Fetched, string? Error)> FetchFromTwitterAsync(SocialMediaSource source)
        {
            var posts = new List<SocialMediaPost>();
            
            if (string.IsNullOrEmpty(_settings.Twitter.BearerToken))
            {
                return (posts, 0, "Twitter bearer token not configured");
            }

            try
            {
                using var request = new HttpRequestMessage();
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.Twitter.BearerToken);

                string endpoint;
                if (source.SourceType == SocialMediaSourceType.Account)
                {
                    // Get user tweets
                    endpoint = $"{_settings.Twitter.BaseUrl}/users/by/username/{source.SourceValue}/tweets?max_results={_settings.MaxPostsPerFetch}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=name,username,profile_image_url";
                }
                else if (source.SourceType == SocialMediaSourceType.Hashtag)
                {
                    var query = source.SourceValue.StartsWith("#") ? source.SourceValue : $"#{source.SourceValue}";
                    endpoint = $"{_settings.Twitter.BaseUrl}/tweets/search/recent?query={Uri.EscapeDataString(query)}&max_results={_settings.MaxPostsPerFetch}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=name,username,profile_image_url";
                }
                else
                {
                    // Keyword search
                    endpoint = $"{_settings.Twitter.BaseUrl}/tweets/search/recent?query={Uri.EscapeDataString(source.SourceValue)}&max_results={_settings.MaxPostsPerFetch}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=name,username,profile_image_url";
                }

                request.RequestUri = new Uri(endpoint);
                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Twitter API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                    return (posts, 0, $"Twitter API error: {response.StatusCode}");
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                var twitterResponse = JsonSerializer.Deserialize<TwitterPostsResponse>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (twitterResponse?.Data == null) return (posts, 0, null);

                var usersDict = twitterResponse.Includes?.Users?.ToDictionary(u => u.Id, u => u) ?? new Dictionary<string, TwitterUser>();

                foreach (var tweet in twitterResponse.Data)
                {
                    if (!IsConstructionRelated(tweet.Text)) continue;

                    var author = usersDict.GetValueOrDefault(tweet.AuthorId);
                    var mediaUrls = new List<string>();
                    
                    // Extract media from attachments if available
                    if (twitterResponse.Includes?.Media != null)
                    {
                        mediaUrls.AddRange(twitterResponse.Includes.Media
                            .Where(m => m.Type == "photo" && !string.IsNullOrEmpty(m.Url))
                            .Select(m => m.Url!));
                    }

                    posts.Add(new SocialMediaPost
                    {
                        Platform = SocialMediaPlatform.Twitter,
                        OriginalPostId = tweet.Id,
                        AuthorName = author?.Name ?? "Unknown",
                        AuthorHandle = author != null ? $"@{author.Username}" : null,
                        AuthorProfileUrl = author != null ? $"https://twitter.com/{author.Username}" : null,
                        AuthorAvatarUrl = author?.ProfileImageUrl,
                        Content = tweet.Text,
                        MediaUrls = mediaUrls.Count > 0 ? JsonSerializer.Serialize(mediaUrls) : null,
                        PostUrl = $"https://twitter.com/i/web/status/{tweet.Id}",
                        PostedAt = tweet.CreatedAt,
                        FetchedAt = DateTime.UtcNow,
                        LikesCount = tweet.PublicMetrics?.LikeCount ?? 0,
                        CommentsCount = tweet.PublicMetrics?.ReplyCount ?? 0,
                        SharesCount = (tweet.PublicMetrics?.RetweetCount ?? 0) + (tweet.PublicMetrics?.QuoteCount ?? 0),
                        IsConstructionRelated = true,
                        MatchedKeywords = GetMatchedKeywords(tweet.Text),
                        SocialMediaSourceId = source.Id
                    });
                }

                return (posts, twitterResponse.Data.Count, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching from Twitter");
                return (posts, 0, ex.Message);
            }
        }

        #endregion

        #region LinkedIn API

        private async Task<(List<SocialMediaPost> Posts, int Fetched, string? Error)> FetchFromLinkedInAsync(SocialMediaSource source)
        {
            var posts = new List<SocialMediaPost>();
            
            if (string.IsNullOrEmpty(_settings.LinkedIn.AccessToken))
            {
                return (posts, 0, "LinkedIn access token not configured");
            }

            try
            {
                using var request = new HttpRequestMessage();
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.LinkedIn.AccessToken);

                string endpoint;
                if (source.SourceType == SocialMediaSourceType.Account)
                {
                    // Get posts from organization or person
                    endpoint = $"{_settings.LinkedIn.BaseUrl}/posts?author={source.SourceValue}&limit={_settings.MaxPostsPerFetch}";
                }
                else
                {
                    // LinkedIn doesn't have public hashtag/keyword search via API
                    // This would require LinkedIn Marketing API
                    return (posts, 0, "LinkedIn hashtag/keyword search requires Marketing API access");
                }

                request.RequestUri = new Uri(endpoint);
                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("LinkedIn API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                    return (posts, 0, $"LinkedIn API error: {response.StatusCode}");
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                var linkedInResponse = JsonSerializer.Deserialize<LinkedInPostsResponse>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (linkedInResponse?.Elements == null) return (posts, 0, null);

                foreach (var liPost in linkedInResponse.Elements)
                {
                    var content = liPost.Commentary?.Text ?? "";
                    if (!IsConstructionRelated(content)) continue;

                    posts.Add(new SocialMediaPost
                    {
                        Platform = SocialMediaPlatform.LinkedIn,
                        OriginalPostId = liPost.Id,
                        AuthorName = liPost.Author?.Name ?? "Unknown",
                        Content = content,
                        MediaUrls = liPost.Content?.Media?.Select(m => m.Url).Where(u => u != null).ToList() != null 
                            ? JsonSerializer.Serialize(liPost.Content.Media.Select(m => m.Url).Where(u => u != null)) 
                            : null,
                        PostUrl = $"https://linkedin.com/feed/update/{liPost.Id}",
                        PostedAt = liPost.CreatedAt ?? DateTime.UtcNow,
                        FetchedAt = DateTime.UtcNow,
                        LikesCount = liPost.SocialDetail?.TotalLikes ?? 0,
                        CommentsCount = liPost.SocialDetail?.TotalComments ?? 0,
                        IsConstructionRelated = true,
                        MatchedKeywords = GetMatchedKeywords(content),
                        SocialMediaSourceId = source.Id
                    });
                }

                return (posts, linkedInResponse.Elements.Count, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching from LinkedIn");
                return (posts, 0, ex.Message);
            }
        }

        #endregion

        #region Instagram API

        private async Task<(List<SocialMediaPost> Posts, int Fetched, string? Error)> FetchFromInstagramAsync(SocialMediaSource source)
        {
            var posts = new List<SocialMediaPost>();
            
            if (string.IsNullOrEmpty(_settings.Instagram.AccessToken))
            {
                return (posts, 0, "Instagram access token not configured");
            }

            try
            {
                string endpoint;
                if (source.SourceType == SocialMediaSourceType.Account)
                {
                    // Get media from Instagram Business account
                    endpoint = $"{_settings.Instagram.BaseUrl}/{source.SourceValue}/media?fields=id,caption,media_url,permalink,timestamp,like_count,comments_count&limit={_settings.MaxPostsPerFetch}&access_token={_settings.Instagram.AccessToken}";
                }
                else if (source.SourceType == SocialMediaSourceType.Hashtag)
                {
                    // Instagram hashtag search requires specific API permissions
                    var hashtagId = await GetInstagramHashtagId(source.SourceValue);
                    if (string.IsNullOrEmpty(hashtagId))
                    {
                        return (posts, 0, "Could not find Instagram hashtag ID");
                    }
                    endpoint = $"{_settings.Instagram.BaseUrl}/{hashtagId}/top_media?fields=id,caption,media_url,permalink,timestamp,like_count,comments_count&limit={_settings.MaxPostsPerFetch}&access_token={_settings.Instagram.AccessToken}";
                }
                else
                {
                    return (posts, 0, "Instagram keyword search is not supported via API");
                }

                var response = await _httpClient.GetAsync(endpoint);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Instagram API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                    return (posts, 0, $"Instagram API error: {response.StatusCode}");
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                var igResponse = JsonSerializer.Deserialize<InstagramMediaResponse>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (igResponse?.Data == null) return (posts, 0, null);

                foreach (var igPost in igResponse.Data)
                {
                    var content = igPost.Caption ?? "";
                    if (!IsConstructionRelated(content)) continue;

                    var mediaUrls = new List<string>();
                    if (!string.IsNullOrEmpty(igPost.MediaUrl))
                        mediaUrls.Add(igPost.MediaUrl);

                    posts.Add(new SocialMediaPost
                    {
                        Platform = SocialMediaPlatform.Instagram,
                        OriginalPostId = igPost.Id,
                        AuthorName = "Instagram User", // Instagram Basic Display API doesn't provide author details
                        Content = content,
                        MediaUrls = mediaUrls.Count > 0 ? JsonSerializer.Serialize(mediaUrls) : null,
                        PostUrl = igPost.Permalink ?? $"https://instagram.com/p/{igPost.Id}",
                        PostedAt = igPost.Timestamp ?? DateTime.UtcNow,
                        FetchedAt = DateTime.UtcNow,
                        LikesCount = igPost.LikeCount ?? 0,
                        CommentsCount = igPost.CommentsCount ?? 0,
                        IsConstructionRelated = true,
                        MatchedKeywords = GetMatchedKeywords(content),
                        SocialMediaSourceId = source.Id
                    });
                }

                return (posts, igResponse.Data.Count, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching from Instagram");
                return (posts, 0, ex.Message);
            }
        }

        private async Task<string?> GetInstagramHashtagId(string hashtag)
        {
            var cleanHashtag = hashtag.StartsWith("#") ? hashtag.Substring(1) : hashtag;
            var endpoint = $"{_settings.Instagram.BaseUrl}/ig_hashtag_search?user_id={_settings.Instagram.AppId}&q={Uri.EscapeDataString(cleanHashtag)}&access_token={_settings.Instagram.AccessToken}";
            
            try
            {
                var response = await _httpClient.GetAsync(endpoint);
                if (!response.IsSuccessStatusCode) return null;

                var jsonContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<InstagramHashtagSearchResponse>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                return result?.Data?.FirstOrDefault()?.Id;
            }
            catch
            {
                return null;
            }
        }

        #endregion

        #endregion

        #region Helper Methods

        private bool IsConstructionRelated(string content)
        {
            if (string.IsNullOrWhiteSpace(content)) return false;
            
            var contentLower = content.ToLower();
            var keywords = _settings.ConstructionKeywords.Count > 0 
                ? _settings.ConstructionKeywords 
                : GetDefaultKeywords();

            return keywords.Any(k => contentLower.Contains(k.ToLower()));
        }

        private string GetMatchedKeywords(string content)
        {
            if (string.IsNullOrWhiteSpace(content)) return "";
            
            var contentLower = content.ToLower();
            var keywords = _settings.ConstructionKeywords.Count > 0 
                ? _settings.ConstructionKeywords 
                : GetDefaultKeywords();

            var matched = keywords.Where(k => contentLower.Contains(k.ToLower())).ToList();
            return string.Join(", ", matched);
        }

        private List<string> GetDefaultKeywords()
        {
            return new List<string>
            {
                "construction", "building", "architecture", "civil engineering",
                "concrete", "steel", "cement", "infrastructure", "real estate",
                "contractor", "project management", "site work", "excavation",
                "foundation", "structural", "renovation", "demolition",
                "بناء", "تشييد", "مقاولات", "هندسة مدنية", "خرسانة",
                "حديد", "اسمنت", "مشاريع", "إنشاءات", "عقارات"
            };
        }

        private SocialMediaPostDto MapPostToDto(SocialMediaPost post)
        {
            List<string> mediaUrls = new();
            if (!string.IsNullOrEmpty(post.MediaUrls))
            {
                try
                {
                    mediaUrls = JsonSerializer.Deserialize<List<string>>(post.MediaUrls) ?? new();
                }
                catch { /* Ignore JSON errors */ }
            }

            return new SocialMediaPostDto
            {
                Id = post.Id,
                Platform = post.Platform.ToString(),
                OriginalPostId = post.OriginalPostId,
                AuthorName = post.AuthorName,
                AuthorHandle = post.AuthorHandle,
                AuthorProfileUrl = post.AuthorProfileUrl,
                AuthorAvatarUrl = post.AuthorAvatarUrl,
                Content = post.Content,
                ContentArabic = post.ContentArabic,
                MediaUrls = mediaUrls,
                PostUrl = post.PostUrl,
                PostedAt = post.PostedAt,
                FetchedAt = post.FetchedAt,
                LikesCount = post.LikesCount,
                CommentsCount = post.CommentsCount,
                SharesCount = post.SharesCount,
                IsConstructionRelated = post.IsConstructionRelated,
                MatchedKeywords = post.MatchedKeywords,
                SourceId = post.SocialMediaSourceId,
                SourceName = post.Source?.DisplayName ?? post.Source?.SourceValue
            };
        }

        private SocialMediaSourceDto MapSourceToDto(SocialMediaSource source)
        {
            return new SocialMediaSourceDto
            {
                Id = source.Id,
                Platform = source.Platform.ToString(),
                SourceType = source.SourceType.ToString(),
                SourceValue = source.SourceValue,
                DisplayName = source.DisplayName,
                IsActive = source.IsActive,
                LastFetchedAt = source.LastFetchedAt,
                FetchCount = source.FetchCount,
                PostsCollected = source.PostsCollected,
                LastError = source.LastError
            };
        }

        #endregion

        #region API Response Models

        // Facebook API response models
        private class FacebookPostsResponse
        {
            public List<FacebookPost>? Data { get; set; }
        }

        private class FacebookPost
        {
            public string Id { get; set; } = string.Empty;
            public string? Message { get; set; }
            public DateTime CreatedTime { get; set; }
            public FacebookAuthor? From { get; set; }
            public FacebookAttachments? Attachments { get; set; }
            public string? PermalinkUrl { get; set; }
            public FacebookReactions? Reactions { get; set; }
            public FacebookComments? Comments { get; set; }
            public FacebookShares? Shares { get; set; }
        }

        private class FacebookAuthor
        {
            public string? Name { get; set; }
            public string? Id { get; set; }
        }

        private class FacebookAttachments
        {
            public List<FacebookAttachment>? Data { get; set; }
        }

        private class FacebookAttachment
        {
            public string? MediaUrl { get; set; }
        }

        private class FacebookReactions
        {
            public FacebookSummary? Summary { get; set; }
        }

        private class FacebookComments
        {
            public FacebookSummary? Summary { get; set; }
        }

        private class FacebookSummary
        {
            public int TotalCount { get; set; }
        }

        private class FacebookShares
        {
            public int Count { get; set; }
        }

        // Twitter API response models
        private class TwitterPostsResponse
        {
            public List<TwitterTweet>? Data { get; set; }
            public TwitterIncludes? Includes { get; set; }
        }

        private class TwitterTweet
        {
            public string Id { get; set; } = string.Empty;
            public string Text { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
            public string AuthorId { get; set; } = string.Empty;
            public TwitterMetrics? PublicMetrics { get; set; }
        }

        private class TwitterMetrics
        {
            public int LikeCount { get; set; }
            public int ReplyCount { get; set; }
            public int RetweetCount { get; set; }
            public int QuoteCount { get; set; }
        }

        private class TwitterIncludes
        {
            public List<TwitterUser>? Users { get; set; }
            public List<TwitterMedia>? Media { get; set; }
        }

        private class TwitterUser
        {
            public string Id { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Username { get; set; } = string.Empty;
            public string? ProfileImageUrl { get; set; }
        }

        private class TwitterMedia
        {
            public string Type { get; set; } = string.Empty;
            public string? Url { get; set; }
        }

        // LinkedIn API response models
        private class LinkedInPostsResponse
        {
            public List<LinkedInPost>? Elements { get; set; }
        }

        private class LinkedInPost
        {
            public string Id { get; set; } = string.Empty;
            public LinkedInCommentary? Commentary { get; set; }
            public LinkedInAuthor? Author { get; set; }
            public LinkedInContent? Content { get; set; }
            public DateTime? CreatedAt { get; set; }
            public LinkedInSocialDetail? SocialDetail { get; set; }
        }

        private class LinkedInCommentary
        {
            public string? Text { get; set; }
        }

        private class LinkedInAuthor
        {
            public string? Name { get; set; }
        }

        private class LinkedInContent
        {
            public List<LinkedInMedia>? Media { get; set; }
        }

        private class LinkedInMedia
        {
            public string? Url { get; set; }
        }

        private class LinkedInSocialDetail
        {
            public int TotalLikes { get; set; }
            public int TotalComments { get; set; }
        }

        // Instagram API response models
        private class InstagramMediaResponse
        {
            public List<InstagramMedia>? Data { get; set; }
        }

        private class InstagramMedia
        {
            public string Id { get; set; } = string.Empty;
            public string? Caption { get; set; }
            public string? MediaUrl { get; set; }
            public string? Permalink { get; set; }
            public DateTime? Timestamp { get; set; }
            public int? LikeCount { get; set; }
            public int? CommentsCount { get; set; }
        }

        private class InstagramHashtagSearchResponse
        {
            public List<InstagramHashtag>? Data { get; set; }
        }

        private class InstagramHashtag
        {
            public string Id { get; set; } = string.Empty;
        }

        #endregion
    }
}

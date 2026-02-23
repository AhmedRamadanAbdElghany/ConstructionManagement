using ConstructionManagement.Application.DTOs.SocialMedia;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace ConstructionManagement.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SocialMediaController : ControllerBase
    {
        private readonly ISocialMediaService _socialMediaService;
        private readonly ITranslationService _translationService;
        private readonly SocialMediaSettings _socialMediaSettings;
        private readonly TranslationSettings _translationSettings;

        public SocialMediaController(
            ISocialMediaService socialMediaService,
            ITranslationService translationService,
            IOptions<SocialMediaSettings> socialMediaSettings,
            IOptions<TranslationSettings> translationSettings)
        {
            _socialMediaService = socialMediaService;
            _translationService = translationService;
            _socialMediaSettings = socialMediaSettings.Value;
            _translationSettings = translationSettings.Value;
        }

        // GET: api/social-media
        [HttpGet]
        [AllowAnonymous] // Public access for the wall
        public async Task<ActionResult<object>> GetPosts(
            [FromQuery] SocialMediaPlatform? platform = null,
            [FromQuery] int? sourceId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var (posts, totalCount) = await _socialMediaService.GetPostsAsync(platform, sourceId, page, pageSize);
            return Ok(new { posts, totalCount, page, pageSize });
        }

        // GET: api/social-media/today
        [HttpGet("today")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<SocialMediaPostDto>>> GetTodaysPosts()
        {
            var posts = await _socialMediaService.GetTodaysPostsAsync();
            return Ok(posts);
        }

        // GET: api/social-media/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<SocialMediaPostDto>> GetPost(int id)
        {
            var post = await _socialMediaService.GetPostByIdAsync(id);
            if (post == null) return NotFound();
            return Ok(post);
        }

        // POST: api/social-media/{id}/translate
        [HttpPost("{id}/translate")]
        public async Task<ActionResult> TranslatePost(int id)
        {
            var result = await _socialMediaService.TranslatePostAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Post translated successfully" });
        }

        // GET: api/social-media/sources
        [HttpGet("sources")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<SocialMediaSourceDto>>> GetSources([FromQuery] bool activeOnly = true)
        {
            var sources = await _socialMediaService.GetSourcesAsync(activeOnly);
            return Ok(sources);
        }

        // POST: api/social-media/sources
        [HttpPost("sources")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SocialMediaSourceDto>> CreateSource([FromBody] CreateSocialMediaSourceRequest request)
        {
            var source = await _socialMediaService.CreateSourceAsync(request);
            return CreatedAtAction(nameof(GetSources), new { id = source.Id }, source);
        }

        // PUT: api/social-media/sources/{id}
        [HttpPut("sources/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SocialMediaSourceDto>> UpdateSource(int id, [FromBody] UpdateSocialMediaSourceRequest request)
        {
            var source = await _socialMediaService.UpdateSourceAsync(id, request);
            return Ok(source);
        }

        // DELETE: api/social-media/sources/{id}
        [HttpDelete("sources/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSource(int id)
        {
            var result = await _socialMediaService.DeleteSourceAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // POST: api/social-media/fetch
        [HttpPost("fetch")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FetchResultDto>> FetchAllPosts()
        {
            var result = await _socialMediaService.FetchPostsFromAllSourcesAsync();
            return Ok(result);
        }

        // POST: api/social-media/fetch/{sourceId}
        [HttpPost("fetch/{sourceId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FetchResultDto>> FetchFromSource(int sourceId)
        {
            var result = await _socialMediaService.FetchPostsFromSourceAsync(sourceId);
            return Ok(result);
        }

        // POST: api/social-media/translate-all
        [HttpPost("translate-all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> TranslateAll()
        {
            await _socialMediaService.TranslateAllUntranslatedAsync();
            return Ok(new { message = "All untranslated posts have been translated" });
        }

        #region Test Endpoints

        // GET: api/social-media/test/connections
        /// <summary>
        /// Tests API connections for all configured social media platforms
        /// </summary>
        [HttpGet("test/connections")]
        [Authorize(Roles = "Admin")]
        public ActionResult<TestConnectionsResult> TestConnections()
        {
            var result = new TestConnectionsResult
            {
                Platforms = new List<PlatformConnectionStatus>()
            };

            // Test Facebook
            result.Platforms.Add(new PlatformConnectionStatus
            {
                Platform = "Facebook",
                IsConfigured = !string.IsNullOrEmpty(_socialMediaSettings.Facebook.AppId) &&
                               !string.IsNullOrEmpty(_socialMediaSettings.Facebook.AppSecret) &&
                               !string.IsNullOrEmpty(_socialMediaSettings.Facebook.AccessToken) &&
                               !_socialMediaSettings.Facebook.AppId.StartsWith("YOUR_"),
                Message = string.IsNullOrEmpty(_socialMediaSettings.Facebook.AccessToken) 
                    ? "Access token not configured" 
                    : (!_socialMediaSettings.Facebook.AppId.StartsWith("YOUR_") ? "Ready" : "Placeholder credentials - replace with actual values")
            });

            // Test Twitter
            result.Platforms.Add(new PlatformConnectionStatus
            {
                Platform = "Twitter/X",
                IsConfigured = !string.IsNullOrEmpty(_socialMediaSettings.Twitter.BearerToken) &&
                               !_socialMediaSettings.Twitter.BearerToken.StartsWith("YOUR_"),
                Message = string.IsNullOrEmpty(_socialMediaSettings.Twitter.BearerToken) 
                    ? "Bearer token not configured" 
                    : (!_socialMediaSettings.Twitter.BearerToken.StartsWith("YOUR_") ? "Ready" : "Placeholder credentials - replace with actual values")
            });

            // Test LinkedIn
            result.Platforms.Add(new PlatformConnectionStatus
            {
                Platform = "LinkedIn",
                IsConfigured = !string.IsNullOrEmpty(_socialMediaSettings.LinkedIn.AccessToken) &&
                               !_socialMediaSettings.LinkedIn.AccessToken.StartsWith("YOUR_"),
                Message = string.IsNullOrEmpty(_socialMediaSettings.LinkedIn.AccessToken) 
                    ? "Access token not configured" 
                    : (!_socialMediaSettings.LinkedIn.AccessToken.StartsWith("YOUR_") ? "Ready" : "Placeholder credentials - replace with actual values")
            });

            // Test Instagram
            result.Platforms.Add(new PlatformConnectionStatus
            {
                Platform = "Instagram",
                IsConfigured = !string.IsNullOrEmpty(_socialMediaSettings.Instagram.AccessToken) &&
                               !_socialMediaSettings.Instagram.AccessToken.StartsWith("YOUR_"),
                Message = string.IsNullOrEmpty(_socialMediaSettings.Instagram.AccessToken) 
                    ? "Access token not configured" 
                    : (!_socialMediaSettings.Instagram.AccessToken.StartsWith("YOUR_") ? "Ready" : "Placeholder credentials - replace with actual values")
            });

            result.OverallStatus = result.Platforms.Any(p => p.IsConfigured) ? "Partial" : "Not Configured";
            if (result.Platforms.All(p => p.IsConfigured))
                result.OverallStatus = "Ready";

            return Ok(result);
        }

        // GET: api/social-media/test/translation
        /// <summary>
        /// Tests translation service connection
        /// </summary>
        [HttpGet("test/translation")]
        [Authorize(Roles = "Admin")]
        public ActionResult<TestTranslationResult> TestTranslation()
        {
            var result = new TestTranslationResult
            {
                Provider = _translationSettings.Provider,
                IsConfigured = false,
                Message = ""
            };

            if (_translationSettings.Provider.ToLowerInvariant() == "azure")
            {
                result.IsConfigured = !string.IsNullOrEmpty(_translationSettings.AzureTranslator.SubscriptionKey) &&
                                      !_translationSettings.AzureTranslator.SubscriptionKey.StartsWith("YOUR_");
                result.Message = result.IsConfigured 
                    ? $"Azure Translator configured for region {_translationSettings.AzureTranslator.Region}" 
                    : "Azure Translator subscription key not configured";
            }
            else if (_translationSettings.Provider.ToLowerInvariant() == "google")
            {
                result.IsConfigured = !string.IsNullOrEmpty(_translationSettings.GoogleTranslate.ApiKey) &&
                                      !_translationSettings.GoogleTranslate.ApiKey.StartsWith("YOUR_");
                result.Message = result.IsConfigured 
                    ? "Google Translate configured" 
                    : "Google Translate API key not configured";
            }

            return Ok(result);
        }

        // POST: api/social-media/test/translate-sample
        /// <summary>
        /// Tests translation with a sample text
        /// </summary>
        [HttpPost("test/translate-sample")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> TestTranslateSample([FromBody] TestTranslateRequest request)
        {
            if (string.IsNullOrEmpty(request?.Text))
            {
                return BadRequest(new { message = "Text is required" });
            }

            try
            {
                var translatedText = await _translationService.TranslateAsync(request.Text, "ar");
                return Ok(new 
                { 
                    originalText = request.Text,
                    translatedText,
                    targetLanguage = "ar",
                    success = true
                });
            }
            catch (Exception ex)
            {
                return Ok(new 
                { 
                    originalText = request.Text,
                    translatedText = (string?)null,
                    targetLanguage = "ar",
                    success = false,
                    error = ex.Message
                });
            }
        }

        // GET: api/social-media/test/keywords
        /// <summary>
        /// Returns the list of construction keywords configured
        /// </summary>
        [HttpGet("test/keywords")]
        [Authorize(Roles = "Admin")]
        public ActionResult<List<string>> GetKeywords()
        {
            return Ok(_socialMediaSettings.ConstructionKeywords);
        }

        #endregion
    }

    #region Test Response Models

    public class TestConnectionsResult
    {
        public string OverallStatus { get; set; } = string.Empty;
        public List<PlatformConnectionStatus> Platforms { get; set; } = new();
    }

    public class PlatformConnectionStatus
    {
        public string Platform { get; set; } = string.Empty;
        public bool IsConfigured { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class TestTranslationResult
    {
        public string Provider { get; set; } = string.Empty;
        public bool IsConfigured { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class TestTranslateRequest
    {
        public string Text { get; set; } = string.Empty;
    }

    #endregion
}
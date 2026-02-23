using ConstructionManagement.Application.Interfaces;
using Hangfire;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.BackgroundJobs
{
    /// <summary>
    /// Background job for fetching social media posts from all configured sources
    /// </summary>
    public class SocialMediaFetchJob
    {
        private readonly ISocialMediaService _socialMediaService;
        private readonly ILogger<SocialMediaFetchJob> _logger;

        public SocialMediaFetchJob(
            ISocialMediaService socialMediaService,
            ILogger<SocialMediaFetchJob> logger)
        {
            _socialMediaService = socialMediaService;
            _logger = logger;
        }

        /// <summary>
        /// Fetches posts from all active social media sources
        /// This job is scheduled to run daily
        /// </summary>
        [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 300, 900, 1800 })] // Retry after 5min, 15min, 30min
        [DisableConcurrentExecution(timeoutInSeconds: 600)] // Prevent overlapping runs, 10 min timeout
        public async Task FetchPostsFromAllSourcesAsync()
        {
            _logger.LogInformation("Starting social media fetch job at {Time}", DateTime.UtcNow);

            try
            {
                var result = await _socialMediaService.FetchPostsFromAllSourcesAsync();

                _logger.LogInformation(
                    "Social media fetch completed. Fetched: {Fetched}, Saved: {Saved}, Success: {Success}",
                    result.PostsFetched,
                    result.PostsSaved,
                    result.Success);

                if (!string.IsNullOrEmpty(result.ErrorMessage))
                {
                    _logger.LogWarning("Social media fetch had errors: {Error}", result.ErrorMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Social media fetch job failed");
                throw; // Re-throw to let Hangfire handle retry
            }
        }

        /// <summary>
        /// Translates all untranslated posts to Arabic
        /// This job runs after the fetch job
        /// </summary>
        [AutomaticRetry(Attempts = 2)]
        [DisableConcurrentExecution(timeoutInSeconds: 300)]
        public async Task TranslateUntranslatedPostsAsync()
        {
            _logger.LogInformation("Starting translation job at {Time}", DateTime.UtcNow);

            try
            {
                await _socialMediaService.TranslateAllUntranslatedAsync();
                _logger.LogInformation("Translation job completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Translation job failed");
                throw;
            }
        }

        /// <summary>
        /// Combined job that fetches posts and then translates them
        /// </summary>
        [AutomaticRetry(Attempts = 3)]
        [DisableConcurrentExecution(timeoutInSeconds: 900)] // 15 min timeout
        public async Task FetchAndTranslateAsync()
        {
            _logger.LogInformation("Starting combined fetch and translate job at {Time}", DateTime.UtcNow);

            // First fetch posts
            await FetchPostsFromAllSourcesAsync();

            // Then translate them
            await TranslateUntranslatedPostsAsync();

            _logger.LogInformation("Combined fetch and translate job completed at {Time}", DateTime.UtcNow);
        }
    }
}
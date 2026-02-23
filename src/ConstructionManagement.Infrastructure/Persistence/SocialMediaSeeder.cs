using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Persistence
{
    /// <summary>
    /// Seeder for default social media sources
    /// </summary>
    public class SocialMediaSeeder
    {
        private readonly IRepository<SocialMediaSource> _sourceRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<SocialMediaSeeder> _logger;

        public SocialMediaSeeder(
            IRepository<SocialMediaSource> sourceRepository,
            IUnitOfWork unitOfWork,
            ILogger<SocialMediaSeeder> logger)
        {
            _sourceRepository = sourceRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// Seeds default social media sources for construction industry content
        /// </summary>
        public async Task SeedAsync()
        {
            var existingSources = await _sourceRepository.AsQueryable().ToListAsync();
            
            var defaultSources = GetDefaultSources();

            foreach (var source in defaultSources)
            {
                // Check if source already exists
                var exists = existingSources.Any(s => 
                    s.Platform == source.Platform && 
                    s.SourceType == source.SourceType && 
                    s.SourceValue == source.SourceValue);

                if (!exists)
                {
                    await _sourceRepository.AddAsync(source);
                    _logger.LogInformation("Added social media source: {Platform} - {Type} - {Value}", 
                        source.Platform, source.SourceType, source.SourceValue);
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        private List<SocialMediaSource> GetDefaultSources()
        {
            var sources = new List<SocialMediaSource>();
            var now = DateTime.UtcNow;

            // Twitter/X Sources - Hashtags
            sources.AddRange(new[]
            {
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "#construction",
                    DisplayName = "Construction Hashtag",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "#building",
                    DisplayName = "Building Hashtag",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "#civilengineering",
                    DisplayName = "Civil Engineering Hashtag",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "#constructionmanagement",
                    DisplayName = "Construction Management Hashtag",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "#بناء",
                    DisplayName = "Construction Arabic Hashtag",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "#مقاولات",
                    DisplayName = "Contracting Arabic Hashtag",
                    IsActive = true,
                    CreatedAt = now
                }
            });

            // Twitter/X Sources - Keywords
            sources.AddRange(new[]
            {
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Keyword,
                    SourceValue = "construction site",
                    DisplayName = "Construction Site Keyword",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Keyword,
                    SourceValue = "heavy equipment",
                    DisplayName = "Heavy Equipment Keyword",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Twitter,
                    SourceType = SocialMediaSourceType.Keyword,
                    SourceValue = "building materials",
                    DisplayName = "Building Materials Keyword",
                    IsActive = true,
                    CreatedAt = now
                }
            });

            // LinkedIn Sources - Company Pages (example construction companies)
            sources.AddRange(new[]
            {
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.LinkedIn,
                    SourceType = SocialMediaSourceType.Account,
                    SourceValue = "construction-news",
                    DisplayName = "Construction News",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.LinkedIn,
                    SourceType = SocialMediaSourceType.Account,
                    SourceValue = "construction-industry",
                    DisplayName = "Construction Industry",
                    IsActive = true,
                    CreatedAt = now
                }
            });

            // Instagram Sources - Hashtags
            sources.AddRange(new[]
            {
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Instagram,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "construction",
                    DisplayName = "Construction Instagram",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Instagram,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "constructionlife",
                    DisplayName = "Construction Life Instagram",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Instagram,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "constructionsite",
                    DisplayName = "Construction Site Instagram",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Instagram,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "heavyequipment",
                    DisplayName = "Heavy Equipment Instagram",
                    IsActive = true,
                    CreatedAt = now
                }
            });

            // Facebook Sources - Pages
            sources.AddRange(new[]
            {
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Facebook,
                    SourceType = SocialMediaSourceType.Hashtag,
                    SourceValue = "#construction",
                    DisplayName = "Construction Facebook Hashtag",
                    IsActive = true,
                    CreatedAt = now
                },
                new SocialMediaSource
                {
                    Platform = SocialMediaPlatform.Facebook,
                    SourceType = SocialMediaSourceType.Keyword,
                    SourceValue = "construction industry",
                    DisplayName = "Construction Industry Keyword",
                    IsActive = true,
                    CreatedAt = now
                }
            });

            return sources;
        }
    }
}
using ConstructionManagement.Application.DTOs.CompanyAnnouncement;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class CompanyAnnouncementService : ICompanyAnnouncementService
{
    private readonly ApplicationDbContext _db;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICompanyContext _companyContext;
    private readonly INotificationService _notificationService;

    public CompanyAnnouncementService(
        ApplicationDbContext db,
        IFileStorageService fileStorageService,
        ICompanyContext companyContext,
        INotificationService notificationService)
    {
        _db = db;
        _fileStorageService = fileStorageService;
        _companyContext = companyContext;
        _notificationService = notificationService;
    }

    // ── Announcements ─────────────────────────────────────────────────────────

    public async Task<IEnumerable<CompanyAnnouncementDto>> GetCompanyAnnouncementsAsync(int companyId)
    {
        var query = _db.CompanyAnnouncements
            .IgnoreQueryFilters()
            .Where(a => a.CompanyId == companyId);

        // Only show unpublished to the company admin
        if (_companyContext.CompanyId != companyId)
        {
            query = query.Where(a => a.IsPublished);
        }

        return await query
            .OrderByDescending(a => a.PublishedAt)
            .Select(a => MapToDto(a))
            .ToListAsync();
    }

    public async Task<CompanyAnnouncementDto> GetAnnouncementAsync(int announcementId)
    {
        var a = await _db.CompanyAnnouncements
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == announcementId)
            ?? throw new KeyNotFoundException($"Announcement {announcementId} not found.");
        return MapToDto(a);
    }

    public async Task<int> CreateAnnouncementAsync(CreateAnnouncementRequest request)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new InvalidOperationException("Company context not set.");

        var entity = new CompanyAnnouncement
        {
            CompanyId = companyId,
            Title = request.Title,
            Content = request.Content,
            Type = request.Type,
            IsPublished = request.IsPublished,
            PublishedAt = request.IsPublished ? DateTime.UtcNow : null
        };

        if (request.Image != null)
        {
            var result = await _fileStorageService.SaveFileAsync(request.Image, "announcements");
            entity.ImageUrl = result.Path;
        }

        _db.CompanyAnnouncements.Add(entity);
        await _db.SaveChangesAsync();

        if (entity.IsPublished)
        {
            await NotifySubscribersAsync(entity);
        }

        return entity.Id;
    }

    public async Task UpdateAnnouncementAsync(int announcementId, UpdateAnnouncementRequest request)
    {
        var entity = await _db.CompanyAnnouncements.FindAsync(announcementId)
            ?? throw new KeyNotFoundException($"Announcement {announcementId} not found.");

        if (entity.CompanyId != _companyContext.CompanyId)
            throw new UnauthorizedAccessException("You do not have permission to update this announcement.");

        bool newlyPublished = request.IsPublished == true && !entity.IsPublished;
        
        if (request.Title != null) entity.Title = request.Title;
        if (request.Content != null) entity.Content = request.Content;
        if (request.Type.HasValue) entity.Type = request.Type.Value;
        if (request.IsPublished.HasValue)
        {
            entity.IsPublished = request.IsPublished.Value;
            if (request.IsPublished.Value && entity.PublishedAt == null)
                entity.PublishedAt = DateTime.UtcNow;
        }

        if (request.Image != null)
        {
            if (!string.IsNullOrEmpty(entity.ImageUrl))
                await _fileStorageService.DeleteFileAsync(entity.ImageUrl);

            var result = await _fileStorageService.SaveFileAsync(request.Image, "announcements");
            entity.ImageUrl = result.Path;
        }

        await _db.SaveChangesAsync();

        if (newlyPublished)
        {
            await NotifySubscribersAsync(entity);
        }
    }

    public async Task DeleteAnnouncementAsync(int announcementId)
    {
        var entity = await _db.CompanyAnnouncements.FindAsync(announcementId)
            ?? throw new KeyNotFoundException($"Announcement {announcementId} not found.");

        if (entity.CompanyId != _companyContext.CompanyId)
            throw new UnauthorizedAccessException("You do not have permission to delete this announcement.");

        if (!string.IsNullOrEmpty(entity.ImageUrl))
            await _fileStorageService.DeleteFileAsync(entity.ImageUrl);

        _db.CompanyAnnouncements.Remove(entity);
        await _db.SaveChangesAsync();
    }

    // ── Followers (Subscribers) ────────────────────────────────────────────────

    public async Task SubscribeAsync(int companyId)
    {
        var userId = _companyContext.CurrentUserId
            ?? throw new UnauthorizedAccessException("User not logged in.");

        var exists = await _db.CompanyFollowers
            .AnyAsync(f => f.CompanyId == companyId && f.UserId == userId);
        if (exists) return;

        _db.CompanyFollowers.Add(new CompanyFollower
        {
            CompanyId = companyId,
            UserId = userId,
            FollowedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }

    public async Task UnsubscribeAsync(int companyId)
    {
        var userId = _companyContext.CurrentUserId
            ?? throw new UnauthorizedAccessException("User not logged in.");

        var follower = await _db.CompanyFollowers
            .FirstOrDefaultAsync(f => f.CompanyId == companyId && f.UserId == userId);
        if (follower != null)
        {
            _db.CompanyFollowers.Remove(follower);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<bool> IsSubscribedAsync(int companyId)
    {
        var userId = _companyContext.CurrentUserId ?? 0;
        return await _db.CompanyFollowers
            .AnyAsync(f => f.CompanyId == companyId && f.UserId == userId);
    }

    public async Task<int> GetSubscriberCountAsync(int companyId)
    {
        return await _db.CompanyFollowers
            .CountAsync(f => f.CompanyId == companyId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task NotifySubscribersAsync(CompanyAnnouncement announcement)
    {
        var company = await _db.Companies.FindAsync(announcement.CompanyId);
        var subscribers = await _db.CompanyFollowers
            .Where(f => f.CompanyId == announcement.CompanyId)
            .Select(f => f.UserId)
            .ToListAsync();

        string companyName = company?.Name ?? "Company";
        string title = announcement.Type == AnnouncementType.Offer ? "New Offer" : "New Announcement";
        string message = $"{companyName} published: {announcement.Title}";

        foreach (var userId in subscribers)
        {
            await _notificationService.CreateAndSendAsync(
                userId: userId,
                title: title,
                message: message,
                link: $"/marketplace/companies/{announcement.CompanyId}",
                type: NotificationType.General,
                titleKey: announcement.Type == AnnouncementType.Offer ? "NOTIF_NEW_OFFER" : "NOTIF_NEW_ANNOUNCEMENT",
                messageKey: "NOTIF_COMPANY_PUBLISHED",
                messageArgs: new object[] { companyName, announcement.Title }
            );
        }
    }

    private static CompanyAnnouncementDto MapToDto(CompanyAnnouncement a) => new()
    {
        Id = a.Id,
        CompanyId = a.CompanyId,
        Title = a.Title,
        Content = a.Content,
        Type = a.Type,
        ImageUrl = a.ImageUrl,
        IsPublished = a.IsPublished,
        PublishedAt = a.PublishedAt,
        CreatedAt = a.CreatedAt
    };
}

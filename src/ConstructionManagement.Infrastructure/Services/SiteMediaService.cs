using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Services;

public class SiteMediaService : ISiteMediaService
{
    private readonly IRepository<SiteMedia> _mediaRepository;
    private readonly IRepository<ProjectSettings> _settingsRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;

    public SiteMediaService(
        IRepository<SiteMedia> mediaRepository,
        IRepository<ProjectSettings> settingsRepository,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork)
    {
        _mediaRepository = mediaRepository;
        _settingsRepository = settingsRepository;
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> UploadMediaAsync(
        int? boqItemId,
        int projectId,
        string mediaType,
        string? description,
        IFormFile file,
        int uploaderUserId,
        SourceType source)
    {
        // جلب إعدادات المشروع (Id = projectId بسبب shared PK)
        var settings = await _settingsRepository.AsQueryable()
            .FirstOrDefaultAsync(s => s.Id == projectId);

        if (settings == null)
        {
            throw new InvalidOperationException("إعدادات المشروع غير موجودة.");
        }

        // التحقق من إمكانية الرفع
        if (!(settings.EnablePhotoUpload ?? true))
        {
            throw new InvalidOperationException("ميزة رفع الصور معطلة في إعدادات المشروع.");
        }

        // رفع الملف
        var filePath = await _fileStorageService.UploadFileAsync(file, "site-media");

        // إنشاء كائن الوسائط
        var media = new SiteMedia
        {
            ProjectId = projectId,
            BOQItemId = boqItemId,
            FilePath = filePath,
            MediaType = mediaType,
            Description = description,
            UploaderUserId = uploaderUserId,
            Source = source,
            CreatedAt = DateTime.UtcNow,

            // هل يحتاج مراجعة؟
            IsApproved = !(settings.RequirePhotoReview ?? true),
            Status = (settings.RequirePhotoReview ?? true) ? "Pending" : "Approved"
        };

        await _mediaRepository.AddAsync(media);
        await _unitOfWork.SaveChangesAsync();

        return media.Id;
    }

    public async Task<bool> ReviewMediaAsync(int mediaId, ReviewMediaRequest request, int reviewerUserId)
    {
        var media = await _mediaRepository.GetByIdAsync(mediaId);
        if (media == null) return false;

        media.Status = request.Status;
        media.RejectionReason = request.RejectionReason;
        media.ReviewerUserId = reviewerUserId;
        media.ReviewDate = DateTime.UtcNow;
        media.IsApproved = request.Status == "Approved";

        await _mediaRepository.UpdateAsync(media);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<SiteMedia?> GetMediaByIdAsync(int mediaId)
    {
        return await _mediaRepository.GetByIdAsync(mediaId);
    }

    public async Task<List<SiteMedia>> GetMediaForProjectAsync(int projectId, int? itemId = null, string? status = null)
    {
        var query = _mediaRepository.AsQueryable()
            .Where(m => m.ProjectId == projectId);

        if (itemId.HasValue)
            query = query.Where(m => m.BOQItemId == itemId.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(m => m.Status == status);

        return await query
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }
}
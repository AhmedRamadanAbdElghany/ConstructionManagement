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
    private readonly IRepository<ProjectApprovalRule> _ruleRepository;
    private readonly IRepository<ApprovalRequest> _requestRepository;
    private readonly IRepository<ApprovalStep> _stepRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService? _notificationService; // اختياري

    public SiteMediaService(
        IRepository<SiteMedia> mediaRepository,
        IRepository<ProjectSettings> settingsRepository,
        IRepository<ProjectApprovalRule> ruleRepository,
        IRepository<ApprovalRequest> requestRepository,
        IRepository<ApprovalStep> stepRepository,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        INotificationService? notificationService = null)
    {
        _mediaRepository = mediaRepository;
        _settingsRepository = settingsRepository;
        _ruleRepository = ruleRepository;
        _requestRepository = requestRepository;
        _stepRepository = stepRepository;
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
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
        try
        {
            // ابدأ الـ transaction
            await _unitOfWork.BeginTransactionAsync();

            // 1. جلب إعدادات المشروع
            var settings = await _settingsRepository.AsQueryable()
                .FirstOrDefaultAsync(s => s.Id == projectId);

            if (settings == null)
                throw new InvalidOperationException("إعدادات المشروع غير موجودة.");

            // 2. رفع الملف
            var filePath = await _fileStorageService.UploadFileAsync(file, "site-media");

            // 3. إنشاء كائن الوسائط
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
                Status = "Pending",
                IsApproved = false
            };

            await _mediaRepository.AddAsync(media);
            await _unitOfWork.SaveChangesAsync(); // احفظ عشان نأخذ media.Id

            // 4. التحقق هل يحتاج مراجعة؟
            bool requiresReview = settings.RequirePhotoReview ?? true;

            if (!requiresReview)
            {
                // لا يحتاج → اعتمد تلقائيًا
                media.Status = "Approved";
                media.IsApproved = true;
                await _mediaRepository.UpdateAsync(media);
            }
            else
            {
                // ابحث عن القاعدة المناسبة
                var rule = await _ruleRepository.AsQueryable()
                    .FirstOrDefaultAsync(r =>
                        r.ProjectId == projectId &&
                        (r.BOQItemId == boqItemId || r.BOQItemId == null) &&
                        r.Source == source);

                if (rule == null)
                {
                    // مفيش قاعدة → اعتمد تلقائيًا (أو ارمي exception لو عايز سياسة صارمة)
                    media.Status = "Approved";
                    media.IsApproved = true;
                    await _mediaRepository.UpdateAsync(media);
                }
                else
                {
                    // أنشئ طلب موافقة
                    var approvalRequest = new ApprovalRequest
                    {
                        ProjectId = projectId,
                        BOQItemId = boqItemId,
                        ProjectApprovalRuleId = rule.Id,
                        Source = source,
                        SourceId = media.Id,
                        RequestedByUserId = uploaderUserId,
                        RequestedAt = DateTime.UtcNow,
                        Status = "Pending"
                    };

                    // أنشئ الخطوة الأولى
                    var firstStep = new ApprovalStep
                    {
                        StepOrder = 1,
                        ApproverRole = rule.ApproverRole,
                        IsActive = true,
                        Status = "Pending"
                    };

                    approvalRequest.Steps.Add(firstStep);

                    await _requestRepository.AddAsync(approvalRequest);
                    await _unitOfWork.SaveChangesAsync();

                    // ابعت إشعار لو الخدمة موجودة
                    if (_notificationService != null)
                    {
                        await _notificationService.SendApprovalNeededNotificationAsync(approvalRequest, firstStep);
                    }
                }
            }

            await _unitOfWork.CommitAsync();
            return media.Id;
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackAsync();
            throw new Exception("فشل رفع الوسائط أو إنشاء طلب الموافقة.", ex);
        }
    }

    public async Task<bool> ReviewMediaAsync(int mediaId, ReviewMediaRequest request, int reviewerUserId)
    {
        try
        {
            await _unitOfWork.BeginTransactionAsync();

            var media = await _mediaRepository.AsQueryable()
                .Include(m => m.Project)
                .FirstOrDefaultAsync(m => m.Id == mediaId);

            if (media == null) return false;

            var approvalRequest = await _requestRepository.AsQueryable()
                .Include(r => r.Steps)
                .FirstOrDefaultAsync(r => r.SourceId == mediaId && r.Source == SourceType.OnlineUpload);

            if (approvalRequest == null)
            {
                // مفيش طلب موافقة → مراجعة مباشرة (fallback)
                media.Status = request.Status;
                media.RejectionReason = request.RejectionReason;
                media.ReviewerUserId = reviewerUserId;
                media.ReviewDate = DateTime.UtcNow;
                media.IsApproved = request.Status == "Approved";
            }
            else
            {
                var activeStep = approvalRequest.Steps.FirstOrDefault(s => s.IsActive);
                if (activeStep == null)
                    throw new InvalidOperationException("لا توجد خطوة موافقة نشطة.");

                activeStep.Status = request.Status;
                activeStep.ApproverUserId = reviewerUserId;
                activeStep.ApprovedAt = DateTime.UtcNow;
                activeStep.Notes = request.RejectionReason;
                activeStep.IsActive = false;

                if (request.Status == "Rejected")
                {
                    approvalRequest.Status = "Rejected";
                    approvalRequest.RejectionReason = request.RejectionReason;
                    media.Status = "Rejected";
                    media.IsApproved = false;
                }
                else
                {
                    var nextStep = approvalRequest.Steps.FirstOrDefault(s => s.StepOrder == activeStep.StepOrder + 1);
                    if (nextStep != null)
                    {
                        nextStep.IsActive = true;
                        approvalRequest.Status = "InProgress";
                    }
                    else
                    {
                        approvalRequest.Status = "Approved";
                        approvalRequest.FinalApprovedAt = DateTime.UtcNow;
                        approvalRequest.FinalApprovedByUserId = reviewerUserId;

                        media.Status = "Approved";
                        media.IsApproved = true;
                    }
                }

                await _requestRepository.UpdateAsync(approvalRequest);
            }

            await _mediaRepository.UpdateAsync(media);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();

            return true;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
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
            .Take(50)
            .ToListAsync();
    }
}

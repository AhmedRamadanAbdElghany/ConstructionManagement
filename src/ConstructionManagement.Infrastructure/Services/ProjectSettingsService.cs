using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

public class ProjectSettingsService : IProjectSettingsService
{
    private readonly IRepository<ProjectSettings> _settingsRepository;
    private readonly IRepository<Project> _projectRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectSettingsService(
        IRepository<ProjectSettings> settingsRepository,
        IRepository<Project> projectRepository,
        IUnitOfWork unitOfWork)
    {
        _settingsRepository = settingsRepository;
        _projectRepository = projectRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProjectSettingsDto> GetSettingsAsync(int projectId)
    {
        // Check if project exists
        var projectExists = await _projectRepository.ExistsAsync(projectId);
        if (!projectExists)
        {
            throw new InvalidOperationException("المشروع غير موجود");
        }

        // Get settings using shared PK (Id = projectId)
        var settings = await _settingsRepository.GetByIdAsync(projectId);

        // Auto-create default settings if not found
        if (settings == null)
        {
            settings = new ProjectSettings
            {
                Id = projectId   // Shared PK + FK to Project.Id
                // All other properties use defaults from entity
            };

            await _settingsRepository.AddAsync(settings);
            await _unitOfWork.SaveChangesAsync();
        }

        return MapToDto(settings);
    }

    public async Task UpdateSettingsAsync(int projectId, UpdateProjectSettingsRequest request, int userId)
    {
        // Fetch project to check existence + permissions
        var project = await _projectRepository.GetByIdAsync(projectId)
            ?? throw new InvalidOperationException("المشروع غير موجود");

        // Authorization: only owner or general manager can update
        if (project.OwnerUserId != userId && project.GeneralManagerUserId != userId)
        {
            throw new UnauthorizedAccessException("ليس لديك صلاحية لتعديل إعدادات هذا المشروع");
        }

        // Get existing settings or create new
        var settings = await _settingsRepository.GetByIdAsync(projectId);
        if (settings == null)
        {
            settings = new ProjectSettings { Id = projectId };
            await _settingsRepository.AddAsync(settings);
        }

        // Apply updates (only if value was provided in request)
        if (request.EnableDelayNotification.HasValue)
            settings.EnableDelayNotification = request.EnableDelayNotification.Value;

        if (request.DelayNotificationIsOneTimeOnly.HasValue)
            settings.DelayNotificationIsOneTimeOnly = request.DelayNotificationIsOneTimeOnly.Value;

        if (request.DelayNotificationIntervalDays.HasValue)
            settings.DelayNotificationIntervalDays = request.DelayNotificationIntervalDays.Value;

        if (request.DelayNotificationSendEmail.HasValue)
            settings.DelayNotificationSendEmail = request.DelayNotificationSendEmail.Value;

        if (request.DelayGracePeriodDays.HasValue)
            settings.DelayGracePeriodDays = request.DelayGracePeriodDays.Value;

        if (request.EnablePhotoUpload.HasValue)
            settings.EnablePhotoUpload = request.EnablePhotoUpload.Value;

        if (request.RequirePhotoReview.HasValue)
            settings.RequirePhotoReview = request.RequirePhotoReview.Value;

        if (request.PhotoApproverRole is not null)
            settings.PhotoApproverRole = request.PhotoApproverRole;

        if (request.EnableInvoiceReview.HasValue)
            settings.EnableInvoiceReview = request.EnableInvoiceReview.Value;

        if (request.EnableInvoiceAggregation.HasValue)
            settings.EnableInvoiceAggregation = request.EnableInvoiceAggregation.Value;

        if (request.MaxPhotosPerUpload.HasValue)
            settings.MaxPhotosPerUpload = request.MaxPhotosPerUpload.Value;

        // Note: UpdatedAt is automatically handled by your audit interceptor
        // No need to set it manually here

        await _settingsRepository.UpdateAsync(settings);
        await _unitOfWork.SaveChangesAsync();
    }

    private ProjectSettingsDto MapToDto(ProjectSettings s)
    {
        return new ProjectSettingsDto
        {
            EnableDelayNotification = s.EnableDelayNotification,
            DelayNotificationIsOneTimeOnly = s.DelayNotificationIsOneTimeOnly,
            DelayNotificationIntervalDays = s.DelayNotificationIntervalDays,
            DelayNotificationSendEmail = s.DelayNotificationSendEmail,
            DelayGracePeriodDays = s.DelayGracePeriodDays,

            EnablePhotoUpload = s.EnablePhotoUpload,
            RequirePhotoReview = s.RequirePhotoReview,
            PhotoApproverRole = s.PhotoApproverRole,

            EnableInvoiceReview = s.EnableInvoiceReview,
            EnableInvoiceAggregation = s.EnableInvoiceAggregation,

            MaxPhotosPerUpload = s.MaxPhotosPerUpload
        };
    }
}
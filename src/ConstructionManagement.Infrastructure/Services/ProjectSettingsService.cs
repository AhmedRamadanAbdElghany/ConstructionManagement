using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.Infrastructure.Services;

public class ProjectSettingsService : IProjectSettingsService
{
    private readonly IRepository<ProjectSettings> _projectSettingsRepository;
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<CompanySettings> _companySettingsRepository; // ← New: global settings
    private readonly IUnitOfWork _unitOfWork;

    public ProjectSettingsService(
        IRepository<ProjectSettings> projectSettingsRepository,
        IRepository<Project> projectRepository,
        IRepository<CompanySettings> companySettingsRepository,
        IUnitOfWork unitOfWork)
    {
        _projectSettingsRepository = projectSettingsRepository;
        _projectRepository = projectRepository;
        _companySettingsRepository = companySettingsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProjectSettingsDto> GetSettingsAsync(int projectId)
    {
        // Check if project exists
        var projectExists = await _projectRepository.ExistsAsync(projectId);
        if (!projectExists)
        {
            throw new KeyNotFoundException("المشروع غير موجود");
        }

        // Get project-specific settings (optional)
        var projectSettings = await _projectSettingsRepository.GetByIdAsync(projectId);

        // Get global company settings (must exist – singleton row Id=1)
        var companySettings = await _companySettingsRepository.GetByIdAsync(1)
            ?? throw new InvalidOperationException("إعدادات الشركة العامة غير موجودة");

        // Merge: project overrides take precedence, else fall back to global
        var effectiveSettings = new ProjectSettingsDto
        {
            EnableDelayNotification = projectSettings?.EnableDelayNotification ?? companySettings.EnableDelayNotification,
            DelayNotificationIsOneTimeOnly = projectSettings?.DelayNotificationIsOneTimeOnly ?? companySettings.DelayNotificationIsOneTimeOnly,
            DelayNotificationIntervalDays = projectSettings?.DelayNotificationIntervalDays ?? companySettings.DelayNotificationIntervalDays,
            DelayNotificationSendEmail = projectSettings?.DelayNotificationSendEmail ?? companySettings.DelayNotificationSendEmail,
            DelayGracePeriodDays = projectSettings?.DelayGracePeriodDays ?? companySettings.DelayGracePeriodDays,

            EnablePhotoUpload = projectSettings?.EnablePhotoUpload ?? companySettings.EnablePhotoUpload,
            RequirePhotoReview = projectSettings?.RequirePhotoReview ?? companySettings.RequirePhotoReview,
            PhotoApproverRole = projectSettings?.PhotoApproverRole ?? companySettings.PhotoApproverRole,

            EnableInvoiceReview = projectSettings?.EnableInvoiceReview ?? companySettings.EnableInvoiceReview,
            EnableInvoiceAggregation = projectSettings?.EnableInvoiceAggregation ?? companySettings.EnableInvoiceAggregation,

            MaxPhotosPerUpload = projectSettings?.MaxPhotosPerUpload ?? companySettings.MaxPhotosPerUpload,
            
            ClientCanSeeFinancials = projectSettings?.ClientCanSeeFinancials ?? companySettings.ClientCanSeeFinancials,
            ClientCanSeeMedia = projectSettings?.ClientCanSeeMedia ?? companySettings.ClientCanSeeMedia,
            ClientCanSeeBOQ = projectSettings?.ClientCanSeeBOQ ?? companySettings.ClientCanSeeBOQ,
            MoneyCalculationMethod = (projectSettings?.MoneyCalculationMethod ?? companySettings.DefaultMoneyCalculationMethod).ToString()
        };

        // Auto-create project settings if they don't exist (optional – lazy creation)
        if (projectSettings == null)
        {
            projectSettings = new ProjectSettings { Id = projectId };
            await _projectSettingsRepository.AddAsync(projectSettings);
            await _unitOfWork.SaveChangesAsync();
        }

        return effectiveSettings;
    }

    public async Task UpdateSettingsAsync(int projectId, UpdateProjectSettingsRequest request, int userId)
    {
        // Fetch project to check existence + authorization
        var project = await _projectRepository.GetByIdAsync(projectId)
            ?? throw new KeyNotFoundException("المشروع غير موجود");

        // Authorization: only owner or general manager can update project settings
        if (project.OwnerUserId != userId && project.GeneralManagerUserId != userId)
        {
            throw new UnauthorizedAccessException("ليس لديك صلاحية لتعديل إعدادات هذا المشروع");
        }

        // Get or create project settings
        var settings = await _projectSettingsRepository.GetByIdAsync(projectId);
        if (settings == null)
        {
            settings = new ProjectSettings { Id = projectId };
            await _projectSettingsRepository.AddAsync(settings);
        }

        // Apply updates only if value was explicitly provided in request
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

        if (request.ClientCanSeeFinancials.HasValue)
            settings.ClientCanSeeFinancials = request.ClientCanSeeFinancials.Value;
        
        if (request.ClientCanSeeMedia.HasValue)
            settings.ClientCanSeeMedia = request.ClientCanSeeMedia.Value;
            
        if (request.ClientCanSeeBOQ.HasValue)
            settings.ClientCanSeeBOQ = request.ClientCanSeeBOQ.Value;
            
        if (request.MoneyCalculationMethod is not null)
             settings.MoneyCalculationMethod = Enum.TryParse<CalculationMethod>(request.MoneyCalculationMethod, true, out var m) ? m : null;

        await _projectSettingsRepository.UpdateAsync(settings);
        await _unitOfWork.SaveChangesAsync();
    }

    private ProjectSettingsDto MapToDto(ProjectSettings settings, CompanySettings global)
    {
        return new ProjectSettingsDto
        {
            EnableDelayNotification = settings.EnableDelayNotification ?? global.EnableDelayNotification,
            DelayNotificationIsOneTimeOnly = settings.DelayNotificationIsOneTimeOnly ?? global.DelayNotificationIsOneTimeOnly,
            DelayNotificationIntervalDays = settings.DelayNotificationIntervalDays ?? global.DelayNotificationIntervalDays,
            DelayNotificationSendEmail = settings.DelayNotificationSendEmail ?? global.DelayNotificationSendEmail,
            DelayGracePeriodDays = settings.DelayGracePeriodDays ?? global.DelayGracePeriodDays,

            EnablePhotoUpload = settings.EnablePhotoUpload ?? global.EnablePhotoUpload,
            RequirePhotoReview = settings.RequirePhotoReview ?? global.RequirePhotoReview,
            PhotoApproverRole = settings.PhotoApproverRole ?? global.PhotoApproverRole,

            EnableInvoiceReview = settings.EnableInvoiceReview ?? global.EnableInvoiceReview,
            EnableInvoiceAggregation = settings.EnableInvoiceAggregation ?? global.EnableInvoiceAggregation,

            MaxPhotosPerUpload = settings.MaxPhotosPerUpload ?? global.MaxPhotosPerUpload,

            ClientCanSeeFinancials = settings.ClientCanSeeFinancials ?? global.ClientCanSeeFinancials,
            ClientCanSeeMedia = settings.ClientCanSeeMedia ?? global.ClientCanSeeMedia,
            ClientCanSeeBOQ = settings.ClientCanSeeBOQ ?? global.ClientCanSeeBOQ,
            MoneyCalculationMethod = (settings.MoneyCalculationMethod ?? global.DefaultMoneyCalculationMethod).ToString()
        };
    }
}

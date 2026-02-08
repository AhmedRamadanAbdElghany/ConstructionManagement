using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.WebApi.Controllers;

[Authorize(Roles = "SuperAdmin,CompanyAdmin")]
[ApiController]
[Route("api/company-settings")]
public class CompanySettingsController : ControllerBase
{
    private readonly IRepository<CompanySettings> _repo;
    private readonly IUnitOfWork _uow;

    public CompanySettingsController(IRepository<CompanySettings> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        // Query filter in DbContext will limit this to the current tenant if not SuperAdmin
        var settings = (await _repo.GetAllAsync()).FirstOrDefault();
        if (settings == null) return NotFound("Settings not found for this company.");
        return Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateCompanySettingsRequest request)
    {
        var settings = (await _repo.GetAllAsync()).FirstOrDefault();
        if (settings == null) return NotFound("Settings not found for this company.");

        // Map request to entity
        
        // Master Switches (Super Admin Only - usually handled in CompaniesController too, but synced here for convenience)
        if (request.EnableUserManagement.HasValue) settings.EnableUserManagement = request.EnableUserManagement.Value;
        if (request.EnableProjectManagement.HasValue) settings.EnableProjectManagement = request.EnableProjectManagement.Value;
        if (request.EnableBOQManagement.HasValue) settings.EnableBOQManagement = request.EnableBOQManagement.Value;
        if (request.EnableDailyLogs.HasValue) settings.EnableDailyLogs = request.EnableDailyLogs.Value;
        if (request.EnableSiteMedia.HasValue) settings.EnableSiteMedia = request.EnableSiteMedia.Value;
        if (request.EnableInventoryManagement.HasValue) settings.EnableInventoryManagement = request.EnableInventoryManagement.Value;
        if (request.EnableEquipmentManagement.HasValue) settings.EnableEquipmentManagement = request.EnableEquipmentManagement.Value;
        if (request.EnableQualityControl.HasValue) settings.EnableQualityControl = request.EnableQualityControl.Value;
        if (request.EnableSafetyManagement.HasValue) settings.EnableSafetyManagement = request.EnableSafetyManagement.Value;
        if (request.EnableSubcontractorManagement.HasValue) settings.EnableSubcontractorManagement = request.EnableSubcontractorManagement.Value;
        if (request.EnableFinancialManagement.HasValue) settings.EnableFinancialManagement = request.EnableFinancialManagement.Value;
        if (request.EnableAnalytics.HasValue) settings.EnableAnalytics = request.EnableAnalytics.Value;
        if (request.EnableNotifications.HasValue) settings.EnableNotifications = request.EnableNotifications.Value;
        if (request.EnableDocumentManagement.HasValue) settings.EnableDocumentManagement = request.EnableDocumentManagement.Value;
        if (request.EnableDesignManagement.HasValue) settings.EnableDesignManagement = request.EnableDesignManagement.Value;
        if (request.EnableClientPortal.HasValue) settings.EnableClientPortal = request.EnableClientPortal.Value;
        if (request.EnableAccessControl.HasValue) settings.EnableAccessControl = request.EnableAccessControl.Value;
        if (request.EnableHRManagement.HasValue) settings.EnableHRManagement = request.EnableHRManagement.Value;
        if (request.EnableVendorManagement.HasValue) settings.EnableVendorManagement = request.EnableVendorManagement.Value;

        // Map request to internal settings
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
        
        if (request.AllowMeasured.HasValue)
            settings.AllowMeasured = request.AllowMeasured.Value;
        if (request.AllowSupervision.HasValue)
            settings.AllowSupervision = request.AllowSupervision.Value;
        if (request.AllowPackages.HasValue)
            settings.AllowPackages = request.AllowPackages.Value;
        
        if (request.DefaultSupervisionPercentage.HasValue)
            settings.DefaultSupervisionPercentage = request.DefaultSupervisionPercentage.Value;

        if (request.DefaultMoneyCalculationMethod is not null)
            settings.DefaultMoneyCalculationMethod = Enum.TryParse<CalculationMethod>(request.DefaultMoneyCalculationMethod, true, out var m) ? m : CalculationMethod.Measured;

        // Inventory Management Settings
        if (request.RequireMaterialRequestApproval.HasValue)
            settings.RequireMaterialRequestApproval = request.RequireMaterialRequestApproval.Value;
        if (request.MaterialRequestApproverRole is not null)
            settings.MaterialRequestApproverRole = request.MaterialRequestApproverRole;
        if (request.EnableMultiWarehouse.HasValue)
            settings.EnableMultiWarehouse = request.EnableMultiWarehouse.Value;
        if (request.EnableStockAlerts.HasValue)
            settings.EnableStockAlerts = request.EnableStockAlerts.Value;
        if (request.DefaultLowStockThreshold.HasValue)
            settings.DefaultLowStockThreshold = request.DefaultLowStockThreshold.Value;

        // Equipment Management Settings
        if (request.RequireEquipmentAssignmentApproval.HasValue)
            settings.RequireEquipmentAssignmentApproval = request.RequireEquipmentAssignmentApproval.Value;
        if (request.EquipmentAssignmentApproverRole is not null)
            settings.EquipmentAssignmentApproverRole = request.EquipmentAssignmentApproverRole;
        if (request.EnableEquipmentGpsTracking.HasValue)
            settings.EnableEquipmentGpsTracking = request.EnableEquipmentGpsTracking.Value;
        if (request.EnableEquipmentRentalBilling.HasValue)
            settings.EnableEquipmentRentalBilling = request.EnableEquipmentRentalBilling.Value;
        if (request.RequireMaintenanceSchedule.HasValue)
            settings.RequireMaintenanceSchedule = request.RequireMaintenanceSchedule.Value;
        if (request.MaintenanceReminderDays.HasValue)
            settings.MaintenanceReminderDays = request.MaintenanceReminderDays.Value;
        if (request.EnableEquipmentUtilizationTracking.HasValue)
            settings.EnableEquipmentUtilizationTracking = request.EnableEquipmentUtilizationTracking.Value;
        if (request.EnableEquipmentInsuranceTracking.HasValue)
            settings.EnableEquipmentInsuranceTracking = request.EnableEquipmentInsuranceTracking.Value;
        if (request.EnableEquipmentDepreciation.HasValue)
            settings.EnableEquipmentDepreciation = request.EnableEquipmentDepreciation.Value;
        if (request.DefaultDepreciationYears.HasValue)
            settings.DefaultDepreciationYears = request.DefaultDepreciationYears.Value;

        // Safety Management Settings
        if (request.RequireSafetyInspections.HasValue)
            settings.RequireSafetyInspections = request.RequireSafetyInspections.Value;
        if (request.SafetyInspectionFrequencyDays.HasValue)
            settings.SafetyInspectionFrequencyDays = request.SafetyInspectionFrequencyDays.Value;
        if (request.IncidentReportingHours.HasValue)
            settings.IncidentReportingHours = request.IncidentReportingHours.Value;
        if (request.EnableIncidentEscalation.HasValue)
            settings.EnableIncidentEscalation = request.EnableIncidentEscalation.Value;
        if (request.RequireSafetyTraining.HasValue)
            settings.RequireSafetyTraining = request.RequireSafetyTraining.Value;
        if (request.SafetyTrainingRenewalMonths.HasValue)
            settings.SafetyTrainingRenewalMonths = request.SafetyTrainingRenewalMonths.Value;
        if (request.RequireEquipmentOperatorCertification.HasValue)
            settings.RequireEquipmentOperatorCertification = request.RequireEquipmentOperatorCertification.Value;
        if (request.EnableSafetyComplianceTracking.HasValue)
            settings.EnableSafetyComplianceTracking = request.EnableSafetyComplianceTracking.Value;
        if (request.SafetyChecklistApproverRole is not null)
            settings.SafetyChecklistApproverRole = request.SafetyChecklistApproverRole;
        if (request.IncidentInvestigatorRole is not null)
            settings.IncidentInvestigatorRole = request.IncidentInvestigatorRole;

        // Subcontractor Management Settings
        if (request.RequireSubcontractorApproval.HasValue)
            settings.RequireSubcontractorApproval = request.RequireSubcontractorApproval.Value;
        if (request.RequireSubcontractorInsurance.HasValue)
            settings.RequireSubcontractorInsurance = request.RequireSubcontractorInsurance.Value;
        if (request.SubcontractorInsuranceWarningDays.HasValue)
            settings.SubcontractorInsuranceWarningDays = request.SubcontractorInsuranceWarningDays.Value;
        if (request.DefaultRetentionPercentage.HasValue)
            settings.DefaultRetentionPercentage = request.DefaultRetentionPercentage.Value;
        if (request.RequireSubcontractorContract.HasValue)
            settings.RequireSubcontractorContract = request.RequireSubcontractorContract.Value;
        if (request.RequireSubcontractorPaymentApproval.HasValue)
            settings.RequireSubcontractorPaymentApproval = request.RequireSubcontractorPaymentApproval.Value;
        if (request.SubcontractorPaymentApproverRole is not null)
            settings.SubcontractorPaymentApproverRole = request.SubcontractorPaymentApproverRole;
        if (request.MaxPaymentWithoutApproval.HasValue)
            settings.MaxPaymentWithoutApproval = request.MaxPaymentWithoutApproval.Value;
        if (request.EnableSubcontractorRatings.HasValue)
            settings.EnableSubcontractorRatings = request.EnableSubcontractorRatings.Value;
        if (request.RequireRatingOnCompletion.HasValue)
            settings.RequireRatingOnCompletion = request.RequireRatingOnCompletion.Value;
        if (request.EnableSubcontractorSafetyScore.HasValue)
            settings.EnableSubcontractorSafetyScore = request.EnableSubcontractorSafetyScore.Value;
        if (request.MinimumRatingThreshold.HasValue)
            settings.MinimumRatingThreshold = request.MinimumRatingThreshold.Value;

        // Document Management Settings
        if (request.MaxFileSizeMB.HasValue)
            settings.MaxFileSizeMB = request.MaxFileSizeMB.Value;
        if (request.AllowedFileTypes is not null)
            settings.AllowedFileTypes = request.AllowedFileTypes;
        if (request.RequireDocumentApproval.HasValue)
            settings.RequireDocumentApproval = request.RequireDocumentApproval.Value;
        if (request.EnableVersionControl.HasValue)
            settings.EnableVersionControl = request.EnableVersionControl.Value;
        if (request.EnableExpirationTracking.HasValue)
            settings.EnableExpirationTracking = request.EnableExpirationTracking.Value;
        if (request.DocumentExpirationWarningDays.HasValue)
            settings.DocumentExpirationWarningDays = request.DocumentExpirationWarningDays.Value;
        if (request.DocumentApproverRole is not null)
            settings.DocumentApproverRole = request.DocumentApproverRole;
        if (request.EnableDocumentCategories.HasValue)
            settings.EnableDocumentCategories = request.EnableDocumentCategories.Value;
        if (request.MaxVersionsPerDocument.HasValue)
            settings.MaxVersionsPerDocument = request.MaxVersionsPerDocument.Value;

        // Quality Control Settings
        if (request.RequireQualityInspections.HasValue)
            settings.RequireQualityInspections = request.RequireQualityInspections.Value;
        if (request.QualityInspectionFrequencyDays.HasValue)
            settings.QualityInspectionFrequencyDays = request.QualityInspectionFrequencyDays.Value;
        if (request.DefectTrackingEnabled.HasValue)
            settings.DefectTrackingEnabled = request.DefectTrackingEnabled.Value;
        if (request.PunchListEnabled.HasValue)
            settings.PunchListEnabled = request.PunchListEnabled.Value;
        if (request.QualityScoreThreshold.HasValue)
            settings.QualityScoreThreshold = request.QualityScoreThreshold.Value;
        if (request.AutoEscalateCriticalDefects.HasValue)
            settings.AutoEscalateCriticalDefects = request.AutoEscalateCriticalDefects.Value;
        if (request.DefectResponseHours.HasValue)
            settings.DefectResponseHours = request.DefectResponseHours.Value;

        // Analytics Settings
        if (request.EnableAnalyticsReporting.HasValue)
            settings.EnableAnalyticsReporting = request.EnableAnalyticsReporting.Value;

        await _repo.UpdateAsync(settings);
        await _uow.SaveChangesAsync();

        return Ok(settings);
    }
}

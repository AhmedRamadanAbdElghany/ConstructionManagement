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

        await _repo.UpdateAsync(settings);
        await _uow.SaveChangesAsync();

        return Ok(settings);
    }
}

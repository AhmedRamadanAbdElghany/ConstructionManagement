using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        if (request.DefaultMoneyCalculationMethod is not null)
            settings.DefaultMoneyCalculationMethod = request.DefaultMoneyCalculationMethod;

        await _repo.UpdateAsync(settings);
        await _uow.SaveChangesAsync();

        return Ok(settings);
    }
}

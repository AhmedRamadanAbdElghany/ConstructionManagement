using ConstructionManagement.Application.DTOs;
using FluentValidation;

namespace ConstructionManagement.Application.Validators;

public class UpdateCompanySettingsRequestValidator : AbstractValidator<UpdateCompanySettingsRequest>
{
    public UpdateCompanySettingsRequestValidator()
    {
        RuleFor(x => x.DelayNotificationIntervalDays)
            .GreaterThanOrEqualTo(1).When(x => x.DelayNotificationIntervalDays.HasValue)
            .WithMessage("يجب أن يكون عدد أيام الإشعار أكبر من أو يساوي 1");

        RuleFor(x => x.DelayGracePeriodDays)
            .GreaterThanOrEqualTo(0).When(x => x.DelayGracePeriodDays.HasValue);

        RuleFor(x => x.MaxPhotosPerUpload)
            .GreaterThanOrEqualTo(1).When(x => x.MaxPhotosPerUpload.HasValue)
            .WithMessage("الحد الأقصى للصور يجب أن يكون 1 أو أكثر");

        RuleFor(x => x.PhotoApproverRole)
            .NotEmpty().When(x => x.PhotoApproverRole != null)
            .WithMessage("يجب تحديد دور مراجع الصور إذا تم إرساله");
    }
}

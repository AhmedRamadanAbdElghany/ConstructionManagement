using FluentValidation;
namespace ConstructionManagement.Application.Validators;
public class CloseDailyLogRequestValidator : AbstractValidator<CloseDailyLogRequest>
{
    public CloseDailyLogRequestValidator()
    {
        RuleFor(x => x.DailyProgressPercentage)
            .InclusiveBetween(0m, 100m).WithMessage("نسبة الإنجاز يجب أن تكون بين 0 و 100")
            .PrecisionScale(5, 2, false).WithMessage("نسبة الإنجاز يمكن أن تحتوي على رقمين عشريين فقط");

        RuleFor(x => x.ProgressNotes)
            .MaximumLength(1000).When(x => !string.IsNullOrEmpty(x.ProgressNotes))
            .WithMessage("ملاحظات التقدم لا تزيد عن 1000 حرف");

        RuleFor(x => x.ClosingNotes)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.ClosingNotes))
            .WithMessage("ملاحظات التقفيل لا تزيد عن 500 حرف");
    }
}

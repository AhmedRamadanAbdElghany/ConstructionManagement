using FluentValidation;
namespace ConstructionManagement.Application.Validators;
public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.ProjectName)
            .NotEmpty().WithMessage("اسم المشروع مطلوب")
            .MaximumLength(150).WithMessage("اسم المشروع لا يزيد عن 150 حرف");

        RuleFor(x => x.AccountingSystem)
            .NotEmpty().WithMessage("نوع نظام الحساب مطلوب")
            .Must(x => x == "Measured" || x == "Supervision" || x == "Mixed" || x == "Other")
            .WithMessage("نوع نظام الحساب غير صالح (Measured, Supervision, Mixed, Other فقط)");

        RuleFor(x => x.TotalContractValue)
            .GreaterThan(0).When(x => x.TotalContractValue.HasValue)
            .WithMessage("قيمة العقد يجب أن تكون أكبر من صفر");

        RuleFor(x => x.StartDate)
            .NotNull().WithMessage("تاريخ البداية مطلوب")
            .LessThanOrEqualTo(x => x.EndDate).When(x => x.EndDate.HasValue)
            .WithMessage("تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date).When(x => x.EndDate.HasValue)
            .WithMessage("تاريخ النهاية يجب أن يكون في المستقبل");
    }
}

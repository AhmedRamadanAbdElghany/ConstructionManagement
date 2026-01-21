using FluentValidation;
namespace ConstructionManagement.Application.Validators;
public class CreateBOQItemRequestValidator : AbstractValidator<CreateBOQItemRequest>
{
    public CreateBOQItemRequestValidator()
    {
        RuleFor(x => x.ItemName)
            .NotEmpty().WithMessage("اسم البند مطلوب")
            .MaximumLength(200).WithMessage("اسم البند لا يزيد عن 200 حرف");

        RuleFor(x => x.AccountingType)
            .NotEmpty().WithMessage("نوع نظام الحساب مطلوب")
            .Must(x => x == "Measured" || x == "Supervision")
            .WithMessage("نوع نظام الحساب يجب أن يكون Measured أو Supervision");

        // Measured-specific validation
        When(x => x.AccountingType == "Measured", () =>
        {
            RuleFor(x => x.AgreedQuantity)
                .GreaterThan(0).WithMessage("الكمية المتفق عليها يجب أن تكون أكبر من صفر");

            RuleFor(x => x.UnitPrice)
                .GreaterThan(0).WithMessage("سعر الوحدة يجب أن يكون أكبر من صفر");
        });

        // Supervision-specific validation
        When(x => x.AccountingType == "Supervision", () =>
        {
            RuleFor(x => x.SupervisionPercentage)
                .InclusiveBetween(0.1m, 50m).WithMessage("نسبة الإشراف يجب أن تكون بين 0.1% و 50%");

            RuleFor(x => x.BaseCalculation)
                .NotEmpty().WithMessage("أساس الحساب مطلوب")
                .Must(x => x == "AllProjectInvoices" || x == "ThisItemInvoices" || x == "CustomAmount")
                .WithMessage("أساس الحساب غير صالح");

            RuleFor(x => x.CustomBaseAmount)
                .GreaterThan(0).When(x => x.BaseCalculation == "CustomAmount")
                .WithMessage("المبلغ الأساسي مطلوب وأكبر من صفر عند اختيار CustomAmount");

            RuleFor(x => x.EstimatedTotalCost)
                .GreaterThan(0).When(x => x.EstimatedTotalCost.HasValue)
                .WithMessage("التكلفة المتوقعة يجب أن تكون أكبر من صفر");
        });

        RuleFor(x => x.StartDate)
            .NotNull().WithMessage("تاريخ البداية مطلوب");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate).When(x => x.EndDate.HasValue && x.StartDate.HasValue)
            .WithMessage("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
    }
}
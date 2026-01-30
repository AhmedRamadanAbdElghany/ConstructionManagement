using FluentValidation;

namespace ConstructionManagement.Application.Validators;

public class ReviewMediaRequestValidator : AbstractValidator<ReviewMediaRequest>
{
    public ReviewMediaRequestValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("حالة المراجعة مطلوبة")
            .Must(x => x == "Approved" || x == "Rejected" || x == "Forwarded")
            .WithMessage("حالة المراجعة يجب أن تكون 'Approved' أو 'Rejected' أو 'Forwarded'");

        RuleFor(x => x.RejectionReason)
            .NotEmpty().When(x => x.Status == "Rejected")
            .WithMessage("سبب الرفض مطلوب عند اختيار Rejected")
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.RejectionReason))
            .WithMessage("سبب الرفض لا يزيد عن 500 حرف");

        RuleFor(x => x.ForwardToUserID)
            .GreaterThan(0).When(x => x.Status == "Forwarded")
            .WithMessage("يجب تحديد مستخدم لإعادة التوجيه عند اختيار Forwarded");
    }
}

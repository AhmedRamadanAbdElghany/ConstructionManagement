using ConstructionManagement.Application.DTOs;
using FluentValidation;

namespace ConstructionManagement.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("الاسم الكامل مطلوب")
            .MaximumLength(100).WithMessage("الاسم لا يزيد عن 100 حرف")
            .MinimumLength(3).WithMessage("الاسم قصير جدًا");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("البريد الإلكتروني مطلوب")
            .EmailAddress().WithMessage("البريد الإلكتروني غير صالح");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("كلمة المرور مطلوبة")
            .MinimumLength(8).WithMessage("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
            .Matches("[A-Z]").WithMessage("يجب أن تحتوي على حرف كبير واحد على الأقل")
            .Matches("[0-9]").WithMessage("يجب أن تحتوي على رقم واحد على الأقل")
            .Matches("[!@#$%^&*]").WithMessage("يجب أن تحتوي على رمز خاص واحد على الأقل");

        RuleFor(x => x.Phone)
            .MaximumLength(15).When(x => !string.IsNullOrEmpty(x.Phone))
            .Matches(@"^01[0-2,5]\d{8}$").When(x => !string.IsNullOrEmpty(x.Phone))
            .WithMessage("رقم التليفون يجب أن يكون رقم مصري صحيح (مثال: 0123456789)");
    }
}
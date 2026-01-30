using ConstructionManagement.Application.DTOs;
using FluentValidation;

namespace ConstructionManagement.Application.Validators;

public class UploadMediaRequestValidator : AbstractValidator<UploadMediaRequest>
{
    public UploadMediaRequestValidator()
    {
        RuleFor(x => x.MediaType)
            .NotEmpty().WithMessage("نوع الوسائط مطلوب")
            .Must(x => x == "Image" || x == "Video")
            .WithMessage("نوع الوسائط يجب أن يكون 'Image' أو 'Video'");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("الوصف لا يزيد عن 500 حرف");

        // ملاحظة: التحقق من وجود الملف نفسه (IFormFile) يتم في الـ Controller
        // لأن FluentValidation لا يدعم التحقق من IFormFile مباشرة في الـ Request
    }
}

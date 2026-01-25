using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[Route("api/projects/{projectId}/media")]
[ApiController]
public class SiteMediaController : ControllerBase
{
    private readonly ISiteMediaService _mediaService;
    private readonly IDailyLogService _dailyLogService;

    public SiteMediaController(
        ISiteMediaService mediaService,
        IDailyLogService dailyLogService)
    {
        _mediaService = mediaService;
        _dailyLogService = dailyLogService;
    }

    /// <summary>
    /// رفع صورة أو فيديو جديد (مرتبط بمشروع وبند اختياري)
    /// </summary>
    [HttpPost]
    [Consumes("multipart/form-data")] // السطر ده هو اللي بيخلي Swagger يفهم إنه يرفع ملف
    public async Task<IActionResult> Upload(
        int projectId,
        [FromForm] UploadMediaRequest request)
    {
        // 1. التحقق من التقفيل اليومي
        if (request.ItemId.HasValue)
        {
            var today = DateTime.UtcNow.Date;
            var isClosed = await _dailyLogService.IsDayClosedForItemAsync(request.ItemId.Value, today);
            if (isClosed)
                return BadRequest("اليوم مقفول لهذا البند، لا يمكن رفع ملفات جديدة");
        }

        // 2. التحقق من الملف
        if (request.File == null || request.File.Length == 0)
            return BadRequest("يرجى اختيار ملف صالح");

        // 3. رفع الملف والحفظ
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var mediaId = await _mediaService.UploadMediaAsync(
            request.ItemId,
            projectId,
            request.MediaType,
            request.Description,
            request.File,
            userId,
            request.SourceType);

        return CreatedAtAction(nameof(Get), new { projectId, mediaId }, new { mediaId });
    }

    /// <summary>
    /// جلب تفاصيل وسائط معينة
    /// </summary>
    [HttpGet("{mediaId}")]
    public async Task<IActionResult> Get(int mediaId)
    {
        var media = await _mediaService.GetMediaByIdAsync(mediaId);
        if (media == null)
            return NotFound();

        return Ok(media);
    }

    /// <summary>
    /// مراجعة وسائط (موافقة / رفض / إعادة توجيه)
    /// </summary>
    /// <remarks>
    /// حالات الرفض المدعومة:
    /// - RejectionType = "WorkQuality": مشكلة في جودة الأعمال (يتم إنشاء ملاحظة على البند)
    /// - RejectionType = "ImageClarity": الصور غير واضحة (طلب إعادة رفع فقط)
    /// </remarks>
    [HttpPut("{mediaId}/review")]
    [Authorize(Policy = "CanReviewSiteImage")]
    public async Task<IActionResult> Review(int mediaId, [FromBody] ReviewMediaRequest request)
    {
        // التحقق الأساسي من الطلب
        if (request.Status == "Rejected" && string.IsNullOrEmpty(request.RejectionReason))
            return BadRequest("سبب الرفض مطلوب عند اختيار Rejected");

        if (request.Status == "Rejected" && string.IsNullOrEmpty(request.RejectionType))
            return BadRequest("نوع الرفض مطلوب عند اختيار Rejected (WorkQuality أو ImageClarity)");

        if (request.Status == "Rejected" &&
            request.RejectionType != "WorkQuality" &&
            request.RejectionType != "ImageClarity")
            return BadRequest("نوع الرفض غير مدعوم. استخدم WorkQuality أو ImageClarity");

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var success = await _mediaService.ReviewMediaAsync(
            mediaId,
            request,  // ← مرر الـ request كامل (يحتوي على RejectionType)
            userId);

        if (!success)
            return BadRequest("لا يمكن مراجعة الوسائط (غير موجودة أو تمت مراجعتها مسبقًا)");

        // رد أكثر تفصيلاً حسب الحالة
        if (request.Status == "Approved")
            return Ok("تمت الموافقة على الوسائط بنجاح");

        if (request.Status == "Rejected")
        {
            var message = request.RejectionType == "WorkQuality"
                ? "تم رفض الوسائط بسبب جودة الأعمال. تم إضافة ملاحظة على البند."
                : "تم رفض الوسائط بسبب عدم وضوح الصور. يرجى إعادة الرفع بصور أفضل.";

            return Ok(message);
        }

        return Ok("تم إعادة توجيه الوسائط بنجاح");
    }
    /// <summary>
    /// جلب كل الوسائط لمشروع معين (اختياري: للبند أو الحالة)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetForProject(
        int projectId,
        [FromQuery] int? itemId = null,
        [FromQuery] string? status = null)
    {
        var media = await _mediaService.GetMediaForProjectAsync(projectId, itemId, status);
        return Ok(media);
    }

    // NOTE: Add tests for daily log closed, file validation, review statuses.
}
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
// البارامتر itemId معرف هنا مرة واحدة لكل الميثودز تحت
[Route("api/items/{itemId}/dailylogs")]
[ApiController]
public class DailyLogsController : ControllerBase
{
    private readonly IDailyLogService _dailyLogService;

    public DailyLogsController(IDailyLogService dailyLogService)
    {
        _dailyLogService = dailyLogService;
    }

    // 1. إنشاء أو جلب يومية اليوم (إضافة مدخل تقدم)
    // المسار النهائي: POST api/items/{itemId}/dailylogs
    [HttpPost]
    [Authorize(Policy = "CanAddProgressEntry")]
    public async Task<IActionResult> CreateOrGet(int itemId, [FromBody] CreateDailyLogRequest request)
    {
        var userId = GetUserId();
        var logId = await _dailyLogService.GetOrCreateDailyLogIdAsync(itemId, request.LogDate, userId);
        return Ok(new { dailyLogId = logId });
    }

    // 2. تقفيل اليوم + تحديد نسبة الإنجاز
    // المسار النهائي: PUT api/items/{itemId}/dailylogs/{logDate}/close
    [HttpPut("{logDate:datetime}/close")] // إضافة datetime constraint للحماية
    [Authorize(Policy = "CanCloseDailyLog")]
    public async Task<IActionResult> Close(int itemId, DateTime logDate, [FromBody] CloseDailyLogRequest request)
    {
        var userId = GetUserId();
        var success = await _dailyLogService.CloseDailyLogAsync(itemId, logDate, userId, request);

        if (!success)
            return BadRequest(new { message = "لا يمكن تقفيل اليوم (ربما مقفول بالفعل أو غير موجود)" });

        return Ok(new { message = "تم تقفيل اليوم بنجاح مع نسبة الإنجاز المحددة" });
    }

    // 3. جلب تاريخ اليوميات والنسب للبند ده
    // تم حذف كلمة item/{itemId} لأنها موروثة من الـ Route الأساسي فوق الكلاس
    // المسار النهائي: GET api/items/{itemId}/dailylogs/history
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(int itemId)
    {
        var history = await _dailyLogService.GetDailyLogHistoryAsync(itemId);
        return Ok(history);
    }

    // 4. إعادة فتح يوم مقفول (مع الصلاحيات اللازمة)
    // المسار النهائي: PUT api/items/{itemId}/dailylogs/{logDate}/reopen
    [HttpPut("{logDate:datetime}/reopen")]
    [Authorize(Policy = "CanReopenClosedDaily")]
    public async Task<IActionResult> ReopenClosedDay(int itemId, DateTime logDate, [FromBody] ReopenDailyLogRequest request)
    {
        var userId = GetUserId();
        var success = await _dailyLogService.ReopenClosedDayAsync(itemId, logDate, userId, request.Reason, request.NotifyRoleIds);

        if (!success)
            return BadRequest(new { message = "Cannot reopen this day. Ensure you have permission and the day exists." });

        return Ok(new { message = "Day reopened successfully. Relevant roles have been notified." });
    }

    // Helper method لتجنب تكرار الكود
    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 0;
    }
}

public record ReopenDailyLogRequest(string Reason, List<int>? NotifyRoleIds);

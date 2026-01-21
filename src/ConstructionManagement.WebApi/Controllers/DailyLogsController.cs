using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[Route("api/items/{itemId}/dailylogs")]
[ApiController]
public class DailyLogsController : ControllerBase
{
    private readonly IDailyLogService _dailyLogService;

    public DailyLogsController(IDailyLogService dailyLogService)
    {
        _dailyLogService = dailyLogService;
    }

    // 1. إنشاء أو جلب يومية اليوم (لو مش موجودة تتعمل تلقائيًا)
    [HttpPost]
    public async Task<IActionResult> CreateOrGet(int itemId, [FromBody] CreateDailyLogRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var logId = await _dailyLogService.GetOrCreateDailyLogIdAsync(itemId, request.LogDate, userId);
        return Ok(new { dailyLogId = logId });
    }

    // 2. تقفيل اليوم + تحديد نسبة الإنجاز (المدير بس)
    [HttpPut("{logDate}/close")]
    [Authorize(Policy = "CanCloseDaily")]
    public async Task<IActionResult> Close(int itemId, DateTime logDate, [FromBody] CloseDailyLogRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var success = await _dailyLogService.CloseDailyLogAsync(itemId, logDate, userId, request);

        if (!success)
            return BadRequest(new { message = "لا يمكن تقفيل اليوم (ربما مقفول بالفعل أو غير موجود)" });

        return Ok(new { message = "تم تقفيل اليوم بنجاح مع نسبة الإنجاز المحددة" });
    }

    // 3. جلب تاريخ اليوميات والنسب للبند ده
    [HttpGet("item/{itemId}/history")]
    public async Task<IActionResult> GetHistory(int itemId)
    {
        // تأكد أن الاستدعاء بهذا الاسم الموحد
        var history = await _dailyLogService.GetDailyLogHistoryAsync(itemId);
        return Ok(history);
    }
}
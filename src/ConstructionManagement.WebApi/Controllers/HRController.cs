using ConstructionManagement.Application.DTOs.HR;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HRController : ControllerBase
{
    private readonly IHRService _hrService;
    private readonly ICompanyContext _companyContext;

    public HRController(IHRService hrService, ICompanyContext companyContext)
    {
        _hrService = hrService;
        _companyContext = companyContext;
    }

    // Team Members
    [HttpGet("team-members")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult<IEnumerable<TeamMemberDto>>> GetTeamMembers()
    {
        return Ok(await _hrService.GetTeamMembersAsync());
    }

    // Attendance
    [HttpGet("attendance")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult<IEnumerable<AttendanceDto>>> GetAttendances([FromQuery] DateTime? date, [FromQuery] int? userId)
    {
        return Ok(await _hrService.GetAttendancesAsync(date, userId));
    }

    [HttpPost("attendance/check-in")]
    public async Task<ActionResult<AttendanceDto>> CheckIn(CheckInRequest request)
    {
        try
        {
            return Ok(await _hrService.CheckInAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("attendance/check-out")]
    public async Task<ActionResult<AttendanceDto>> CheckOut(CheckOutRequest request)
    {
        try
        {
            return Ok(await _hrService.CheckOutAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("attendance/today")]
    public async Task<ActionResult<AttendanceDto>> GetTodayAttendance()
    {
        var attendance = await _hrService.GetTodayAttendanceAsync();
        if (attendance == null) return NotFound();
        return Ok(attendance);
    }

    // Leave Management
    [HttpGet("leave-types")]
    public async Task<ActionResult<IEnumerable<LeaveTypeDto>>> GetLeaveTypes()
    {
        return Ok(await _hrService.GetLeaveTypesAsync());
    }

    [HttpGet("leave-requests")]
    public async Task<ActionResult<IEnumerable<LeaveRequestDto>>> GetLeaveRequests([FromQuery] int? userId)
    {
        // If not admin, can only see own requests
        if (!User.IsInRole("CompanyAdmin") && !User.IsInRole("SuperAdmin"))
        {
            // Enforce current user ID for non-admin users
            userId = _companyContext.CurrentUserId;
        }
        return Ok(await _hrService.GetLeaveRequestsAsync(userId));
    }

    [HttpPost("leave-requests")]
    public async Task<ActionResult<LeaveRequestDto>> CreateLeaveRequest(CreateLeaveRequest request)
    {
        return Ok(await _hrService.CreateLeaveRequestAsync(request));
    }

    [HttpPut("leave-requests/{id}/review")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult> ReviewLeaveRequest(int id, ReviewLeaveRequest review)
    {
        await _hrService.ReviewLeaveRequestAsync(id, review);
        return NoContent();
    }

    // Certifications
    [HttpGet("certifications")]
    public async Task<ActionResult<IEnumerable<CertificationDto>>> GetCertifications([FromQuery] int? userId)
    {
        // If not admin, can only see own certifications
        if (!User.IsInRole("CompanyAdmin") && !User.IsInRole("SuperAdmin"))
        {
            userId = _companyContext.CurrentUserId;
        }
        return Ok(await _hrService.GetCertificationsAsync(userId));
    }

    [HttpPost("certifications")]
    public async Task<ActionResult<CertificationDto>> CreateCertification(UpsertCertificationRequest request)
    {
        return Ok(await _hrService.UpsertCertificationAsync(null, request));
    }

    [HttpPut("certifications/{id}")]
    public async Task<ActionResult<CertificationDto>> UpdateCertification(int id, UpsertCertificationRequest request)
    {
        return Ok(await _hrService.UpsertCertificationAsync(id, request));
    }

    [HttpDelete("certifications/{id}")]
    public async Task<ActionResult> DeleteCertification(int id)
    {
        await _hrService.DeleteCertificationAsync(id);
        return NoContent();
    }

    // Payroll
    [HttpGet("payroll")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult<IEnumerable<PayrollDto>>> GetPayrolls([FromQuery] int month, [FromQuery] int year)
    {
        return Ok(await _hrService.GetPayrollsAsync(month, year));
    }

    [HttpGet("my-payroll")]
    public async Task<ActionResult<IEnumerable<PayrollDto>>> GetMyPayrollHistory()
    {
        var userId = _companyContext.CurrentUserId ?? throw new UnauthorizedAccessException("User not authenticated");
        return Ok(await _hrService.GetUserPayrollHistoryAsync(userId));
    }

    [HttpGet("my-stats")]
    public async Task<ActionResult<UserHRStatsDto>> GetMyHRStats()
    {
        var userId = _companyContext.CurrentUserId ?? throw new UnauthorizedAccessException("User not authenticated");
        return Ok(await _hrService.GetUserHRStatsAsync(userId));
    }

    [HttpPost("payroll/process")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult> ProcessPayroll(GeneratePayrollRequest request)
    {
        await _hrService.ProcessMonthlyPayrollAsync(request.Month, request.Year);
        return Ok(new { message = $"Payroll for {request.Month}/{request.Year} processed successfully." });
    }

    [HttpPost("payroll/{id}/pay")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult> MarkAsPaid(int id)
    {
        var success = await _hrService.MarkAsPaidAsync(id);
        if (!success) return NotFound();
        return Ok(new { message = "Payment confirmed successfully." });
    }
}

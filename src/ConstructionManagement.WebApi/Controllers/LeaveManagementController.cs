using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaveManagementController : BaseApiController
    {
        private readonly ILeaveManagementService _leaveService;

        public LeaveManagementController(
            ILeaveManagementService leaveService,
            ICompanyFeatureService featureService) : base(featureService)
        {
            _leaveService = leaveService;
        }

        #region Leave Types

        [HttpGet("types")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<ActionResult<List<LeaveTypeDto>>> GetLeaveTypes([FromQuery] int? companyId)
        {
            // Check if leave management feature is enabled
            if (!await IsFeatureEnabledAsync("EnableLeaveManagement"))
            {
                return FeatureDisabled<List<LeaveTypeDto>>("Leave Management");
            }

            // Company isolation: use user's company if not SystemAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SystemAdmin") && userCompanyId.HasValue)
            {
                companyId = userCompanyId.Value;
            }
            
            var types = await _leaveService.GetLeaveTypesAsync(companyId);
            return Ok(types);
        }

        [HttpGet("types/{id}")]
        public async Task<ActionResult<LeaveTypeDto>> GetLeaveType(int id)
        {
            var type = await _leaveService.GetLeaveTypeByIdAsync(id);
            return Ok(type);
        }

        [HttpPost("types")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<LeaveTypeDto>> CreateLeaveType([FromBody] CreateLeaveTypeRequest request, [FromQuery] int? companyId)
        {
            // Company isolation: use user's company if not SystemAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SystemAdmin"))
            {
                if (!userCompanyId.HasValue)
                {
                    return BadRequest("Company context not found");
                }
                companyId = userCompanyId.Value;
            }
            
            var type = await _leaveService.CreateLeaveTypeAsync(request, companyId);
            return CreatedAtAction(nameof(GetLeaveType), new { id = type.Id }, type);
        }

        [HttpPut("types/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<LeaveTypeDto>> UpdateLeaveType(int id, [FromBody] UpdateLeaveTypeRequest request)
        {
            var type = await _leaveService.UpdateLeaveTypeAsync(id, request);
            return Ok(type);
        }

        [HttpDelete("types/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteLeaveType(int id)
        {
            await _leaveService.DeleteLeaveTypeAsync(id);
            return NoContent();
        }

        #endregion

        #region Leave Balances

        [HttpGet("balances/user/{userId}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<LeaveBalanceDto>>> GetUserLeaveBalances(int userId, [FromQuery] int? year)
        {
            var balances = await _leaveService.GetUserLeaveBalancesAsync(userId, year);
            return Ok(balances);
        }

        [HttpGet("balances/summary/{userId}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<UserLeaveSummaryDto>> GetUserLeaveSummary(int userId, [FromQuery] int? year)
        {
            var summary = await _leaveService.GetUserLeaveSummaryAsync(userId, year);
            return Ok(summary);
        }

        [HttpGet("balances/team")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<LeaveBalanceDto>>> GetTeamLeaveBalances([FromQuery] int companyId, [FromQuery] int? year)
        {
            // Company isolation: use user's company if not SystemAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SystemAdmin"))
            {
                if (!userCompanyId.HasValue)
                {
                    return BadRequest("Company context not found");
                }
                if (companyId != userCompanyId.Value)
                {
                    return Forbid();
                }
            }
            
            var balances = await _leaveService.GetTeamLeaveBalancesAsync(companyId, year);
            return Ok(balances);
        }

        [HttpPost("balances/adjust")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<LeaveBalanceDto>> AdjustLeaveBalance([FromBody] AdjustLeaveBalanceRequest request)
        {
            var balance = await _leaveService.AdjustLeaveBalanceAsync(request);
            return Ok(balance);
        }

        [HttpPost("balances/initialize")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult> InitializeYearBalances([FromQuery] int companyId, [FromQuery] int year)
        {
            // Company isolation: use user's company if not SystemAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SystemAdmin"))
            {
                if (!userCompanyId.HasValue)
                {
                    return BadRequest("Company context not found");
                }
                if (companyId != userCompanyId.Value)
                {
                    return Forbid();
                }
            }
            
            await _leaveService.InitializeYearLeaveBalancesAsync(companyId, year);
            return Ok();
        }

        #endregion

        #region Leave Requests

        [HttpGet("requests")]
        public async Task<ActionResult<List<LeaveRequestDto>>> GetLeaveRequests([FromQuery] LeaveRequestFilter filter)
        {
            // Company isolation: enforce user's companies if not SystemAdmin
            if (!User.IsInRole("SystemAdmin"))
            {
                if (filter.CompanyId.HasValue)
                {
                    // If a specific company is requested, ensure user has access to it
                    var myCompanies = GetAllCompanyIds();
                    if (!myCompanies.Contains(filter.CompanyId.Value))
                    {
                        return Forbid();
                    }
                }
                else
                {
                    // Otherwise, fetch for all our companies
                    filter.CompanyIds = GetAllCompanyIds();
                }
            }
            
            var requests = await _leaveService.GetLeaveRequestsAsync(filter);
            return Ok(requests);
        }

        [HttpGet("requests/{id}")]
        public async Task<ActionResult<LeaveRequestDto>> GetLeaveRequest(int id)
        {
            var request = await _leaveService.GetLeaveRequestByIdAsync(id);
            return Ok(request);
        }

        [HttpGet("requests/user/{userId}")]
        public async Task<ActionResult<List<LeaveRequestDto>>> GetUserLeaveRequests(int userId, [FromQuery] int? year)
        {
            var requests = await _leaveService.GetUserLeaveRequestsAsync(userId, year);
            return Ok(requests);
        }

        [HttpGet("requests/pending")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<LeaveRequestDto>>> GetPendingLeaveRequests([FromQuery] int companyId)
        {
            // Company isolation: use user's company if not SystemAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SystemAdmin"))
            {
                if (!userCompanyId.HasValue)
                {
                    return BadRequest("Company context not found");
                }
                if (companyId != userCompanyId.Value)
                {
                    return Forbid();
                }
            }
            
            var requests = await _leaveService.GetPendingLeaveRequestsAsync(companyId);
            return Ok(requests);
        }

        [HttpPost("requests")]
        public async Task<ActionResult<LeaveRequestDto>> CreateLeaveRequest([FromBody] CreateLeaveRequestRequest request)
        {
            var userId = GetUserId();
            var leaveRequest = await _leaveService.CreateLeaveRequestAsync(userId, request);
            return CreatedAtAction(nameof(GetLeaveRequest), new { id = leaveRequest.Id }, leaveRequest);
        }

        [HttpPut("requests/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<LeaveRequestDto>> UpdateLeaveRequest(int id, [FromBody] UpdateLeaveRequestRequest request)
        {
            var leaveRequest = await _leaveService.UpdateLeaveRequestAsync(id, request);
            return Ok(leaveRequest);
        }

        [HttpDelete("requests/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteLeaveRequest(int id)
        {
            await _leaveService.DeleteLeaveRequestAsync(id);
            return NoContent();
        }

        [HttpPost("requests/{id}/cancel")]
        public async Task<ActionResult> CancelLeaveRequest(int id)
        {
            var userId = GetUserId();
            await _leaveService.CancelLeaveRequestAsync(id, userId);
            return Ok();
        }

        [HttpPost("requests/{id}/approve")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<LeaveRequestDto>> ApproveLeaveRequest(int id, [FromBody] ApproveLeaveRequestRequest request)
        {
            var approverId = GetUserId();
            var leaveRequest = await _leaveService.ApproveLeaveRequestAsync(id, approverId, request);
            return Ok(leaveRequest);
        }

        [HttpPost("requests/{id}/reject")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<LeaveRequestDto>> RejectLeaveRequest(int id, [FromBody] RejectLeaveRequestRequest request)
        {
            var approverId = GetUserId();
            var leaveRequest = await _leaveService.RejectLeaveRequestAsync(id, approverId, request);
            return Ok(leaveRequest);
        }

        #endregion

        #region Holidays

        [HttpGet("holidays")]
        public async Task<ActionResult<List<HolidayDto>>> GetHolidays([FromQuery] int? companyId, [FromQuery] int? year)
        {
            var holidays = await _leaveService.GetHolidaysAsync(companyId, year);
            return Ok(holidays);
        }

        [HttpPost("holidays")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<HolidayDto>> CreateHoliday([FromBody] CreateHolidayRequest request, [FromQuery] int? companyId)
        {
            var holiday = await _leaveService.CreateHolidayAsync(request, companyId);
            return CreatedAtAction(nameof(GetHolidays), new { companyId }, holiday);
        }

        [HttpPut("holidays/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<HolidayDto>> UpdateHoliday(int id, [FromBody] UpdateHolidayRequest request)
        {
            var holiday = await _leaveService.UpdateHolidayAsync(id, request);
            return Ok(holiday);
        }

        [HttpDelete("holidays/{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteHoliday(int id)
        {
            await _leaveService.DeleteHolidayAsync(id);
            return NoContent();
        }

        #endregion

        #region Calendar & Reports

        [HttpGet("calendar")]
        public async Task<ActionResult<List<LeaveCalendarDto>>> GetLeaveCalendar(
            [FromQuery] int companyId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var calendar = await _leaveService.GetLeaveCalendarAsync(companyId, startDate, endDate);
            return Ok(calendar);
        }

        [HttpGet("report")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<LeaveReportDto>> GetLeaveReport(
            [FromQuery] int companyId,
            [FromQuery] int? year,
            [FromQuery] int? month)
        {
            var report = await _leaveService.GetLeaveReportAsync(companyId, year, month);
            return Ok(report);
        }

        [HttpGet("team-on-leave")]
        public async Task<ActionResult<List<LeaveRequestDto>>> GetTeamOnLeave([FromQuery] int companyId, [FromQuery] DateTime date)
        {
            var requests = await _leaveService.GetTeamOnLeaveAsync(companyId, date);
            return Ok(requests);
        }

        #endregion

        #region Calculations

        [HttpGet("calculate-days")]
        public async Task<ActionResult<decimal>> CalculateLeaveDays(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] int? companyId)
        {
            var days = await _leaveService.CalculateLeaveDaysAsync(startDate, endDate, companyId);
            return Ok(new { days });
        }

        [HttpGet("check-balance")]
        public async Task<ActionResult<bool>> CheckLeaveBalance(
            [FromQuery] int userId,
            [FromQuery] int leaveTypeId,
            [FromQuery] decimal days,
            [FromQuery] int? year)
        {
            var hasBalance = await _leaveService.HasSufficientLeaveBalanceAsync(userId, leaveTypeId, days, year);
            return Ok(new { hasBalance });
        }

        #endregion


    }
}


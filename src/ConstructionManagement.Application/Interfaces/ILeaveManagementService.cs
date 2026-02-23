using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface ILeaveManagementService
    {
        #region Leave Types
        
        Task<List<LeaveTypeDto>> GetLeaveTypesAsync(int? companyId = null);
        Task<LeaveTypeDto> GetLeaveTypeByIdAsync(int id, int? userCompanyId = null);
        Task<LeaveTypeDto> CreateLeaveTypeAsync(CreateLeaveTypeRequest request, int? companyId = null);
        Task<LeaveTypeDto> UpdateLeaveTypeAsync(int id, UpdateLeaveTypeRequest request);
        Task DeleteLeaveTypeAsync(int id);
        
        #endregion
        
        #region Leave Balances
        
        Task<List<LeaveBalanceDto>> GetUserLeaveBalancesAsync(int userId, int? year = null);
        Task<UserLeaveSummaryDto> GetUserLeaveSummaryAsync(int userId, int? year = null);
        Task<List<LeaveBalanceDto>> GetTeamLeaveBalancesAsync(int companyId, int? year = null);
        Task<LeaveBalanceDto> AdjustLeaveBalanceAsync(AdjustLeaveBalanceRequest request);
        Task InitializeYearLeaveBalancesAsync(int companyId, int year);
        
        #endregion
        
        #region Leave Requests
        
        Task<List<LeaveRequestDto>> GetLeaveRequestsAsync(LeaveRequestFilter filter);
        Task<LeaveRequestDto> GetLeaveRequestByIdAsync(int id);
        Task<List<LeaveRequestDto>> GetUserLeaveRequestsAsync(int userId, int? year = null);
        Task<List<LeaveRequestDto>> GetPendingLeaveRequestsAsync(int companyId);
        Task<LeaveRequestDto> CreateLeaveRequestAsync(int userId, CreateLeaveRequestRequest request);
        Task<LeaveRequestDto> UpdateLeaveRequestAsync(int id, UpdateLeaveRequestRequest request);
        Task DeleteLeaveRequestAsync(int id);
        Task CancelLeaveRequestAsync(int id, int userId);
        Task<LeaveRequestDto> ApproveLeaveRequestAsync(int id, int approverUserId, ApproveLeaveRequestRequest request);
        Task<LeaveRequestDto> RejectLeaveRequestAsync(int id, int approverUserId, RejectLeaveRequestRequest request);
        
        #endregion
        
        #region Holidays
        
        Task<List<HolidayDto>> GetHolidaysAsync(int? companyId = null, int? year = null);
        Task<HolidayDto> CreateHolidayAsync(CreateHolidayRequest request, int? companyId = null);
        Task<HolidayDto> UpdateHolidayAsync(int id, UpdateHolidayRequest request);
        Task DeleteHolidayAsync(int id);
        
        #endregion
        
        #region Calendar & Reports
        
        Task<List<LeaveCalendarDto>> GetLeaveCalendarAsync(int companyId, DateTime startDate, DateTime endDate);
        Task<LeaveReportDto> GetLeaveReportAsync(int companyId, int? year = null, int? month = null);
        Task<List<LeaveRequestDto>> GetTeamOnLeaveAsync(int companyId, DateTime date);
        
        #endregion
        
        #region Calculations
        
        Task<decimal> CalculateLeaveDaysAsync(DateTime startDate, DateTime endDate, int? companyId = null);
        Task<bool> HasSufficientLeaveBalanceAsync(int userId, int leaveTypeId, decimal days, int? year = null);
        
        #endregion
    }
}

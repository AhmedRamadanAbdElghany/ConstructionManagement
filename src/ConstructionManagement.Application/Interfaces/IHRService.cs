using ConstructionManagement.Application.DTOs.HR;

namespace ConstructionManagement.Application.Interfaces;

public interface IHRService
{
    // Attendance
    Task<IEnumerable<AttendanceDto>> GetAttendancesAsync(DateTime? date = null, int? userId = null);
    Task<AttendanceDto> CheckInAsync(CheckInRequest request);
    Task<AttendanceDto> CheckOutAsync(CheckOutRequest request);
    Task<AttendanceDto?> GetTodayAttendanceAsync();
    
    // Leave Management
    Task<IEnumerable<LeaveTypeDto>> GetLeaveTypesAsync();
    Task<IEnumerable<LeaveRequestDto>> GetLeaveRequestsAsync(int? userId = null);
    Task<LeaveRequestDto> CreateLeaveRequestAsync(CreateLeaveRequest request);
    Task ReviewLeaveRequestAsync(int requestId, ReviewLeaveRequest review);
    
    // Certifications
    Task<IEnumerable<CertificationDto>> GetCertificationsAsync(int? userId = null);
    Task<CertificationDto> UpsertCertificationAsync(int? id, UpsertCertificationRequest request);
    Task DeleteCertificationAsync(int id);

    // Payroll
    Task<IEnumerable<PayrollDto>> GetPayrollsAsync(int month, int year);
    Task<PayrollDto> GeneratePayrollForUserAsync(int userId, int month, int year);
    Task ProcessMonthlyPayrollAsync(int month, int year);
    Task<bool> MarkAsPaidAsync(int payrollId);
}

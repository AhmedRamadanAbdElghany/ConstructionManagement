using ConstructionManagement.Application.DTOs.HR;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class HRService : IHRService
{
    private readonly ApplicationDbContext _db;
    private readonly ICompanyContext _companyContext;
    private readonly IAuthService _authService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public HRService(
        ApplicationDbContext db,
        ICompanyContext companyContext,
        IAuthService authService,
        IUnitOfWork unitOfWork,
        INotificationService notificationService)
    {
        _db = db;
        _companyContext = companyContext;
        _authService = authService;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    // Team Members
    public async Task<IEnumerable<TeamMemberDto>> GetTeamMembersAsync()
    {
        var companyId = _companyContext.CompanyId;
        var today = DateTime.UtcNow.Date;

        // Get all users in the company with their roles
        var users = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.ReportsTo)
            .Where(u => u.CompanyId == companyId)
            .ToListAsync();

        // Get today's attendance for all users
        var todayAttendances = await _db.Attendances
            .Where(a => a.Date.Date == today)
            .ToListAsync();

        var result = users.Select(u =>
        {
            var attendance = todayAttendances.FirstOrDefault(a => a.UserId == u.Id);
            var primaryRole = u.UserRoles.FirstOrDefault()?.Role.Name ?? "NormalUser";
            
            // Determine status
            string status;
            if (primaryRole == "Client")
            {
                status = "Client";
            }
            else if (attendance != null && attendance.Status == AttendanceStatus.Present)
            {
                status = "Working";
            }
            else if (attendance != null && attendance.Status == AttendanceStatus.OnLeave)
            {
                status = "OnLeave";
            }
            else
            {
                status = "Absent";
            }

            return new TeamMemberDto
            {
                Id = u.Id,
                FullName = (u.FirstName + " " + u.LastName).Trim(),
                Email = u.Email ?? string.Empty,
                Role = primaryRole,
                Status = status,
                Salary = u.Salary,
                ReportsToId = u.ReportsToId,
                ReportsToName = u.ReportsTo != null ? (u.ReportsTo.FirstName + " " + u.ReportsTo.LastName).Trim() : null,
                Notes = null // Notes field not available on User entity
            };
        }).ToList();

        return result;
    }

    // Attendance
    public async Task<IEnumerable<AttendanceDto>> GetAttendancesAsync(DateTime? date = null, int? userId = null)
    {
        var query = _db.Attendances
            .Include(a => a.User)
            .AsQueryable();

        if (date.HasValue)
        {
            var dateValue = date.Value.Date;
            query = query.Where(a => a.Date.Date == dateValue);
        }

        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);

        return await query.Select(a => new AttendanceDto
        {
            Id = a.Id,
            UserId = a.UserId,
            UserFullName = a.User.FirstName + " " + a.User.LastName,
            Date = a.Date,
            CheckIn = a.CheckIn,
            CheckOut = a.CheckOut,
            Location = a.Location,
            Latitude = a.Latitude,
            Longitude = a.Longitude,
            Status = a.Status,
            Note = a.Note
        }).ToListAsync();
    }

    public async Task<AttendanceDto> CheckInAsync(CheckInRequest request)
    {
        var userId = _authService.GetCurrentUserId();
        if (!userId.HasValue) throw new UnauthorizedAccessException();

        var today = DateTime.UtcNow.Date;
        var existing = await _db.Attendances
            .FirstOrDefaultAsync(a => a.UserId == userId.Value && a.Date.Date == today);

        if (existing != null)
            throw new InvalidOperationException("Already checked in for today.");

        var attendance = new Attendance
        {
            UserId = userId.Value,
            CompanyId = _companyContext.CompanyId,
            Date = DateTime.UtcNow,
            CheckIn = DateTime.UtcNow.TimeOfDay,
            Location = request.Location,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Note = request.Note,
            Status = AttendanceStatus.Present
        };

        _db.Attendances.Add(attendance);
        await _unitOfWork.SaveChangesAsync();

        // Refresh to get User property
        var created = await _db.Attendances
            .Include(a => a.User)
            .FirstAsync(a => a.Id == attendance.Id);

        return MapAttendanceToDto(created);
    }

    public async Task<AttendanceDto> CheckOutAsync(CheckOutRequest request)
    {
        var userId = _authService.GetCurrentUserId();
        if (!userId.HasValue) throw new UnauthorizedAccessException();

        var today = DateTime.UtcNow.Date;
        var attendance = await _db.Attendances
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.UserId == userId.Value && a.Date.Date == today);

        if (attendance == null)
            throw new InvalidOperationException("No check-in record found for today.");

        if (attendance.CheckOut.HasValue)
            throw new InvalidOperationException("Already checked out for today.");

        attendance.CheckOut = DateTime.UtcNow.TimeOfDay;
        if (request.Location != null) attendance.Location = request.Location;
        if (request.Latitude != null) attendance.Latitude = request.Latitude;
        if (request.Longitude != null) attendance.Longitude = request.Longitude;

        await _unitOfWork.SaveChangesAsync();

        return MapAttendanceToDto(attendance);
    }

    public async Task<AttendanceDto?> GetTodayAttendanceAsync()
    {
        var userId = _authService.GetCurrentUserId();
        if (!userId.HasValue) return null;

        var today = DateTime.UtcNow.Date;
        var attendance = await _db.Attendances
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.UserId == userId.Value && a.Date.Date == today);

        return attendance != null ? MapAttendanceToDto(attendance) : null;
    }

    // Leave Management
    public async Task<IEnumerable<LeaveTypeDto>> GetLeaveTypesAsync()
    {
        return await _db.LeaveTypes
            .Select(t => new LeaveTypeDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                DefaultDays = t.DefaultDays,
                IsPaid = t.IsPaid,
                RequiresApproval = t.RequiresApproval
            }).ToListAsync();
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetLeaveRequestsAsync(int? userId = null)
    {
        var query = _db.LeaveRequests
            .Include(l => l.User)
            .Include(l => l.LeaveType)
            .Include(l => l.ApprovedByUser)
            .AsQueryable();

        if (userId.HasValue)
            query = query.Where(l => l.UserId == userId.Value);

        var results = await query.ToListAsync();
        return results.Select(l => MapLeaveRequestToDto(l));
    }

    public async Task<LeaveRequestDto> CreateLeaveRequestAsync(CreateLeaveRequest request)
    {
        var userId = _authService.GetCurrentUserId();
        if (!userId.HasValue) throw new UnauthorizedAccessException();

        var leaveRequest = new LeaveRequest
        {
            UserId = userId.Value,
            CompanyId = _companyContext.CompanyId,
            LeaveTypeId = request.LeaveTypeId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Reason = request.Reason,
            Status = LeaveRequestStatus.Pending
        };

        _db.LeaveRequests.Add(leaveRequest);
        await _unitOfWork.SaveChangesAsync();

        // Refresh to get navigation properties for the DTO
        var created = await _db.LeaveRequests
            .Include(l => l.User)
            .Include(l => l.LeaveType)
            .FirstAsync(l => l.Id == leaveRequest.Id);

        return MapLeaveRequestToDto(created);
    }

    public async Task ReviewLeaveRequestAsync(int requestId, ReviewLeaveRequest review)
    {
        var reviewerId = _authService.GetCurrentUserId();
        var request = await _db.LeaveRequests.FindAsync(requestId);
        if (request == null) throw new KeyNotFoundException();

        request.Status = review.Approved ? LeaveRequestStatus.Approved : LeaveRequestStatus.Rejected;
        request.ApprovedByUserId = reviewerId;
        request.ActionDate = DateTime.UtcNow;
        request.RejectionReason = review.RejectionReason;

        await _unitOfWork.SaveChangesAsync();

        // Send Notification
        var title = review.Approved ? "Leave Request Approved" : "Leave Request Rejected";
        var titleKey = review.Approved ? "notifications.leave_approved_title" : "notifications.leave_rejected_title";
        var message = review.Approved 
            ? $"Your leave request for {request.StartDate:dd/MM/yyyy} has been approved." 
            : $"Your leave request for {request.StartDate:dd/MM/yyyy} has been rejected. Reason: {review.RejectionReason}";
        var messageKey = review.Approved ? "notifications.leave_approved_msg" : "notifications.leave_rejected_msg";
        
        await _notificationService.CreateAndSendAsync(
            request.UserId,
            title,
            message,
            link: "/admin/hr",
            type: review.Approved ? NotificationType.General : NotificationType.General,
            titleKey: titleKey,
            messageKey: messageKey,
            messageArgs: new object[] { request.StartDate.ToString("dd/MM/yyyy") }
        );
    }

    // Certifications
    public async Task<IEnumerable<CertificationDto>> GetCertificationsAsync(int? userId = null)
    {
        var query = _db.Certifications
            .Include(c => c.User)
            .AsQueryable();

        if (userId.HasValue)
            query = query.Where(c => c.UserId == userId.Value);

        var results = await query.ToListAsync();
        return results.Select(c => new CertificationDto
        {
            Id = c.Id,
            UserId = c.UserId,
            UserFullName = c.User.FirstName + " " + c.User.LastName,
            Name = c.Name,
            IssuingAuthority = c.IssuingAuthority,
            IssueDate = c.IssueDate,
            ExpiryDate = c.ExpiryDate,
            CertificateNumber = c.CertificateNumber,
            DocumentUrl = c.DocumentUrl,
            IsVerified = c.IsVerified
        });
    }

    public async Task<CertificationDto> UpsertCertificationAsync(int? id, UpsertCertificationRequest request)
    {
        Certification cert;
        var currentUserId = _authService.GetCurrentUserId();
        
        if (id.HasValue && id > 0)
        {
            var existingCert = await _db.Certifications.FindAsync(id.Value);
            if (existingCert == null) throw new KeyNotFoundException();
            cert = existingCert;
            
            // Validate ownership: only the owner or admin can update
            if (cert.UserId != currentUserId)
            {
                // Check if user has admin role by querying UserRoles
                var userRoles = await _db.UserRoles
                    .Include(ur => ur.Role)
                    .Where(ur => ur.UserId == currentUserId)
                    .Select(ur => ur.Role.Name)
                    .ToListAsync();
                    
                if (!userRoles.Contains("CompanyAdmin") && !userRoles.Contains("SuperAdmin"))
                {
                    throw new UnauthorizedAccessException("You do not have permission to update this certification.");
                }
            }
        }
        else
        {
            if (!currentUserId.HasValue)
                throw new UnauthorizedAccessException("User not authenticated.");
            cert = new Certification { UserId = currentUserId.Value, CompanyId = _companyContext.CompanyId };
            _db.Certifications.Add(cert);
        }

        cert.Name = request.Name;
        cert.IssuingAuthority = request.IssuingAuthority;
        cert.IssueDate = request.IssueDate;
        cert.ExpiryDate = request.ExpiryDate;
        cert.CertificateNumber = request.CertificateNumber;
        cert.DocumentUrl = request.DocumentUrl;

        await _unitOfWork.SaveChangesAsync();
        
        // Refresh
        var updated = await _db.Certifications
            .Include(c => c.User)
            .FirstAsync(c => c.Id == cert.Id);

        return new CertificationDto
        {
            Id = updated.Id,
            UserId = updated.UserId,
            UserFullName = updated.User.FirstName + " " + updated.User.LastName,
            Name = updated.Name,
            IssuingAuthority = updated.IssuingAuthority,
            IssueDate = updated.IssueDate,
            ExpiryDate = updated.ExpiryDate,
            CertificateNumber = updated.CertificateNumber,
            DocumentUrl = updated.DocumentUrl,
            IsVerified = updated.IsVerified
        };
    }

    // Payroll implementation
    public async Task<IEnumerable<PayrollDto>> GetPayrollsAsync(int month, int year)
    {
        var companyId = _companyContext.CompanyId;
        return await _db.Payrolls
            .Include(p => p.User)
            .Where(p => p.CompanyId == companyId && p.Month == month && p.Year == year)
            .Select(p => new PayrollDto
            {
                Id = p.Id,
                UserId = p.UserId,
                UserFullName = p.User.FirstName + " " + p.User.LastName,
                Month = p.Month,
                Year = p.Year,
                BaseSalary = p.BaseSalary,
                Bonuses = p.Bonuses,
                Deductions = p.Deductions,
                NetSalary = p.NetSalary,
                IsPaid = p.IsPaid,
                PaymentDate = p.PaymentDate,
                Note = p.Note
            }).ToListAsync();
    }

    public async Task<PayrollDto> GeneratePayrollForUserAsync(int userId, int month, int year)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found");

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        // Get Attendance for the month
        var attendances = await _db.Attendances
            .Where(a => a.UserId == userId && a.Date >= startDate && a.Date <= endDate)
            .ToListAsync();

        var absents = attendances.Count(a => a.Status == AttendanceStatus.Absent);
        var lates = attendances.Count(a => a.Status == AttendanceStatus.Late);

        // Use actual days in the month for accurate daily salary calculation
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var dailySalary = user.Salary / daysInMonth;
        var deductions = (absents * dailySalary) + (lates * dailySalary * 0.1m);

        var existing = await _db.Payrolls
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Month == month && p.Year == year);

        if (existing != null)
        {
            existing.BaseSalary = user.Salary;
            existing.Deductions = Math.Round(deductions, 2);
            existing.NetSalary = Math.Round(user.Salary - existing.Deductions + existing.Bonuses, 2);
            await _unitOfWork.SaveChangesAsync();
            return await GetPayrollDto(existing.Id);
        }

        var payroll = new Payroll
        {
            CompanyId = _companyContext.CompanyId,
            UserId = userId,
            Month = month,
            Year = year,
            BaseSalary = user.Salary,
            Deductions = Math.Round(deductions, 2),
            NetSalary = Math.Round(user.Salary - deductions, 2),
            IsPaid = false
        };

        _db.Payrolls.Add(payroll);
        await _unitOfWork.SaveChangesAsync();

        return await GetPayrollDto(payroll.Id);
    }

    public async Task ProcessMonthlyPayrollAsync(int month, int year)
    {
        var companyId = _companyContext.CompanyId;
        var users = await _db.Users
            .Where(u => u.CompanyId == companyId && u.Salary > 0)
            .ToListAsync();

        foreach (var user in users)
        {
            await GeneratePayrollForUserAsync(user.Id, month, year);
        }
    }

    public async Task<bool> MarkAsPaidAsync(int payrollId)
    {
        var payroll = await _db.Payrolls.FindAsync(payrollId);
        if (payroll == null) return false;

        payroll.IsPaid = true;
        payroll.PaymentDate = DateTime.UtcNow;
        
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<PayrollDto>> GetUserPayrollHistoryAsync(int userId)
    {
        return await _db.Payrolls
            .Include(p => p.User)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.Year)
            .ThenByDescending(p => p.Month)
            .Select(p => new PayrollDto
            {
                Id = p.Id,
                UserId = p.UserId,
                UserFullName = p.User.FirstName + " " + p.User.LastName,
                Month = p.Month,
                Year = p.Year,
                BaseSalary = p.BaseSalary,
                Bonuses = p.Bonuses,
                Deductions = p.Deductions,
                NetSalary = p.NetSalary,
                IsPaid = p.IsPaid,
                PaymentDate = p.PaymentDate,
                Note = p.Note
            })
            .ToListAsync();
    }

    public async Task<UserHRStatsDto> GetUserHRStatsAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) throw new InvalidOperationException("User not found");

        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        // Get work days this month
        var workDaysThisMonth = await _db.Attendances
            .Where(a => a.UserId == userId && a.Date >= startOfMonth && a.Date <= today)
            .CountAsync();

        // Get pending leave requests
        var pendingRequests = await _db.LeaveRequests
            .Where(lr => lr.UserId == userId && lr.Status == LeaveRequestStatus.Pending)
            .CountAsync();

        // Get used leave days this year
        var usedLeaveDays = await _db.LeaveRequests
            .Where(lr => lr.UserId == userId && 
                         lr.Status == LeaveRequestStatus.Approved && 
                         lr.StartDate.Year == today.Year)
            .SumAsync(lr => lr.TotalDays);

        // Default annual leave (could be stored in company settings)
        const int defaultAnnualLeave = 21;

        return new UserHRStatsDto
        {
            MonthlySalary = user.Salary,
            AnnualLeaveDays = defaultAnnualLeave,
            UsedLeaveDays = usedLeaveDays,
            RemainingLeaveDays = defaultAnnualLeave - usedLeaveDays,
            PendingRequests = pendingRequests,
            WorkDaysThisMonth = workDaysThisMonth
        };
    }

    private async Task<PayrollDto> GetPayrollDto(int id)
    {
        return await _db.Payrolls
            .Include(p => p.User)
            .Where(p => p.Id == id)
            .Select(p => new PayrollDto
            {
                Id = p.Id,
                UserId = p.UserId,
                UserFullName = p.User.FirstName + " " + p.User.LastName,
                Month = p.Month,
                Year = p.Year,
                BaseSalary = p.BaseSalary,
                Bonuses = p.Bonuses,
                Deductions = p.Deductions,
                NetSalary = p.NetSalary,
                IsPaid = p.IsPaid,
                PaymentDate = p.PaymentDate,
                Note = p.Note
            }).FirstAsync();
    }

    public async Task DeleteCertificationAsync(int id)
    {
        var cert = await _db.Certifications.FindAsync(id);
        if (cert == null) return;
        
        var currentUserId = _authService.GetCurrentUserId();
        
        // Validate ownership: only the owner or admin can delete
        if (cert.UserId != currentUserId)
        {
            // Check if user has admin role
            var userRoles = await _db.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => ur.UserId == currentUserId)
                .Select(ur => ur.Role.Name)
                .ToListAsync();
                
            if (!userRoles.Contains("CompanyAdmin") && !userRoles.Contains("SuperAdmin"))
            {
                throw new UnauthorizedAccessException("You do not have permission to delete this certification.");
            }
        }
        
        _db.Certifications.Remove(cert);
        await _unitOfWork.SaveChangesAsync();
    }

    private AttendanceDto MapAttendanceToDto(Attendance a)
    {
        return new AttendanceDto
        {
            Id = a.Id,
            UserId = a.UserId,
            UserFullName = a.User?.FirstName + " " + a.User?.LastName,
            Date = a.Date,
            CheckIn = a.CheckIn,
            CheckOut = a.CheckOut,
            Location = a.Location,
            Latitude = a.Latitude,
            Longitude = a.Longitude,
            Status = a.Status,
            Note = a.Note
        };
    }

    private LeaveRequestDto MapLeaveRequestToDto(LeaveRequest l)
    {
        return new LeaveRequestDto
        {
            Id = l.Id,
            UserId = l.UserId,
            UserFullName = l.User?.FirstName + " " + l.User?.LastName,
            LeaveTypeId = l.LeaveTypeId,
            LeaveTypeName = l.LeaveType?.Name ?? string.Empty,
            StartDate = l.StartDate,
            EndDate = l.EndDate,
            Reason = l.Reason,
            Status = l.Status,
            ApprovedByUserId = l.ApprovedByUserId,
            ApprovedByFullName = l.ApprovedByUser?.FirstName + " " + l.ApprovedByUser?.LastName,
            ActionDate = l.ActionDate,
            RejectionReason = l.RejectionReason,
            TotalDays = l.TotalDays
        };
    }
}

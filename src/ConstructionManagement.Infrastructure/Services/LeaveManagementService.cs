using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    public class LeaveManagementService : ILeaveManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LeaveManagementService> _logger;

        public LeaveManagementService(
            ApplicationDbContext context,
            ILogger<LeaveManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Leave Types

        public async Task<List<LeaveTypeDto>> GetLeaveTypesAsync(int? companyId = null)
        {
            var query = _context.LeaveTypes.AsQueryable();

            // Get system defaults (null company) and company-specific types
            query = query.Where(lt => lt.CompanyId == null || lt.CompanyId == companyId);

            var leaveTypes = await query
                .Where(lt => lt.IsActive)
                .OrderBy(lt => lt.Name)
                .ToListAsync();

            return leaveTypes.Select(MapToDto).ToList();
        }

        public async Task<LeaveTypeDto> GetLeaveTypeByIdAsync(int id, int? userCompanyId = null)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(id);
            if (leaveType == null)
                throw new InvalidOperationException($"Leave type with ID {id} not found");

            // Verify company access (system defaults have null CompanyId and are accessible to all)
            if (leaveType.CompanyId != null && leaveType.CompanyId != userCompanyId)
                throw new UnauthorizedAccessException("Access denied to this leave type");

            return MapToDto(leaveType);
        }

        public async Task<LeaveTypeDto> CreateLeaveTypeAsync(CreateLeaveTypeRequest request, int? companyId = null)
        {
            var leaveType = new LeaveType
            {
                Name = request.Name,
                Description = request.Description,
                DefaultDaysPerYear = request.DefaultDaysPerYear,
                AllowCarryOver = request.AllowCarryOver,
                MaxCarryOverDays = request.MaxCarryOverDays,
                RequiresApproval = request.RequiresApproval,
                IsPaid = request.IsPaid,
                ColorCode = request.ColorCode,
                IsActive = true,
                CompanyId = companyId
            };

            _context.LeaveTypes.Add(leaveType);
            await _context.SaveChangesAsync();

            return MapToDto(leaveType);
        }

        public async Task<LeaveTypeDto> UpdateLeaveTypeAsync(int id, UpdateLeaveTypeRequest request)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(id);
            if (leaveType == null)
                throw new InvalidOperationException($"Leave type with ID {id} not found");

            leaveType.Name = request.Name;
            leaveType.Description = request.Description;
            leaveType.DefaultDaysPerYear = request.DefaultDaysPerYear;
            leaveType.AllowCarryOver = request.AllowCarryOver;
            leaveType.MaxCarryOverDays = request.MaxCarryOverDays;
            leaveType.RequiresApproval = request.RequiresApproval;
            leaveType.IsPaid = request.IsPaid;
            leaveType.ColorCode = request.ColorCode;
            leaveType.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return MapToDto(leaveType);
        }

        public async Task DeleteLeaveTypeAsync(int id)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(id);
            if (leaveType == null)
                throw new InvalidOperationException($"Leave type with ID {id} not found");

            // Soft delete
            leaveType.IsActive = false;
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Leave Balances

        public async Task<List<LeaveBalanceDto>> GetUserLeaveBalancesAsync(int userId, int? year = null)
        {
            var currentYear = year ?? DateTime.UtcNow.Year;

            var balances = await _context.LeaveBalances
                .Include(lb => lb.LeaveType)
                .Include(lb => lb.User)
                .Where(lb => lb.UserId == userId && lb.Year == currentYear)
                .ToListAsync();

            return balances.Select(MapToDto).ToList();
        }

        public async Task<UserLeaveSummaryDto> GetUserLeaveSummaryAsync(int userId, int? year = null)
        {
            var currentYear = year ?? DateTime.UtcNow.Year;
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException($"User with ID {userId} not found");

            var balances = await GetUserLeaveBalancesAsync(userId, currentYear);

            var upcomingLeaves = await _context.LeaveRequests
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.UserId == userId &&
                            lr.StartDate >= DateTime.UtcNow &&
                            (lr.Status == LeaveRequestStatus.Approved || lr.Status == LeaveRequestStatus.Pending))
                .OrderBy(lr => lr.StartDate)
                .Take(5)
                .ToListAsync();

            return new UserLeaveSummaryDto
            {
                UserId = userId,
                UserName = user.FullName ?? user.Username ?? string.Empty,
                Balances = balances,
                UpcomingLeaves = upcomingLeaves.Select(l => new UpcomingLeaveDto
                {
                    Id = l.Id,
                    LeaveTypeName = l.LeaveType.Name,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    TotalDays = l.TotalDays,
                    Status = l.Status.ToString()
                }).ToList()
            };
        }

        public async Task<List<LeaveBalanceDto>> GetTeamLeaveBalancesAsync(int companyId, int? year = null)
        {
            var currentYear = year ?? DateTime.UtcNow.Year;

            var balances = await _context.LeaveBalances
                .Include(lb => lb.LeaveType)
                .Include(lb => lb.User)
                .Where(lb => lb.User.CompanyId == companyId && lb.Year == currentYear)
                .ToListAsync();

            return balances.Select(MapToDto).ToList();
        }

        public async Task<LeaveBalanceDto> AdjustLeaveBalanceAsync(AdjustLeaveBalanceRequest request)
        {
            var balance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.UserId == request.UserId &&
                                          lb.LeaveTypeId == request.LeaveTypeId &&
                                          lb.Year == request.Year);

            if (balance == null)
            {
                // Create new balance
                balance = new LeaveBalance
                {
                    UserId = request.UserId,
                    LeaveTypeId = request.LeaveTypeId,
                    Year = request.Year,
                    TotalAllocated = request.Adjustment
                };
                _context.LeaveBalances.Add(balance);
            }
            else
            {
                balance.TotalAllocated += request.Adjustment;
            }

            await _context.SaveChangesAsync();
            return await GetLeaveBalanceByIdAsync(balance.Id);
        }

        public async Task InitializeYearLeaveBalancesAsync(int companyId, int year)
        {
            var users = await _context.Users
                .Where(u => u.CompanyId == companyId)
                .ToListAsync();

            var leaveTypes = await GetLeaveTypesAsync(companyId);
            var previousYear = year - 1;

            foreach (var user in users)
            {
                foreach (var leaveType in leaveTypes)
                {
                    var existingBalance = await _context.LeaveBalances
                        .FirstOrDefaultAsync(lb => lb.UserId == user.Id &&
                                                  lb.LeaveTypeId == leaveType.Id &&
                                                  lb.Year == year);

                    if (existingBalance == null)
                    {
                        decimal carryOver = 0;

                        // Calculate carry over from previous year
                        if (leaveType.AllowCarryOver)
                        {
                            var previousBalance = await _context.LeaveBalances
                                .FirstOrDefaultAsync(lb => lb.UserId == user.Id &&
                                                          lb.LeaveTypeId == leaveType.Id &&
                                                          lb.Year == previousYear);

                            if (previousBalance != null)
                            {
                                var availableDays = previousBalance.TotalAllocated + previousBalance.CarriedOver -
                                                   previousBalance.UsedDays;
                                carryOver = Math.Min(availableDays, leaveType.MaxCarryOverDays);
                            }
                        }

                        var newBalance = new LeaveBalance
                        {
                            UserId = user.Id,
                            LeaveTypeId = leaveType.Id,
                            Year = year,
                            TotalAllocated = leaveType.DefaultDaysPerYear,
                            CarriedOver = carryOver
                        };

                        _context.LeaveBalances.Add(newBalance);
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        #endregion

        #region Leave Requests

        public async Task<List<LeaveRequestDto>> GetLeaveRequestsAsync(LeaveRequestFilter filter)
        {
            var query = _context.LeaveRequests
                .Include(lr => lr.User)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ApprovedBy)
                .Include(lr => lr.Attachments)
                .AsQueryable();

            if (filter.UserId.HasValue)
                query = query.Where(lr => lr.UserId == filter.UserId.Value);

            if (filter.LeaveTypeId.HasValue)
                query = query.Where(lr => lr.LeaveTypeId == filter.LeaveTypeId.Value);

            if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse<LeaveRequestStatus>(filter.Status, out var status))
                query = query.Where(lr => lr.Status == status);

            if (filter.FromDate.HasValue)
                query = query.Where(lr => lr.StartDate >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(lr => lr.EndDate <= filter.ToDate.Value);

            if (filter.CompanyId.HasValue)
                query = query.Where(lr => lr.User.CompanyId == filter.CompanyId.Value);
            else if (filter.CompanyIds != null && filter.CompanyIds.Any())
                query = query.Where(lr => lr.User.CompanyId != null && filter.CompanyIds.Contains(lr.User.CompanyId.Value));

            var requests = await query
                .OrderByDescending(lr => lr.CreatedAt)
                .Take(100)
                .ToListAsync();

            return requests.Select(MapToDto).ToList();
        }

        public async Task<LeaveRequestDto> GetLeaveRequestByIdAsync(int id)
        {
            var request = await _context.LeaveRequests
                .Include(lr => lr.User)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ApprovedBy)
                .Include(lr => lr.Attachments)
                .FirstOrDefaultAsync(lr => lr.Id == id);

            if (request == null)
                throw new InvalidOperationException($"Leave request with ID {id} not found");

            return MapToDto(request);
        }

        public async Task<List<LeaveRequestDto>> GetUserLeaveRequestsAsync(int userId, int? year = null)
        {
            var query = _context.LeaveRequests
                .Include(lr => lr.User)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.Attachments)
                .Where(lr => lr.UserId == userId);

            if (year.HasValue)
            {
                var startOfYear = new DateTime(year.Value, 1, 1);
                var endOfYear = new DateTime(year.Value, 12, 31);
                query = query.Where(lr => lr.StartDate >= startOfYear && lr.StartDate <= endOfYear);
            }

            var requests = await query
                .OrderByDescending(lr => lr.CreatedAt)
                .ToListAsync();

            return requests.Select(MapToDto).ToList();
        }

        public async Task<List<LeaveRequestDto>> GetPendingLeaveRequestsAsync(int companyId)
        {
            var requests = await _context.LeaveRequests
                .Include(lr => lr.User)
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.User.CompanyId == companyId && lr.Status == LeaveRequestStatus.Pending)
                .OrderBy(lr => lr.StartDate)
                .ToListAsync();

            return requests.Select(MapToDto).ToList();
        }

        public async Task<LeaveRequestDto> CreateLeaveRequestAsync(int userId, CreateLeaveRequestRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException($"User with ID {userId} not found");

            var leaveType = await _context.LeaveTypes.FindAsync(request.LeaveTypeId);
            if (leaveType == null)
                throw new InvalidOperationException($"Leave type with ID {request.LeaveTypeId} not found");

            var totalDays = await CalculateLeaveDaysAsync(request.StartDate, request.EndDate, user.CompanyId);

            // Check balance
            if (!await HasSufficientLeaveBalanceAsync(userId, request.LeaveTypeId, totalDays))
                throw new InvalidOperationException("Insufficient leave balance");

            var leaveRequest = new LeaveRequest
            {
                UserId = userId,
                LeaveTypeId = request.LeaveTypeId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                TotalDays = totalDays,
                Reason = request.Reason,
                Status = leaveType.RequiresApproval ? LeaveRequestStatus.Pending : LeaveRequestStatus.Approved
            };

            _context.LeaveRequests.Add(leaveRequest);
            await _context.SaveChangesAsync();

            // Update pending days in balance
            if (leaveType.RequiresApproval)
            {
                await UpdatePendingDaysAsync(userId, request.LeaveTypeId, totalDays, true);
            }
            else
            {
                // Auto-approve if no approval required
                await UpdateUsedDaysAsync(userId, request.LeaveTypeId, totalDays, true);
            }

            return await GetLeaveRequestByIdAsync(leaveRequest.Id);
        }

        public async Task<LeaveRequestDto> UpdateLeaveRequestAsync(int id, UpdateLeaveRequestRequest request)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
                throw new InvalidOperationException($"Leave request with ID {id} not found");

            if (leaveRequest.Status != LeaveRequestStatus.Pending)
                throw new InvalidOperationException("Can only update pending leave requests");

            var oldTotalDays = leaveRequest.TotalDays;
            var newTotalDays = await CalculateLeaveDaysAsync(request.StartDate, request.EndDate);

            // Update pending days
            await UpdatePendingDaysAsync(leaveRequest.UserId, leaveRequest.LeaveTypeId, oldTotalDays, false);
            await UpdatePendingDaysAsync(leaveRequest.UserId, request.LeaveTypeId, newTotalDays, true);

            leaveRequest.LeaveTypeId = request.LeaveTypeId;
            leaveRequest.StartDate = request.StartDate;
            leaveRequest.EndDate = request.EndDate;
            leaveRequest.TotalDays = newTotalDays;
            leaveRequest.Reason = request.Reason;

            await _context.SaveChangesAsync();

            return await GetLeaveRequestByIdAsync(id);
        }

        public async Task DeleteLeaveRequestAsync(int id)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
                throw new InvalidOperationException($"Leave request with ID {id} not found");

            if (leaveRequest.Status == LeaveRequestStatus.Pending)
            {
                // Revert pending days
                await UpdatePendingDaysAsync(leaveRequest.UserId, leaveRequest.LeaveTypeId, leaveRequest.TotalDays, false);
            }

            _context.LeaveRequests.Remove(leaveRequest);
            await _context.SaveChangesAsync();
        }

        public async Task CancelLeaveRequestAsync(int id, int userId)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
                throw new InvalidOperationException($"Leave request with ID {id} not found");

            if (leaveRequest.UserId != userId)
                throw new InvalidOperationException("Can only cancel your own leave requests");

            if (leaveRequest.Status == LeaveRequestStatus.Cancelled || leaveRequest.Status == LeaveRequestStatus.CancelledByUser)
                throw new InvalidOperationException("Leave request is already cancelled");

            if (leaveRequest.Status == LeaveRequestStatus.Pending)
            {
                await UpdatePendingDaysAsync(userId, leaveRequest.LeaveTypeId, leaveRequest.TotalDays, false);
            }
            else if (leaveRequest.Status == LeaveRequestStatus.Approved)
            {
                await UpdateUsedDaysAsync(userId, leaveRequest.LeaveTypeId, leaveRequest.TotalDays, false);
            }

            leaveRequest.Status = LeaveRequestStatus.CancelledByUser;
            await _context.SaveChangesAsync();
        }

        public async Task<LeaveRequestDto> ApproveLeaveRequestAsync(int id, int approverUserId, ApproveLeaveRequestRequest request)
        {
            var leaveRequest = await _context.LeaveRequests
                .Include(lr => lr.User)
                .FirstOrDefaultAsync(lr => lr.Id == id);

            if (leaveRequest == null)
                throw new InvalidOperationException($"Leave request with ID {id} not found");

            if (leaveRequest.Status != LeaveRequestStatus.Pending)
                throw new InvalidOperationException("Can only approve pending leave requests");

            // Move from pending to used
            await UpdatePendingDaysAsync(leaveRequest.UserId, leaveRequest.LeaveTypeId, leaveRequest.TotalDays, false);
            await UpdateUsedDaysAsync(leaveRequest.UserId, leaveRequest.LeaveTypeId, leaveRequest.TotalDays, true);

            leaveRequest.Status = LeaveRequestStatus.Approved;
            leaveRequest.ApprovedByUserId = approverUserId;
            leaveRequest.ApprovedAt = DateTime.UtcNow;
            leaveRequest.ApproverComments = request.Comments;
            leaveRequest.UserNotified = false;

            await _context.SaveChangesAsync();

            return await GetLeaveRequestByIdAsync(id);
        }

        public async Task<LeaveRequestDto> RejectLeaveRequestAsync(int id, int approverUserId, RejectLeaveRequestRequest request)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
                throw new InvalidOperationException($"Leave request with ID {id} not found");

            if (leaveRequest.Status != LeaveRequestStatus.Pending)
                throw new InvalidOperationException("Can only reject pending leave requests");

            // Revert pending days
            await UpdatePendingDaysAsync(leaveRequest.UserId, leaveRequest.LeaveTypeId, leaveRequest.TotalDays, false);

            leaveRequest.Status = LeaveRequestStatus.Rejected;
            leaveRequest.ApprovedByUserId = approverUserId;
            leaveRequest.ApprovedAt = DateTime.UtcNow;
            leaveRequest.RejectionReason = request.Reason;
            leaveRequest.UserNotified = false;

            await _context.SaveChangesAsync();

            return await GetLeaveRequestByIdAsync(id);
        }

        #endregion

        #region Holidays

        public async Task<List<HolidayDto>> GetHolidaysAsync(int? companyId = null, int? year = null)
        {
            var query = _context.Holidays.AsQueryable();

            // Get national holidays (null company) and company-specific holidays
            query = query.Where(h => h.CompanyId == null || h.CompanyId == companyId);

            if (year.HasValue)
            {
                var startOfYear = new DateTime(year.Value, 1, 1);
                var endOfYear = new DateTime(year.Value, 12, 31);
                query = query.Where(h => h.Date >= startOfYear && h.Date <= endOfYear);
            }

            var holidays = await query.OrderBy(h => h.Date).ToListAsync();

            return holidays.Select(MapToDto).ToList();
        }

        public async Task<HolidayDto> CreateHolidayAsync(CreateHolidayRequest request, int? companyId = null)
        {
            var holiday = new Holiday
            {
                Name = request.Name,
                Date = request.Date,
                IsRecurring = request.IsRecurring,
                Description = request.Description,
                CompanyId = companyId
            };

            _context.Holidays.Add(holiday);
            await _context.SaveChangesAsync();

            return MapToDto(holiday);
        }

        public async Task<HolidayDto> UpdateHolidayAsync(int id, UpdateHolidayRequest request)
        {
            var holiday = await _context.Holidays.FindAsync(id);
            if (holiday == null)
                throw new InvalidOperationException($"Holiday with ID {id} not found");

            holiday.Name = request.Name;
            holiday.Date = request.Date;
            holiday.IsRecurring = request.IsRecurring;
            holiday.Description = request.Description;

            await _context.SaveChangesAsync();

            return MapToDto(holiday);
        }

        public async Task DeleteHolidayAsync(int id)
        {
            var holiday = await _context.Holidays.FindAsync(id);
            if (holiday == null)
                throw new InvalidOperationException($"Holiday with ID {id} not found");

            _context.Holidays.Remove(holiday);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Calendar & Reports

        public async Task<List<LeaveCalendarDto>> GetLeaveCalendarAsync(int companyId, DateTime startDate, DateTime endDate)
        {
            var holidays = await GetHolidaysAsync(companyId, startDate.Year);
            var holidayDates = holidays.Select(h => h.Date.Date).ToHashSet();

            var approvedLeaves = await _context.LeaveRequests
                .Include(lr => lr.User)
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.User.CompanyId == companyId &&
                            lr.Status == LeaveRequestStatus.Approved &&
                            lr.StartDate <= endDate &&
                            lr.EndDate >= startDate)
                .ToListAsync();

            var calendar = new List<LeaveCalendarDto>();
            var current = startDate.Date;

            while (current <= endDate.Date)
            {
                var isHoliday = holidayDates.Contains(current);
                var isWeekend = current.DayOfWeek == DayOfWeek.Saturday || current.DayOfWeek == DayOfWeek.Sunday;

                var dayLeaves = approvedLeaves
                    .Where(lr => current >= lr.StartDate.Date && current <= lr.EndDate.Date)
                    .Select(lr => new LeaveCalendarEntryDto
                    {
                        UserId = lr.UserId,
                        UserName = lr.User.FullName ?? lr.User.Username ?? string.Empty,
                        LeaveTypeName = lr.LeaveType.Name,
                        LeaveTypeColor = lr.LeaveType.ColorCode,
                        Status = lr.Status.ToString()
                    })
                    .ToList();

                calendar.Add(new LeaveCalendarDto
                {
                    Date = current,
                    IsHoliday = isHoliday,
                    HolidayName = isHoliday ? holidays.FirstOrDefault(h => h.Date.Date == current)?.Name : null,
                    IsWeekend = isWeekend,
                    Leaves = dayLeaves
                });

                current = current.AddDays(1);
            }

            return calendar;
        }

        public async Task<LeaveReportDto> GetLeaveReportAsync(int companyId, int? year = null, int? month = null)
        {
            var currentYear = year ?? DateTime.UtcNow.Year;
            var employees = await _context.Users.CountAsync(u => u.CompanyId == companyId);

            var today = DateTime.UtcNow.Date;
            var onLeaveToday = await _context.LeaveRequests
                .CountAsync(lr => lr.User.CompanyId == companyId &&
                                 lr.Status == LeaveRequestStatus.Approved &&
                                 lr.StartDate <= today &&
                                 lr.EndDate >= today);

            var monthStart = month.HasValue ? new DateTime(currentYear, month.Value, 1) : new DateTime(currentYear, 1, 1);
            var monthEnd = month.HasValue ? monthStart.AddMonths(1).AddDays(-1) : new DateTime(currentYear, 12, 31);

            var yearStart = new DateTime(currentYear, 1, 1);
            var yearEnd = new DateTime(currentYear, 12, 31);

            var monthDays = await _context.LeaveRequests
                .Where(lr => lr.User.CompanyId == companyId &&
                            lr.Status == LeaveRequestStatus.Approved &&
                            lr.StartDate >= monthStart &&
                            lr.StartDate <= monthEnd)
                .SumAsync(lr => lr.TotalDays);

            var yearDays = await _context.LeaveRequests
                .Where(lr => lr.User.CompanyId == companyId &&
                            lr.Status == LeaveRequestStatus.Approved &&
                            lr.StartDate >= yearStart &&
                            lr.StartDate <= yearEnd)
                .SumAsync(lr => lr.TotalDays);

            // Leave type summaries
            var leaveTypes = await _context.LeaveTypes
                .Where(lt => lt.CompanyId == null || lt.CompanyId == companyId)
                .ToListAsync();

            var typeSummaries = new List<LeaveTypeSummaryDto>();
            foreach (var lt in leaveTypes)
            {
                var requests = await _context.LeaveRequests
                    .Where(lr => lr.LeaveTypeId == lt.Id &&
                                lr.User.CompanyId == companyId &&
                                lr.StartDate >= yearStart &&
                                lr.StartDate <= yearEnd)
                    .ToListAsync();

                typeSummaries.Add(new LeaveTypeSummaryDto
                {
                    LeaveTypeName = lt.Name,
                    TotalRequests = requests.Count,
                    ApprovedRequests = requests.Count(r => r.Status == LeaveRequestStatus.Approved),
                    PendingRequests = requests.Count(r => r.Status == LeaveRequestStatus.Pending),
                    RejectedRequests = requests.Count(r => r.Status == LeaveRequestStatus.Rejected),
                    TotalDays = requests.Where(r => r.Status == LeaveRequestStatus.Approved).Sum(r => r.TotalDays)
                });
            }

            // Monthly trends
            var monthlyTrends = new List<MonthlyLeaveTrendDto>();
            for (int m = 1; m <= 12; m++)
            {
                var mStart = new DateTime(currentYear, m, 1);
                var mEnd = mStart.AddMonths(1).AddDays(-1);

                var monthRequests = await _context.LeaveRequests
                    .Where(lr => lr.User.CompanyId == companyId &&
                                lr.Status == LeaveRequestStatus.Approved &&
                                lr.StartDate >= mStart &&
                                lr.StartDate <= mEnd)
                    .ToListAsync();

                monthlyTrends.Add(new MonthlyLeaveTrendDto
                {
                    Month = m,
                    Year = currentYear,
                    MonthName = mStart.ToString("MMMM"),
                    TotalDays = monthRequests.Sum(r => r.TotalDays),
                    RequestCount = monthRequests.Count
                });
            }

            return new LeaveReportDto
            {
                TotalEmployees = employees,
                EmployeesOnLeaveToday = onLeaveToday,
                TotalDaysTakenThisMonth = monthDays,
                TotalDaysTakenThisYear = yearDays,
                LeaveTypeSummaries = typeSummaries,
                MonthlyTrends = monthlyTrends
            };
        }

        public async Task<List<LeaveRequestDto>> GetTeamOnLeaveAsync(int companyId, DateTime date)
        {
            var requests = await _context.LeaveRequests
                .Include(lr => lr.User)
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.User.CompanyId == companyId &&
                            lr.Status == LeaveRequestStatus.Approved &&
                            lr.StartDate <= date &&
                            lr.EndDate >= date)
                .ToListAsync();

            return requests.Select(MapToDto).ToList();
        }

        #endregion

        #region Calculations

        public async Task<decimal> CalculateLeaveDaysAsync(DateTime startDate, DateTime endDate, int? companyId = null)
        {
            var holidays = await GetHolidaysAsync(companyId, startDate.Year);
            var holidayDates = holidays.Select(h => h.Date.Date).ToHashSet();

            decimal workingDays = 0;
            var current = startDate.Date;

            while (current <= endDate.Date)
            {
                // Skip weekends
                if (current.DayOfWeek != DayOfWeek.Saturday && current.DayOfWeek != DayOfWeek.Sunday)
                {
                    // Skip holidays
                    if (!holidayDates.Contains(current))
                    {
                        workingDays++;
                    }
                }

                current = current.AddDays(1);
            }

            return workingDays;
        }

        public async Task<bool> HasSufficientLeaveBalanceAsync(int userId, int leaveTypeId, decimal days, int? year = null)
        {
            var currentYear = year ?? DateTime.UtcNow.Year;

            var balance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.UserId == userId &&
                                          lb.LeaveTypeId == leaveTypeId &&
                                          lb.Year == currentYear);

            if (balance == null)
            {
                // Initialize balance if not exists
                var leaveType = await _context.LeaveTypes.FindAsync(leaveTypeId);
                if (leaveType == null) return false;

                balance = new LeaveBalance
                {
                    UserId = userId,
                    LeaveTypeId = leaveTypeId,
                    Year = currentYear,
                    TotalAllocated = leaveType.DefaultDaysPerYear
                };
                _context.LeaveBalances.Add(balance);
                await _context.SaveChangesAsync();
            }

            return balance.AvailableDays >= days;
        }

        #endregion

        #region Private Helpers

        private async Task<LeaveBalanceDto> GetLeaveBalanceByIdAsync(int id)
        {
            var balance = await _context.LeaveBalances
                .Include(lb => lb.User)
                .Include(lb => lb.LeaveType)
                .FirstOrDefaultAsync(lb => lb.Id == id);

            if (balance == null)
                throw new InvalidOperationException($"Leave balance with ID {id} not found");

            return MapToDto(balance);
        }

        private async Task UpdatePendingDaysAsync(int userId, int leaveTypeId, decimal days, bool add)
        {
            var year = DateTime.UtcNow.Year;
            var balance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.UserId == userId &&
                                          lb.LeaveTypeId == leaveTypeId &&
                                          lb.Year == year);

            if (balance != null)
            {
                balance.PendingDays += add ? days : -days;
                if (balance.PendingDays < 0) balance.PendingDays = 0;
                await _context.SaveChangesAsync();
            }
        }

        private async Task UpdateUsedDaysAsync(int userId, int leaveTypeId, decimal days, bool add)
        {
            var year = DateTime.UtcNow.Year;
            var balance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.UserId == userId &&
                                          lb.LeaveTypeId == leaveTypeId &&
                                          lb.Year == year);

            if (balance != null)
            {
                balance.UsedDays += add ? days : -days;
                if (balance.UsedDays < 0) balance.UsedDays = 0;
                await _context.SaveChangesAsync();
            }
        }

        private static LeaveTypeDto MapToDto(LeaveType lt) => new()
        {
            Id = lt.Id,
            Name = lt.Name,
            Description = lt.Description,
            DefaultDaysPerYear = lt.DefaultDaysPerYear,
            AllowCarryOver = lt.AllowCarryOver,
            MaxCarryOverDays = lt.MaxCarryOverDays,
            RequiresApproval = lt.RequiresApproval,
            IsPaid = lt.IsPaid,
            ColorCode = lt.ColorCode,
            IsActive = lt.IsActive,
            CompanyId = lt.CompanyId
        };

        private static LeaveBalanceDto MapToDto(LeaveBalance lb) => new()
        {
            Id = lb.Id,
            UserId = lb.UserId,
            UserName = lb.User?.FullName ?? lb.User?.Username ?? string.Empty,
            LeaveTypeId = lb.LeaveTypeId,
            LeaveTypeName = lb.LeaveType?.Name ?? string.Empty,
            LeaveTypeColor = lb.LeaveType?.ColorCode ?? "#6366f1",
            Year = lb.Year,
            TotalAllocated = lb.TotalAllocated,
            CarriedOver = lb.CarriedOver,
            UsedDays = lb.UsedDays,
            PendingDays = lb.PendingDays,
            AvailableDays = lb.AvailableDays
        };

        private static LeaveRequestDto MapToDto(LeaveRequest lr) => new()
        {
            Id = lr.Id,
            UserId = lr.UserId,
            UserName = lr.User?.FullName ?? lr.User?.Username ?? string.Empty,
            UserAvatar = lr.User?.ProfileImageUrl,
            LeaveTypeId = lr.LeaveTypeId,
            LeaveTypeName = lr.LeaveType?.Name ?? string.Empty,
            LeaveTypeColor = lr.LeaveType?.ColorCode ?? "#6366f1",
            StartDate = lr.StartDate,
            EndDate = lr.EndDate,
            TotalDays = lr.TotalDays,
            Reason = lr.Reason,
            Status = lr.Status.ToString(),
            ApprovedByUserId = lr.ApprovedByUserId,
            ApprovedByName = lr.ApprovedBy?.FullName ?? lr.ApprovedBy?.Username,
            ApprovedAt = lr.ApprovedAt,
            RejectionReason = lr.RejectionReason,
            ApproverComments = lr.ApproverComments,
            CreatedAt = lr.CreatedAt,
            Attachments = lr.Attachments?.Select(a => new LeaveRequestAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FilePath = a.FilePath,
                ContentType = a.ContentType,
                FileSize = a.FileSize,
                UploadedAt = a.UploadedAt
            }).ToList() ?? new List<LeaveRequestAttachmentDto>()
        };

        private static HolidayDto MapToDto(Holiday h) => new()
        {
            Id = h.Id,
            Name = h.Name,
            Date = h.Date,
            IsRecurring = h.IsRecurring,
            CompanyId = h.CompanyId,
            Description = h.Description
        };

        #endregion
    }
}

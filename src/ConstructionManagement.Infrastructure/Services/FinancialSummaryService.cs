using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for calculating project financial summaries and triggering alerts.
/// </summary>
public class FinancialSummaryService : IFinancialSummaryService
{
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<ItemInvoice> _invoiceRepository;
    private readonly IRepository<ClientPayment> _paymentRepository;
    private readonly IRepository<ProgressInvoice> _progressInvoiceRepository;
    private readonly IRepository<User> _userRepository;
    private readonly ILogger<FinancialSummaryService> _logger;

    public FinancialSummaryService(
        IRepository<Project> projectRepository,
        IRepository<ItemInvoice> invoiceRepository,
        IRepository<ClientPayment> paymentRepository,
        IRepository<ProgressInvoice> progressInvoiceRepository,
        IRepository<User> userRepository,
        ILogger<FinancialSummaryService> logger)
    {
        _projectRepository = projectRepository;
        _invoiceRepository = invoiceRepository;
        _paymentRepository = paymentRepository;
        _progressInvoiceRepository = progressInvoiceRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<ProjectFinancialSummaryDto> GetProjectFinancialSummaryAsync(int projectId)
    {
        var project = await _projectRepository.AsQueryable()
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new ArgumentException("Project not found");

        // Get expenses (ItemInvoices)
        var invoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.ProjectId == projectId)
            .ToListAsync();

        var totalExpenses = invoices.Sum(i => i.NetAmount);
        var confirmedExpenses = invoices.Where(i => i.StatusEnum == InvoiceStatus.Approved || i.StatusEnum == InvoiceStatus.Paid).Sum(i => i.NetAmount);
        var pendingExpenses = invoices.Where(i => i.StatusEnum == InvoiceStatus.Pending).Sum(i => i.NetAmount);
        var draftExpenses = invoices.Where(i => i.StatusEnum == InvoiceStatus.Draft).Sum(i => i.NetAmount);

        // Get client payments
        var payments = await _paymentRepository.AsQueryable()
            .Where(p => p.ProjectId == projectId)
            .ToListAsync();

        var totalClientPayments = payments.Where(p => p.Status == ClientPaymentStatus.Confirmed).Sum(p => p.Amount);
        var advancePayments = payments.Where(p => p.Status == ClientPaymentStatus.Confirmed && p.PaymentType == ClientPaymentType.Advance).Sum(p => p.Amount);
        var progressPayments = payments.Where(p => p.Status == ClientPaymentStatus.Confirmed && p.PaymentType == ClientPaymentType.Progress).Sum(p => p.Amount);
        var onAccountPayments = payments.Where(p => p.Status == ClientPaymentStatus.Confirmed && p.PaymentType == ClientPaymentType.OnAccount).Sum(p => p.Amount);
        var finalPayments = payments.Where(p => p.Status == ClientPaymentStatus.Confirmed && p.PaymentType == ClientPaymentType.Final).Sum(p => p.Amount);
        var pendingPayments = payments.Where(p => p.Status == ClientPaymentStatus.Pending).Sum(p => p.Amount);
        var confirmedPayments = payments.Where(p => p.Status == ClientPaymentStatus.Confirmed).Sum(p => p.Amount);

        // Get progress invoices
        var progressInvoices = await _progressInvoiceRepository.AsQueryable()
            .Where(i => i.ProjectId == projectId)
            .ToListAsync();

        var totalInvoices = progressInvoices.Count;
        var paidInvoices = progressInvoices.Count(i => i.Status == ProgressInvoiceStatus.Paid);
        var pendingInvoicesCount = progressInvoices.Count(i => i.Status == ProgressInvoiceStatus.Submitted || i.Status == ProgressInvoiceStatus.Approved);
        var totalInvoiced = progressInvoices.Sum(i => i.NetAmount);
        var totalCollected = progressInvoices.Sum(i => i.PaidAmount);

        // Calculate balance
        var balance = totalClientPayments - totalExpenses;
        var balanceStatus = GetBalanceStatus(balance, totalClientPayments);
        var balancePercentage = totalClientPayments > 0 ? (balance / totalClientPayments) * 100 : 0;

        // Determine alert level
        var (alertLevel, alertMessage) = CalculateAlertLevel(totalExpenses, totalClientPayments, balancePercentage);

        return new ProjectFinancialSummaryDto(
            ProjectId: projectId,
            ProjectName: project.Name,
            TotalContractValue: project.TotalContractValue,
            
            // Expenses
            TotalExpenses: totalExpenses,
            ConfirmedExpenses: confirmedExpenses,
            PendingExpenses: pendingExpenses,
            DraftExpenses: draftExpenses,
            
            // Client Payments
            TotalClientPayments: totalClientPayments,
            AdvancePayments: advancePayments,
            ProgressPayments: progressPayments,
            OnAccountPayments: onAccountPayments,
            FinalPayments: finalPayments,
            PendingPayments: pendingPayments,
            ConfirmedPayments: confirmedPayments,
            
            // Balance
            Balance: balance,
            BalanceStatus: balanceStatus,
            BalancePercentage: balancePercentage,
            
            // Alerts
            AlertLevel: alertLevel,
            AlertMessage: alertMessage,
            
            // Progress Invoices
            TotalInvoices: totalInvoices,
            PaidInvoices: paidInvoices,
            PendingInvoices: pendingInvoicesCount,
            TotalInvoiced: totalInvoiced,
            TotalCollected: totalCollected
        );
    }

    public async Task<List<ProjectFinancialSummaryDto>> GetCompanyFinancialSummaryAsync(int companyId)
    {
        var projects = await _projectRepository.AsQueryable()
            .Where(p => p.CompanyId == companyId)
            .ToListAsync();

        var summaries = new List<ProjectFinancialSummaryDto>();
        foreach (var project in projects)
        {
            var summary = await GetProjectFinancialSummaryAsync(project.Id);
            summaries.Add(summary);
        }

        return summaries;
    }

    public async Task CheckAndTriggerAlertsAsync(int projectId)
    {
        var summary = await GetProjectFinancialSummaryAsync(projectId);

        if (summary.AlertLevel == "None")
        {
            _logger.LogInformation("Project {ProjectId} financial status is healthy", projectId);
            return;
        }

        _logger.LogWarning("Project {ProjectId} financial alert: {AlertLevel} - {Message}", 
            projectId, summary.AlertLevel, summary.AlertMessage);

        // TODO: Send notifications to relevant users
        // This would integrate with the notification system
        // - Warning: Notify project manager
        // - Critical: Notify project manager + finance manager
        // - Emergency: Notify company owner + all managers

        await SendFinancialAlertNotifications(projectId, summary);
    }

    #region Private Methods

    private static string GetBalanceStatus(decimal balance, decimal totalPayments)
    {
        if (totalPayments == 0) return "NoPayments";
        
        var percentage = (balance / totalPayments) * 100;
        
        if (percentage > 10) return "Surplus"; // فائض
        if (percentage < -10) return "Deficit"; // عجز
        return "Balanced"; // متوازن
    }

    private static (string Level, string? Message) CalculateAlertLevel(decimal totalExpenses, decimal totalPayments, decimal balancePercentage)
    {
        if (totalPayments == 0 && totalExpenses == 0)
            return ("None", null);

        if (totalPayments == 0 && totalExpenses > 0)
            return ("Critical", "لا توجد مدفوعات من العميل رغم وجود مصروفات");

        if (totalExpenses == 0)
            return ("None", null);

        var expenseToPaymentRatio = totalExpenses / totalPayments;

        // Expenses exceed payments
        if (expenseToPaymentRatio >= 1.5m)
            return ("Emergency", "المصروفات تتجاوز المدفوعات بنسبة 50% أو أكثر - مطلوب تدخل عاجل");
        
        if (expenseToPaymentRatio >= 1.25m)
            return ("Critical", "المصروفات تتجاوز المدفوعات بنسبة 25% - مطلوب مراجعة عاجلة");
        
        if (expenseToPaymentRatio >= 1.1m)
            return ("Warning", "المصروفات تتجاوز المدفوعات بنسبة 10% - يرجى المتابعة");
        
        if (expenseToPaymentRatio >= 1.0m)
            return ("Info", "المصروفات تساوي المدفوعات - يرجى الانتباه");

        return ("None", null);
    }

    private async Task SendFinancialAlertNotifications(int projectId, ProjectFinancialSummaryDto summary)
    {
        // Get users to notify based on alert level
        var usersToNotify = await GetUsersToNotify(projectId, summary.AlertLevel);

        foreach (var user in usersToNotify)
        {
            _logger.LogInformation("Sending financial alert to user {UserId} for project {ProjectId}: {Message}",
                user.Id, projectId, summary.AlertMessage);

            // TODO: Integrate with actual notification service
            // await _notificationService.SendAsync(new Notification
            // {
            //     UserId = user.Id,
            //     Title = "تنبيه مالي",
            //     Message = summary.AlertMessage,
            //     Type = NotificationType.FinancialAlert,
            //     ProjectId = projectId
            // });
        }
    }

    private async Task<List<User>> GetUsersToNotify(int projectId, string alertLevel)
    {
        // This is a simplified version - in production, you'd query based on roles and project assignments
        var query = _userRepository.AsQueryable();

        // TODO: Implement proper role-based notification
        // For now, return empty list as placeholder
        return await query.Take(0).ToListAsync();
    }

    #endregion
}

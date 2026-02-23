using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service implementation for background jobs related to workflow
/// </summary>
public class WorkflowBackgroundJobService : IWorkflowBackgroundJobService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<WorkflowBackgroundJobService> _logger;
    private readonly ITaskManagementService _taskService;
    private readonly IEscalationService _escalationService;
    private readonly ITaskNotificationService _notificationService;
    private readonly IDailyTaskBoardService _dailyBoardService;
    private readonly IWorkflowConfigurationService _configService;

    public WorkflowBackgroundJobService(
        ApplicationDbContext context,
        ILogger<WorkflowBackgroundJobService> logger,
        ITaskManagementService taskService,
        IEscalationService escalationService,
        ITaskNotificationService notificationService,
        IDailyTaskBoardService dailyBoardService,
        IWorkflowConfigurationService configService)
    {
        _context = context;
        _logger = logger;
        _taskService = taskService;
        _escalationService = escalationService;
        _notificationService = notificationService;
        _dailyBoardService = dailyBoardService;
        _configService = configService;
    }

    // -- Pre-Start Confirmation Jobs -------------------------------------------
    public async Task SendPreStartConfirmationRemindersAsync()
    {
        _logger.LogInformation("Running pre-start confirmation reminder job");

        var now = DateTime.UtcNow;
        var companies = await _context.Companies.Where(c => c.IsActive).ToListAsync();

        foreach (var company in companies)
        {
            var config = await _configService.GetEffectiveConfigurationAsync(company.Id);
            if (!config.PreStartConfirmationEnabled)
                continue;

            var reminderTime = now.AddHours(config.PreStartConfirmationHours);
            var reminderWindowStart = reminderTime.AddMinutes(-30);
            var reminderWindowEnd = reminderTime.AddMinutes(30);

            var tasksNeedingReminder = await _context.ProjectItemTasks
                .Where(t => t.CompanyId == company.Id &&
                            t.RequiresPreStartConfirmation &&
                            t.PreStartConfirmationStatus == ConfirmationStatus.Pending &&
                            t.ScheduledStartDate.HasValue &&
                            t.ScheduledStartDate.Value >= reminderWindowStart &&
                            t.ScheduledStartDate.Value <= reminderWindowEnd &&
                            t.Status == ProjectTaskStatus.Pending)
                .ToListAsync();

            foreach (var task in tasksNeedingReminder)
            {
                try
                {
                    await _notificationService.SendPreStartConfirmationReminderAsync(task);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send pre-start reminder for task {TaskId}", task.Id);
                }
            }
        }

        _logger.LogInformation("Pre-start confirmation reminder job completed");
    }

    public async Task CheckPreStartConfirmationsAsync()
    {
        _logger.LogInformation("Running pre-start confirmation check job");

        var now = DateTime.UtcNow;
        var companies = await _context.Companies.Where(c => c.IsActive).ToListAsync();

        foreach (var company in companies)
        {
            var config = await _configService.GetEffectiveConfigurationAsync(company.Id);
            if (!config.PreStartConfirmationEnabled)
                continue;

            var escalationTime = now.AddHours(-config.PreStartEscalationHours);
            var startTimeWindow = now.AddHours(config.PreStartEscalationHours);

            var unconfirmedTasks = await _context.ProjectItemTasks
                .Include(t => t.Project)
                .Include(t => t.ProjectItem)
                .Where(t => t.CompanyId == company.Id &&
                            t.RequiresPreStartConfirmation &&
                            t.PreStartConfirmationStatus == ConfirmationStatus.Pending &&
                            t.ScheduledStartDate.HasValue &&
                            t.ScheduledStartDate.Value <= startTimeWindow &&
                            t.Status == ProjectTaskStatus.Pending)
                .ToListAsync();

            foreach (var task in unconfirmedTasks)
            {
                try
                {
                    await _escalationService.CreateEscalationAsync(
                        company.Id,
                        task.ProjectId,
                        EscalationType.PreStartNotConfirmed,
                        EscalationSeverity.High,
                        $"Pre-Start Not Confirmed: {task.Title}",
                        $"Pre-start confirmation not received for task '{task.Title}' scheduled to start at {task.ScheduledStartDate:yyyy-MM-dd HH:mm}",
                        task.ProjectItemId,
                        task.Id,
                        triggerReason: "Pre-start confirmation deadline passed"
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to create escalation for unconfirmed task {TaskId}", task.Id);
                }
            }
        }

        _logger.LogInformation("Pre-start confirmation check job completed");
    }

    // -- No-Start Check Jobs ---------------------------------------------------
    public async Task RunNoStartCheckAsync()
    {
        _logger.LogInformation("Running no-start check job");

        var companies = await _context.Companies.Where(c => c.IsActive).ToListAsync();

        foreach (var company in companies)
        {
            await RunNoStartCheckForCompanyAsync(company.Id);
        }

        _logger.LogInformation("No-start check job completed");
    }

    public async Task RunNoStartCheckForCompanyAsync(int companyId)
    {
        var config = await _configService.GetEffectiveConfigurationAsync(companyId);
        if (!config.NoStartCheckEnabled)
            return;

        var now = DateTime.UtcNow;
        var today = now.Date;

        // Find items that were scheduled to start today but haven't started
        var itemsNotStarted = await _context.ProjectItems
            .Include(i => i.Project)
            .Where(i => i.Project.CompanyId == companyId &&
                        i.StartDate.HasValue &&
                        i.StartDate.Value.Date == today &&
                        i.Status == "جديد" &&
                        !i.Tasks.Any())
            .ToListAsync();

        foreach (var item in itemsNotStarted)
        {
            try
            {
                await _escalationService.CreateEscalationAsync(
                    companyId,
                    item.ProjectId,
                    EscalationType.NoStartToday,
                    EscalationSeverity.High,
                    $"Item Not Started: {item.ItemName}",
                    $"Project item '{item.ItemName}' was scheduled to start today but has not started.",
                    item.Id,
                    triggerReason: "Scheduled start date passed without start"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create no-start escalation for item {ItemId}", item.Id);
            }
        }

        // Find tasks that were scheduled to start today but haven't started
        var tasksNotStarted = await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Where(t => t.CompanyId == companyId &&
                        t.ScheduledStartDate.HasValue &&
                        t.ScheduledStartDate.Value.Date == today &&
                        t.Status == ProjectTaskStatus.Pending)
            .ToListAsync();

        foreach (var task in tasksNotStarted)
        {
            try
            {
                await _escalationService.CreateEscalationAsync(
                    companyId,
                    task.ProjectId,
                    EscalationType.NoStartToday,
                    EscalationSeverity.Medium,
                    $"Task Not Started: {task.Title}",
                    $"Task '{task.Title}' was scheduled to start today but has not started.",
                    task.ProjectItemId,
                    task.Id,
                    triggerReason: "Scheduled start date passed without start"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create no-start escalation for task {TaskId}", task.Id);
            }
        }
    }

    // -- Delay Prediction Jobs -------------------------------------------------
    public async Task RunDelayPredictionAsync()
    {
        _logger.LogInformation("Running delay prediction job");

        var projects = await _context.Projects
            .Where(p => p.Status != "Completed" && p.Status != "Cancelled")
            .Select(p => p.Id)
            .ToListAsync();

        foreach (var projectId in projects)
        {
            await RunDelayPredictionForProjectAsync(projectId);
        }

        _logger.LogInformation("Delay prediction job completed");
    }

    public async Task RunDelayPredictionForProjectAsync(int projectId)
    {
        var project = await _context.Projects
            .Include(p => p.ProjectItems)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return;

        var config = await _configService.GetEffectiveConfigurationAsync(project.CompanyId ?? 0);
        if (!config.DelayPredictionEnabled)
            return;

        var now = DateTime.UtcNow;
        var warningDate = now.AddDays(config.DelayPredictionDaysBeforeEnd);

        foreach (var item in project.ProjectItems)
        {
            if (item.EndDate == null || item.Status == "Completed" || item.Status == "Cancelled")
                continue;

            // Check if we're approaching the end date
            if (item.EndDate.Value <= warningDate)
            {
                var totalDays = (item.EndDate.Value - item.StartDate.GetValueOrDefault()).TotalDays;
                if (totalDays <= 0) totalDays = 1;

                var elapsedDays = (now - item.StartDate.GetValueOrDefault()).TotalDays;
                var timeProgress = (elapsedDays / totalDays) * 100;

                // If time progress is ahead of work progress, predict delay
                var workProgress = (double)(item.ProgressPercentage);
                if (timeProgress > config.DelayPredictionThreshold && workProgress < timeProgress * 0.7)
                {
                    var predictedDelay = (int)Math.Ceiling((timeProgress - workProgress) / 100 * totalDays);

                    try
                    {
                        await _escalationService.CreateEscalationAsync(
                            project.CompanyId ?? 0,
                            projectId,
                            EscalationType.DelayPredicted,
                            EscalationSeverity.Medium,
                            $"Delay Predicted: {item.ItemName}",
                            $"Project item '{item.ItemName}' is predicted to be delayed by approximately {predictedDelay} days. Time progress: {timeProgress:F1}%, Work progress: {workProgress:F1}%",
                            item.Id,
                            estimatedDelayDays: predictedDelay,
                            affectsCriticalPath: true
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to create delay prediction for item {ItemId}", item.Id);
                    }
                }
            }
        }
    }

    // -- Task Stuck Detection Jobs ---------------------------------------------
    public async Task DetectStuckTasksAsync()
    {
        _logger.LogInformation("Running task stuck detection job");

        var companies = await _context.Companies.Where(c => c.IsActive).ToListAsync();

        foreach (var company in companies)
        {
            await DetectStuckTasksForCompanyAsync(company.Id);
        }

        _logger.LogInformation("Task stuck detection job completed");
    }

    public async Task DetectStuckTasksForCompanyAsync(int companyId)
    {
        var config = await _configService.GetEffectiveConfigurationAsync(companyId);
        if (!config.TaskStuckDetectionEnabled)
            return;

        var stuckTasks = await _taskService.GetStuckTasksAsync(companyId, config.TaskStuckDays);

        foreach (var task in stuckTasks)
        {
            try
            {
                await _escalationService.CreateEscalationAsync(
                    companyId,
                    task.ProjectId,
                    EscalationType.TaskStuck,
                    EscalationSeverity.Low,
                    $"Task Stuck: {task.Title}",
                    $"Task '{task.Title}' has not been updated in {config.TaskStuckDays} days. Current status: {task.Status}",
                    task.ProjectItemId,
                    task.Id,
                    triggerReason: $"No updates for {config.TaskStuckDays} days"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create stuck task escalation for task {TaskId}", task.Id);
            }
        }
    }

    // -- Review Timeout Jobs ---------------------------------------------------
    public async Task CheckReviewTimeoutsAsync()
    {
        _logger.LogInformation("Running review timeout check job");

        var companies = await _context.Companies.Where(c => c.IsActive).ToListAsync();

        foreach (var company in companies)
        {
            await CheckReviewTimeoutsForCompanyAsync(company.Id);
        }

        _logger.LogInformation("Review timeout check job completed");
    }

    public async Task CheckReviewTimeoutsForCompanyAsync(int companyId)
    {
        var config = await _configService.GetEffectiveConfigurationAsync(companyId);
        if (!config.ReviewTimeoutEnabled)
            return;

        var timeoutThreshold = DateTime.UtcNow.AddHours(-config.ReviewTimeoutHours);

        var tasksWaitingForReview = await _context.ProjectItemTasks
            .Include(t => t.Project)
            .Where(t => t.CompanyId == companyId &&
                        t.Status == ProjectTaskStatus.ReadyForReview &&
                        t.UpdatedAt < timeoutThreshold)
            .ToListAsync();

        foreach (var task in tasksWaitingForReview)
        {
            try
            {
                await _escalationService.CreateEscalationAsync(
                    companyId,
                    task.ProjectId,
                    EscalationType.ReviewPendingTooLong,
                    EscalationSeverity.Medium,
                    $"Review Pending: {task.Title}",
                    $"Task '{task.Title}' has been waiting for review for more than {config.ReviewTimeoutHours} hours.",
                    task.ProjectItemId,
                    task.Id,
                    triggerReason: "Review timeout exceeded"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create review timeout escalation for task {TaskId}", task.Id);
            }
        }
    }

    // -- Daily Board Jobs ------------------------------------------------------
    public async Task GenerateDailyBoardsAsync()
    {
        _logger.LogInformation("Running daily board generation job");
        await _dailyBoardService.GenerateAllCompaniesDailyBoardAsync();
        _logger.LogInformation("Daily board generation job completed");
    }

    // -- Escalation Jobs -------------------------------------------------------
    public async Task ProcessAutoEscalationsAsync()
    {
        _logger.LogInformation("Running auto-escalation job");

        var companies = await _context.Companies.Where(c => c.IsActive).ToListAsync();

        foreach (var company in companies)
        {
            try
            {
                await _escalationService.CheckAndEscalateStaleEscalationsAsync(company.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process auto-escalations for company {CompanyId}", company.Id);
            }
        }

        _logger.LogInformation("Auto-escalation job completed");
    }

    public async Task SendEscalationRemindersAsync()
    {
        _logger.LogInformation("Running escalation reminder job");

        var openEscalations = await _context.ProjectItemEscalations
            .Where(e => e.Status == EscalationStatus.Open || e.Status == EscalationStatus.InProgress)
            .ToListAsync();

        foreach (var escalation in openEscalations)
        {
            try
            {
                await _escalationService.SendEscalationReminderAsync(escalation.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send escalation reminder for {EscalationId}", escalation.Id);
            }
        }

        _logger.LogInformation("Escalation reminder job completed");
    }

    // -- Notification Jobs -----------------------------------------------------
    public async Task SendPendingNotificationsAsync()
    {
        _logger.LogInformation("Running pending notifications job");
        await _notificationService.SendPendingNotificationsAsync();
        _logger.LogInformation("Pending notifications job completed");
    }

    public async Task SendTaskDueSoonRemindersAsync()
    {
        _logger.LogInformation("Running task due soon reminder job");

        var companies = await _context.Companies.Where(c => c.IsActive).ToListAsync();

        foreach (var company in companies)
        {
            var tasksDueSoon = await _taskService.GetTasksDueSoonAsync(company.Id, 3);

            foreach (var task in tasksDueSoon)
            {
                if (!task.DueDate.HasValue) continue;

                var daysRemaining = (task.DueDate.Value - DateTime.UtcNow).Days;
                if (daysRemaining < 0) daysRemaining = 0;

                try
                {
                    await _notificationService.SendTaskDueSoonNotificationAsync(task, daysRemaining);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send due soon reminder for task {TaskId}", task.Id);
                }
            }
        }

        _logger.LogInformation("Task due soon reminder job completed");
    }

    public async Task SendTaskOverdueNotificationsAsync()
    {
        _logger.LogInformation("Running task overdue notification job");

        var companies = await _context.Companies.Where(c => c.IsActive).ToListAsync();

        foreach (var company in companies)
        {
            var overdueTasks = await _taskService.GetOverdueTasksAsync(company.Id);

            foreach (var task in overdueTasks)
            {
                try
                {
                    await _notificationService.SendTaskOverdueNotificationAsync(task);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send overdue notification for task {TaskId}", task.Id);
                }
            }
        }

        _logger.LogInformation("Task overdue notification job completed");
    }

    // -- Cleanup Jobs ----------------------------------------------------------
    public async Task CleanupOldNotificationsAsync()
    {
        _logger.LogInformation("Running notification cleanup job");
        await _notificationService.DeleteOldNotificationsAsync(90);
        _logger.LogInformation("Notification cleanup job completed");
    }

    public async Task CleanupOldBoardEntriesAsync()
    {
        _logger.LogInformation("Running board entries cleanup job");
        await _dailyBoardService.CleanupOldBoardEntriesAsync(30);
        _logger.LogInformation("Board entries cleanup job completed");
    }
}

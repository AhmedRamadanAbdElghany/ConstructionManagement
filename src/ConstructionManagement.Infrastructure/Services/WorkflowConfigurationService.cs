using System.Text.Json;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service implementation for managing workflow configurations
/// </summary>
public class WorkflowConfigurationService : IWorkflowConfigurationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<WorkflowConfigurationService> _logger;

    public WorkflowConfigurationService(
        ApplicationDbContext context,
        ILogger<WorkflowConfigurationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    // -- Configuration CRUD ----------------------------------------------------
    public async Task<WorkflowConfiguration> CreateConfigurationAsync(int companyId,
        WorkflowConfigurationType configurationType, int? projectId = null)
    {
        var config = new WorkflowConfiguration
        {
            CompanyId = companyId,
            ProjectId = projectId,
            ConfigurationType = configurationType
        };

        _context.WorkflowConfigurations.Add(config);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Workflow configuration created for company {CompanyId}", companyId);
        return config;
    }

    public async Task<WorkflowConfiguration?> GetConfigurationByIdAsync(int configurationId)
    {
        return await _context.WorkflowConfigurations
            .FirstOrDefaultAsync(c => c.Id == configurationId);
    }

    public async Task<WorkflowConfiguration?> GetCompanyConfigurationAsync(int companyId)
    {
        return await _context.WorkflowConfigurations
            .FirstOrDefaultAsync(c => c.CompanyId == companyId && c.ProjectId == null);
    }

    public async Task<WorkflowConfiguration?> GetProjectConfigurationAsync(int projectId)
    {
        return await _context.WorkflowConfigurations
            .FirstOrDefaultAsync(c => c.ProjectId == projectId);
    }

    public async Task<WorkflowConfiguration> GetEffectiveConfigurationAsync(int companyId, int? projectId = null)
    {
        // Try to get project-specific configuration first
        if (projectId.HasValue)
        {
            var projectConfig = await GetProjectConfigurationAsync(projectId.Value);
            if (projectConfig != null && projectConfig.IsActive)
                return projectConfig;
        }

        // Fall back to company configuration
        var companyConfig = await GetCompanyConfigurationAsync(companyId);
        if (companyConfig != null && companyConfig.IsActive)
            return companyConfig;

        // Create default configuration if none exists
        return await CreateDefaultConfigurationAsync(companyId, projectId);
    }

    public async Task<WorkflowConfiguration> UpdateConfigurationAsync(int configurationId,
        bool? preStartConfirmationEnabled = null, int? preStartConfirmationHours = null,
        int? preStartEscalationHours = null, bool? allowForcedStart = null,
        bool? noStartCheckEnabled = null, int? noStartCheckHour = null,
        bool? delayPredictionEnabled = null, int? delayPredictionThreshold = null,
        int? delayPredictionDaysBeforeEnd = null,
        bool? taskStuckDetectionEnabled = null, int? taskStuckDays = null,
        bool? reviewTimeoutEnabled = null, int? reviewTimeoutHours = null,
        bool? sendInAppNotifications = null, bool? sendPushNotifications = null,
        bool? sendEmailNotifications = null, bool? sendSmsNotifications = null,
        int? dailyBoardGenerationHour = null,
        int? autoEscalateHours = null, int? maxEscalationLevel = null,
        bool? requirePhotoEvidence = null, int? minimumPhotosRequired = null,
        bool? requireBeforeAfterPhotos = null, bool? requireVideoEvidence = null,
        bool? requireManagerApproval = null, string? approverRoles = null)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        if (preStartConfirmationEnabled.HasValue)
            config.PreStartConfirmationEnabled = preStartConfirmationEnabled.Value;
        if (preStartConfirmationHours.HasValue)
            config.PreStartConfirmationHours = preStartConfirmationHours.Value;
        if (preStartEscalationHours.HasValue)
            config.PreStartEscalationHours = preStartEscalationHours.Value;
        if (allowForcedStart.HasValue)
            config.AllowForcedStart = allowForcedStart.Value;
        if (noStartCheckEnabled.HasValue)
            config.NoStartCheckEnabled = noStartCheckEnabled.Value;
        if (noStartCheckHour.HasValue)
            config.NoStartCheckHour = noStartCheckHour.Value;
        if (delayPredictionEnabled.HasValue)
            config.DelayPredictionEnabled = delayPredictionEnabled.Value;
        if (delayPredictionThreshold.HasValue)
            config.DelayPredictionThreshold = delayPredictionThreshold.Value;
        if (delayPredictionDaysBeforeEnd.HasValue)
            config.DelayPredictionDaysBeforeEnd = delayPredictionDaysBeforeEnd.Value;
        if (taskStuckDetectionEnabled.HasValue)
            config.TaskStuckDetectionEnabled = taskStuckDetectionEnabled.Value;
        if (taskStuckDays.HasValue)
            config.TaskStuckDays = taskStuckDays.Value;
        if (reviewTimeoutEnabled.HasValue)
            config.ReviewTimeoutEnabled = reviewTimeoutEnabled.Value;
        if (reviewTimeoutHours.HasValue)
            config.ReviewTimeoutHours = reviewTimeoutHours.Value;
        if (sendInAppNotifications.HasValue)
            config.SendInAppNotifications = sendInAppNotifications.Value;
        if (sendPushNotifications.HasValue)
            config.SendPushNotifications = sendPushNotifications.Value;
        if (sendEmailNotifications.HasValue)
            config.SendEmailNotifications = sendEmailNotifications.Value;
        if (sendSmsNotifications.HasValue)
            config.SendSmsNotifications = sendSmsNotifications.Value;
        if (dailyBoardGenerationHour.HasValue)
            config.DailyBoardGenerationHour = dailyBoardGenerationHour.Value;
        if (autoEscalateHours.HasValue)
            config.AutoEscalateHours = autoEscalateHours.Value;
        if (maxEscalationLevel.HasValue)
            config.MaxEscalationLevel = maxEscalationLevel.Value;
        if (requirePhotoEvidence.HasValue)
            config.RequirePhotoEvidence = requirePhotoEvidence.Value;
        if (minimumPhotosRequired.HasValue)
            config.MinimumPhotosRequired = minimumPhotosRequired.Value;
        if (requireBeforeAfterPhotos.HasValue)
            config.RequireBeforeAfterPhotos = requireBeforeAfterPhotos.Value;
        if (requireVideoEvidence.HasValue)
            config.RequireVideoEvidence = requireVideoEvidence.Value;
        if (requireManagerApproval.HasValue)
            config.RequireManagerApproval = requireManagerApproval.Value;
        if (approverRoles != null)
            config.ApproverRoles = approverRoles;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Workflow configuration {Id} updated", configurationId);
        return config;
    }

    public async Task DeleteConfigurationAsync(int configurationId)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        _context.WorkflowConfigurations.Remove(config);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Workflow configuration {Id} deleted", configurationId);
    }

    // -- Notification Recipients ------------------------------------------------
    public async Task<WorkflowConfiguration> SetPreStartEscalationRecipientsAsync(int configurationId, IEnumerable<int> userIds)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        config.PreStartEscalationNotifyUserIds = JsonSerializer.Serialize(userIds.ToList());
        await _context.SaveChangesAsync();
        return config;
    }

    public async Task<WorkflowConfiguration> SetNoStartRecipientsAsync(int configurationId, IEnumerable<int> userIds)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        config.NoStartNotifyUserIds = JsonSerializer.Serialize(userIds.ToList());
        await _context.SaveChangesAsync();
        return config;
    }

    public async Task<WorkflowConfiguration> SetDelayPredictionRecipientsAsync(int configurationId, IEnumerable<int> userIds)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        config.DelayPredictionNotifyUserIds = JsonSerializer.Serialize(userIds.ToList());
        await _context.SaveChangesAsync();
        return config;
    }

    public async Task<WorkflowConfiguration> SetTaskStuckRecipientsAsync(int configurationId, IEnumerable<int> userIds)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        config.TaskStuckNotifyUserIds = JsonSerializer.Serialize(userIds.ToList());
        await _context.SaveChangesAsync();
        return config;
    }

    public async Task<WorkflowConfiguration> SetReviewTimeoutRecipientsAsync(int configurationId, IEnumerable<int> userIds)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        config.ReviewTimeoutNotifyUserIds = JsonSerializer.Serialize(userIds.ToList());
        await _context.SaveChangesAsync();
        return config;
    }

    public async Task<WorkflowConfiguration> SetDailyBoardRecipientsAsync(int configurationId, IEnumerable<int> userIds)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        config.DailyBoardNotifyUserIds = JsonSerializer.Serialize(userIds.ToList());
        await _context.SaveChangesAsync();
        return config;
    }

    public async Task<WorkflowConfiguration> SetEscalationLevelRecipientsAsync(int configurationId, int level, IEnumerable<int> userIds)
    {
        var config = await _context.WorkflowConfigurations.FindAsync(configurationId);
        if (config == null)
            throw new InvalidOperationException($"Configuration with ID {configurationId} not found");

        var userIdsJson = JsonSerializer.Serialize(userIds.ToList());
        switch (level)
        {
            case 1:
                config.EscalationLevel1UserIds = userIdsJson;
                break;
            case 2:
                config.EscalationLevel2UserIds = userIdsJson;
                break;
            case 3:
                config.EscalationLevel3UserIds = userIdsJson;
                break;
            default:
                throw new ArgumentException("Escalation level must be 1, 2, or 3", nameof(level));
        }

        await _context.SaveChangesAsync();
        return config;
    }

    // -- Default Configuration --------------------------------------------------
    public async Task<WorkflowConfiguration> CreateDefaultConfigurationAsync(int companyId, int? projectId = null)
    {
        var config = new WorkflowConfiguration
        {
            CompanyId = companyId,
            ProjectId = projectId,
            ConfigurationType = WorkflowConfigurationType.PreStartConfirmation,
            IsActive = true,
            
            // Pre-start confirmation defaults
            PreStartConfirmationEnabled = true,
            PreStartConfirmationHours = 24,
            PreStartEscalationHours = 4,
            AllowForcedStart = true,
            
            // No-start check defaults
            NoStartCheckEnabled = true,
            NoStartCheckHour = 18,
            
            // Delay prediction defaults
            DelayPredictionEnabled = true,
            DelayPredictionThreshold = 80,
            DelayPredictionDaysBeforeEnd = 3,
            
            // Task stuck detection defaults
            TaskStuckDetectionEnabled = true,
            TaskStuckDays = 3,
            
            // Review timeout defaults
            ReviewTimeoutEnabled = true,
            ReviewTimeoutHours = 24,
            
            // Notification defaults
            SendInAppNotifications = true,
            SendPushNotifications = true,
            SendEmailNotifications = false,
            SendSmsNotifications = false,
            
            // Daily board defaults
            DailyBoardGenerationHour = 6,
            
            // Escalation defaults
            AutoEscalateHours = 4,
            MaxEscalationLevel = 3,
            
            // Quality defaults
            RequirePhotoEvidence = true,
            MinimumPhotosRequired = 1,
            RequireBeforeAfterPhotos = false,
            RequireVideoEvidence = false,
            RequireManagerApproval = true,
            ApproverRoles = "[\"Manager\", \"Supervisor\", \"CompanyOwner\"]"
        };

        _context.WorkflowConfigurations.Add(config);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Default workflow configuration created for company {CompanyId}", companyId);
        return config;
    }

    public async Task EnsureCompanyHasConfigurationAsync(int companyId)
    {
        var existing = await GetCompanyConfigurationAsync(companyId);
        if (existing == null)
        {
            await CreateDefaultConfigurationAsync(companyId);
        }
    }
}

/// <summary>
/// Service implementation for daily task board operations
/// </summary>
public class DailyTaskBoardService : IDailyTaskBoardService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DailyTaskBoardService> _logger;
    private readonly IWorkflowConfigurationService _configService;

    public DailyTaskBoardService(
        ApplicationDbContext context,
        ILogger<DailyTaskBoardService> logger,
        IWorkflowConfigurationService configService)
    {
        _context = context;
        _logger = logger;
        _configService = configService;
    }

    // -- Board Generation -------------------------------------------------------
    public async Task GenerateDailyBoardAsync(int companyId)
    {
        var today = DateTime.UtcNow.Date;
        var projects = await _context.Projects
            .Where(p => p.CompanyId == companyId && p.Status != "Completed" && p.Status != "Cancelled")
            .Select(p => p.Id)
            .ToListAsync();

        foreach (var projectId in projects)
        {
            await GenerateProjectDailyBoardAsync(projectId);
        }

        _logger.LogInformation("Daily board generated for company {CompanyId}", companyId);
    }

    public async Task GenerateProjectDailyBoardAsync(int projectId)
    {
        var today = DateTime.UtcNow.Date;
        var project = await _context.Projects
            .Include(p => p.ProjectItems)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return;

        var companyId = project.CompanyId ?? 0;

        // Get items starting today
        var itemsStartingToday = project.ProjectItems
            .Where(i => i.StartDate.HasValue && i.StartDate.Value.Date == today)
            .ToList();

        foreach (var item in itemsStartingToday)
        {
            await CreateBoardEntryAsync(companyId, projectId, item.Id, null,
                DailyBoardEntryType.ItemStartingToday, item.ItemName, item.Description,
                item.StartDate, item.EndDate);
        }

        // Get items in progress
        var itemsInProgress = project.ProjectItems
            .Where(i => i.StartDate.HasValue && i.StartDate.Value.Date <= today &&
                        (i.EndDate == null || i.EndDate.Value.Date >= today) &&
                        i.Status == "InProgress")
            .ToList();

        foreach (var item in itemsInProgress)
        {
            await CreateBoardEntryAsync(companyId, projectId, item.Id, null,
                DailyBoardEntryType.ItemInProgress, item.ItemName, item.Description,
                item.StartDate, item.EndDate);
        }

        // Get items ending today
        var itemsEndingToday = project.ProjectItems
            .Where(i => i.EndDate.HasValue && i.EndDate.Value.Date == today)
            .ToList();

        foreach (var item in itemsEndingToday)
        {
            await CreateBoardEntryAsync(companyId, projectId, item.Id, null,
                DailyBoardEntryType.ItemEndingToday, item.ItemName, item.Description,
                item.StartDate, item.EndDate);
        }

        // Get tasks scheduled for today
        var tasksToday = await _context.ProjectItemTasks
            .Where(t => t.ProjectId == projectId &&
                        t.ScheduledStartDate.HasValue &&
                        t.ScheduledStartDate.Value.Date <= today &&
                        (t.ScheduledEndDate == null || t.ScheduledEndDate.Value.Date >= today) &&
                        t.Status != Domain.Enums.ProjectTaskStatus.Approved &&
                        t.Status != Domain.Enums.ProjectTaskStatus.Cancelled)
            .Include(t => t.ProjectItem)
            .ToListAsync();

        foreach (var task in tasksToday)
        {
            await CreateBoardEntryAsync(companyId, projectId, task.ProjectItemId, task.Id,
                DailyBoardEntryType.TaskScheduled, task.Title, task.Description,
                task.ScheduledStartDate, task.ScheduledEndDate, task.AssignedToUserId,
                task.Priority, task.ProgressPercentage);
        }

        // Get overdue items
        var overdueItems = project.ProjectItems
            .Where(i => i.EndDate.HasValue && i.EndDate.Value.Date < today &&
                        i.Status != "Completed" && i.Status != "Cancelled")
            .ToList();

        foreach (var item in overdueItems)
        {
            await CreateBoardEntryAsync(companyId, projectId, item.Id, null,
                DailyBoardEntryType.OverdueItem, item.ItemName, item.Description,
                item.StartDate, item.EndDate, isOverdue: true);
        }

        _logger.LogInformation("Daily board generated for project {ProjectId}", projectId);
    }

    private async Task<DailyTaskBoard> CreateBoardEntryAsync(
        int companyId, int projectId, int? projectItemId, int? taskId,
        DailyBoardEntryType entryType, string itemName, string? description,
        DateTime? scheduledStart, DateTime? scheduledEnd, int? assignedToUserId = null,
        Domain.Enums.TaskPriority priority = Domain.Enums.TaskPriority.Normal,
        decimal progressPercentage = 0, bool isOverdue = false)
    {
        var today = DateTime.UtcNow.Date;

        // Check if entry already exists for today
        var existing = await _context.DailyTaskBoards
            .FirstOrDefaultAsync(b => b.ProjectId == projectId &&
                                      b.ProjectItemId == projectItemId &&
                                      b.ProjectItemTaskId == taskId &&
                                      b.BoardDate == today);

        if (existing != null)
            return existing;

        string? assignedUserName = null;
        if (assignedToUserId.HasValue)
        {
            var user = await _context.Users.FindAsync(assignedToUserId.Value);
            assignedUserName = user?.FullName;
        }

        var entry = new DailyTaskBoard
        {
            CompanyId = companyId,
            ProjectId = projectId,
            ProjectItemId = projectItemId,
            ProjectItemTaskId = taskId,
            BoardDate = today,
            EntryType = entryType,
            ItemName = itemName,
            ItemDescription = description,
            ScheduledStart = scheduledStart,
            ScheduledEnd = scheduledEnd,
            AssignedToUserId = assignedToUserId,
            AssignedUserName = assignedUserName,
            Priority = priority,
            ProgressPercentage = progressPercentage,
            IsOverdue = isOverdue,
            GeneratedAt = DateTime.UtcNow
        };

        _context.DailyTaskBoards.Add(entry);
        await _context.SaveChangesAsync();
        return entry;
    }

    public async Task GenerateAllCompaniesDailyBoardAsync()
    {
        var companyIds = await _context.Companies
            .Where(c => c.IsActive)
            .Select(c => c.Id)
            .ToListAsync();

        foreach (var companyId in companyIds)
        {
            await GenerateDailyBoardAsync(companyId);
        }

        _logger.LogInformation("Daily board generated for all companies");
    }

    // -- Board Retrieval --------------------------------------------------------
    public async Task<IEnumerable<DailyTaskBoard>> GetDailyBoardAsync(int companyId, DateTime? date = null)
    {
        var boardDate = date?.Date ?? DateTime.UtcNow.Date;
        return await _context.DailyTaskBoards
            .Include(b => b.Project)
            .Include(b => b.AssignedToUser)
            .Where(b => b.CompanyId == companyId && b.BoardDate == boardDate)
            .OrderBy(b => b.Priority)
            .ThenBy(b => b.ScheduledStart)
            .ToListAsync();
    }

    public async Task<IEnumerable<DailyTaskBoard>> GetProjectDailyBoardAsync(int projectId, DateTime? date = null)
    {
        var boardDate = date?.Date ?? DateTime.UtcNow.Date;
        return await _context.DailyTaskBoards
            .Include(b => b.AssignedToUser)
            .Where(b => b.ProjectId == projectId && b.BoardDate == boardDate)
            .OrderBy(b => b.Priority)
            .ThenBy(b => b.ScheduledStart)
            .ToListAsync();
    }

    public async Task<IEnumerable<DailyTaskBoard>> GetUserDailyBoardAsync(int userId, DateTime? date = null)
    {
        var boardDate = date?.Date ?? DateTime.UtcNow.Date;
        return await _context.DailyTaskBoards
            .Include(b => b.Project)
            .Where(b => b.AssignedToUserId == userId && b.BoardDate == boardDate)
            .OrderBy(b => b.Priority)
            .ThenBy(b => b.ScheduledStart)
            .ToListAsync();
    }

    public async Task<DailyTaskBoard?> GetBoardEntryByIdAsync(int entryId)
    {
        return await _context.DailyTaskBoards
            .Include(b => b.Project)
            .Include(b => b.ProjectItem)
            .Include(b => b.Task)
            .Include(b => b.AssignedToUser)
            .FirstOrDefaultAsync(b => b.Id == entryId);
    }

    // -- Board Entry Management -------------------------------------------------
    public async Task<DailyTaskBoard> UpdateBoardEntryStatusAsync(int entryId, DailyBoardEntryStatus status, string? notes = null)
    {
        var entry = await _context.DailyTaskBoards.FindAsync(entryId);
        if (entry == null)
            throw new InvalidOperationException($"Board entry with ID {entryId} not found");

        entry.Status = status;
        entry.Notes = notes;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return entry;
    }

    public async Task<DailyTaskBoard> UpdateBoardEntryProgressAsync(int entryId, decimal progressPercentage)
    {
        var entry = await _context.DailyTaskBoards.FindAsync(entryId);
        if (entry == null)
            throw new InvalidOperationException($"Board entry with ID {entryId} not found");

        entry.ProgressPercentage = progressPercentage;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return entry;
    }

    public async Task<DailyTaskBoard> SetActualStartAsync(int entryId, DateTime actualStart)
    {
        var entry = await _context.DailyTaskBoards.FindAsync(entryId);
        if (entry == null)
            throw new InvalidOperationException($"Board entry with ID {entryId} not found");

        entry.ActualStart = actualStart;
        entry.Status = DailyBoardEntryStatus.InProgress;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return entry;
    }

    public async Task<DailyTaskBoard> SetActualEndAsync(int entryId, DateTime actualEnd)
    {
        var entry = await _context.DailyTaskBoards.FindAsync(entryId);
        if (entry == null)
            throw new InvalidOperationException($"Board entry with ID {entryId} not found");

        entry.ActualEnd = actualEnd;
        entry.Status = DailyBoardEntryStatus.Completed;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return entry;
    }

    // -- Pre-Start Confirmation -------------------------------------------------
    public async Task<DailyTaskBoard> ConfirmPreStartAsync(int entryId, int confirmedByUserId, string? notes = null)
    {
        var entry = await _context.DailyTaskBoards.FindAsync(entryId);
        if (entry == null)
            throw new InvalidOperationException($"Board entry with ID {entryId} not found");

        var user = await _context.Users.FindAsync(confirmedByUserId);

        entry.PreStartStatus = ConfirmationStatus.Confirmed;
        entry.PreStartConfirmedAt = DateTime.UtcNow;
        entry.PreStartConfirmedByName = user?.FullName;
        entry.Status = DailyBoardEntryStatus.ReadyToStart;
        entry.Notes = notes;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return entry;
    }

    public async Task<DailyTaskBoard> AuthorizeForcedStartAsync(int entryId, int authorizedByUserId, string reason)
    {
        var entry = await _context.DailyTaskBoards.FindAsync(entryId);
        if (entry == null)
            throw new InvalidOperationException($"Board entry with ID {entryId} not found");

        var user = await _context.Users.FindAsync(authorizedByUserId);

        entry.PreStartStatus = ConfirmationStatus.ForcedStart;
        entry.PreStartConfirmedAt = DateTime.UtcNow;
        entry.PreStartConfirmedByName = user?.FullName;
        entry.Status = DailyBoardEntryStatus.ReadyToStart;
        entry.Notes = $"Forced start authorized: {reason}";
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return entry;
    }

    // -- Statistics -------------------------------------------------------------
    public async Task<Dictionary<DailyBoardEntryStatus, int>> GetBoardStatusCountsAsync(int companyId, DateTime? date = null)
    {
        var boardDate = date?.Date ?? DateTime.UtcNow.Date;
        var entries = await _context.DailyTaskBoards
            .Where(b => b.CompanyId == companyId && b.BoardDate == boardDate)
            .GroupBy(b => b.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return entries.ToDictionary(e => e.Status, e => e.Count);
    }

    public async Task<int> GetItemsStartingTodayCountAsync(int companyId)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.DailyTaskBoards
            .CountAsync(b => b.CompanyId == companyId &&
                            b.BoardDate == today &&
                            b.EntryType == DailyBoardEntryType.ItemStartingToday);
    }

    public async Task<int> GetItemsEndingTodayCountAsync(int companyId)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.DailyTaskBoards
            .CountAsync(b => b.CompanyId == companyId &&
                            b.BoardDate == today &&
                            b.EntryType == DailyBoardEntryType.ItemEndingToday);
    }

    public async Task<int> GetOverdueItemsCountAsync(int companyId)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.DailyTaskBoards
            .CountAsync(b => b.CompanyId == companyId &&
                            b.BoardDate == today &&
                            b.IsOverdue);
    }

    public async Task<int> GetNotStartedItemsCountAsync(int companyId, DateTime? date = null)
    {
        var boardDate = date?.Date ?? DateTime.UtcNow.Date;
        return await _context.DailyTaskBoards
            .CountAsync(b => b.CompanyId == companyId &&
                            b.BoardDate == boardDate &&
                            b.Status == DailyBoardEntryStatus.NotStarted);
    }

    // -- Cleanup ----------------------------------------------------------------
    public async Task CleanupOldBoardEntriesAsync(int daysOld = 30)
    {
        var threshold = DateTime.UtcNow.Date.AddDays(-daysOld);
        var oldEntries = await _context.DailyTaskBoards
            .Where(b => b.BoardDate < threshold)
            .ToListAsync();

        _context.DailyTaskBoards.RemoveRange(oldEntries);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Cleaned up {Count} old board entries", oldEntries.Count);
    }
}

using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for managing workflow configurations
/// </summary>
public interface IWorkflowConfigurationService
{
    // -- Configuration CRUD ----------------------------------------------------
    Task<WorkflowConfiguration> CreateConfigurationAsync(int companyId,
        WorkflowConfigurationType configurationType, int? projectId = null);
    
    Task<WorkflowConfiguration?> GetConfigurationByIdAsync(int configurationId);
    Task<WorkflowConfiguration?> GetCompanyConfigurationAsync(int companyId);
    Task<WorkflowConfiguration?> GetProjectConfigurationAsync(int projectId);
    Task<WorkflowConfiguration> GetEffectiveConfigurationAsync(int companyId, int? projectId = null);
    
    Task<WorkflowConfiguration> UpdateConfigurationAsync(int configurationId,
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
        bool? requireManagerApproval = null, string? approverRoles = null);
    
    Task DeleteConfigurationAsync(int configurationId);
    
    // -- Notification Recipients ------------------------------------------------
    Task<WorkflowConfiguration> SetPreStartEscalationRecipientsAsync(int configurationId, IEnumerable<int> userIds);
    Task<WorkflowConfiguration> SetNoStartRecipientsAsync(int configurationId, IEnumerable<int> userIds);
    Task<WorkflowConfiguration> SetDelayPredictionRecipientsAsync(int configurationId, IEnumerable<int> userIds);
    Task<WorkflowConfiguration> SetTaskStuckRecipientsAsync(int configurationId, IEnumerable<int> userIds);
    Task<WorkflowConfiguration> SetReviewTimeoutRecipientsAsync(int configurationId, IEnumerable<int> userIds);
    Task<WorkflowConfiguration> SetDailyBoardRecipientsAsync(int configurationId, IEnumerable<int> userIds);
    Task<WorkflowConfiguration> SetEscalationLevelRecipientsAsync(int configurationId, int level, IEnumerable<int> userIds);
    
    // -- Default Configuration --------------------------------------------------
    Task<WorkflowConfiguration> CreateDefaultConfigurationAsync(int companyId, int? projectId = null);
    Task EnsureCompanyHasConfigurationAsync(int companyId);
}

/// <summary>
/// Service interface for daily task board operations
/// </summary>
public interface IDailyTaskBoardService
{
    // -- Board Generation -------------------------------------------------------
    Task GenerateDailyBoardAsync(int companyId);
    Task GenerateProjectDailyBoardAsync(int projectId);
    Task GenerateAllCompaniesDailyBoardAsync();
    
    // -- Board Retrieval --------------------------------------------------------
    Task<IEnumerable<DailyTaskBoard>> GetDailyBoardAsync(int companyId, DateTime? date = null);
    Task<IEnumerable<DailyTaskBoard>> GetProjectDailyBoardAsync(int projectId, DateTime? date = null);
    Task<IEnumerable<DailyTaskBoard>> GetUserDailyBoardAsync(int userId, DateTime? date = null);
    Task<DailyTaskBoard?> GetBoardEntryByIdAsync(int entryId);
    
    // -- Board Entry Management -------------------------------------------------
    Task<DailyTaskBoard> UpdateBoardEntryStatusAsync(int entryId, DailyBoardEntryStatus status, string? notes = null);
    Task<DailyTaskBoard> UpdateBoardEntryProgressAsync(int entryId, decimal progressPercentage);
    Task<DailyTaskBoard> SetActualStartAsync(int entryId, DateTime actualStart);
    Task<DailyTaskBoard> SetActualEndAsync(int entryId, DateTime actualEnd);
    
    // -- Pre-Start Confirmation -------------------------------------------------
    Task<DailyTaskBoard> ConfirmPreStartAsync(int entryId, int confirmedByUserId, string? notes = null);
    Task<DailyTaskBoard> AuthorizeForcedStartAsync(int entryId, int authorizedByUserId, string reason);
    
    // -- Statistics -------------------------------------------------------------
    Task<Dictionary<DailyBoardEntryStatus, int>> GetBoardStatusCountsAsync(int companyId, DateTime? date = null);
    Task<int> GetItemsStartingTodayCountAsync(int companyId);
    Task<int> GetItemsEndingTodayCountAsync(int companyId);
    Task<int> GetOverdueItemsCountAsync(int companyId);
    Task<int> GetNotStartedItemsCountAsync(int companyId, DateTime? date = null);
    
    // -- Cleanup ----------------------------------------------------------------
    Task CleanupOldBoardEntriesAsync(int daysOld = 30);
}

/// <summary>
/// Service interface for background jobs related to workflow
/// </summary>
public interface IWorkflowBackgroundJobService
{
    // -- Pre-Start Confirmation Jobs -------------------------------------------
    Task SendPreStartConfirmationRemindersAsync();
    Task CheckPreStartConfirmationsAsync();
    
    // -- No-Start Check Jobs ---------------------------------------------------
    Task RunNoStartCheckAsync();
    Task RunNoStartCheckForCompanyAsync(int companyId);
    
    // -- Delay Prediction Jobs -------------------------------------------------
    Task RunDelayPredictionAsync();
    Task RunDelayPredictionForProjectAsync(int projectId);
    
    // -- Task Stuck Detection Jobs ---------------------------------------------
    Task DetectStuckTasksAsync();
    Task DetectStuckTasksForCompanyAsync(int companyId);
    
    // -- Review Timeout Jobs ---------------------------------------------------
    Task CheckReviewTimeoutsAsync();
    Task CheckReviewTimeoutsForCompanyAsync(int companyId);
    
    // -- Daily Board Jobs ------------------------------------------------------
    Task GenerateDailyBoardsAsync();
    
    // -- Escalation Jobs -------------------------------------------------------
    Task ProcessAutoEscalationsAsync();
    Task SendEscalationRemindersAsync();
    
    // -- Notification Jobs -----------------------------------------------------
    Task SendPendingNotificationsAsync();
    Task SendTaskDueSoonRemindersAsync();
    Task SendTaskOverdueNotificationsAsync();
    
    // -- Cleanup Jobs ----------------------------------------------------------
    Task CleanupOldNotificationsAsync();
    Task CleanupOldBoardEntriesAsync();
}

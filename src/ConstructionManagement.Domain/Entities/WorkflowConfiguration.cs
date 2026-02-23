using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Configuration for project item workflow settings
/// Can be set at company level and overridden at project level
/// </summary>
public class WorkflowConfiguration : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    // -- Project Override (optional) --------------------------------------------
    /// <summary>
    /// If set, this configuration applies only to this project
    /// </summary>
    public int? ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }
    
    // -- Configuration Type -----------------------------------------------------
    /// <summary>
    /// Type of workflow configuration
    /// </summary>
    public WorkflowConfigurationType ConfigurationType { get; set; }
    
    // -- Pre-Start Confirmation Settings ----------------------------------------
    /// <summary>
    /// Enable pre-start confirmation workflow
    /// </summary>
    public bool PreStartConfirmationEnabled { get; set; } = true;
    
    /// <summary>
    /// Hours before scheduled start to send confirmation reminder
    /// </summary>
    public int PreStartConfirmationHours { get; set; } = 24;
    
    /// <summary>
    /// Hours before scheduled start to escalate if not confirmed
    /// </summary>
    public int PreStartEscalationHours { get; set; } = 4;
    
    /// <summary>
    /// User IDs to notify for pre-start escalations (JSON array)
    /// </summary>
    public string? PreStartEscalationNotifyUserIds { get; set; }
    
    /// <summary>
    /// Allow forced start by company owner
    /// </summary>
    public bool AllowForcedStart { get; set; } = true;
    
    // -- No-Start Check Settings ------------------------------------------------
    /// <summary>
    /// Enable no-start check (check if item started by end of scheduled day)
    /// </summary>
    public bool NoStartCheckEnabled { get; set; } = true;
    
    /// <summary>
    /// Hour of day to run no-start check (24-hour format)
    /// </summary>
    public int NoStartCheckHour { get; set; } = 18; // 6 PM
    
    /// <summary>
    /// User IDs to notify for no-start escalations (JSON array)
    /// </summary>
    public string? NoStartNotifyUserIds { get; set; }
    
    // -- Delay Prediction Settings ----------------------------------------------
    /// <summary>
    /// Enable delay prediction
    /// </summary>
    public bool DelayPredictionEnabled { get; set; } = true;
    
    /// <summary>
    /// Percentage threshold for delay warning (e.g., 80% of time passed but less than 50% progress)
    /// </summary>
    public int DelayPredictionThreshold { get; set; } = 80;
    
    /// <summary>
    /// Number of days before end date to start delay prediction
    /// </summary>
    public int DelayPredictionDaysBeforeEnd { get; set; } = 3;
    
    /// <summary>
    /// User IDs to notify for delay predictions (JSON array)
    /// </summary>
    public string? DelayPredictionNotifyUserIds { get; set; }
    
    // -- Task Stuck Detection Settings ------------------------------------------
    /// <summary>
    /// Enable task stuck detection
    /// </summary>
    public bool TaskStuckDetectionEnabled { get; set; } = true;
    
    /// <summary>
    /// Number of days without update before task is considered stuck
    /// </summary>
    public int TaskStuckDays { get; set; } = 3;
    
    /// <summary>
    /// User IDs to notify for stuck tasks (JSON array)
    /// </summary>
    public string? TaskStuckNotifyUserIds { get; set; }
    
    // -- Review Timeout Settings ------------------------------------------------
    /// <summary>
    /// Enable review timeout detection
    /// </summary>
    public bool ReviewTimeoutEnabled { get; set; } = true;
    
    /// <summary>
    /// Hours after submission before review is considered overdue
    /// </summary>
    public int ReviewTimeoutHours { get; set; } = 24;
    
    /// <summary>
    /// User IDs to notify for review timeouts (JSON array)
    /// </summary>
    public string? ReviewTimeoutNotifyUserIds { get; set; }
    
    // -- Notification Settings --------------------------------------------------
    /// <summary>
    /// Send in-app notifications
    /// </summary>
    public bool SendInAppNotifications { get; set; } = true;
    
    /// <summary>
    /// Send push notifications
    /// </summary>
    public bool SendPushNotifications { get; set; } = true;
    
    /// <summary>
    /// Send email notifications
    /// </summary>
    public bool SendEmailNotifications { get; set; } = false;
    
    /// <summary>
    /// Send SMS notifications
    /// </summary>
    public bool SendSmsNotifications { get; set; } = false;
    
    // -- Daily Board Settings ---------------------------------------------------
    /// <summary>
    /// Hour to generate daily task board (24-hour format)
    /// </summary>
    public int DailyBoardGenerationHour { get; set; } = 6; // 6 AM
    
    /// <summary>
    /// User IDs to receive daily board summary (JSON array)
    /// </summary>
    public string? DailyBoardNotifyUserIds { get; set; }
    
    // -- Escalation Settings ----------------------------------------------------
    /// <summary>
    /// Auto-escalate after this many hours without acknowledgment
    /// </summary>
    public int AutoEscalateHours { get; set; } = 4;
    
    /// <summary>
    /// Maximum escalation level
    /// </summary>
    public int MaxEscalationLevel { get; set; } = 3;
    
    /// <summary>
    /// User IDs for escalation level 1 (JSON array)
    /// </summary>
    public string? EscalationLevel1UserIds { get; set; }
    
    /// <summary>
    /// User IDs for escalation level 2 (JSON array)
    /// </summary>
    public string? EscalationLevel2UserIds { get; set; }
    
    /// <summary>
    /// User IDs for escalation level 3 (JSON array)
    /// </summary>
    public string? EscalationLevel3UserIds { get; set; }
    
    // -- Quality Settings -------------------------------------------------------
    /// <summary>
    /// Require photo evidence for task completion
    /// </summary>
    public bool RequirePhotoEvidence { get; set; } = true;
    
    /// <summary>
    /// Minimum number of photos required
    /// </summary>
    public int MinimumPhotosRequired { get; set; } = 1;
    
    /// <summary>
    /// Require before/after photos
    /// </summary>
    public bool RequireBeforeAfterPhotos { get; set; } = false;
    
    /// <summary>
    /// Require video evidence for certain tasks
    /// </summary>
    public bool RequireVideoEvidence { get; set; } = false;
    
    // -- Approval Settings ------------------------------------------------------
    /// <summary>
    /// Require manager approval for task completion
    /// </summary>
    public bool RequireManagerApproval { get; set; } = true;
    
    /// <summary>
    /// Roles that can approve tasks (JSON array of role names)
    /// </summary>
    public string? ApproverRoles { get; set; } = "[\"Manager\", \"Supervisor\", \"CompanyOwner\"]";
    
    // -- Metadata ---------------------------------------------------------------
    /// <summary>
    /// Whether this configuration is active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Additional settings as JSON
    /// </summary>
    public string? AdditionalSettings { get; set; }
}

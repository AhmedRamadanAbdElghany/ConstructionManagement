using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Links a worker to a project with contact tracking
/// </summary>
public class ProjectWorkerContact : BaseEntity
{
    /// <summary>
    /// The worker
    /// </summary>
    public int WorkerId { get; set; }
    [ForeignKey(nameof(WorkerId))]
    public virtual Worker? Worker { get; set; }

    /// <summary>
    /// The project
    /// </summary>
    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }

    /// <summary>
    /// User who contacted/added the worker (typically project admin)
    /// </summary>
    public int ContactedByUserId { get; set; }
    [ForeignKey(nameof(ContactedByUserId))]
    public virtual User? ContactedByUser { get; set; }

    /// <summary>
    /// Date of first contact
    /// </summary>
    public DateTime ContactDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Purpose of contact (Hiring, Quote, Consultation, etc.)
    /// </summary>
    public string ContactPurpose { get; set; } = string.Empty;

    /// <summary>
    /// Was the worker hired for this project
    /// </summary>
    public bool IsHired { get; set; } = false;

    /// <summary>
    /// Hire start date
    /// </summary>
    public DateTime? HireStartDate { get; set; }

    /// <summary>
    /// Hire end date
    /// </summary>
    public DateTime? HireEndDate { get; set; }

    /// <summary>
    /// Agreed rate for this project
    /// </summary>
    public decimal? AgreedRate { get; set; }

    /// <summary>
    /// Work status (Pending, InProgress, Completed, Cancelled)
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Notes about the worker/project engagement
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Last contact date
    /// </summary>
    public DateTime? LastContactDate { get; set; }
}

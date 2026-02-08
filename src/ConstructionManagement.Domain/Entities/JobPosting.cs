using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Job posting for recruiting workers
/// </summary>
public class JobPosting : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    public string JobTitle { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Responsibilities { get; set; } = string.Empty;

    public JobStatus Status { get; set; } = JobStatus.Draft;
    public JobType JobType { get; set; } = JobType.FullTime;
    public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.MidLevel;

    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? SalaryCurrency { get; set; } = "EGP";

    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ApplicationDeadline { get; set; }
    public DateTime? StartDate { get; set; }

    public int? VacancyCount { get; set; } = 1;
    public int ApplicationsReceived { get; set; } = 0;

    public string? ContactName { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }

    public string? Benefits { get; set; } // JSON array of benefits
    public string? RequiredSkills { get; set; } // JSON array of skills
    public string? EducationLevel { get; set; }
    public string? LanguageRequirements { get; set; }

    public bool IsUrgent { get; set; } = false;
    public bool IsRemote { get; set; } = false;
}

public enum JobType
{
    FullTime = 0,
    PartTime = 1,
    Contract = 2,
    Temporary = 3,
    Internship = 4
}

public enum ExperienceLevel
{
    EntryLevel = 0,
    MidLevel = 1,
    SeniorLevel = 2,
    Lead = 3,
    Manager = 4,
    Executive = 5
}

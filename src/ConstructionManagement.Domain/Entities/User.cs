using System.ComponentModel.DataAnnotations.Schema;
namespace ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents a system user (employee, manager, engineer, client rep, etc.)
/// Central entity for authentication, roles, project assignments, and audit trails
/// </summary>
public class User : BaseEntity, ICompanyEntity
{
    // -- Basic Profile ---------------------------------------------------------
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal Salary { get; set; }
    public decimal? BaseSalary { get; set; }
    public int? ReportsToId { get; set; }
    [ForeignKey(nameof(ReportsToId))]
    public virtual User? ReportsTo { get; set; }

    /// <summary>
    /// The current type of the user (persisted for role switching)
    /// </summary>
    public UserType UserType { get; set; } = UserType.NormalUser;

    // -- Email Verification -----------------------------------------------------
    public bool IsEmailVerified { get; set; } = false;
    public string? EmailVerificationToken { get; set; }

    // -- Password Reset --------------------------------------------------------
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    // -- Password Change Required ------------------------------------------------
    /// <summary>
    /// When true, the user must change their password on next login.
    /// Set to true when a temporary password is generated.
    /// </summary>
    public bool RequiresPasswordChange { get; set; } = false;

    // -- Multi-Tenancy ----------------------------------------------------------
    /// Logical tenant identifier for data isolation (all data in single database)
    /// </summary>
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Company? Company { get; set; }



    // -- Core Navigation Properties --------------------------------------------

    /// <summary>
    /// Global/system roles assigned to this user (Admin, Accountant, etc.)
    /// </summary>
    public virtual ICollection<UserRole> UserRoles { get; set; }
        = new List<UserRole>();

    // -- Project Ownership & Management ----------------------------------------

    /// <summary>
    /// Projects where this user is the owner (usually the client or main contractor)
    /// </summary>
    public virtual ICollection<Project> OwnedProjects { get; set; }
        = new List<Project>();

    /// <summary>
    /// Projects where this user is assigned as General Manager
    /// </summary>
    public virtual ICollection<Project> ManagedProjects { get; set; }
        = new List<Project>();

    /// <summary>
    /// Projects that this user has closed/finalized
    /// </summary>
    public virtual ICollection<Project> ClosedProjects { get; set; }
        = new List<Project>();

    // -- Financial & Review Responsibilities -----------------------------------

    /// <summary>
    /// Transactions created by this user
    /// </summary>
    public virtual ICollection<Transaction> CreatedTransactions { get; set; }
        = new List<Transaction>();

    /// <summary>
    /// Transactions reviewed/approved by this user
    /// </summary>
    public virtual ICollection<Transaction> ReviewedTransactions { get; set; }
        = new List<Transaction>();

    /// <summary>
    /// Invoices reviewed by this user
    /// </summary>
    public virtual ICollection<ItemInvoice> ReviewedInvoices { get; set; }
        = new List<ItemInvoice>();

    // -- Media & Documentation -------------------------------------------------

    /// <summary>
    /// Media (photos, videos, documents) uploaded by this user
    /// </summary>
    public virtual ICollection<SiteMedia> UploadedMedias { get; set; }
        = new List<SiteMedia>();

    /// <summary>
    /// Media reviewed/approved by this user
    /// </summary>
    public virtual ICollection<SiteMedia> ReviewedMedias { get; set; }
        = new List<SiteMedia>();

    // -- Progress & Daily Logs -------------------------------------------------

    /// <summary>
    /// Daily logs created by this user
    /// </summary>
    public virtual ICollection<ItemDailyLog> CreatedDailyLogs { get; set; }
        = new List<ItemDailyLog>();

    /// <summary>
    /// Daily logs closed/finalized by this user
    /// </summary>
    public virtual ICollection<ItemDailyLog> ClosedDailyLogs { get; set; }
        = new List<ItemDailyLog>();

    /// <summary>
    /// Daily logs reopened by this user
    /// </summary>
    public virtual ICollection<ItemDailyLog> ReopenedDailyLogs { get; set; }
        = new List<ItemDailyLog>();

    // -- Notifications & Escalations -------------------------------------------

    /// <summary>
    /// All in-app notifications sent to this user
    /// </summary>
    public virtual ICollection<Notification> Notifications { get; set; }
        = new List<Notification>();

    /// <summary>
    /// Escalation messages/notifications received by this user
    /// </summary>
    public virtual ICollection<EscalationLog> ReceivedEscalations { get; set; }
        = new List<EscalationLog>();

    // -- Project Memberships (optional but very useful) ------------------------

    /// <summary>
    /// All projects this user is assigned to (as team member)
    /// </summary>
    public virtual ICollection<ProjectTeamMember> ProjectMemberships { get; set; }
        = new List<ProjectTeamMember>();
    // In User.cs – add these collections
    
    public virtual ICollection<ItemInvoice> CreatedInvoices { get; set; } = new List<ItemInvoice>();
    // In User.cs – add this collection
    public virtual ICollection<ProjectTeamMember> Subordinates { get; set; } = new List<ProjectTeamMember>();
    // or name it ReportsFrom / ManagedTeamMembers / etc.

    // -- Warehouse Partner Location Fields ------------------------------------
    
    /// <summary>
    /// Geographic latitude for location-based search
    /// </summary>
    public double? Latitude { get; set; }

    /// <summary>
    /// Geographic longitude for location-based search
    /// </summary>
    public double? Longitude { get; set; }

    /// <summary>
    /// Physical address
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// City name
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// District/neighborhood name
    /// </summary>
    public string? District { get; set; }

    /// <summary>
    /// Specialization for workers and engineers (plumbing, electrical, general construction, etc.)
    /// </summary>
    public string? Specialization { get; set; }

    /// <summary>
    /// Profile description/bio
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Profile image URL
    /// </summary>
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Indicates if profile is complete enough for search results
    /// </summary>
    public bool IsProfileComplete { get; set; } = false;

    /// <summary>
    /// Average rating from reviews (1-5)
    /// </summary>
    public decimal? AverageRating { get; set; }

    /// <summary>
    /// Total number of reviews
    /// </summary>
    public int? TotalReviews { get; set; }

    /// <summary>
    /// Employee skills for this user
    /// </summary>
    public virtual ICollection<EmployeeSkill> EmployeeSkills { get; set; } = new List<EmployeeSkill>();

    /// <summary>
    /// Indicates if user has set their location
    /// </summary>
    public bool HasLocation => Latitude.HasValue && Longitude.HasValue;

    // -- Optional helpers (not mapped) -----------------------------------------
    // [NotMapped]
    // public bool IsAdmin => UserRoles.Any(ur => ur.Role.Name == "Admin");

    // NOTE: Add tests for navigation consistency and role assignments.
}

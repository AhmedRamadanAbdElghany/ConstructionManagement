using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a construction project with its core metadata, team, financials, 
/// and related child entities (BOQ, payments, media, settings, rules, etc.)
/// </summary>
public class Project : BaseEntity, ICompanyEntity
{
    public string ProjectName { get; set; } = string.Empty;

    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    public string? Description { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public virtual ICollection<ItemInvoice> ItemInvoices { get; set; }
        = new List<ItemInvoice>();
    public virtual ICollection<EscalationLog> EscalationLogs { get; set; }
        = new List<EscalationLog>();
    public virtual ICollection<ClientPayment> ClientPayments { get; set; }
        = new List<ClientPayment>();

    public string Status { get; set; } = "????";  // New, InProgress, Delayed, Completed, Cancelled, etc.

    // -- Ownership & Management ------------------------------------------------
    public int OwnerUserId { get; set; }
    [ForeignKey(nameof(OwnerUserId))]
    public virtual User? Owner { get; set; }

    public int? GeneralManagerUserId { get; set; }
    [ForeignKey(nameof(GeneralManagerUserId))]
    public virtual User? GeneralManager { get; set; }

    public int? ClosedByUserId { get; set; }
    [ForeignKey(nameof(ClosedByUserId))]
    public virtual User? ClosedBy { get; set; }

    // ???? ???? Project
    public int? PackageId { get; set; }
    public virtual Package? Package { get; set; }

    /// <summary>
    /// Selected finishing package for the client (if applicable).
    /// </summary>
    public int? CompanyPackageId { get; set; }
    [ForeignKey(nameof(CompanyPackageId))]
    public virtual CompanyPackage? CompanyPackage { get; set; }

    /// <summary>
    /// Method to calculate costs when a client requests a change in the package.
    /// </summary>
    public ConstructionManagement.Domain.Enums.PackageVariationCalculation VariationCalculation { get; set; } 
        = ConstructionManagement.Domain.Enums.PackageVariationCalculation.AddFullCost;

    public bool IsClosed { get; set; } = false;
    public DateTime? ClosedAt { get; set; }

    // -- Financial & Accounting ------------------------------------------------
    public ConstructionManagement.Domain.Enums.CalculationMethod AccountingSystem { get; set; } = ConstructionManagement.Domain.Enums.CalculationMethod.Measured;
    public decimal? TotalContractValue { get; set; }

    // Navigation Properties -------------------------------------------------

    /// <summary>
    /// Hierarchical phases of the project.
    /// </summary>
    public virtual ICollection<Phase> Phases { get; set; }
        = new List<Phase>();

    // BOQ (Bill of Quantities) items
    // NOTE: In the new hierarchical structure, items should be accessed via Phases.
    public virtual ICollection<BOQItem> BOQItems { get; set; }
        = new List<BOQItem>();

    // Team members assigned to this project
    public virtual ICollection<ProjectTeamMember> TeamMembers { get; set; }
        = new List<ProjectTeamMember>();


    // 1:1 project-specific settings
    public virtual ProjectSettings? Settings { get; set; }

    // Approval workflow rules (global + item-specific)
    public virtual ICollection<ProjectApprovalRule> ApprovalRules { get; set; }
        = new List<ProjectApprovalRule>();

    // Media (photos, videos, documents) uploaded for this project
    public virtual ICollection<SiteMedia> SiteMedias { get; set; }
        = new List<SiteMedia>();

    // -- Recommended additional collections (add as you implement features) -----
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<BOQItemNote> Notes { get; set; }
            = new List<BOQItemNote>();
    public virtual ICollection<ProjectRole> ProjectRoles { get; set; } = new List<ProjectRole>();

    // NOTE: Add tests for status transitions and date validation.
}

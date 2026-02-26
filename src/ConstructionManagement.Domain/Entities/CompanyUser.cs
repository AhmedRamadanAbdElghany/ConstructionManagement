using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Junction table entity for many-to-many relationships between users and companies.
/// Supports:
/// - Clients working with multiple companies
/// - Workers employed by multiple companies
/// - Contract start/end dates
/// - Contract status tracking (Active, Terminated, Pending, Suspended)
/// - Role tracking per company
/// </summary>
public class CompanyUser : BaseEntity
{
    /// <summary>
    /// The user ID
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// The company ID
    /// </summary>
    public int CompanyId { get; set; }

    /// <summary>
    /// Role of the user in this company (e.g., Admin, Manager, Worker, Client)
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Contract start date
    /// </summary>
    public DateTime ContractStartDate { get; set; }

    /// <summary>
    /// Contract end date (null for indefinite contracts)
    /// </summary>
    public DateTime? ContractEndDate { get; set; }

    /// <summary>
    /// Current status of the contract with this company
    /// </summary>
    public Domain.Enums.ContractStatus Status { get; set; } = Domain.Enums.ContractStatus.Pending;

    /// <summary>
    /// Hourly or monthly rate for this company-specific role
    /// </summary>
    public decimal? HourlyRate { get; set; }

    /// <summary>
    /// Monthly salary for this company-specific role
    /// </summary>
    public decimal? MonthlySalary { get; set; }

    /// <summary>
    /// Additional notes about the contract
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Date when the user joined this company
    /// </summary>
    public DateTime JoinedAt { get; set; }

    /// <summary>
    /// Date when the contract was terminated (if applicable)
    /// </summary>
    public DateTime? TerminatedAt { get; set; }

    /// <summary>
    /// Reason for termination (if applicable)
    /// </summary>
    public string? TerminationReason { get; set; }

    // -- Navigation Properties --

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}

using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a registered worker (mason, painter, etc.)
/// </summary>
public class Worker : BaseEntity
{
    /// <summary>
    /// First name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Full name (computed)
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();

    /// <summary>
    /// Phone number for contact
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Alternative phone number
    /// </summary>
    public string? AlternativePhone { get; set; }

    /// <summary>
    /// Worker specialty (Mason, Painter, Electrician, Plumber, etc.)
    /// </summary>
    public string Specialty { get; set; } = string.Empty;

    /// <summary>
    /// Years of experience
    /// </summary>
    public int? YearsOfExperience { get; set; }

    /// <summary>
    /// Hourly rate
    /// </summary>
    public decimal? HourlyRate { get; set; }

    /// <summary>
    /// Daily rate
    /// </summary>
    public decimal? DailyRate { get; set; }

    /// <summary>
    /// Current location latitude
    /// </summary>
    public double? Latitude { get; set; }

    /// <summary>
    /// Current location longitude
    /// </summary>
    public double? Longitude { get; set; }

    /// <summary>
    /// Is worker available for hire
    /// </summary>
    public bool IsAvailable { get; set; } = true;

    /// <summary>
    /// Is worker verified by admin
    /// </summary>
    public bool IsVerified { get; set; } = false;

    /// <summary>
    /// Worker notes/description
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Profile image URL
    /// </summary>
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Linked user account (optional)
    /// </summary>
    public int? UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    // Navigation Properties
    public virtual ICollection<ProjectWorkerContact> ProjectContacts { get; set; } = new List<ProjectWorkerContact>();
}

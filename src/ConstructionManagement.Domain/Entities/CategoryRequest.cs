using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Request to create a new product category
/// Users can request new categories, Admin approves/rejects
/// </summary>
public class CategoryRequest : BaseEntity
{
    /// <summary>
    /// User who requested the category
    /// </summary>
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
    
    /// <summary>
    /// Category name in English
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Category name in Arabic
    /// </summary>
    public string? NameAr { get; set; }
    
    /// <summary>
    /// Description of the category
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Suggested parent category
    /// </summary>
    public int? ParentCategoryId { get; set; }
    [ForeignKey(nameof(ParentCategoryId))]
    public virtual ProductCategory? ParentCategory { get; set; }
    
    /// <summary>
    /// Status: Pending, Approved, Rejected
    /// </summary>
    public string Status { get; set; } = "Pending";
    
    /// <summary>
    /// Admin who reviewed the request
    /// </summary>
    public int? ReviewedByUserId { get; set; }
    [ForeignKey(nameof(ReviewedByUserId))]
    public virtual User? ReviewedBy { get; set; }
    
    /// <summary>
    /// When the request was reviewed
    /// </summary>
    public DateTime? ReviewedAt { get; set; }
    
    /// <summary>
    /// Rejection reason or notes
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// If approved, reference to the created category
    /// </summary>
    public int? CreatedCategoryId { get; set; }
    [ForeignKey(nameof(CreatedCategoryId))]
    public virtual ProductCategory? CreatedCategory { get; set; }
}

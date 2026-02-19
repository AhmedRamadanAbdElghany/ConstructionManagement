using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a monthly payroll record for an employee.
/// </summary>
public class Payroll : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
    
    public int Month { get; set; }
    public int Year { get; set; }
    
    public decimal BaseSalary { get; set; }
    public decimal Bonuses { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary { get; set; }
    
    public bool IsPaid { get; set; }
    public DateTime? PaymentDate { get; set; }
    
    public string? Note { get; set; }
}

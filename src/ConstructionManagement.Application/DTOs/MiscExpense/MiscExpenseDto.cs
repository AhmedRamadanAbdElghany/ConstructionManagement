using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.MiscExpense
{
    public class MiscExpenseDto
    {
        public int Id { get; set; }
        public string ExpenseNumber { get; set; } = string.Empty;
        public DateTime ExpenseDate { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? ReceiptUrl { get; set; }
        public string? OriginalFileName { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string ApprovalStatus { get; set; } = string.Empty;
        public int? ApprovedByUserId { get; set; }
        public string? ApprovedByUserName { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectionReason { get; set; }
        public int CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateMiscExpenseRequest
    {
        public int CreatedByUserId { get; set; }
        public DateTime ExpenseDate { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public int? ProjectId { get; set; }
        public IFormFile? ReceiptFile { get; set; }
    }

    public class ReviewMiscExpenseRequest
    {
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class MiscExpenseSummary
    {
        public int TotalExpenses { get; set; }
        public decimal TotalAmount { get; set; }
        public int PendingApprovals { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
        public Dictionary<string, decimal> ExpensesByCategory { get; set; } = new();
    }
}

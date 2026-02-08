namespace ConstructionManagement.Application.DTOs.CashVoucher
{
    public class CashVoucherDto
    {
        public int Id { get; set; }
        public string VoucherNumber { get; set; } = string.Empty;
        public DateTime VoucherDate { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public int? WorkerUserId { get; set; }
        public string? WorkerUserName { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = string.Empty;
        public int? ApprovedByUserId { get; set; }
        public string? ApprovedByUserName { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectionReason { get; set; }
        public int CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCashVoucherRequest
    {
        public DateTime VoucherDate { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public int? WorkerUserId { get; set; }
        public int? ProjectId { get; set; }
        public string Category { get; set; } = string.Empty; // DailyWage, Bonus, Advance, etc.
    }

    public class ReviewCashVoucherRequest
    {
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class CashVoucherSummary
    {
        public int TotalVouchers { get; set; }
        public decimal TotalAmount { get; set; }
        public int PendingApprovals { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
    }
}

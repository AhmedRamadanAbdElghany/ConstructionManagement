using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    #region Report Request DTOs

    public class FinancialReportRequest
    {
        public int CompanyId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ReportFormat Format { get; set; } = ReportFormat.Excel;
        public string? Language { get; set; } = "ar";
    }

    public class ProjectFinancialReportRequest : FinancialReportRequest
    {
        public int ProjectId { get; set; }
        public bool IncludeTransactions { get; set; } = true;
        public bool IncludeInvoices { get; set; } = true;
        public bool IncludeClientPayments { get; set; } = true;
        public bool IncludeProfitability { get; set; } = true;
    }

    public class CashFlowReportRequest : FinancialReportRequest
    {
        public CashFlowGrouping Grouping { get; set; } = CashFlowGrouping.Monthly;
        public List<int>? ProjectIds { get; set; }
    }

    public class ProfitLossReportRequest : FinancialReportRequest
    {
        public ProfitLossGrouping Grouping { get; set; } = ProfitLossGrouping.ByProject;
    }

    public class TaxReportRequest : FinancialReportRequest
    {
        public string? TaxType { get; set; }
    }

    public enum ReportFormat
    {
        Excel = 0,
        Pdf = 1,
        Csv = 2
    }

    public enum CashFlowGrouping
    {
        Daily = 0,
        Weekly = 1,
        Monthly = 2,
        Quarterly = 3,
        Yearly = 4
    }

    public enum ProfitLossGrouping
    {
        ByProject = 0,
        ByCategory = 1,
        ByPhase = 2,
        ByMonth = 3
    }

    #endregion

    #region Report Data DTOs

    public class FinancialReportData
    {
        public string ReportTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Currency { get; set; } = "EGP";
        public string Language { get; set; } = "ar";
        
        // Summary
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit { get; set; }
        public decimal ProfitMargin { get; set; }
        
        // Details
        public List<RevenueItem> RevenueItems { get; set; } = new();
        public List<ExpenseItem> ExpenseItems { get; set; } = new();
        public List<CashFlowItem> CashFlowItems { get; set; } = new();
    }

    public class ProjectFinancialReportData : FinancialReportData
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectStatus { get; set; } = string.Empty;
        public decimal ProjectBudget { get; set; }
        public decimal BudgetUsed { get; set; }
        public decimal BudgetRemaining { get; set; }
        public decimal BudgetUtilizationPercent { get; set; }
        
        public List<ProjectTransactionItem> Transactions { get; set; } = new();
        public List<ProjectInvoiceItem> Invoices { get; set; } = new();
        public List<ProjectClientPaymentItem> ClientPayments { get; set; } = new();
        public List<ProjectProfitabilityItem> ProfitabilityByPhase { get; set; } = new();
    }

    public class CashFlowReportData
    {
        public string ReportTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Currency { get; set; } = "EGP";
        
        public decimal OpeningBalance { get; set; }
        public decimal TotalInflows { get; set; }
        public decimal TotalOutflows { get; set; }
        public decimal NetCashFlow { get; set; }
        public decimal ClosingBalance { get; set; }
        
        public List<CashFlowPeriod> Periods { get; set; } = new();
    }

    public class ProfitLossReportData
    {
        public string ReportTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Currency { get; set; } = "EGP";
        
        public decimal GrossRevenue { get; set; }
        public decimal CostOfGoodsSold { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal GrossProfitMargin { get; set; }
        
        public decimal OperatingExpenses { get; set; }
        public decimal OperatingIncome { get; set; }
        public decimal OperatingMargin { get; set; }
        
        public decimal OtherIncome { get; set; }
        public decimal OtherExpenses { get; set; }
        
        public decimal NetIncome { get; set; }
        public decimal NetProfitMargin { get; set; }
        
        public List<RevenueCategory> RevenueByCategory { get; set; } = new();
        public List<ExpenseCategory> ExpensesByCategory { get; set; } = new();
        public List<ProjectProfitSummary> ProjectSummaries { get; set; } = new();
    }

    #endregion

    #region Item DTOs

    public class RevenueItem
    {
        public DateTime Date { get; set; }
        public string Source { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ProjectName { get; set; }
        public decimal Amount { get; set; }
        public string? Reference { get; set; }
    }

    public class ExpenseItem
    {
        public DateTime Date { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ProjectName { get; set; }
        public decimal Amount { get; set; }
        public string? Vendor { get; set; }
        public string? Reference { get; set; }
        public string? Status { get; set; }
    }

    public class CashFlowItem
    {
        public DateTime Date { get; set; }
        public string Type { get; set; } = string.Empty; // Inflow, Outflow
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal RunningBalance { get; set; }
    }

    public class CashFlowPeriod
    {
        public string PeriodLabel { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal Inflows { get; set; }
        public decimal Outflows { get; set; }
        public decimal NetCashFlow { get; set; }
        public decimal ClosingBalance { get; set; }
        public List<CashFlowDetail> Details { get; set; } = new();
    }

    public class CashFlowDetail
    {
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class ProjectTransactionItem
    {
        public DateTime Date { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ItemName { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ApprovedBy { get; set; }
    }

    public class ProjectInvoiceItem
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string? Vendor { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Category { get; set; }
    }

    public class ProjectClientPaymentItem
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string PaymentNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class ProjectProfitabilityItem
    {
        public string PhaseName { get; set; } = string.Empty;
        public decimal BudgetedAmount { get; set; }
        public decimal ActualCost { get; set; }
        public decimal Variance { get; set; }
        public decimal VariancePercent { get; set; }
        public decimal ProgressPercent { get; set; }
    }

    public class RevenueCategory
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
        public int TransactionCount { get; set; }
    }

    public class ExpenseCategory
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
        public int TransactionCount { get; set; }
    }

    public class ProjectProfitSummary
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public decimal Expenses { get; set; }
        public decimal Profit { get; set; }
        public decimal ProfitMargin { get; set; }
    }

    #endregion
}

using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IFinancialReportService
    {
        /// <summary>
        /// Generate a comprehensive financial report for a company
        /// </summary>
        Task<ExportResult> GenerateFinancialReportAsync(FinancialReportRequest request);
        
        /// <summary>
        /// Generate a detailed financial report for a specific project
        /// </summary>
        Task<ExportResult> GenerateProjectFinancialReportAsync(ProjectFinancialReportRequest request);
        
        /// <summary>
        /// Generate a cash flow report
        /// </summary>
        Task<ExportResult> GenerateCashFlowReportAsync(CashFlowReportRequest request);
        
        /// <summary>
        /// Generate a profit and loss statement
        /// </summary>
        Task<ExportResult> GenerateProfitLossReportAsync(ProfitLossReportRequest request);
        
        /// <summary>
        /// Generate a tax report
        /// </summary>
        Task<ExportResult> GenerateTaxReportAsync(TaxReportRequest request);
        
        /// <summary>
        /// Get financial report data (without export) for preview
        /// </summary>
        Task<FinancialReportData> GetFinancialReportDataAsync(FinancialReportRequest request);
        
        /// <summary>
        /// Get project financial report data (without export) for preview
        /// </summary>
        Task<ProjectFinancialReportData> GetProjectFinancialReportDataAsync(ProjectFinancialReportRequest request);
        
        /// <summary>
        /// Get cash flow report data (without export) for preview
        /// </summary>
        Task<CashFlowReportData> GetCashFlowReportDataAsync(CashFlowReportRequest request);
        
        /// <summary>
        /// Get profit and loss report data (without export) for preview
        /// </summary>
        Task<ProfitLossReportData> GetProfitLossReportDataAsync(ProfitLossReportRequest request);
    }
}

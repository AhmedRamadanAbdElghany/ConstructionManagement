using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    public class FinancialReportService : IFinancialReportService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FinancialReportService> _logger;

        public FinancialReportService(
            ApplicationDbContext context,
            ILogger<FinancialReportService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Report Generation

        public async Task<ExportResult> GenerateFinancialReportAsync(FinancialReportRequest request)
        {
            try
            {
                var data = await GetFinancialReportDataAsync(request);
                return await ExportReportAsync(data, request.Format, "Financial_Report", request.Language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating financial report");
                return new ExportResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        public async Task<ExportResult> GenerateProjectFinancialReportAsync(ProjectFinancialReportRequest request)
        {
            try
            {
                var data = await GetProjectFinancialReportDataAsync(request);
                return await ExportReportAsync(data, request.Format, $"Project_{request.ProjectId}_Financial_Report", request.Language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating project financial report");
                return new ExportResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        public async Task<ExportResult> GenerateCashFlowReportAsync(CashFlowReportRequest request)
        {
            try
            {
                var data = await GetCashFlowReportDataAsync(request);
                return await ExportReportAsync(data, request.Format, "Cash_Flow_Report", request.Language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating cash flow report");
                return new ExportResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        public async Task<ExportResult> GenerateProfitLossReportAsync(ProfitLossReportRequest request)
        {
            try
            {
                var data = await GetProfitLossReportDataAsync(request);
                return await ExportReportAsync(data, request.Format, "Profit_Loss_Statement", request.Language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating profit/loss report");
                return new ExportResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        public async Task<ExportResult> GenerateTaxReportAsync(TaxReportRequest request)
        {
            try
            {
                var data = await GetFinancialReportDataAsync(request);
                // Tax-specific formatting can be applied here
                return await ExportReportAsync(data, request.Format, "Tax_Report", request.Language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating tax report");
                return new ExportResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        #endregion

        #region Data Retrieval

        public async Task<FinancialReportData> GetFinancialReportDataAsync(FinancialReportRequest request)
        {
            var company = await _context.Companies.FindAsync(request.CompanyId);
            var settings = await _context.CompanySettings.FirstOrDefaultAsync(s => s.CompanyId == request.CompanyId);

            // Get transactions
            var transactions = await _context.Transactions
                .Include(t => t.Project)
                .Include(t => t.ProjectItem)
                .Where(t => t.Project.CompanyId == request.CompanyId &&
                           t.TransactionDate >= request.StartDate &&
                           t.TransactionDate <= request.EndDate)
                .ToListAsync();

            // Get client payments
            var clientPayments = await _context.ClientPayments
                .Include(p => p.Project)
                .Where(p => p.Project.CompanyId == request.CompanyId &&
                           p.PaymentDate >= request.StartDate &&
                           p.PaymentDate <= request.EndDate)
                .ToListAsync();

            // Calculate totals
            var totalRevenue = clientPayments.Where(p => p.Status == ClientPaymentStatus.Confirmed).Sum(p => p.Amount);
            var totalExpenses = transactions.Where(t => t.Status == TransactionStatus.Approved).Sum(t => t.Amount);
            var netProfit = totalRevenue - totalExpenses;

            // Build revenue items
            var revenueItems = clientPayments
                .Where(p => p.Status == ClientPaymentStatus.Confirmed)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new RevenueItem
                {
                    Date = p.PaymentDate,
                    Source = "Client Payment",
                    Description = p.Notes ?? $"Payment for project",
                    ProjectName = p.Project?.Name,
                    Amount = p.Amount,
                    Reference = p.PaymentNumber
                }).ToList();

            // Build expense items
            var expenseItems = transactions
                .Where(t => t.Status == TransactionStatus.Approved)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new ExpenseItem
                {
                    Date = t.TransactionDate,
                    Category = t.Type.ToString(),
                    Description = t.Description,
                    ProjectName = t.Project?.Name,
                    Amount = t.Amount,
                    Vendor = t.SupplierName,
                    Reference = t.InvoiceNumber,
                    Status = t.Status.ToString()
                }).ToList();

            // Build cash flow items
            var cashFlowItems = new List<CashFlowItem>();
            decimal runningBalance = 0;

            var allItems = transactions
                .Where(t => t.Status == TransactionStatus.Approved)
                .Select(t => new { Date = t.TransactionDate, Type = "Outflow", Amount = t.Amount, Description = t.Description })
                .Union(clientPayments
                    .Where(p => p.Status == ClientPaymentStatus.Confirmed)
                    .Select(p => new { Date = p.PaymentDate, Type = "Inflow", Amount = p.Amount, Description = p.Notes ?? "Client Payment" }))
                .OrderBy(x => x.Date);

            foreach (var item in allItems)
            {
                if (item.Type == "Inflow")
                    runningBalance += item.Amount;
                else
                    runningBalance -= item.Amount;

                cashFlowItems.Add(new CashFlowItem
                {
                    Date = item.Date,
                    Type = item.Type,
                    Category = item.Type == "Inflow" ? "Revenue" : "Expense",
                    Description = item.Description,
                    Amount = item.Amount,
                    RunningBalance = runningBalance
                });
            }

            return new FinancialReportData
            {
                ReportTitle = GetLocalizedTitle("Financial Report", request.Language),
                CompanyName = company?.Name ?? string.Empty,
                GeneratedAt = DateTime.UtcNow,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Currency = settings?.Currency ?? "EGP",
                Language = request.Language ?? "ar",
                TotalRevenue = totalRevenue,
                TotalExpenses = totalExpenses,
                NetProfit = netProfit,
                ProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
                RevenueItems = revenueItems,
                ExpenseItems = expenseItems,
                CashFlowItems = cashFlowItems
            };
        }

        public async Task<ProjectFinancialReportData> GetProjectFinancialReportDataAsync(ProjectFinancialReportRequest request)
        {
            var project = await _context.Projects
                .Include(p => p.Phases)
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId);

            if (project == null)
                throw new InvalidOperationException($"Project with ID {request.ProjectId} not found");

            var company = await _context.Companies.FindAsync(request.CompanyId);
            var settings = await _context.CompanySettings.FirstOrDefaultAsync(s => s.CompanyId == request.CompanyId);

            var baseData = await GetFinancialReportDataAsync(request);
            var data = new ProjectFinancialReportData
            {
                ReportTitle = GetLocalizedTitle($"Project Financial Report - {project.Name}", request.Language),
                CompanyName = baseData.CompanyName,
                GeneratedAt = baseData.GeneratedAt,
                StartDate = baseData.StartDate,
                EndDate = baseData.EndDate,
                Currency = baseData.Currency,
                Language = baseData.Language,
                TotalRevenue = baseData.TotalRevenue,
                TotalExpenses = baseData.TotalExpenses,
                NetProfit = baseData.NetProfit,
                ProfitMargin = baseData.ProfitMargin,
                RevenueItems = baseData.RevenueItems.Where(r => r.ProjectName == project.Name).ToList(),
                ExpenseItems = baseData.ExpenseItems.Where(e => e.ProjectName == project.Name).ToList(),
                CashFlowItems = baseData.CashFlowItems,
                ProjectId = request.ProjectId,
                ProjectName = project.Name,
                ProjectStatus = project.Status.ToString(),
                ProjectBudget = project.Budget ?? 0,
                BudgetUsed = baseData.TotalExpenses,
                BudgetRemaining = (project.Budget ?? 0) - baseData.TotalExpenses,
                BudgetUtilizationPercent = project.Budget > 0 ? (baseData.TotalExpenses / (project.Budget ?? 1)) * 100 : 0
            };

            // Transactions
            if (request.IncludeTransactions)
            {
                var transactions = await _context.Transactions
                    .Include(t => t.ProjectItem)
                    .Where(t => t.ProjectId == request.ProjectId &&
                               t.TransactionDate >= request.StartDate &&
                               t.TransactionDate <= request.EndDate)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();

                data.Transactions = transactions.Select(t => new ProjectTransactionItem
                {
                    Date = t.TransactionDate,
                    Type = t.Type.ToString(),
                    Description = t.Description,
                    ItemName = t.ProjectItem?.ItemName,
                    Amount = t.Amount,
                    Status = t.Status.ToString(),
                    ApprovedBy = t.ReviewedBy?.FullName
                }).ToList();
            }

            // Invoices
            if (request.IncludeInvoices)
            {
                var invoices = await _context.ItemInvoices
                    .Include(i => i.ProjectItem)
                    .Where(i => i.ProjectItem.ProjectId == request.ProjectId &&
                               i.InvoiceDate >= request.StartDate &&
                               i.InvoiceDate <= request.EndDate)
                    .OrderByDescending(i => i.InvoiceDate)
                    .ToListAsync();

                data.Invoices = invoices.Select(i => new ProjectInvoiceItem
                {
                    Id = i.Id,
                    Date = i.InvoiceDate,
                    InvoiceNumber = i.InvoiceNumber,
                    Vendor = i.SupplierVendor,
                    Amount = i.NetAmount,
                    Status = i.Status.ToString(),
                    Category = i.InvoiceType
                }).ToList();
            }

            // Client Payments
            if (request.IncludeClientPayments)
            {
                var payments = await _context.ClientPayments
                    .Where(p => p.ProjectId == request.ProjectId &&
                               p.PaymentDate >= request.StartDate &&
                               p.PaymentDate <= request.EndDate)
                    .OrderByDescending(p => p.PaymentDate)
                    .ToListAsync();

                data.ClientPayments = payments.Select(p => new ProjectClientPaymentItem
                {
                    Id = p.Id,
                    Date = p.PaymentDate,
                    PaymentNumber = p.PaymentNumber ?? $"PAY-{p.Id}",
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod.ToString(),
                    Status = p.Status.ToString(),
                    Notes = p.Notes
                }).ToList();
            }

            // Profitability by Phase
            if (request.IncludeProfitability && project.Phases.Any())
            {
                var phases = project.Phases.Where(p => p.ParentPhaseId == null).ToList();
                
                foreach (var phase in phases)
                {
                    var phaseItems = await _context.ProjectItems
                        .Where(pi => pi.PhaseId == phase.Id)
                        .ToListAsync();

                    var budgetedAmount = phaseItems.Sum(pi => pi.EstimatedTotalCost ?? 0);
                    var actualCost = phaseItems.Sum(pi => pi.BudgetUsed ?? 0);

                    data.ProfitabilityByPhase.Add(new ProjectProfitabilityItem
                    {
                        PhaseName = phase.Name,
                        BudgetedAmount = budgetedAmount,
                        ActualCost = actualCost,
                        Variance = budgetedAmount - actualCost,
                        VariancePercent = budgetedAmount > 0 ? ((budgetedAmount - actualCost) / budgetedAmount) * 100 : 0,
                        ProgressPercent = 0 // Phase progress would need to be calculated from items
                    });
                }
            }

            return data;
        }

        public async Task<CashFlowReportData> GetCashFlowReportDataAsync(CashFlowReportRequest request)
        {
            var company = await _context.Companies.FindAsync(request.CompanyId);
            var settings = await _context.CompanySettings.FirstOrDefaultAsync(s => s.CompanyId == request.CompanyId);

            // Get all transactions and payments
            var transactionsQuery = _context.Transactions
                .Include(t => t.Project)
                .Where(t => t.Project.CompanyId == request.CompanyId &&
                           t.TransactionDate >= request.StartDate &&
                           t.TransactionDate <= request.EndDate &&
                           t.Status == TransactionStatus.Approved);

            if (request.ProjectIds != null && request.ProjectIds.Any())
            {
                transactionsQuery = transactionsQuery.Where(t => request.ProjectIds.Contains(t.ProjectId));
            }

            var transactions = await transactionsQuery.ToListAsync();

            var paymentsQuery = _context.ClientPayments
                .Include(p => p.Project)
                .Where(p => p.Project.CompanyId == request.CompanyId &&
                           p.PaymentDate >= request.StartDate &&
                           p.PaymentDate <= request.EndDate &&
                           p.Status == ClientPaymentStatus.Confirmed);

            if (request.ProjectIds != null && request.ProjectIds.Any())
            {
                paymentsQuery = paymentsQuery.Where(p => request.ProjectIds.Contains(p.ProjectId));
            }

            var payments = await paymentsQuery.ToListAsync();

            // Calculate totals
            var totalInflows = payments.Sum(p => p.Amount);
            var totalOutflows = transactions.Sum(t => t.Amount);
            var netCashFlow = totalInflows - totalOutflows;

            // Calculate opening balance (sum of all transactions before start date)
            var openingInflows = await _context.ClientPayments
                .Include(p => p.Project)
                .Where(p => p.Project.CompanyId == request.CompanyId &&
                           p.PaymentDate < request.StartDate &&
                           p.Status == ClientPaymentStatus.Confirmed)
                .SumAsync(p => p.Amount);

            var openingOutflows = await _context.Transactions
                .Include(t => t.Project)
                .Where(t => t.Project.CompanyId == request.CompanyId &&
                           t.TransactionDate < request.StartDate &&
                           t.Status == TransactionStatus.Approved)
                .SumAsync(t => t.Amount);

            var openingBalance = openingInflows - openingOutflows;

            // Group by periods
            var periods = GenerateCashFlowPeriods(request.StartDate, request.EndDate, request.Grouping);
            
            foreach (var period in periods)
            {
                var periodInflows = payments
                    .Where(p => p.PaymentDate >= period.StartDate && p.PaymentDate <= period.EndDate)
                    .Sum(p => p.Amount);

                var periodOutflows = transactions
                    .Where(t => t.TransactionDate >= period.StartDate && t.TransactionDate <= period.EndDate)
                    .Sum(t => t.Amount);

                period.Inflows = periodInflows;
                period.Outflows = periodOutflows;
                period.NetCashFlow = periodInflows - periodOutflows;

                // Add details
                foreach (var payment in payments.Where(p => p.PaymentDate >= period.StartDate && p.PaymentDate <= period.EndDate))
                {
                    period.Details.Add(new CashFlowDetail
                    {
                        Date = payment.PaymentDate,
                        Description = payment.Notes ?? "Client Payment",
                        Type = "Inflow",
                        Amount = payment.Amount
                    });
                }

                foreach (var transaction in transactions.Where(t => t.TransactionDate >= period.StartDate && t.TransactionDate <= period.EndDate))
                {
                    period.Details.Add(new CashFlowDetail
                    {
                        Date = transaction.TransactionDate,
                        Description = transaction.Description,
                        Type = "Outflow",
                        Amount = transaction.Amount
                    });
                }
            }

            // Calculate running balances
            var runningBalance = openingBalance;
            foreach (var period in periods)
            {
                period.OpeningBalance = runningBalance;
                runningBalance += period.NetCashFlow;
                period.ClosingBalance = runningBalance;
            }

            return new CashFlowReportData
            {
                ReportTitle = GetLocalizedTitle("Cash Flow Report", request.Language),
                CompanyName = company?.Name ?? string.Empty,
                GeneratedAt = DateTime.UtcNow,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Currency = settings?.Currency ?? "EGP",
                OpeningBalance = openingBalance,
                TotalInflows = totalInflows,
                TotalOutflows = totalOutflows,
                NetCashFlow = netCashFlow,
                ClosingBalance = openingBalance + netCashFlow,
                Periods = periods
            };
        }

        public async Task<ProfitLossReportData> GetProfitLossReportDataAsync(ProfitLossReportRequest request)
        {
            var company = await _context.Companies.FindAsync(request.CompanyId);
            var settings = await _context.CompanySettings.FirstOrDefaultAsync(s => s.CompanyId == request.CompanyId);

            var baseData = await GetFinancialReportDataAsync(request);

            // Get projects for the company
            var projects = await _context.Projects
                .Where(p => p.CompanyId == request.CompanyId)
                .ToListAsync();

            // Calculate revenue by category
            var revenueByCategory = baseData.RevenueItems
                .GroupBy(r => r.Source)
                .Select(g => new RevenueCategory
                {
                    CategoryName = g.Key,
                    Amount = g.Sum(r => r.Amount),
                    Percentage = baseData.TotalRevenue > 0 ? (g.Sum(r => r.Amount) / baseData.TotalRevenue) * 100 : 0,
                    TransactionCount = g.Count()
                }).ToList();

            // Calculate expenses by category
            var expensesByCategory = baseData.ExpenseItems
                .GroupBy(e => e.Category)
                .Select(g => new ExpenseCategory
                {
                    CategoryName = g.Key,
                    Amount = g.Sum(e => e.Amount),
                    Percentage = baseData.TotalExpenses > 0 ? (g.Sum(e => e.Amount) / baseData.TotalExpenses) * 100 : 0,
                    TransactionCount = g.Count()
                }).ToList();

            // Calculate project summaries
            var projectSummaries = new List<ProjectProfitSummary>();
            foreach (var project in projects)
            {
                var projectRevenue = baseData.RevenueItems
                    .Where(r => r.ProjectName == project.Name)
                    .Sum(r => r.Amount);

                var projectExpenses = baseData.ExpenseItems
                    .Where(e => e.ProjectName == project.Name)
                    .Sum(e => e.Amount);

                if (projectRevenue > 0 || projectExpenses > 0)
                {
                    projectSummaries.Add(new ProjectProfitSummary
                    {
                        ProjectId = project.Id,
                        ProjectName = project.Name,
                        Revenue = projectRevenue,
                        Expenses = projectExpenses,
                        Profit = projectRevenue - projectExpenses,
                        ProfitMargin = projectRevenue > 0 ? ((projectRevenue - projectExpenses) / projectRevenue) * 100 : 0
                    });
                }
            }

            // Calculate P&L metrics
            var costOfGoodsSold = baseData.ExpenseItems
                .Where(e => e.Category == "Materials" || e.Category == "Labor" || e.Category == "Equipment")
                .Sum(e => e.Amount);

            var operatingExpenses = baseData.TotalExpenses - costOfGoodsSold;
            var grossProfit = baseData.TotalRevenue - costOfGoodsSold;
            var operatingIncome = grossProfit - operatingExpenses;

            return new ProfitLossReportData
            {
                ReportTitle = GetLocalizedTitle("Profit and Loss Statement", request.Language),
                CompanyName = company?.Name ?? string.Empty,
                GeneratedAt = DateTime.UtcNow,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Currency = settings?.Currency ?? "EGP",
                GrossRevenue = baseData.TotalRevenue,
                CostOfGoodsSold = costOfGoodsSold,
                GrossProfit = grossProfit,
                GrossProfitMargin = baseData.TotalRevenue > 0 ? (grossProfit / baseData.TotalRevenue) * 100 : 0,
                OperatingExpenses = operatingExpenses,
                OperatingIncome = operatingIncome,
                OperatingMargin = baseData.TotalRevenue > 0 ? (operatingIncome / baseData.TotalRevenue) * 100 : 0,
                OtherIncome = 0,
                OtherExpenses = 0,
                NetIncome = baseData.NetProfit,
                NetProfitMargin = baseData.ProfitMargin,
                RevenueByCategory = revenueByCategory,
                ExpensesByCategory = expensesByCategory,
                ProjectSummaries = projectSummaries
            };
        }

        #endregion

        #region Export Helpers

        private async Task<ExportResult> ExportReportAsync<T>(T data, ReportFormat format, string fileName, string? language)
        {
            return format switch
            {
                ReportFormat.Excel => await ExportToExcelAsync(data, fileName),
                ReportFormat.Pdf => await ExportToPdfAsync(data, fileName, language),
                ReportFormat.Csv => ExportToCsv(data, fileName),
                _ => throw new ArgumentException($"Unsupported format: {format}")
            };
        }

        private async Task<ExportResult> ExportToExcelAsync<T>(T data, string fileName)
        {
            try
            {
                // Simple CSV-based Excel export (can be enhanced with EPPlus or similar library)
                var csvContent = GenerateCsvContent(data);
                var bytes = Encoding.UTF8.GetBytes(csvContent);

                return new ExportResult
                {
                    Success = true,
                    FileName = $"{fileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv",
                    ContentType = "text/csv",
                    FileContent = bytes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to Excel");
                return new ExportResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        private async Task<ExportResult> ExportToPdfAsync<T>(T data, string fileName, string? language)
        {
            try
            {
                // Generate HTML content for PDF
                var htmlContent = GenerateHtmlContent(data, language);
                var bytes = Encoding.UTF8.GetBytes(htmlContent);

                // Note: In production, use a PDF library like iTextSharp, Puppeteer, or similar
                // For now, returning HTML that can be converted to PDF
                return new ExportResult
                {
                    Success = true,
                    FileName = $"{fileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.html",
                    ContentType = "text/html",
                    FileContent = bytes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to PDF");
                return new ExportResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        private ExportResult ExportToCsv<T>(T data, string fileName)
        {
            try
            {
                var csvContent = GenerateCsvContent(data);
                var bytes = Encoding.UTF8.GetBytes(csvContent);

                return new ExportResult
                {
                    Success = true,
                    FileName = $"{fileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv",
                    ContentType = "text/csv",
                    FileContent = bytes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to CSV");
                return new ExportResult { Success = false, ErrorMessage = ex.Message };
            }
        }

        private string GenerateCsvContent<T>(T data)
        {
            var sb = new StringBuilder();

            if (data is FinancialReportData financialData)
            {
                sb.AppendLine("Financial Report");
                sb.AppendLine($"Company,{financialData.CompanyName}");
                sb.AppendLine($"Period,{financialData.StartDate:yyyy-MM-dd} to {financialData.EndDate:yyyy-MM-dd}");
                sb.AppendLine($"Generated,{financialData.GeneratedAt:yyyy-MM-dd HH:mm}");
                sb.AppendLine();
                sb.AppendLine("Summary");
                sb.AppendLine($"Total Revenue,{financialData.TotalRevenue}");
                sb.AppendLine($"Total Expenses,{financialData.TotalExpenses}");
                sb.AppendLine($"Net Profit,{financialData.NetProfit}");
                sb.AppendLine($"Profit Margin,{financialData.ProfitMargin:F2}%");
                sb.AppendLine();
                sb.AppendLine("Revenue Items");
                sb.AppendLine("Date,Source,Description,Project,Amount,Reference");
                foreach (var item in financialData.RevenueItems)
                {
                    sb.AppendLine($"\"{item.Date:yyyy-MM-dd}\",\"{item.Source}\",\"{item.Description}\",\"{item.ProjectName}\",{item.Amount},\"{item.Reference}\"");
                }
                sb.AppendLine();
                sb.AppendLine("Expense Items");
                sb.AppendLine("Date,Category,Description,Project,Amount,Vendor,Reference,Status");
                foreach (var item in financialData.ExpenseItems)
                {
                    sb.AppendLine($"\"{item.Date:yyyy-MM-dd}\",\"{item.Category}\",\"{item.Description}\",\"{item.ProjectName}\",{item.Amount},\"{item.Vendor}\",\"{item.Reference}\",\"{item.Status}\"");
                }
            }
            else if (data is CashFlowReportData cashFlowData)
            {
                sb.AppendLine("Cash Flow Report");
                sb.AppendLine($"Company,{cashFlowData.CompanyName}");
                sb.AppendLine($"Period,{cashFlowData.StartDate:yyyy-MM-dd} to {cashFlowData.EndDate:yyyy-MM-dd}");
                sb.AppendLine();
                sb.AppendLine("Summary");
                sb.AppendLine($"Opening Balance,{cashFlowData.OpeningBalance}");
                sb.AppendLine($"Total Inflows,{cashFlowData.TotalInflows}");
                sb.AppendLine($"Total Outflows,{cashFlowData.TotalOutflows}");
                sb.AppendLine($"Net Cash Flow,{cashFlowData.NetCashFlow}");
                sb.AppendLine($"Closing Balance,{cashFlowData.ClosingBalance}");
                sb.AppendLine();
                sb.AppendLine("Period,Start Date,End Date,Opening,Inflows,Outflows,Net,Closing");
                foreach (var period in cashFlowData.Periods)
                {
                    sb.AppendLine($"\"{period.PeriodLabel}\",\"{period.StartDate:yyyy-MM-dd}\",\"{period.EndDate:yyyy-MM-dd}\",{period.OpeningBalance},{period.Inflows},{period.Outflows},{period.NetCashFlow},{period.ClosingBalance}");
                }
            }
            else if (data is ProfitLossReportData plData)
            {
                sb.AppendLine("Profit and Loss Statement");
                sb.AppendLine($"Company,{plData.CompanyName}");
                sb.AppendLine($"Period,{plData.StartDate:yyyy-MM-dd} to {plData.EndDate:yyyy-MM-dd}");
                sb.AppendLine();
                sb.AppendLine("Summary");
                sb.AppendLine($"Gross Revenue,{plData.GrossRevenue}");
                sb.AppendLine($"Cost of Goods Sold,{plData.CostOfGoodsSold}");
                sb.AppendLine($"Gross Profit,{plData.GrossProfit}");
                sb.AppendLine($"Gross Profit Margin,{plData.GrossProfitMargin:F2}%");
                sb.AppendLine($"Operating Expenses,{plData.OperatingExpenses}");
                sb.AppendLine($"Operating Income,{plData.OperatingIncome}");
                sb.AppendLine($"Net Income,{plData.NetIncome}");
                sb.AppendLine($"Net Profit Margin,{plData.NetProfitMargin:F2}%");
                sb.AppendLine();
                sb.AppendLine("Revenue by Category");
                sb.AppendLine("Category,Amount,Percentage,Count");
                foreach (var cat in plData.RevenueByCategory)
                {
                    sb.AppendLine($"\"{cat.CategoryName}\",{cat.Amount},{cat.Percentage:F2}%,{cat.TransactionCount}");
                }
                sb.AppendLine();
                sb.AppendLine("Expenses by Category");
                sb.AppendLine("Category,Amount,Percentage,Count");
                foreach (var cat in plData.ExpensesByCategory)
                {
                    sb.AppendLine($"\"{cat.CategoryName}\",{cat.Amount},{cat.Percentage:F2}%,{cat.TransactionCount}");
                }
            }

            return sb.ToString();
        }

        private string GenerateHtmlContent<T>(T data, string? language)
        {
            var isArabic = language == "ar";
            var dir = isArabic ? "rtl" : "ltr";
            var sb = new StringBuilder();

            sb.AppendLine($"<!DOCTYPE html><html dir=\"{dir}\" lang=\"{language ?? "en"}\"><head>");
            sb.AppendLine("<meta charset=\"UTF-8\">");
            sb.AppendLine("<style>");
            sb.AppendLine("body { font-family: Arial, sans-serif; margin: 20px; }");
            sb.AppendLine("h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }");
            sb.AppendLine("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
            sb.AppendLine("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
            sb.AppendLine("th { background-color: #4CAF50; color: white; }");
            sb.AppendLine("tr:nth-child(even) { background-color: #f2f2f2; }");
            sb.AppendLine(".summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }");
            sb.AppendLine(".positive { color: green; }");
            sb.AppendLine(".negative { color: red; }");
            sb.AppendLine("</style></head><body>");

            if (data is FinancialReportData financialData)
            {
                sb.AppendLine($"<h1>{financialData.ReportTitle}</h1>");
                sb.AppendLine($"<p><strong>Company:</strong> {financialData.CompanyName}</p>");
                sb.AppendLine($"<p><strong>Period:</strong> {financialData.StartDate:yyyy-MM-dd} to {financialData.EndDate:yyyy-MM-dd}</p>");
                sb.AppendLine($"<p><strong>Generated:</strong> {financialData.GeneratedAt:yyyy-MM-dd HH:mm}</p>");
                
                sb.AppendLine("<div class=\"summary\">");
                sb.AppendLine($"<h3>Summary</h3>");
                sb.AppendLine($"<p><strong>Total Revenue:</strong> {financialData.Currency} {financialData.TotalRevenue:N2}</p>");
                sb.AppendLine($"<p><strong>Total Expenses:</strong> {financialData.Currency} {financialData.TotalExpenses:N2}</p>");
                sb.AppendLine($"<p><strong>Net Profit:</strong> <span class=\"{(financialData.NetProfit >= 0 ? "positive" : "negative")}\">{financialData.Currency} {financialData.NetProfit:N2}</span></p>");
                sb.AppendLine($"<p><strong>Profit Margin:</strong> {financialData.ProfitMargin:F2}%</p>");
                sb.AppendLine("</div>");
            }

            sb.AppendLine("</body></html>");
            return sb.ToString();
        }

        #endregion

        #region Private Helpers

        private List<CashFlowPeriod> GenerateCashFlowPeriods(DateTime startDate, DateTime endDate, CashFlowGrouping grouping)
        {
            var periods = new List<CashFlowPeriod>();

            switch (grouping)
            {
                case CashFlowGrouping.Daily:
                    for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
                    {
                        periods.Add(new CashFlowPeriod
                        {
                            PeriodLabel = date.ToString("yyyy-MM-dd"),
                            StartDate = date,
                            EndDate = date.AddDays(1).AddSeconds(-1)
                        });
                    }
                    break;

                case CashFlowGrouping.Weekly:
                    var weekStart = startDate.Date;
                    while (weekStart <= endDate.Date)
                    {
                        var weekEnd = weekStart.AddDays(6);
                        if (weekEnd > endDate.Date) weekEnd = endDate.Date;

                        periods.Add(new CashFlowPeriod
                        {
                            PeriodLabel = $"Week of {weekStart:yyyy-MM-dd}",
                            StartDate = weekStart,
                            EndDate = weekEnd
                        });

                        weekStart = weekEnd.AddDays(1);
                    }
                    break;

                case CashFlowGrouping.Monthly:
                    var monthStart = new DateTime(startDate.Year, startDate.Month, 1);
                    while (monthStart <= endDate)
                    {
                        var monthEnd = monthStart.AddMonths(1).AddDays(-1);
                        if (monthEnd > endDate) monthEnd = endDate;

                        periods.Add(new CashFlowPeriod
                        {
                            PeriodLabel = monthStart.ToString("MMMM yyyy"),
                            StartDate = monthStart,
                            EndDate = monthEnd
                        });

                        monthStart = monthStart.AddMonths(1);
                    }
                    break;

                case CashFlowGrouping.Quarterly:
                    var quarterStart = new DateTime(startDate.Year, ((startDate.Month - 1) / 3) * 3 + 1, 1);
                    while (quarterStart <= endDate)
                    {
                        var quarterEnd = quarterStart.AddMonths(3).AddDays(-1);
                        if (quarterEnd > endDate) quarterEnd = endDate;

                        var quarter = (quarterStart.Month - 1) / 3 + 1;
                        periods.Add(new CashFlowPeriod
                        {
                            PeriodLabel = $"Q{quarter} {quarterStart.Year}",
                            StartDate = quarterStart,
                            EndDate = quarterEnd
                        });

                        quarterStart = quarterStart.AddMonths(3);
                    }
                    break;

                case CashFlowGrouping.Yearly:
                    var yearStart = new DateTime(startDate.Year, 1, 1);
                    while (yearStart <= endDate)
                    {
                        var yearEnd = yearStart.AddYears(1).AddDays(-1);
                        if (yearEnd > endDate) yearEnd = endDate;

                        periods.Add(new CashFlowPeriod
                        {
                            PeriodLabel = yearStart.Year.ToString(),
                            StartDate = yearStart,
                            EndDate = yearEnd
                        });

                        yearStart = yearStart.AddYears(1);
                    }
                    break;
            }

            return periods;
        }

        private string GetLocalizedTitle(string englishTitle, string? language)
        {
            if (language == "ar")
            {
                return englishTitle switch
                {
                    "Financial Report" => "التقرير المالي",
                    "Cash Flow Report" => "تقرير التدفق النقدي",
                    "Profit and Loss Statement" => "قائمة الأرباح والخسائر",
                    "Tax Report" => "التقرير الضريبي",
                    _ => englishTitle
                };
            }
            return englishTitle;
        }

        #endregion
    }
}

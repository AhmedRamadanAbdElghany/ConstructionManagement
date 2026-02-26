using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DomainPaymentStatus = ConstructionManagement.Domain.Entities.SubcontractorPaymentStatus;
using DomainPaymentType = ConstructionManagement.Domain.Entities.SubcontractorPaymentType;
using DtoPaymentStatus = ConstructionManagement.Application.DTOs.SubcontractorPaymentStatus;
using DtoPaymentType = ConstructionManagement.Application.DTOs.SubcontractorPaymentType;
using ContractStatus = ConstructionManagement.Domain.Entities.SubcontractorContractStatus;

namespace ConstructionManagement.Infrastructure.Services
{
    public class SubcontractorService : ISubcontractorService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICompanyContext _companyContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SubcontractorService(
            ApplicationDbContext context,
            ICompanyContext companyContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _companyContext = companyContext;
            _httpContextAccessor = httpContextAccessor;
        }

        private int? GetCurrentCompanyId() => _companyContext.CompanyId;

        #region Subcontractor CRUD

        public async Task<IEnumerable<SubcontractorDto>> GetSubcontractorsAsync(int? companyId = null)
        {
            var query = _context.Subcontractors.AsQueryable();

            var effectiveCompanyId = companyId ?? GetCurrentCompanyId() ?? 0;
            if (effectiveCompanyId > 0)
            {
                query = query.Where(s => s.CompanyId == effectiveCompanyId);
            }

            var subcontractors = await query
                .OrderByDescending(s => s.AverageRating ?? 0)
                .ToListAsync();

            return subcontractors.Select(MapToDto);
        }

        public async Task<SubcontractorDto?> GetSubcontractorByIdAsync(int id)
        {
            var subcontractor = await _context.Subcontractors
                .FirstOrDefaultAsync(s => s.Id == id);

            return subcontractor != null ? MapToDto(subcontractor) : null;
        }

        public async Task<SubcontractorDto> CreateSubcontractorAsync(CreateSubcontractorRequest request)
        {
            var subcontractor = new Subcontractor
            {
                CompanyId = GetCurrentCompanyId(),
                Name = request.Name,
                Phone = request.Phone,
                Email = request.Email,
                Address = request.Address,
                TaxNumber = request.TaxNumber,
                ContactPerson = request.ContactPerson,
                Notes = request.Notes,
                TradeSpecialty = request.TradeSpecialty,
                LicenseNumber = request.LicenseNumber,
                InsurancePolicyNumber = request.InsurancePolicyNumber,
                InsuranceExpiryDate = request.InsuranceExpiryDate,
                InsuranceCertificateUrl = request.InsuranceCertificateUrl,
                RetentionPercentage = request.RetentionPercentage ?? 5,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Subcontractors.Add(subcontractor);
            await _context.SaveChangesAsync();

            return MapToDto(subcontractor);
        }

        public async Task<SubcontractorDto> UpdateSubcontractorAsync(int id, UpdateSubcontractorRequest request)
        {
            var subcontractor = await _context.Subcontractors.FindAsync(id)
                ?? throw new KeyNotFoundException($"Subcontractor with ID {id} not found");

            if (request.Name != null) subcontractor.Name = request.Name;
            if (request.Phone != null) subcontractor.Phone = request.Phone;
            if (request.Email != null) subcontractor.Email = request.Email;
            if (request.Address != null) subcontractor.Address = request.Address;
            if (request.TaxNumber != null) subcontractor.TaxNumber = request.TaxNumber;
            if (request.ContactPerson != null) subcontractor.ContactPerson = request.ContactPerson;
            if (request.Notes != null) subcontractor.Notes = request.Notes;
            if (request.TradeSpecialty != null) subcontractor.TradeSpecialty = request.TradeSpecialty;
            if (request.LicenseNumber != null) subcontractor.LicenseNumber = request.LicenseNumber;
            if (request.InsurancePolicyNumber != null) subcontractor.InsurancePolicyNumber = request.InsurancePolicyNumber;
            if (request.InsuranceExpiryDate.HasValue) subcontractor.InsuranceExpiryDate = request.InsuranceExpiryDate;
            if (request.InsuranceCertificateUrl != null) subcontractor.InsuranceCertificateUrl = request.InsuranceCertificateUrl;
            if (request.RetentionPercentage.HasValue) subcontractor.RetentionPercentage = request.RetentionPercentage;
            if (request.IsActive.HasValue) subcontractor.IsActive = request.IsActive.Value;

            subcontractor.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(subcontractor);
        }

        public async Task<bool> DeleteSubcontractorAsync(int id)
        {
            var subcontractor = await _context.Subcontractors.FindAsync(id);
            if (subcontractor == null) return false;

            _context.Subcontractors.Remove(subcontractor);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SubcontractorDto> ApproveSubcontractorAsync(int id, ApproveSubcontractorRequest request)
        {
            var subcontractor = await _context.Subcontractors.FindAsync(id)
                ?? throw new KeyNotFoundException($"Subcontractor with ID {id} not found");

            subcontractor.IsApproved = true;
            subcontractor.ApprovalDate = DateTime.UtcNow;
            subcontractor.ApprovedBy = _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "System";
            if (request.Notes != null) subcontractor.Notes += $"\nApproval notes: {request.Notes}";

            await _context.SaveChangesAsync();
            return MapToDto(subcontractor);
        }

        #endregion

        #region Contract Management

        public async Task<IEnumerable<SubcontractorContractDto>> GetContractsAsync(int subcontractorId)
        {
            var contracts = await _context.SubcontractorContracts
                .Include(c => c.Subcontractor)
                .Include(c => c.Project)
                .Where(c => c.SubcontractorId == subcontractorId)
                .OrderByDescending(c => c.ContractDate)
                .ToListAsync();

            return contracts.Select(MapContractToDto);
        }

        public async Task<SubcontractorContractDto?> GetContractByIdAsync(int id)
        {
            var contract = await _context.SubcontractorContracts
                .Include(c => c.Subcontractor)
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.Id == id);

            return contract != null ? MapContractToDto(contract) : null;
        }

        public async Task<SubcontractorContractDto> CreateContractAsync(CreateContractRequest request)
        {
            var subcontractor = await _context.Subcontractors.FindAsync(request.SubcontractorId)
                ?? throw new KeyNotFoundException($"Subcontractor with ID {request.SubcontractorId} not found");

            var contractNumber = $"SC-{DateTime.UtcNow:yyyy}-{DateTime.UtcNow.Month:D2}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var retentionAmount = request.ContractAmount * ((request.RetentionPercentage ?? subcontractor.RetentionPercentage ?? 5) / 100);

            var contract = new SubcontractorContract
            {
                CompanyId = GetCurrentCompanyId(),
                SubcontractorId = request.SubcontractorId,
                ProjectId = request.ProjectId,
                ContractNumber = contractNumber,
                Title = request.Title,
                Description = request.Description,
                ContractType = request.ContractType,
                ScopeOfWork = request.ScopeOfWork,
                ContractAmount = request.ContractAmount,
                RetentionAmount = retentionAmount,
                Currency = request.Currency ?? "EGP",
                ContractDate = DateTime.UtcNow,
                StartDate = request.StartDate,
                PlannedEndDate = request.PlannedEndDate,
                PaymentTerms = request.PaymentTerms,
                ContractDocumentUrl = request.ContractDocumentUrl,
                InsuranceCertificateUrl = request.InsuranceCertificateUrl,
                WorkPermitUrl = request.WorkPermitUrl,
                Status = ContractStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };

            _context.SubcontractorContracts.Add(contract);
            await _context.SaveChangesAsync();

            return MapContractToDto(contract);
        }

        public async Task<SubcontractorContractDto> UpdateContractAsync(int id, UpdateContractRequest request)
        {
            var contract = await _context.SubcontractorContracts.FindAsync(id)
                ?? throw new KeyNotFoundException($"Contract with ID {id} not found");

            if (request.Title != null) contract.Title = request.Title;
            if (request.Description != null) contract.Description = request.Description;
            if (request.ContractType != null) contract.ContractType = request.ContractType;
            if (request.ScopeOfWork != null) contract.ScopeOfWork = request.ScopeOfWork;
            if (request.ContractAmount.HasValue) contract.ContractAmount = request.ContractAmount.Value;
            if (request.ApprovedVariationOrders.HasValue) contract.ApprovedVariationOrders = request.ApprovedVariationOrders.Value;
            if (request.PlannedEndDate.HasValue) contract.PlannedEndDate = request.PlannedEndDate.Value;
            if (request.ActualEndDate.HasValue) contract.ActualEndDate = request.ActualEndDate.Value;
            if (request.StatusNotes != null) contract.StatusNotes = request.StatusNotes;
            if (request.ContractDocumentUrl != null) contract.ContractDocumentUrl = request.ContractDocumentUrl;
            if (request.CompletionCertificateUrl != null) contract.CompletionCertificateUrl = request.CompletionCertificateUrl;

            await _context.SaveChangesAsync();
            return MapContractToDto(contract);
        }

        public async Task<bool> DeleteContractAsync(int id)
        {
            var contract = await _context.SubcontractorContracts.FindAsync(id);
            if (contract == null) return false;

            _context.SubcontractorContracts.Remove(contract);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SubcontractorContractDto> UpdateContractStatusAsync(int id, ContractStatusUpdateRequest request)
        {
            var contract = await _context.SubcontractorContracts.FindAsync(id)
                ?? throw new KeyNotFoundException($"Contract with ID {id} not found");

            if (Enum.TryParse<ContractStatus>(request.Status, out var status))
            {
                contract.Status = status;
                contract.StatusDate = DateTime.UtcNow;
            }
            if (request.Notes != null) contract.StatusNotes = request.Notes;

            if (status == ContractStatus.Completed)
            {
                contract.ActualEndDate = DateTime.UtcNow;
                await UpdateSubcontractorContractMetrics(contract.SubcontractorId);
            }

            await _context.SaveChangesAsync();
            return MapContractToDto(contract);
        }

        public async Task<IEnumerable<SubcontractorContractDto>> GetActiveContractsAsync()
        {
            var contracts = await _context.SubcontractorContracts
                .Include(c => c.Subcontractor)
                .Include(c => c.Project)
                .Where(c => c.Status == ContractStatus.Active)
                .OrderBy(c => c.PlannedEndDate)
                .ToListAsync();

            return contracts.Select(MapContractToDto);
        }

        #endregion

        #region Payment Management

        public async Task<IEnumerable<SubcontractorPaymentDto>> GetPaymentsAsync(int subcontractorId)
        {
            var payments = await _context.SubcontractorPayments
                .Include(p => p.Subcontractor)
                .Include(p => p.Contract)
                .Include(p => p.Project)
                .Where(p => p.SubcontractorId == subcontractorId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return payments.Select(MapPaymentToDto);
        }

        public async Task<SubcontractorPaymentDto?> GetPaymentByIdAsync(int id)
        {
            var payment = await _context.SubcontractorPayments
                .Include(p => p.Subcontractor)
                .Include(p => p.Contract)
                .Include(p => p.Project)
                .FirstOrDefaultAsync(p => p.Id == id);

            return payment != null ? MapPaymentToDto(payment) : null;
        }

        public async Task<SubcontractorPaymentDto> CreatePaymentAsync(CreatePaymentRequest request)
        {
            var subcontractor = await _context.Subcontractors.FindAsync(request.SubcontractorId)
                ?? throw new KeyNotFoundException($"Subcontractor with ID {request.SubcontractorId} not found");

            var paymentNumber = $"PAY-{DateTime.UtcNow:yyyyMM}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var netPayment = request.Amount
                - (request.RetentionDeducted ?? 0)
                - (request.TaxDeducted ?? 0)
                - (request.OtherDeductions ?? 0)
                - (request.LiquidatedDamages ?? 0);

            var payment = new SubcontractorPayment
            {
                CompanyId = GetCurrentCompanyId(),
                SubcontractorId = request.SubcontractorId,
                ContractId = request.ContractId,
                ProjectId = request.ProjectId,
                PaymentNumber = paymentNumber,
                PaymentType = (DomainPaymentType)(int)request.PaymentType,
                Description = request.Description,
                Amount = request.Amount,
                Currency = request.Currency ?? "EGP",
                RetentionDeducted = request.RetentionDeducted,
                TaxDeducted = request.TaxDeducted,
                OtherDeductions = request.OtherDeductions,
                LiquidatedDamages = request.LiquidatedDamages,
                NetPayment = netPayment,
                InvoiceDate = request.InvoiceDate,
                DueDate = request.DueDate,
                MilestoneName = request.MilestoneName,
                MilestoneNumber = request.MilestoneNumber,
                InvoiceUrl = request.InvoiceUrl,
                Status = DomainPaymentStatus.Pending,
                RequestedBy = _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.SubcontractorPayments.Add(payment);

            // Update subcontractor balance
            subcontractor.TotalPaid += netPayment;
            subcontractor.CurrentBalance -= netPayment;

            await _context.SaveChangesAsync();
            return MapPaymentToDto(payment);
        }

        public async Task<SubcontractorPaymentDto> UpdatePaymentStatusAsync(int id, UpdatePaymentStatusRequest request)
        {
            var payment = await _context.SubcontractorPayments.FindAsync(id)
                ?? throw new KeyNotFoundException($"Payment with ID {id} not found");

            var newStatus = (DomainPaymentStatus)(int)request.Status;
            payment.Status = newStatus;
            payment.StatusDate = DateTime.UtcNow;
            if (request.Notes != null) payment.StatusNotes = request.Notes;

            if (newStatus == DomainPaymentStatus.Approved)
            {
                payment.ApprovedBy = _httpContextAccessor.HttpContext?.User?.Identity?.Name;
                payment.ApprovalDate = DateTime.UtcNow;
            }

            if (newStatus == DomainPaymentStatus.Paid)
            {
                payment.PaymentDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return MapPaymentToDto(payment);
        }

        public async Task<IEnumerable<SubcontractorPaymentDto>> GetPendingPaymentsAsync()
        {
            var payments = await _context.SubcontractorPayments
                .Include(p => p.Subcontractor)
                .Include(p => p.Contract)
                .Where(p => p.Status == DomainPaymentStatus.Pending || p.Status == DomainPaymentStatus.Submitted)
                .OrderBy(p => p.DueDate)
                .ToListAsync();

            return payments.Select(MapPaymentToDto);
        }

        #endregion

        #region Rating Management

        public async Task<IEnumerable<SubcontractorRatingDto>> GetRatingsAsync(int subcontractorId)
        {
            var ratings = await _context.SubcontractorRatings
                .Include(r => r.Subcontractor)
                .Where(r => r.SubcontractorId == subcontractorId)
                .OrderByDescending(r => r.EvaluationDate)
                .ToListAsync();

            return ratings.Select(MapRatingToDto);
        }

        public async Task<SubcontractorRatingDto?> GetRatingByIdAsync(int id)
        {
            var rating = await _context.SubcontractorRatings
                .Include(r => r.Subcontractor)
                .FirstOrDefaultAsync(r => r.Id == id);

            return rating != null ? MapRatingToDto(rating) : null;
        }

        public async Task<SubcontractorRatingDto> CreateRatingAsync(CreateRatingRequest request)
        {
            var subcontractor = await _context.Subcontractors.FindAsync(request.SubcontractorId)
                ?? throw new KeyNotFoundException($"Subcontractor with ID {request.SubcontractorId} not found");

            var rating = new SubcontractorRating
            {
                CompanyId = GetCurrentCompanyId(),
                SubcontractorId = request.SubcontractorId,
                ContractId = request.ContractId,
                ProjectId = request.ProjectId,
                EvaluatorId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "",
                EvaluatorName = _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "",
                EvaluatorRole = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value ?? "",
                EvaluationDate = DateTime.UtcNow,
                ContractCompletionDate = request.ContractCompletionDate,
                QualityOfWork = request.QualityOfWork,
                Timeliness = request.Timeliness,
                Communication = request.Communication,
                Professionalism = request.Professionalism,
                SafetyCompliance = request.SafetyCompliance,
                BudgetAdherence = request.BudgetAdherence,
                ProblemSolving = request.ProblemSolving,
                Documentation = request.Documentation,
                Strengths = request.Strengths,
                Weaknesses = request.Weaknesses,
                Recommendations = request.Recommendations,
                GeneralComments = request.GeneralComments,
                DaysEarly = request.DaysEarly,
                DaysLate = request.DaysLate,
                BudgetVariance = request.BudgetVariance,
                WouldRecommend = request.WouldRecommend,
                WouldHireAgain = request.WouldHireAgain,
                CreatedAt = DateTime.UtcNow
            };

            // Calculate overall rating and grade
            rating.OverallRating = RatingGradeCalculator.CalculateOverallRating(rating);
            rating.RatingGrade = RatingGradeCalculator.CalculateGrade(rating.OverallRating);

            _context.SubcontractorRatings.Add(rating);

            // Recalculate subcontractor metrics
            await UpdateSubcontractorMetrics(request.SubcontractorId);

            return MapRatingToDto(rating);
        }

        public async Task<SubcontractorRatingDto> FinalizeRatingAsync(int id)
        {
            var rating = await _context.SubcontractorRatings.FindAsync(id)
                ?? throw new KeyNotFoundException($"Rating with ID {id} not found");

            rating.IsFinalized = true;
            rating.ReviewedBy = _httpContextAccessor.HttpContext?.User?.Identity?.Name;
            rating.ReviewDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapRatingToDto(rating);
        }

        public async Task<RatingSummaryDto> GetRatingSummaryAsync(int subcontractorId)
        {
            var ratings = await _context.SubcontractorRatings
                .Where(r => r.SubcontractorId == subcontractorId && r.IsFinalized)
                .OrderByDescending(r => r.EvaluationDate)
                .ToListAsync();

            var subcontractor = await _context.Subcontractors.FindAsync(subcontractorId);

            var summary = new RatingSummaryDto
            {
                SubcontractorId = subcontractorId,
                SubcontractorName = subcontractor?.Name ?? "",
                TotalRatings = ratings.Count,
                RecentRatings = ratings.Take(5).Select(MapRatingToDto).ToList()
            };

            if (ratings.Any())
            {
                summary.AverageQualityOfWork = ratings.Average(r => r.QualityOfWork);
                summary.AverageTimeliness = ratings.Average(r => r.Timeliness);
                summary.AverageCommunication = ratings.Average(r => r.Communication);
                summary.AverageProfessionalism = ratings.Average(r => r.Professionalism);
                summary.AverageSafetyCompliance = ratings.Average(r => r.SafetyCompliance);
                summary.AverageBudgetAdherence = ratings.Average(r => r.BudgetAdherence);
                summary.AverageProblemSolving = ratings.Average(r => r.ProblemSolving);
                summary.AverageDocumentation = ratings.Average(r => r.Documentation);
                summary.OverallAverageRating = ratings.Average(r => r.OverallRating);
                summary.RatingGrade = RatingGradeCalculator.CalculateGrade(summary.OverallAverageRating);
                summary.RecommendationRate = ratings.Count(r => r.WouldRecommend) / (double)ratings.Count * 100;
            }

            return summary;
        }

        #endregion

        #region Summary & Analytics

        public async Task<SubcontractorSummaryDto> GetSummaryAsync()
        {
            var companyId = GetCurrentCompanyId();
            var subcontractors = await _context.Subcontractors
                .Where(s => s.CompanyId == companyId)
                .ToListAsync();

            var now = DateTime.UtcNow;
            var thirtyDaysFromNow = now.AddDays(30);

            var summary = new SubcontractorSummaryDto
            {
                TotalSubcontractors = subcontractors.Count,
                ActiveSubcontractors = subcontractors.Count(s => s.IsActive),
                PendingApproval = subcontractors.Count(s => !s.IsApproved),
                ApprovedSubcontractors = subcontractors.Count(s => s.IsApproved),
                ExpiringInsurance = subcontractors.Count(s => s.InsuranceExpiryDate.HasValue && 
                    s.InsuranceExpiryDate.Value > now && 
                    s.InsuranceExpiryDate.Value <= thirtyDaysFromNow),
                TotalOutstandingBalance = subcontractors.Sum(s => s.CurrentBalance ?? 0),
                AverageRating = subcontractors.Where(s => s.AverageRating.HasValue).Average(s => s.AverageRating ?? 0),
                TopRatedSubcontractors = subcontractors
                    .Where(s => s.IsApproved && s.AverageRating.HasValue)
                    .OrderByDescending(s => s.AverageRating)
                    .Take(5)
                    .Select(s => s.Name)
                    .ToList(),
                TradeSpecialties = subcontractors
                    .Where(s => !string.IsNullOrEmpty(s.TradeSpecialty))
                    .Select(s => s.TradeSpecialty!)
                    .Distinct()
                    .ToList()
            };

            return summary;
        }

        public async Task RecalculateSubcontractorMetricsAsync(int subcontractorId)
        {
            await UpdateSubcontractorMetrics(subcontractorId);
        }

        public async Task<IEnumerable<SubcontractorDto>> GetTopRatedSubcontractorsAsync(int count = 5)
        {
            var subcontractors = await _context.Subcontractors
                .Where(s => s.IsApproved && s.AverageRating.HasValue)
                .OrderByDescending(s => s.AverageRating)
                .Take(count)
                .ToListAsync();

            return subcontractors.Select(MapToDto);
        }

        public async Task<IEnumerable<SubcontractorDto>> GetSubcontractorsByTradeAsync(string trade)
        {
            var subcontractors = await _context.Subcontractors
                .Where(s => s.TradeSpecialty == trade && s.IsActive)
                .OrderByDescending(s => s.AverageRating)
                .ToListAsync();

            return subcontractors.Select(MapToDto);
        }

        public async Task<IEnumerable<SubcontractorDto>> GetSubcontractorsWithExpiringInsuranceAsync(int daysAhead = 30)
        {
            var now = DateTime.UtcNow;
            var expiryDate = now.AddDays(daysAhead);

            var subcontractors = await _context.Subcontractors
                .Where(s => s.InsuranceExpiryDate.HasValue && 
                    s.InsuranceExpiryDate.Value > now && 
                    s.InsuranceExpiryDate.Value <= expiryDate)
                .OrderBy(s => s.InsuranceExpiryDate)
                .ToListAsync();

            return subcontractors.Select(MapToDto);
        }

        #endregion

        #region Private Helpers

        private async Task UpdateSubcontractorMetrics(int subcontractorId)
        {
            var ratings = await _context.SubcontractorRatings
                .Where(r => r.SubcontractorId == subcontractorId && r.IsFinalized)
                .ToListAsync();

            var contracts = await _context.SubcontractorContracts
                .Where(c => c.SubcontractorId == subcontractorId)
                .ToListAsync();

            var subcontractor = await _context.Subcontractors.FindAsync(subcontractorId);
            if (subcontractor == null) return;

            if (ratings.Any())
            {
                subcontractor.AverageRating = ratings.Average(r => r.OverallRating);
            }

            subcontractor.TotalProjectsCompleted = contracts.Count(c => c.Status == ContractStatus.Completed);
            subcontractor.TotalProjectsOngoing = contracts.Count(c => c.Status == ContractStatus.Active);

            await _context.SaveChangesAsync();
        }

        private async Task UpdateSubcontractorContractMetrics(int subcontractorId)
        {
            await UpdateSubcontractorMetrics(subcontractorId);
        }

        private SubcontractorDto MapToDto(Subcontractor subcontractor)
        {
            return new SubcontractorDto
            {
                Id = subcontractor.Id,
                CompanyId = subcontractor.CompanyId,
                Name = subcontractor.Name,
                Phone = subcontractor.Phone,
                Email = subcontractor.Email,
                Address = subcontractor.Address,
                TaxNumber = subcontractor.TaxNumber,
                ContactPerson = subcontractor.ContactPerson,
                Notes = subcontractor.Notes,
                TradeSpecialty = subcontractor.TradeSpecialty,
                LicenseNumber = subcontractor.LicenseNumber,
                InsurancePolicyNumber = subcontractor.InsurancePolicyNumber,
                InsuranceExpiryDate = subcontractor.InsuranceExpiryDate,
                InsuranceCertificateUrl = subcontractor.InsuranceCertificateUrl,
                CurrentBalance = subcontractor.CurrentBalance,
                TotalPaid = subcontractor.TotalPaid,
                TotalInvoiced = subcontractor.TotalInvoiced,
                RetentionPercentage = subcontractor.RetentionPercentage,
                IsActive = subcontractor.IsActive,
                IsApproved = subcontractor.IsApproved,
                ApprovalDate = subcontractor.ApprovalDate,
                ApprovedBy = subcontractor.ApprovedBy,
                AverageRating = subcontractor.AverageRating,
                TotalProjectsCompleted = subcontractor.TotalProjectsCompleted,
                TotalProjectsOngoing = subcontractor.TotalProjectsOngoing,
                OnTimeDeliveryRate = subcontractor.OnTimeDeliveryRate,
                QualityScore = subcontractor.QualityScore,
                SafetyScore = subcontractor.SafetyScore,
                RatingGrade = subcontractor.AverageRating.HasValue 
                    ? RatingGradeCalculator.CalculateGrade(subcontractor.AverageRating.Value) 
                    : null,
                CreatedAt = subcontractor.CreatedAt,
                UpdatedAt = subcontractor.UpdatedAt
            };
        }

        private SubcontractorContractDto MapContractToDto(SubcontractorContract contract)
        {
            return new SubcontractorContractDto
            {
                Id = contract.Id,
                CompanyId = contract.CompanyId ?? 0,
                SubcontractorId = contract.SubcontractorId,
                SubcontractorName = contract.Subcontractor?.Name,
                ProjectId = contract.ProjectId ?? 0,
                ProjectName = contract.Project?.Name,
                ContractNumber = contract.ContractNumber,
                Title = contract.Title,
                Description = contract.Description,
                ContractType = contract.ContractType,
                ScopeOfWork = contract.ScopeOfWork,
                ContractAmount = contract.ContractAmount,
                ApprovedVariationOrders = contract.ApprovedVariationOrders,
                RetentionAmount = contract.RetentionAmount,
                FinalAmount = contract.FinalAmount,
                Currency = contract.Currency,
                ContractDate = contract.ContractDate,
                StartDate = contract.StartDate,
                PlannedEndDate = contract.PlannedEndDate,
                ActualEndDate = contract.ActualEndDate,
                CompletionCertificateDate = contract.CompletionCertificateDate,
                Status = contract.Status.ToString(),
                StatusNotes = contract.StatusNotes,
                ContractDocumentUrl = contract.ContractDocumentUrl,
                InsuranceCertificateUrl = contract.InsuranceCertificateUrl,
                WorkPermitUrl = contract.WorkPermitUrl,
                CompletionCertificateUrl = contract.CompletionCertificateUrl,
                PaymentTerms = contract.PaymentTerms,
                PaymentMilestoneCount = contract.PaymentMilestoneCount,
                ChangeOrderCount = contract.ChangeOrderCount,
                TotalChangeOrderValue = contract.TotalChangeOrderValue,
                CompletionPercentage = contract.CompletionPercentage,
                IsUnderWarranty = contract.IsUnderWarranty,
                WarrantyEndDate = contract.WarrantyEndDate,
                CreatedAt = contract.CreatedAt
            };
        }

        private SubcontractorPaymentDto MapPaymentToDto(SubcontractorPayment payment)
        {
            return new SubcontractorPaymentDto
            {
                Id = payment.Id,
                CompanyId = payment.CompanyId ?? 0,
                SubcontractorId = payment.SubcontractorId,
                SubcontractorName = payment.Subcontractor?.Name,
                ContractId = payment.ContractId ?? 0,
                ContractNumber = payment.Contract?.ContractNumber,
                ProjectId = payment.ProjectId ?? 0,
                ProjectName = payment.Project?.Name,
                PaymentNumber = payment.PaymentNumber,
                PaymentType = payment.PaymentType.ToString(),
                Description = payment.Description,
                Notes = payment.Notes,
                Amount = payment.Amount,
                Currency = payment.Currency,
                RetentionDeducted = payment.RetentionDeducted,
                TaxDeducted = payment.TaxDeducted,
                OtherDeductions = payment.OtherDeductions,
                LiquidatedDamages = payment.LiquidatedDamages,
                NetPayment = payment.NetPayment,
                MilestoneName = payment.MilestoneName,
                MilestoneNumber = payment.MilestoneNumber,
                MilestoneCompletionPercentage = payment.MilestoneCompletionPercentage,
                Status = payment.Status.ToString(),
                InvoiceDate = payment.InvoiceDate,
                DueDate = payment.DueDate,
                PaymentDate = payment.PaymentDate,
                RequestedBy = payment.RequestedBy,
                ApprovedBy = payment.ApprovedBy,
                ApprovalDate = payment.ApprovalDate
            };
        }

        private SubcontractorRatingDto MapRatingToDto(SubcontractorRating rating)
        {
            return new SubcontractorRatingDto
            {
                Id = rating.Id,
                CompanyId = rating.CompanyId ?? 0,
                SubcontractorId = rating.SubcontractorId,
                SubcontractorName = rating.Subcontractor?.Name,
                ContractId = rating.ContractId ?? 0,
                ContractNumber = rating.Contract?.ContractNumber,
                ProjectId = rating.ProjectId ?? 0,
                ProjectName = rating.Project?.Name,
                EvaluatorId = rating.EvaluatorId,
                EvaluatorName = rating.EvaluatorName,
                EvaluatorRole = rating.EvaluatorRole,
                EvaluationDate = rating.EvaluationDate,
                ContractCompletionDate = rating.ContractCompletionDate,
                QualityOfWork = rating.QualityOfWork,
                Timeliness = rating.Timeliness,
                Communication = rating.Communication,
                Professionalism = rating.Professionalism,
                SafetyCompliance = rating.SafetyCompliance,
                BudgetAdherence = rating.BudgetAdherence,
                ProblemSolving = rating.ProblemSolving,
                Documentation = rating.Documentation,
                OverallRating = rating.OverallRating,
                RatingGrade = rating.RatingGrade,
                Strengths = rating.Strengths,
                Weaknesses = rating.Weaknesses,
                Recommendations = rating.Recommendations,
                GeneralComments = rating.GeneralComments,
                DaysEarly = rating.DaysEarly,
                DaysLate = rating.DaysLate,
                BudgetVariance = rating.BudgetVariance,
                WouldRecommend = rating.WouldRecommend,
                WouldHireAgain = rating.WouldHireAgain,
                IsFinalized = rating.IsFinalized,
                ReviewedBy = rating.ReviewedBy,
                ReviewDate = rating.ReviewDate
            };
        }

        #endregion
    }
}

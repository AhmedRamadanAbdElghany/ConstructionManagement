using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    public class EmployeeDocumentService : IEmployeeDocumentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileStorageService _fileStorage;
        private readonly ILogger<EmployeeDocumentService> _logger;

        public EmployeeDocumentService(
            ApplicationDbContext context,
            IFileStorageService fileStorage,
            ILogger<EmployeeDocumentService> logger)
        {
            _context = context;
            _fileStorage = fileStorage;
            _logger = logger;
        }

        #region Categories

        public async Task<List<EmployeeDocumentCategoryDto>> GetCategoriesAsync(int? companyId)
        {
            var query = _context.EmployeeDocumentCategories
                .Include(c => c.Documents)
                .Where(c => c.CompanyId == companyId);

            var categories = await query.OrderBy(c => c.DisplayOrder).ToListAsync();

            return categories.Select(c => new EmployeeDocumentCategoryDto
            {
                Id = c.Id,
                CompanyId = c.CompanyId,
                Name = c.Name,
                Description = c.Description,
                HasExpiry = c.HasExpiry,
                ExpiryAlertDays = c.ExpiryAlertDays,
                IsRequired = c.IsRequired,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                DocumentCount = c.Documents.Count
            }).ToList();
        }

        public async Task<EmployeeDocumentCategoryDto> GetCategoryByIdAsync(int id)
        {
            var category = await _context.EmployeeDocumentCategories
                .Include(c => c.Documents)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null) return null!;

            return new EmployeeDocumentCategoryDto
            {
                Id = category.Id,
                CompanyId = category.CompanyId,
                Name = category.Name,
                Description = category.Description,
                HasExpiry = category.HasExpiry,
                ExpiryAlertDays = category.ExpiryAlertDays,
                IsRequired = category.IsRequired,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                DocumentCount = category.Documents.Count
            };
        }

        public async Task<EmployeeDocumentCategoryDto> CreateCategoryAsync(CreateDocumentCategoryRequest request, int? companyId, int userId)
        {
            var category = new EmployeeDocumentCategory
            {
                CompanyId = companyId,
                Name = request.Name,
                Description = request.Description,
                HasExpiry = request.HasExpiry,
                ExpiryAlertDays = request.ExpiryAlertDays,
                IsRequired = request.IsRequired,
                DisplayOrder = request.DisplayOrder,
                IsActive = true
            };

            _context.EmployeeDocumentCategories.Add(category);
            await _context.SaveChangesAsync();

            return await GetCategoryByIdAsync(category.Id);
        }

        public async Task<EmployeeDocumentCategoryDto> UpdateCategoryAsync(int id, UpdateDocumentCategoryRequest request)
        {
            var category = await _context.EmployeeDocumentCategories.FindAsync(id);
            if (category == null) return null!;

            category.Name = request.Name;
            category.Description = request.Description;
            category.HasExpiry = request.HasExpiry;
            category.ExpiryAlertDays = request.ExpiryAlertDays;
            category.IsRequired = request.IsRequired;
            category.DisplayOrder = request.DisplayOrder;
            category.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return await GetCategoryByIdAsync(id);
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await _context.EmployeeDocumentCategories.FindAsync(id);
            if (category == null) return;

            _context.EmployeeDocumentCategories.Remove(category);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Documents

        public async Task<List<EmployeeDocumentDto>> GetDocumentsAsync(int? companyId, int? employeeId = null, int? categoryId = null, string? status = null)
        {
            var query = _context.EmployeeDocuments
                .Include(d => d.Employee)
                .Include(d => d.Category)
                .Include(d => d.UploadedByUser)
                .Include(d => d.VerifiedByUser)
                .Include(d => d.Versions)
                .Where(d => d.CompanyId == companyId);

            if (employeeId.HasValue)
                query = query.Where(d => d.EmployeeId == employeeId);

            if (categoryId.HasValue)
                query = query.Where(d => d.CategoryId == categoryId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(d => d.Status == status);

            var documents = await query.OrderByDescending(d => d.CreatedAt).ToListAsync();
            var now = DateTime.UtcNow;

            return documents.Select(d => MapToDto(d, now)).ToList();
        }

        public async Task<EmployeeDocumentDto> GetDocumentByIdAsync(int id)
        {
            var document = await _context.EmployeeDocuments
                .Include(d => d.Employee)
                .Include(d => d.Category)
                .Include(d => d.UploadedByUser)
                .Include(d => d.VerifiedByUser)
                .Include(d => d.Versions)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null) return null!;

            return MapToDto(document, DateTime.UtcNow);
        }

        public async Task<EmployeeDocumentDto> UploadDocumentAsync(CreateEmployeeDocumentRequest request, byte[] fileData, string fileName, string mimeType, int? companyId, int userId)
        {
            // Save file
            var filePath = await _fileStorage.SaveFileAsync(fileData, "employee-documents", fileName);

            var document = new EmployeeDocument
            {
                CompanyId = companyId,
                EmployeeId = request.EmployeeId,
                CategoryId = request.CategoryId,
                DocumentName = request.DocumentName,
                Description = request.Description,
                FilePath = filePath,
                FileName = fileName,
                FileSize = fileData.Length,
                MimeType = mimeType,
                IssueDate = request.IssueDate,
                ExpiryDate = request.ExpiryDate,
                Status = "Active",
                IsVerified = false,
                UploadedByUserId = userId
            };

            _context.EmployeeDocuments.Add(document);
            await _context.SaveChangesAsync();

            // Create expiry alerts if applicable
            if (document.ExpiryDate.HasValue)
            {
                await CreateExpiryAlertsAsync(document);
            }

            return await GetDocumentByIdAsync(document.Id);
        }

        public async Task<EmployeeDocumentDto> UpdateDocumentAsync(int id, UpdateEmployeeDocumentRequest request)
        {
            var document = await _context.EmployeeDocuments.FindAsync(id);
            if (document == null) return null!;

            document.DocumentName = request.DocumentName;
            document.Description = request.Description;
            document.IssueDate = request.IssueDate;
            document.ExpiryDate = request.ExpiryDate;
            document.Status = request.Status;

            await _context.SaveChangesAsync();

            return await GetDocumentByIdAsync(id);
        }

        public async Task DeleteDocumentAsync(int id)
        {
            var document = await _context.EmployeeDocuments.FindAsync(id);
            if (document == null) return;

            // Delete file
            await _fileStorage.DeleteFileAsync(document.FilePath);

            _context.EmployeeDocuments.Remove(document);
            await _context.SaveChangesAsync();
        }

        public async Task<EmployeeDocumentDto> UploadNewVersionAsync(int documentId, byte[] fileData, string fileName, string mimeType, string? changeNotes, int userId)
        {
            var document = await _context.EmployeeDocuments
                .Include(d => d.Versions)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null) return null!;

            // Save new file
            var filePath = await _fileStorage.SaveFileAsync(fileData, "employee-documents", fileName);

            // Create version record for old file
            var version = new EmployeeDocumentVersion
            {
                EmployeeDocumentId = documentId,
                Version = document.Versions.Count + 1,
                FilePath = document.FilePath,
                FileName = document.FileName,
                FileSize = document.FileSize,
                ChangeNotes = changeNotes,
                UploadedByUserId = userId,
                UploadedAt = DateTime.UtcNow
            };

            _context.EmployeeDocumentVersions.Add(version);

            // Update document with new file
            document.FilePath = filePath;
            document.FileName = fileName;
            document.FileSize = fileData.Length;
            document.MimeType = mimeType;

            await _context.SaveChangesAsync();

            return await GetDocumentByIdAsync(documentId);
        }

        public async Task<List<EmployeeDocumentVersionDto>> GetDocumentVersionsAsync(int documentId)
        {
            var versions = await _context.EmployeeDocumentVersions
                .Include(v => v.UploadedByUser)
                .Where(v => v.EmployeeDocumentId == documentId)
                .OrderByDescending(v => v.Version)
                .ToListAsync();

            return versions.Select(v => new EmployeeDocumentVersionDto
            {
                Id = v.Id,
                Version = v.Version,
                FileName = v.FileName,
                FileSize = v.FileSize,
                ChangeNotes = v.ChangeNotes,
                UploadedByName = v.UploadedByUser?.FullName ?? "",
                UploadedAt = v.UploadedAt
            }).ToList();
        }

        public async Task<EmployeeDocumentDto> VerifyDocumentAsync(int id, VerifyDocumentRequest request, int userId)
        {
            var document = await _context.EmployeeDocuments.FindAsync(id);
            if (document == null) return null!;

            document.IsVerified = request.IsVerified;
            document.VerifiedByUserId = userId;
            document.VerifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetDocumentByIdAsync(id);
        }

        public async Task<byte[]> DownloadDocumentAsync(int id)
        {
            var document = await _context.EmployeeDocuments.FindAsync(id);
            if (document == null) return null!;

            return await _fileStorage.GetFileAsync(document.FilePath);
        }

        #endregion

        #region Expiry Alerts

        public async Task<List<DocumentExpiryAlertDto>> GetExpiringDocumentsAsync(int? companyId, int daysThreshold = 30)
        {
            var now = DateTime.UtcNow;
            var threshold = now.AddDays(daysThreshold);

            var alerts = await _context.DocumentExpiryAlerts
                .Include(a => a.Document)
                    .ThenInclude(d => d.Employee)
                .Where(a => a.CompanyId == companyId && !a.IsSent && a.ExpiryDate <= threshold)
                .OrderBy(a => a.ExpiryDate)
                .ToListAsync();

            return alerts.Select(a => new DocumentExpiryAlertDto
            {
                Id = a.Id,
                DocumentId = a.DocumentId,
                DocumentName = a.Document?.DocumentName ?? "",
                EmployeeId = a.Document?.EmployeeId ?? 0,
                EmployeeName = a.Document?.Employee?.FullName ?? "",
                ExpiryDate = a.ExpiryDate,
                DaysUntilExpiry = a.DaysUntilExpiry,
                AlertType = a.AlertType,
                IsSent = a.IsSent,
                SentAt = a.SentAt
            }).ToList();
        }

        public async Task<ExpiringDocumentsReport> GetExpiryReportAsync(int? companyId)
        {
            var now = DateTime.UtcNow;
            var in7Days = now.AddDays(7);
            var in30Days = now.AddDays(30);

            var documents = await _context.EmployeeDocuments
                .Include(d => d.Employee)
                .Include(d => d.Category)
                .Where(d => d.CompanyId == companyId && d.ExpiryDate.HasValue)
                .ToListAsync();

            var report = new ExpiringDocumentsReport
            {
                Expired = documents.Count(d => d.ExpiryDate < now),
                ExpiringIn7Days = documents.Count(d => d.ExpiryDate >= now && d.ExpiryDate <= in7Days),
                ExpiringIn30Days = documents.Count(d => d.ExpiryDate > in7Days && d.ExpiryDate <= in30Days),
                TotalExpiring = documents.Count(d => d.ExpiryDate <= in30Days)
            };

            // Get detailed list
            var expiringDocs = documents
                .Where(d => d.ExpiryDate <= in30Days)
                .OrderBy(d => d.ExpiryDate)
                .Select(d => new DocumentExpiryAlertDto
                {
                    DocumentId = d.Id,
                    DocumentName = d.DocumentName,
                    EmployeeId = d.EmployeeId,
                    EmployeeName = d.Employee?.FullName ?? "",
                    ExpiryDate = d.ExpiryDate!.Value,
                    DaysUntilExpiry = (int)(d.ExpiryDate!.Value - now).TotalDays
                })
                .ToList();

            report.Documents = expiringDocs;

            return report;
        }

        public async Task ProcessExpiryAlertsAsync()
        {
            var now = DateTime.UtcNow;
            var categories = await _context.EmployeeDocumentCategories
                .Where(c => c.HasExpiry && c.ExpiryAlertDays.HasValue)
                .ToListAsync();

            foreach (var category in categories)
            {
                var documents = await _context.EmployeeDocuments
                    .Where(d => d.CategoryId == category.Id && d.ExpiryDate.HasValue && d.Status == "Active")
                    .ToListAsync();

                foreach (var document in documents)
                {
                    var daysUntilExpiry = (document.ExpiryDate!.Value - now).Days;

                    // Check if we need to create an alert
                    if (daysUntilExpiry <= category.ExpiryAlertDays!.Value)
                    {
                        var existingAlert = await _context.DocumentExpiryAlerts
                            .AnyAsync(a => a.DocumentId == document.Id && a.AlertType == $"{category.ExpiryAlertDays} days");

                        if (!existingAlert)
                        {
                            var alert = new DocumentExpiryAlert
                            {
                                CompanyId = document.CompanyId,
                                DocumentId = document.Id,
                                ExpiryDate = document.ExpiryDate.Value,
                                DaysUntilExpiry = daysUntilExpiry,
                                AlertType = $"{category.ExpiryAlertDays} days",
                                IsSent = false
                            };

                            _context.DocumentExpiryAlerts.Add(alert);
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task CreateExpiryAlertsAsync(EmployeeDocument document)
        {
            var category = await _context.EmployeeDocumentCategories.FindAsync(document.CategoryId);
            if (category == null || !category.HasExpiry || !category.ExpiryAlertDays.HasValue) return;

            var now = DateTime.UtcNow;
            var daysUntilExpiry = (document.ExpiryDate!.Value - now).Days;

            if (daysUntilExpiry <= category.ExpiryAlertDays!.Value)
            {
                var alert = new DocumentExpiryAlert
                {
                    CompanyId = document.CompanyId,
                    DocumentId = document.Id,
                    ExpiryDate = document.ExpiryDate.Value,
                    DaysUntilExpiry = daysUntilExpiry,
                    AlertType = $"{category.ExpiryAlertDays} days",
                    IsSent = false
                };

                _context.DocumentExpiryAlerts.Add(alert);
                await _context.SaveChangesAsync();
            }
        }

        #endregion

        #region Helpers

        private EmployeeDocumentDto MapToDto(EmployeeDocument d, DateTime now)
        {
            var daysUntilExpiry = d.ExpiryDate.HasValue
                ? (int?)(d.ExpiryDate.Value - now).TotalDays
                : null;

            return new EmployeeDocumentDto
            {
                Id = d.Id,
                CompanyId = d.CompanyId,
                EmployeeId = d.EmployeeId,
                EmployeeName = d.Employee?.FullName ?? "",
                CategoryId = d.CategoryId,
                CategoryName = d.Category?.Name ?? "",
                DocumentName = d.DocumentName,
                Description = d.Description,
                FilePath = d.FilePath,
                FileName = d.FileName,
                FileSize = d.FileSize,
                MimeType = d.MimeType,
                IssueDate = d.IssueDate,
                ExpiryDate = d.ExpiryDate,
                Status = d.Status,
                IsVerified = d.IsVerified,
                VerifiedByUserId = d.VerifiedByUserId,
                VerifiedByName = d.VerifiedByUser?.FullName,
                VerifiedAt = d.VerifiedAt,
                UploadedByUserId = d.UploadedByUserId,
                UploadedByName = d.UploadedByUser?.FullName ?? "",
                CreatedAt = d.CreatedAt,
                VersionCount = d.Versions?.Count ?? 0,
                IsExpiringSoon = daysUntilExpiry.HasValue && daysUntilExpiry.Value <= 30,
                DaysUntilExpiry = daysUntilExpiry
            };
        }

        #endregion
    }
}

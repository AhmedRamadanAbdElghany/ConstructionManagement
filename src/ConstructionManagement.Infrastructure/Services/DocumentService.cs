using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ConstructionManagement.Infrastructure.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICompanyContext _companyContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWebHostEnvironment _environment;

        public DocumentService(
            ApplicationDbContext context,
            ICompanyContext companyContext,
            IHttpContextAccessor httpContextAccessor,
            IWebHostEnvironment environment)
        {
            _context = context;
            _companyContext = companyContext;
            _httpContextAccessor = httpContextAccessor;
            _environment = environment;
        }

        private int? GetCurrentCompanyId() => _companyContext.CompanyId;
        private string CurrentUser => _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "System";

        #region Category Management

        public async Task<IEnumerable<DocumentCategoryDto>> GetCategoriesAsync()
        {
            var companyId = GetCurrentCompanyId();
            var categories = await _context.DocumentCategories
                .Where(c => c.CompanyId == companyId && c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            var result = new List<DocumentCategoryDto>();
            foreach (var cat in categories)
            {
                var docCount = await _context.Documents.CountAsync(d => d.CategoryId == cat.Id && !d.IsDeleted);
                result.Add(new DocumentCategoryDto
                {
                    Id = cat.Id,
                    CompanyId = cat.CompanyId,
                    Name = cat.Name,
                    Description = cat.Description,
                    ParentCategoryId = cat.ParentCategoryId,
                    SortOrder = cat.SortOrder,
                    IsActive = cat.IsActive,
                    DocumentCount = docCount
                });
            }
            return result;
        }

        public async Task<DocumentCategoryDto?> GetCategoryByIdAsync(int id)
        {
            var category = await _context.DocumentCategories.FindAsync(id);
            if (category == null) return null;

            var docCount = await _context.Documents.CountAsync(d => d.CategoryId == id && !d.IsDeleted);
            return new DocumentCategoryDto
            {
                Id = category.Id,
                CompanyId = category.CompanyId,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                DocumentCount = docCount
            };
        }

        public async Task<DocumentCategoryDto> CreateCategoryAsync(CreateCategoryRequest request)
        {
            var category = new DocumentCategory
            {
                CompanyId = GetCurrentCompanyId(),
                Name = request.Name,
                Description = request.Description,
                ParentCategoryId = request.ParentCategoryId,
                SortOrder = request.SortOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentCategories.Add(category);
            await _context.SaveChangesAsync();

            return new DocumentCategoryDto
            {
                Id = category.Id,
                CompanyId = category.CompanyId,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                DocumentCount = 0
            };
        }

        public async Task<DocumentCategoryDto> UpdateCategoryAsync(int id, UpdateCategoryRequest request)
        {
            var category = await _context.DocumentCategories.FindAsync(id)
                ?? throw new KeyNotFoundException($"Category with ID {id} not found");

            if (request.Name != null) category.Name = request.Name;
            if (request.Description != null) category.Description = request.Description;
            if (request.ParentCategoryId != null) category.ParentCategoryId = request.ParentCategoryId;
            if (request.SortOrder.HasValue) category.SortOrder = request.SortOrder.Value;
            if (request.IsActive.HasValue) category.IsActive = request.IsActive.Value;

            await _context.SaveChangesAsync();
            return await GetCategoryByIdAsync(id) ?? throw new Exception("Failed to retrieve updated category");
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.DocumentCategories.FindAsync(id);
            if (category == null) return false;

            // Check if category has documents
            var docCount = await _context.Documents.CountAsync(d => d.CategoryId == id && !d.IsDeleted);
            if (docCount > 0)
                throw new InvalidOperationException("Cannot delete category with existing documents");

            _context.DocumentCategories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Document CRUD

        public async Task<IEnumerable<DocumentDto>> GetDocumentsAsync(DocumentSearchRequest? request = null)
        {
            var companyId = GetCurrentCompanyId();
            var query = _context.Documents
                .Include(d => d.Category)
                .Include(d => d.Project)
                .Where(d => d.CompanyId == companyId && !d.IsDeleted);

            if (request != null)
            {
                if (!string.IsNullOrEmpty(request.Query))
                {
                    var searchTerm = request.Query.ToLower();
                    query = query.Where(d => d.Title.ToLower().Contains(searchTerm) ||
                                            d.Description != null && d.Description.ToLower().Contains(searchTerm) ||
                                            d.Tags != null && d.Tags.ToLower().Contains(searchTerm));
                }
                if (request.CategoryId.HasValue)
                    query = query.Where(d => d.CategoryId == request.CategoryId);
                if (!string.IsNullOrEmpty(request.DocumentType))
                    query = query.Where(d => d.DocumentType == request.DocumentType);
                if (request.ProjectId.HasValue)
                    query = query.Where(d => d.ProjectId == request.ProjectId);
                if (!string.IsNullOrEmpty(request.Status))
                {
                    if (Enum.TryParse<DocumentStatus>(request.Status, out var status))
                        query = query.Where(d => d.Status == status);
                }
            }

            var now = DateTime.UtcNow;
            var documents = await query.OrderByDescending(d => d.UploadedDate).ToListAsync();

            return documents.Select(d => MapToDto(d, now));
        }

        public async Task<DocumentDto?> GetDocumentByIdAsync(int id)
        {
            var companyId = GetCurrentCompanyId();
            var document = await _context.Documents
                .Include(d => d.Category)
                .Include(d => d.Project)
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId && !d.IsDeleted);

            if (document == null) return null;
            return MapToDto(document, DateTime.UtcNow);
        }

        public async Task<DocumentDto> CreateDocumentAsync(CreateDocumentRequest request)
        {
            var fileName = request.File?.FileName ?? $"{Guid.NewGuid()}.bin";
            var filePath = Path.Combine(_environment.ContentRootPath, "Uploads", "Documents", fileName);

            var document = new Document
            {
                CompanyId = GetCurrentCompanyId(),
                CategoryId = request.CategoryId,
                ProjectId = request.ProjectId,
                Title = request.Title,
                Description = request.Description,
                DocumentType = request.DocumentType,
                Tags = request.Tags,
                FileName = fileName,
                FilePath = filePath,
                FileSize = request.File?.Length ?? 0,
                FileType = request.File?.ContentType ?? "application/octet-stream",
                Status = DocumentStatus.Draft,
                IssueDate = request.IssueDate,
                ExpiryDate = request.ExpiryDate,
                RequiresApproval = request.RequiresApproval,
                UploadedBy = CurrentUser,
                UploadedDate = DateTime.UtcNow,
                CurrentVersion = 1
            };

            // Create initial version
            var version = new DocumentVersion
            {
                CompanyId = GetCurrentCompanyId(),
                DocumentId = 0,  // Will be set by EF
                VersionNumber = 1,
                FileName = fileName,
                FilePath = filePath,
                FileSize = document.FileSize,
                FileType = document.FileType,
                UploadedBy = CurrentUser,
                UploadedDate = DateTime.UtcNow,
                IsCurrentVersion = true
            };

            document.Versions.Add(version);

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            // Ensure directory exists
            var directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            // Save file if provided
            if (request.File != null)
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }
            }

            return MapToDto(document, DateTime.UtcNow);
        }

        public async Task<DocumentDto> UpdateDocumentAsync(int id, UpdateDocumentRequest request)
        {
            var document = await _context.Documents.FindAsync(id)
                ?? throw new KeyNotFoundException($"Document with ID {id} not found");

            if (request.Title != null) document.Title = request.Title;
            if (request.Description != null) document.Description = request.Description;
            if (request.DocumentType != null) document.DocumentType = request.DocumentType;
            if (request.CategoryId.HasValue) document.CategoryId = request.CategoryId;
            if (request.Tags != null) document.Tags = request.Tags;
            if (request.IssueDate.HasValue) document.IssueDate = request.IssueDate;
            if (request.ExpiryDate.HasValue) document.ExpiryDate = request.ExpiryDate;
            if (request.RequiresApproval.HasValue) document.RequiresApproval = request.RequiresApproval.Value;

            document.LastModifiedBy = CurrentUser;
            document.LastModifiedDate = DateTime.UtcNow;

            // Handle new version upload
            if (request.File != null)
            {
                document.CurrentVersion++;
                var newVersion = new DocumentVersion
                {
                    CompanyId = GetCurrentCompanyId(),
                    DocumentId = document.Id,
                    VersionNumber = document.CurrentVersion,
                    ChangeNotes = request.ChangeNotes,
                    FileName = request.File.FileName,
                    FilePath = Path.Combine(_environment.ContentRootPath, "Uploads", "Documents", request.File.FileName),
                    FileSize = request.File.Length,
                    FileType = request.File.ContentType,
                    UploadedBy = CurrentUser,
                    UploadedDate = DateTime.UtcNow,
                    IsCurrentVersion = true
                };

                // Mark previous version as not current
                foreach (var v in document.Versions)
                    v.IsCurrentVersion = false;

                _context.DocumentVersions.Add(newVersion);

                // Save the file
                var directory = Path.GetDirectoryName(newVersion.FilePath);
                if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                    Directory.CreateDirectory(directory);

                using (var stream = new FileStream(newVersion.FilePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }
            }

            await _context.SaveChangesAsync();
            return await GetDocumentByIdAsync(id) ?? throw new Exception("Failed to retrieve updated document");
        }

        public async Task<bool> DeleteDocumentAsync(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return false;

            // Soft delete
            document.IsDeleted = true;
            document.Status = DocumentStatus.Archived;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DocumentDto> ArchiveDocumentAsync(int id)
        {
            var document = await _context.Documents.FindAsync(id)
                ?? throw new KeyNotFoundException($"Document with ID {id} not found");

            document.IsArchived = true;
            document.Status = DocumentStatus.Archived;
            await _context.SaveChangesAsync();
            return await GetDocumentByIdAsync(id) ?? throw new Exception("Failed to retrieve archived document");
        }

        public async Task<DocumentDto> RestoreDocumentAsync(int id)
        {
            var document = await _context.Documents.FindAsync(id)
                ?? throw new KeyNotFoundException($"Document with ID {id} not found");

            document.IsArchived = false;
            document.Status = DocumentStatus.Approved;  // Restore to approved status
            await _context.SaveChangesAsync();
            return await GetDocumentByIdAsync(id) ?? throw new Exception("Failed to retrieve restored document");
        }

        #endregion

        #region Version Management

        public async Task<IEnumerable<DocumentVersionDto>> GetDocumentVersionsAsync(int documentId)
        {
            var versions = await _context.DocumentVersions
                .Where(v => v.DocumentId == documentId)
                .OrderByDescending(v => v.VersionNumber)
                .ToListAsync();

            return versions.Select(v => new DocumentVersionDto
            {
                Id = v.Id,
                DocumentId = v.DocumentId,
                VersionNumber = v.VersionNumber,
                ChangeNotes = v.ChangeNotes,
                FileName = v.FileName,
                FileUrl = v.FileUrl,
                FileSize = v.FileSize,
                FileType = v.FileType,
                UploadedBy = v.UploadedBy,
                UploadedDate = v.UploadedDate,
                IsCurrentVersion = v.IsCurrentVersion
            });
        }

        public async Task<DocumentVersionDto?> GetVersionByIdAsync(int versionId)
        {
            var version = await _context.DocumentVersions.FindAsync(versionId);
            if (version == null) return null;

            return new DocumentVersionDto
            {
                Id = version.Id,
                DocumentId = version.DocumentId,
                VersionNumber = version.VersionNumber,
                ChangeNotes = version.ChangeNotes,
                FileName = version.FileName,
                FileUrl = version.FileUrl,
                FileSize = version.FileSize,
                FileType = version.FileType,
                UploadedBy = version.UploadedBy,
                UploadedDate = version.UploadedDate,
                IsCurrentVersion = version.IsCurrentVersion
            };
        }

        public async Task<DocumentVersionDto> UploadVersionAsync(int documentId, UploadVersionRequest request)
        {
            var document = await _context.Documents.FindAsync(documentId)
                ?? throw new KeyNotFoundException($"Document with ID {documentId} not found");

            document.CurrentVersion++;
            document.LastModifiedBy = CurrentUser;
            document.LastModifiedDate = DateTime.UtcNow;

            // Mark previous version as not current
            foreach (var v in document.Versions)
                v.IsCurrentVersion = false;

            var newVersion = new DocumentVersion
            {
                CompanyId = GetCurrentCompanyId(),
                DocumentId = documentId,
                VersionNumber = document.CurrentVersion,
                ChangeNotes = request.ChangeNotes,
                FileName = request.File?.FileName ?? $"v{document.CurrentVersion}_{document.FileName}",
                FilePath = Path.Combine(_environment.ContentRootPath, "Uploads", "Documents", request.File?.FileName ?? "temp.bin"),
                FileSize = request.File?.Length ?? 0,
                FileType = request.File?.ContentType ?? "application/octet-stream",
                UploadedBy = CurrentUser,
                UploadedDate = DateTime.UtcNow,
                IsCurrentVersion = true
            };

            _context.DocumentVersions.Add(newVersion);
            await _context.SaveChangesAsync();

            return new DocumentVersionDto
            {
                Id = newVersion.Id,
                DocumentId = newVersion.DocumentId,
                VersionNumber = newVersion.VersionNumber,
                ChangeNotes = newVersion.ChangeNotes,
                FileName = newVersion.FileName,
                FileSize = newVersion.FileSize,
                FileType = newVersion.FileType,
                UploadedBy = newVersion.UploadedBy,
                UploadedDate = newVersion.UploadedDate,
                IsCurrentVersion = true
            };
        }

        public async Task<DocumentVersionDto> SetCurrentVersionAsync(int documentId, int versionId)
        {
            var document = await _context.Documents.FindAsync(documentId)
                ?? throw new KeyNotFoundException($"Document with ID {documentId} not found");

            var version = await _context.DocumentVersions.FindAsync(versionId)
                ?? throw new KeyNotFoundException($"Version with ID {versionId} not found");

            foreach (var v in document.Versions)
                v.IsCurrentVersion = (v.Id == versionId);

            await _context.SaveChangesAsync();

            return new DocumentVersionDto
            {
                Id = version.Id,
                DocumentId = version.DocumentId,
                VersionNumber = version.VersionNumber,
                IsCurrentVersion = true
            };
        }

        #endregion

        #region Approval Workflow

        public async Task<IEnumerable<DocumentApprovalDto>> GetPendingApprovalsAsync()
        {
            var companyId = GetCurrentCompanyId();
            var approvals = await _context.DocumentApprovals
                .Include(a => a.Document)
                .Where(a => a.CompanyId == companyId && a.Status == ApprovalStatus.Pending)
                .OrderBy(a => a.RequestedDate)
                .ToListAsync();

            return approvals.Select(a => new DocumentApprovalDto
            {
                Id = a.Id,
                DocumentId = a.DocumentId,
                DocumentTitle = a.Document?.Title,
                VersionId = a.VersionId ?? 0,
                ApprovalOrder = a.ApprovalOrder,
                ApproverRole = a.ApproverRole,
                ApproverName = a.ApproverName,
                Status = a.Status.ToString(),
                Comments = a.Comments,
                RequestedDate = a.RequestedDate,
                DueDate = a.DueDate,
                ActionDate = a.ActionDate
            });
        }

        public async Task<IEnumerable<DocumentApprovalDto>> GetDocumentApprovalsAsync(int documentId)
        {
            var approvals = await _context.DocumentApprovals
                .Where(a => a.DocumentId == documentId)
                .OrderBy(a => a.ApprovalOrder)
                .ToListAsync();

            return approvals.Select(a => new DocumentApprovalDto
            {
                Id = a.Id,
                DocumentId = a.DocumentId,
                VersionId = a.VersionId ?? 0,
                ApprovalOrder = a.ApprovalOrder,
                ApproverRole = a.ApproverRole,
                ApproverName = a.ApproverName,
                Status = a.Status.ToString(),
                Comments = a.Comments,
                RequestedDate = a.RequestedDate,
                DueDate = a.DueDate,
                ActionDate = a.ActionDate
            });
        }

        public async Task<DocumentDto> RequestApprovalAsync(int documentId, RequestApprovalRequest request)
        {
            var document = await _context.Documents.FindAsync(documentId)
                ?? throw new KeyNotFoundException($"Document with ID {documentId} not found");

            document.Status = DocumentStatus.PendingApproval;
            document.RequiresApproval = true;

            var order = 1;
            foreach (var role in request.ApproverRoles)
            {
                var approval = new DocumentApproval
                {
                    CompanyId = GetCurrentCompanyId(),
                    DocumentId = documentId,
                    VersionId = document.LatestVersionId,
                    ApprovalOrder = order++,
                    ApproverRole = role,
                    Status = ApprovalStatus.Pending,
                    RequestedDate = DateTime.UtcNow,
                    DueDate = request.DueDate
                };
                _context.DocumentApprovals.Add(approval);
            }

            await _context.SaveChangesAsync();
            return await GetDocumentByIdAsync(documentId) ?? throw new Exception("Failed to retrieve document");
        }

        public async Task<DocumentApprovalDto> SubmitApprovalAsync(int approvalId, SubmitApprovalRequest request)
        {
            var approval = await _context.DocumentApprovals.FindAsync(approvalId)
                ?? throw new KeyNotFoundException($"Approval with ID {approvalId} not found");

            if (Enum.TryParse<ApprovalStatus>(request.Status, out var status))
            {
                approval.Status = status;
                approval.Comments = request.Comments;
                approval.ActionDate = DateTime.UtcNow;
                approval.StatusDate = DateTime.UtcNow;
            }

            // Check if all approvals are complete
            var allApprovals = await _context.DocumentApprovals
                .Where(a => a.DocumentId == approval.DocumentId)
                .ToListAsync();

            if (allApprovals.All(a => a.Status != ApprovalStatus.Pending))
            {
                var document = await _context.Documents.FindAsync(approval.DocumentId);
                if (document != null)
                {
                    document.ApprovalStatus = allApprovals.Any(a => a.Status == ApprovalStatus.Rejected)
                        ? "Rejected"
                        : "Approved";
                    document.Status = allApprovals.Any(a => a.Status == ApprovalStatus.Rejected)
                        ? DocumentStatus.Rejected
                        : DocumentStatus.Approved;
                    document.ApprovedDate = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return new DocumentApprovalDto
            {
                Id = approval.Id,
                DocumentId = approval.DocumentId,
                VersionId = approval.VersionId ?? 0,
                ApprovalOrder = approval.ApprovalOrder,
                ApproverRole = approval.ApproverRole,
                ApproverName = approval.ApproverName,
                Status = approval.Status.ToString(),
                Comments = approval.Comments,
                RequestedDate = approval.RequestedDate,
                DueDate = approval.DueDate,
                ActionDate = approval.ActionDate
            };
        }

        public async Task<DocumentDto> CancelApprovalRequestAsync(int documentId)
        {
            var document = await _context.Documents.FindAsync(documentId)
                ?? throw new KeyNotFoundException($"Document with ID {documentId} not found");

            // Remove pending approvals
            var pendingApprovals = await _context.DocumentApprovals
                .Where(a => a.DocumentId == documentId && a.Status == ApprovalStatus.Pending)
                .ToListAsync();

            _context.DocumentApprovals.RemoveRange(pendingApprovals);

            document.Status = DocumentStatus.Draft;
            document.ApprovalStatus = null;

            await _context.SaveChangesAsync();
            return await GetDocumentByIdAsync(documentId) ?? throw new Exception("Failed to retrieve document");
        }

        #endregion

        #region Search & Analytics

        public async Task<DocumentSummaryDto> GetSummaryAsync()
        {
            var companyId = GetCurrentCompanyId();
            var now = DateTime.UtcNow;
            var warningDate = now.AddDays(30);

            var documents = await _context.Documents
                .Where(d => d.CompanyId == companyId && !d.IsDeleted)
                .ToListAsync();

            var categories = await _context.DocumentCategories
                .Where(c => c.CompanyId == companyId && c.IsActive)
                .CountAsync();

            var pendingApprovals = await _context.DocumentApprovals
                .CountAsync(a => a.CompanyId == companyId && a.Status == ApprovalStatus.Pending);

            var expiringDocs = documents.Count(d => d.ExpiryDate.HasValue && d.ExpiryDate.Value > now && d.ExpiryDate.Value <= warningDate);
            var expiredDocs = documents.Count(d => d.ExpiryDate.HasValue && d.ExpiryDate.Value < now);

            var summary = new DocumentSummaryDto
            {
                TotalDocuments = documents.Count,
                TotalCategories = categories,
                PendingApprovals = pendingApprovals,
                ExpiringDocuments = expiringDocs,
                ExpiredDocuments = expiredDocs,
                TotalStorageUsed = documents.Sum(d => d.FileSize),
                StorageUsedFormatted = FormatFileSize(documents.Sum(d => d.FileSize)),
                DocumentsByType = documents.GroupBy(d => d.DocumentType).ToDictionary(g => g.Key, g => g.Count()),
                RecentDocuments = documents.OrderByDescending(d => d.UploadedDate).Take(5).Select(d => MapToDto(d, now)).ToList(),
                ExpiringSoon = documents.Where(d => d.ExpiryDate.HasValue && d.ExpiryDate.Value > now && d.ExpiryDate.Value <= warningDate)
                    .OrderBy(d => d.ExpiryDate).Take(5).Select(d => MapToDto(d, now)).ToList()
            };

            return summary;
        }

        public async Task<IEnumerable<DocumentDto>> SearchDocumentsAsync(DocumentSearchRequest request)
        {
            return await GetDocumentsAsync(request);
        }

        public async Task<IEnumerable<DocumentDto>> GetExpiringDocumentsAsync(int daysAhead = 30)
        {
            var companyId = GetCurrentCompanyId();
            var now = DateTime.UtcNow;
            var expiryDate = now.AddDays(daysAhead);

            var documents = await _context.Documents
                .Include(d => d.Category)
                .Where(d => d.CompanyId == companyId && !d.IsDeleted &&
                            d.ExpiryDate.HasValue && d.ExpiryDate.Value > now && d.ExpiryDate.Value <= expiryDate)
                .OrderBy(d => d.ExpiryDate)
                .ToListAsync();

            return documents.Select(d => MapToDto(d, now));
        }

        public async Task<IEnumerable<DocumentDto>> GetExpiredDocumentsAsync()
        {
            var companyId = GetCurrentCompanyId();
            var now = DateTime.UtcNow;

            var documents = await _context.Documents
                .Include(d => d.Category)
                .Where(d => d.CompanyId == companyId && !d.IsDeleted &&
                            d.ExpiryDate.HasValue && d.ExpiryDate.Value < now)
                .OrderBy(d => d.ExpiryDate)
                .ToListAsync();

            return documents.Select(d => MapToDto(d, now));
        }

        public async Task IncrementDownloadCountAsync(int documentId)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document != null)
            {
                document.DownloadCount++;
                await _context.SaveChangesAsync();
            }
        }

        public async Task IncrementViewCountAsync(int documentId)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document != null)
            {
                document.ViewCount++;
                await _context.SaveChangesAsync();
            }
        }

        #endregion

        #region File Operations

        public async Task<byte[]?> DownloadDocumentAsync(int documentId)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null || !File.Exists(document.FilePath)) return null;

            await IncrementDownloadCountAsync(documentId);
            return await File.ReadAllBytesAsync(document.FilePath);
        }

        public async Task<byte[]?> DownloadVersionAsync(int versionId)
        {
            var version = await _context.DocumentVersions.FindAsync(versionId);
            if (version == null || !File.Exists(version.FilePath)) return null;

            var document = await _context.Documents.FindAsync(version.DocumentId);
            if (document != null) await IncrementDownloadCountAsync(document.Id);

            return await File.ReadAllBytesAsync(version.FilePath);
        }

        #endregion

        #region Private Helpers

        private DocumentDto MapToDto(Document document, DateTime now)
        {
            var daysUntilExpiry = document.ExpiryDate.HasValue
                ? (int)(document.ExpiryDate.Value - now).TotalDays
                : 0;

            return new DocumentDto
            {
                Id = document.Id,
                CompanyId = document.CompanyId,
                CategoryId = document.CategoryId,
                CategoryName = document.Category?.Name,
                ProjectId = document.ProjectId,
                ProjectName = document.Project?.Name,
                Title = document.Title,
                Description = document.Description,
                DocumentType = document.DocumentType,
                Tags = document.Tags,
                FileName = document.FileName,
                FileUrl = document.FileUrl,
                FileSize = document.FileSize,
                FileType = document.FileType,
                FileSizeFormatted = FormatFileSize(document.FileSize),
                Status = document.Status.ToString(),
                IsArchived = document.IsArchived,
                IssueDate = document.IssueDate,
                ExpiryDate = document.ExpiryDate,
                IsExpired = document.ExpiryDate.HasValue && document.ExpiryDate.Value < now,
                DaysUntilExpiry = daysUntilExpiry,
                CurrentVersion = document.CurrentVersion,
                RequiresApproval = document.RequiresApproval,
                ApprovalStatus = document.ApprovalStatus,
                UploadedBy = document.UploadedBy,
                UploadedDate = document.UploadedDate,
                DownloadCount = document.DownloadCount,
                ViewCount = document.ViewCount
            };
        }

        private static string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            var order = 0;
            var size = bytes;

            while (size >= 1024 && order < sizes.Length - 1)
            {
                order++;
                size /= 1024;
            }

            return $"{size:0.##} {sizes[order]}";
        }

        #endregion
    }
}

using ConstructionManagement.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.Interfaces
{
    /// <summary>
    /// Service interface for Document Management operations
    /// </summary>
    public interface IDocumentService
    {
        // Category Management
        Task<IEnumerable<DocumentCategoryDto>> GetCategoriesAsync();
        Task<DocumentCategoryDto?> GetCategoryByIdAsync(int id);
        Task<DocumentCategoryDto> CreateCategoryAsync(CreateCategoryRequest request);
        Task<DocumentCategoryDto> UpdateCategoryAsync(int id, UpdateCategoryRequest request);
        Task<bool> DeleteCategoryAsync(int id);

        // Document CRUD
        Task<IEnumerable<DocumentDto>> GetDocumentsAsync(DocumentSearchRequest? request = null);
        Task<DocumentDto?> GetDocumentByIdAsync(int id);
        Task<DocumentDto> CreateDocumentAsync(CreateDocumentRequest request);
        Task<DocumentDto> UpdateDocumentAsync(int id, UpdateDocumentRequest request);
        Task<bool> DeleteDocumentAsync(int id);
        Task<DocumentDto> ArchiveDocumentAsync(int id);
        Task<DocumentDto> RestoreDocumentAsync(int id);

        // Version Management
        Task<IEnumerable<DocumentVersionDto>> GetDocumentVersionsAsync(int documentId);
        Task<DocumentVersionDto?> GetVersionByIdAsync(int versionId);
        Task<DocumentVersionDto> UploadVersionAsync(int documentId, UploadVersionRequest request);
        Task<DocumentVersionDto> SetCurrentVersionAsync(int documentId, int versionId);

        // Approval Workflow
        Task<IEnumerable<DocumentApprovalDto>> GetPendingApprovalsAsync();
        Task<IEnumerable<DocumentApprovalDto>> GetDocumentApprovalsAsync(int documentId);
        Task<DocumentDto> RequestApprovalAsync(int documentId, RequestApprovalRequest request);
        Task<DocumentApprovalDto> SubmitApprovalAsync(int approvalId, SubmitApprovalRequest request);
        Task<DocumentDto> CancelApprovalRequestAsync(int documentId);

        // Search & Analytics
        Task<DocumentSummaryDto> GetSummaryAsync();
        Task<IEnumerable<DocumentDto>> SearchDocumentsAsync(DocumentSearchRequest request);
        Task<IEnumerable<DocumentDto>> GetExpiringDocumentsAsync(int daysAhead = 30);
        Task<IEnumerable<DocumentDto>> GetExpiredDocumentsAsync();
        Task IncrementDownloadCountAsync(int documentId);
        Task IncrementViewCountAsync(int documentId);

        // File Operations
        Task<byte[]?> DownloadDocumentAsync(int documentId);
        Task<byte[]?> DownloadVersionAsync(int versionId);
    }
}

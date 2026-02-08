using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        #region Categories

        /// <summary>
        /// Get all document categories
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<DocumentCategoryDto>>> GetCategories()
        {
            var categories = await _documentService.GetCategoriesAsync();
            return Ok(categories);
        }

        /// <summary>
        /// Get a specific category
        /// </summary>
        [HttpGet("categories/{id}")]
        public async Task<ActionResult<DocumentCategoryDto>> GetCategory(int id)
        {
            var category = await _documentService.GetCategoryByIdAsync(id);
            if (category == null)
                return NotFound();

            return Ok(category);
        }

        /// <summary>
        /// Create a new category
        /// </summary>
        [HttpPost("categories")]
        public async Task<ActionResult<DocumentCategoryDto>> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            var category = await _documentService.CreateCategoryAsync(request);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        /// <summary>
        /// Update a category
        /// </summary>
        [HttpPut("categories/{id}")]
        public async Task<ActionResult<DocumentCategoryDto>> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
        {
            var category = await _documentService.UpdateCategoryAsync(id, request);
            return Ok(category);
        }

        /// <summary>
        /// Delete a category
        /// </summary>
        [HttpDelete("categories/{id}")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            var result = await _documentService.DeleteCategoryAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        #endregion

        #region Documents

        /// <summary>
        /// Get all documents with optional filtering
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments([FromQuery] DocumentSearchRequest? request)
        {
            var documents = await _documentService.GetDocumentsAsync(request);
            return Ok(documents);
        }

        /// <summary>
        /// Get document summary/dashboard
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<DocumentSummaryDto>> GetSummary()
        {
            var summary = await _documentService.GetSummaryAsync();
            return Ok(summary);
        }

        /// <summary>
        /// Search documents
        /// </summary>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> SearchDocuments([FromQuery] DocumentSearchRequest request)
        {
            var documents = await _documentService.SearchDocumentsAsync(request);
            return Ok(documents);
        }

        /// <summary>
        /// Get expiring documents
        /// </summary>
        [HttpGet("expiring")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetExpiringDocuments([FromQuery] int daysAhead = 30)
        {
            var documents = await _documentService.GetExpiringDocumentsAsync(daysAhead);
            return Ok(documents);
        }

        /// <summary>
        /// Get expired documents
        /// </summary>
        [HttpGet("expired")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetExpiredDocuments()
        {
            var documents = await _documentService.GetExpiredDocumentsAsync();
            return Ok(documents);
        }

        /// <summary>
        /// Get a specific document
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocument(int id)
        {
            var document = await _documentService.GetDocumentByIdAsync(id);
            if (document == null)
                return NotFound();

            await _documentService.IncrementViewCountAsync(id);
            return Ok(document);
        }

        /// <summary>
        /// Create a new document
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<DocumentDto>> CreateDocument([FromForm] CreateDocumentRequest request)
        {
            var document = await _documentService.CreateDocumentAsync(request);
            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
        }

        /// <summary>
        /// Update a document
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<DocumentDto>> UpdateDocument(int id, [FromForm] UpdateDocumentRequest request)
        {
            var document = await _documentService.UpdateDocumentAsync(id, request);
            return Ok(document);
        }

        /// <summary>
        /// Delete a document
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDocument(int id)
        {
            var result = await _documentService.DeleteDocumentAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Archive a document
        /// </summary>
        [HttpPost("{id}/archive")]
        public async Task<ActionResult<DocumentDto>> ArchiveDocument(int id)
        {
            var document = await _documentService.ArchiveDocumentAsync(id);
            return Ok(document);
        }

        /// <summary>
        /// Restore a document
        /// </summary>
        [HttpPost("{id}/restore")]
        public async Task<ActionResult<DocumentDto>> RestoreDocument(int id)
        {
            var document = await _documentService.RestoreDocumentAsync(id);
            return Ok(document);
        }

        #endregion

        #region Versions

        /// <summary>
        /// Get document versions
        /// </summary>
        [HttpGet("{documentId}/versions")]
        public async Task<ActionResult<IEnumerable<DocumentVersionDto>>> GetVersions(int documentId)
        {
            var versions = await _documentService.GetDocumentVersionsAsync(documentId);
            return Ok(versions);
        }

        /// <summary>
        /// Upload a new version
        /// </summary>
        [HttpPost("{documentId}/versions")]
        public async Task<ActionResult<DocumentVersionDto>> UploadVersion(int documentId, [FromForm] UploadVersionRequest request)
        {
            var version = await _documentService.UploadVersionAsync(documentId, request);
            return Ok(version);
        }

        /// <summary>
        /// Set current version
        /// </summary>
        [HttpPut("{documentId}/versions/{versionId}/current")]
        public async Task<ActionResult<DocumentVersionDto>> SetCurrentVersion(int documentId, int versionId)
        {
            var version = await _documentService.SetCurrentVersionAsync(documentId, versionId);
            return Ok(version);
        }

        #endregion

        #region Approvals

        /// <summary>
        /// Get pending approvals
        /// </summary>
        [HttpGet("approvals/pending")]
        public async Task<ActionResult<IEnumerable<DocumentApprovalDto>>> GetPendingApprovals()
        {
            var approvals = await _documentService.GetPendingApprovalsAsync();
            return Ok(approvals);
        }

        /// <summary>
        /// Get document approvals
        /// </summary>
        [HttpGet("{documentId}/approvals")]
        public async Task<ActionResult<IEnumerable<DocumentApprovalDto>>> GetDocumentApprovals(int documentId)
        {
            var approvals = await _documentService.GetDocumentApprovalsAsync(documentId);
            return Ok(approvals);
        }

        /// <summary>
        /// Request approval for a document
        /// </summary>
        [HttpPost("{documentId}/request-approval")]
        public async Task<ActionResult<DocumentDto>> RequestApproval(int documentId, [FromBody] RequestApprovalRequest request)
        {
            var document = await _documentService.RequestApprovalAsync(documentId, request);
            return Ok(document);
        }

        /// <summary>
        /// Submit approval decision
        /// </summary>
        [HttpPost("approvals/{approvalId}/submit")]
        public async Task<ActionResult<DocumentApprovalDto>> SubmitApproval(int approvalId, [FromBody] SubmitApprovalRequest request)
        {
            var approval = await _documentService.SubmitApprovalAsync(approvalId, request);
            return Ok(approval);
        }

        /// <summary>
        /// Cancel approval request
        /// </summary>
        [HttpPost("{documentId}/cancel-approval")]
        public async Task<ActionResult<DocumentDto>> CancelApproval(int documentId)
        {
            var document = await _documentService.CancelApprovalRequestAsync(documentId);
            return Ok(document);
        }

        #endregion

        #region Downloads

        /// <summary>
        /// Download a document
        /// </summary>
        [HttpGet("{id}/download")]
        public async Task<ActionResult> DownloadDocument(int id)
        {
            var content = await _documentService.DownloadDocumentAsync(id);
            if (content == null)
                return NotFound();

            var document = await _documentService.GetDocumentByIdAsync(id);
            return File(content, "application/octet-stream", document?.FileName ?? "document");
        }

        /// <summary>
        /// Download a specific version
        /// </summary>
        [HttpGet("versions/{versionId}/download")]
        public async Task<ActionResult> DownloadVersion(int versionId)
        {
            var content = await _documentService.DownloadVersionAsync(versionId);
            if (content == null)
                return NotFound();

            var version = await _documentService.GetVersionByIdAsync(versionId);
            return File(content, "application/octet-stream", version?.FileName ?? "version");
        }

        #endregion
    }
}

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    /// <summary>
    /// Service interface for inspection management
    /// </summary>
    public interface IInspectionService
    {
        #region Inspection Requests

        /// <summary>
        /// Create a new inspection request
        /// </summary>
        Task<InspectionRequestDto> CreateRequestAsync(int clientUserId, CreateInspectionRequestDto dto);

        /// <summary>
        /// Get inspection request by ID
        /// </summary>
        Task<InspectionRequestDto?> GetRequestByIdAsync(int id, int userId);

        /// <summary>
        /// Get inspection requests for a client
        /// </summary>
        Task<InspectionRequestPagedResultDto> GetClientRequestsAsync(int clientUserId, InspectionFilterDto filter);

        /// <summary>
        /// Get inspection requests for a company
        /// </summary>
        Task<InspectionRequestPagedResultDto> GetCompanyRequestsAsync(int companyId, InspectionFilterDto filter);

        /// <summary>
        /// Update inspection request
        /// </summary>
        Task<InspectionRequestDto> UpdateRequestAsync(int id, int clientUserId, UpdateInspectionRequestDto dto);

        /// <summary>
        /// Cancel inspection request
        /// </summary>
        Task<bool> CancelRequestAsync(int id, int userId, string? reason);

        #endregion

        #region Time Slots

        /// <summary>
        /// Add time slots to an inspection request
        /// </summary>
        Task<List<InspectionTimeSlotDto>> AddTimeSlotsAsync(int inspectionId, int userId, List<CreateTimeSlotDto> slots);

        /// <summary>
        /// Select a time slot
        /// </summary>
        Task<bool> SelectTimeSlotAsync(int inspectionId, int timeSlotId, int userId);

        /// <summary>
        /// Remove a time slot
        /// </summary>
        Task<bool> RemoveTimeSlotAsync(int inspectionId, int timeSlotId, int userId);

        #endregion

        #region Quotes

        /// <summary>
        /// Create a quote for an inspection request
        /// </summary>
        Task<InspectionQuoteDto> CreateQuoteAsync(int inspectionId, int companyUserId, CreateInspectionQuoteDto dto);

        /// <summary>
        /// Get quotes for an inspection request
        /// </summary>
        Task<List<InspectionQuoteDto>> GetQuotesAsync(int inspectionId);

        /// <summary>
        /// Accept a quote
        /// </summary>
        Task<bool> AcceptQuoteAsync(int inspectionId, int quoteId, int clientUserId);

        /// <summary>
        /// Reject a quote
        /// </summary>
        Task<bool> RejectQuoteAsync(int inspectionId, int quoteId, int clientUserId, string? reason);

        #endregion

        #region Session Management

        /// <summary>
        /// Generate QR code for inspection verification
        /// </summary>
        Task<QRCodeResponseDto> GenerateQRCodeAsync(int inspectionId, int companyUserId);

        /// <summary>
        /// Verify inspection start via QR code
        /// </summary>
        Task<InspectionSessionDto> VerifyStartAsync(int inspectionId, int clientUserId, VerifyInspectionStartDto dto);

        /// <summary>
        /// Start inspection (company side)
        /// </summary>
        Task<InspectionSessionDto> StartInspectionAsync(int inspectionId, int companyUserId, StartInspectionDto dto);

        /// <summary>
        /// Approve inspection start request (client side)
        /// </summary>
        Task<InspectionSessionDto> ApproveStartAsync(int inspectionId, int clientUserId);

        /// <summary>
        /// Complete inspection
        /// </summary>
        Task<bool> CompleteInspectionAsync(int inspectionId, int companyUserId, string? notes);

        /// <summary>
        /// Get session details
        /// </summary>
        Task<InspectionSessionDto?> GetSessionAsync(int inspectionId);

        #endregion

        #region Documents

        /// <summary>
        /// Upload document to inspection
        /// </summary>
        Task<InspectionDocumentDto> UploadDocumentAsync(int inspectionId, int userId, UploadInspectionDocumentDto dto, byte[] fileData, string fileName, string mimeType);

        /// <summary>
        /// Get documents for inspection
        /// </summary>
        Task<List<InspectionDocumentDto>> GetDocumentsAsync(int inspectionId);

        /// <summary>
        /// Delete document
        /// </summary>
        Task<bool> DeleteDocumentAsync(int inspectionId, int documentId, int userId);

        #endregion

        #region Payments

        /// <summary>
        /// Process payment for inspection
        /// </summary>
        Task<InspectionPaymentDto> ProcessPaymentAsync(int inspectionId, int clientUserId, PayInspectionDto dto);

        /// <summary>
        /// Confirm cash payment
        /// </summary>
        Task<InspectionPaymentDto> ConfirmCashPaymentAsync(int inspectionId, int companyUserId, ConfirmCashPaymentDto dto);

        /// <summary>
        /// Get payment details
        /// </summary>
        Task<InspectionPaymentDto?> GetPaymentAsync(int inspectionId);

        #endregion

        #region Work Requests

        /// <summary>
        /// Create work request from inspection
        /// </summary>
        Task<InspectionWorkRequestDto> CreateWorkRequestAsync(int inspectionId, int clientUserId, CreateWorkRequestDto dto);

        /// <summary>
        /// Respond to work request
        /// </summary>
        Task<InspectionWorkRequestDto> RespondToWorkRequestAsync(int inspectionId, int companyUserId, RespondToWorkRequestDto dto);

        /// <summary>
        /// Convert work request to project
        /// </summary>
        Task<int> ConvertToProjectAsync(int inspectionId, int companyUserId);

        #endregion

        #region Reviews

        /// <summary>
        /// Create review for inspection
        /// </summary>
        Task<InspectionReviewDto> CreateReviewAsync(int inspectionId, int clientUserId, CreateInspectionReviewDto dto);

        /// <summary>
        /// Get review for inspection
        /// </summary>
        Task<InspectionReviewDto?> GetReviewAsync(int inspectionId);

        /// <summary>
        /// Respond to review (company)
        /// </summary>
        Task<InspectionReviewDto> RespondToReviewAsync(int inspectionId, int companyUserId, string response);

        #endregion

        #region Cost Estimates

        /// <summary>
        /// Create cost estimate for inspection
        /// </summary>
        Task<InspectionCostEstimateDto> CreateCostEstimateAsync(int inspectionId, int companyUserId, CreateCostEstimateDto dto);

        /// <summary>
        /// Get cost estimate for inspection
        /// </summary>
        Task<InspectionCostEstimateDto?> GetCostEstimateAsync(int inspectionId);

        /// <summary>
        /// Update cost estimate
        /// </summary>
        Task<InspectionCostEstimateDto> UpdateCostEstimateAsync(int inspectionId, int estimateId, int companyUserId, CreateCostEstimateDto dto);

        #endregion

        #region Rescheduling

        /// <summary>
        /// Create reschedule request
        /// </summary>
        Task<InspectionRescheduleRequestDto> CreateRescheduleRequestAsync(int inspectionId, int userId, CreateRescheduleRequestDto dto);

        /// <summary>
        /// Respond to reschedule request
        /// </summary>
        Task<InspectionRescheduleRequestDto> RespondToRescheduleAsync(int inspectionId, int rescheduleId, int userId, RespondToRescheduleDto dto);

        /// <summary>
        /// Get reschedule requests for inspection
        /// </summary>
        Task<List<InspectionRescheduleRequestDto>> GetRescheduleRequestsAsync(int inspectionId);

        #endregion

        #region Chat

        /// <summary>
        /// Send chat message
        /// </summary>
        Task<InspectionChatMessageDto> SendMessageAsync(int inspectionId, int userId, SendChatMessageDto dto);

        /// <summary>
        /// Get chat messages
        /// </summary>
        Task<List<InspectionChatMessageDto>> GetMessagesAsync(int inspectionId, int userId, int? afterId = null);

        /// <summary>
        /// Mark messages as read
        /// </summary>
        Task<int> MarkMessagesAsReadAsync(int inspectionId, int userId);

        #endregion

        #region Checklists

        /// <summary>
        /// Get checklist templates for company
        /// </summary>
        Task<List<InspectionChecklistTemplateDto>> GetChecklistTemplatesAsync(int companyId, int? propertyType = null);

        /// <summary>
        /// Create checklist template
        /// </summary>
        Task<InspectionChecklistTemplateDto> CreateChecklistTemplateAsync(int companyUserId, InspectionChecklistTemplateDto dto);

        /// <summary>
        /// Apply checklist to inspection
        /// </summary>
        Task<bool> ApplyChecklistAsync(int inspectionId, int templateId, int companyUserId);

        /// <summary>
        /// Submit checklist response
        /// </summary>
        Task<InspectionChecklistResponseDto> SubmitChecklistResponseAsync(int inspectionId, int companyUserId, SubmitChecklistResponseDto dto);

        /// <summary>
        /// Get checklist responses for inspection
        /// </summary>
        Task<List<InspectionChecklistResponseDto>> GetChecklistResponsesAsync(int inspectionId);

        #endregion

        #region Team Management

        /// <summary>
        /// Assign team member to inspection
        /// </summary>
        Task<InspectionTeamMemberDto> AssignTeamMemberAsync(int inspectionId, int companyUserId, AssignTeamMemberDto dto);

        /// <summary>
        /// Remove team member from inspection
        /// </summary>
        Task<bool> RemoveTeamMemberAsync(int inspectionId, int teamMemberId, int companyUserId);

        /// <summary>
        /// Get team members for inspection
        /// </summary>
        Task<List<InspectionTeamMemberDto>> GetTeamMembersAsync(int inspectionId);

        #endregion

        #region Signatures

        /// <summary>
        /// Submit signature
        /// </summary>
        Task<InspectionSignatureDto> SubmitSignatureAsync(int inspectionId, int userId, SubmitSignatureDto dto);

        /// <summary>
        /// Get signatures for inspection
        /// </summary>
        Task<List<InspectionSignatureDto>> GetSignaturesAsync(int inspectionId);

        #endregion

        #region Audio Notes

        /// <summary>
        /// Upload audio note
        /// </summary>
        Task<InspectionAudioNoteDto> UploadAudioNoteAsync(int inspectionId, int userId, byte[] audioData, int durationSeconds);

        /// <summary>
        /// Get audio notes for inspection
        /// </summary>
        Task<List<InspectionAudioNoteDto>> GetAudioNotesAsync(int inspectionId);

        #endregion

        #region Reports

        /// <summary>
        /// Generate inspection report
        /// </summary>
        Task<InspectionReportDto> GenerateReportAsync(int inspectionId, int companyUserId, GenerateReportDto dto);

        /// <summary>
        /// Get report for inspection
        /// </summary>
        Task<InspectionReportDto?> GetReportAsync(int inspectionId);

        /// <summary>
        /// Send report to client
        /// </summary>
        Task<bool> SendReportToClientAsync(int inspectionId, int companyUserId);

        #endregion

        #region Analytics

        /// <summary>
        /// Get inspection analytics for company
        /// </summary>
        Task<InspectionAnalyticsDto> GetAnalyticsAsync(int companyId, DateTime? fromDate = null, DateTime? toDate = null);

        #endregion

        #region Notifications

        /// <summary>
        /// Send inspection reminders (called by background job)
        /// </summary>
        Task SendInspectionRemindersAsync();

        #endregion
    }
}
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    /// <summary>
    /// Interface for Client Portal services
    /// </summary>
    public interface IClientPortalService
    {
        #region Client Portal Settings

        /// <summary>
        /// Get client portal settings for a company
        /// </summary>
        Task<ClientPortalSettingsDto?> GetClientPortalSettingsAsync(int companyId);

        /// <summary>
        /// Update client portal settings
        /// </summary>
        Task<ClientPortalSettingsDto> UpdateClientPortalSettingsAsync(int companyId, UpdateClientPortalSettingsRequest request);

        #endregion

        #region Client Users

        /// <summary>
        /// Get all client users for a company
        /// </summary>
        Task<List<ClientUserDto>> GetClientUsersAsync(int companyId);

        /// <summary>
        /// Get client user by ID
        /// </summary>
        Task<ClientUserDto?> GetClientUserAsync(int clientUserId);

        /// <summary>
        /// Create a new client user
        /// </summary>
        Task<ClientUserDto> CreateClientUserAsync(int companyId, CreateClientUserRequest request);

        /// <summary>
        /// Update client user
        /// </summary>
        Task<ClientUserDto?> UpdateClientUserAsync(int clientUserId, UpdateClientUserRequest request);

        /// <summary>
        /// Delete client user
        /// </summary>
        Task<bool> DeleteClientUserAsync(int clientUserId);

        /// <summary>
        /// Client login
        /// </summary>
        Task<ClientLoginResponse?> ClientLoginAsync(ClientLoginRequest request);

        /// <summary>
        /// Change client password
        /// </summary>
        Task<bool> ChangeClientPasswordAsync(int clientUserId, ChangeClientPasswordRequest request);

        /// <summary>
        /// Reset client password (send reset email)
        /// </summary>
        Task<bool> ResetClientPasswordAsync(ResetClientPasswordRequest request);

        /// <summary>
        /// Set new password with reset token
        /// </summary>
        Task<bool> SetClientPasswordAsync(SetClientPasswordRequest request);

        #endregion

        #region Client Project Access

        /// <summary>
        /// Get project access for a client user
        /// </summary>
        Task<List<ClientProjectAccessDto>> GetClientProjectAccessAsync(int clientUserId);

        /// <summary>
        /// Grant project access to client user
        /// </summary>
        Task<ClientProjectAccessDto> GrantProjectAccessAsync(int companyId, GrantClientProjectAccessRequest request);

        /// <summary>
        /// Update client project access
        /// </summary>
        Task<ClientProjectAccessDto?> UpdateProjectAccessAsync(int accessId, UpdateClientProjectAccessRequest request);

        /// <summary>
        /// Revoke client project access
        /// </summary>
        Task<bool> RevokeProjectAccessAsync(int accessId);

        #endregion

        #region Client Dashboard

        /// <summary>
        /// Get client dashboard data
        /// </summary>
        Task<ClientDashboardDto> GetClientDashboardAsync(int clientUserId);

        /// <summary>
        /// Get companies associated with the current user via join requests
        /// </summary>
        Task<List<ClientCompanyDto>> GetMyCompaniesAsync(int userId);

        #endregion

        #region Client Payments

        /// <summary>
        /// Get payment history for client
        /// </summary>
        Task<List<ClientPaymentDto>> GetClientPaymentsAsync(int clientUserId, int? projectId = null);

        /// <summary>
        /// Get payment summary for client
        /// </summary>
        Task<ClientPaymentSummaryDto> GetClientPaymentSummaryAsync(int clientUserId);

        #endregion

        #region Client Messages

        /// <summary>
        /// Get messages for client
        /// </summary>
        Task<List<ClientMessageDto>> GetClientMessagesAsync(int clientUserId, string? status = null);

        /// <summary>
        /// Get message by ID
        /// </summary>
        Task<ClientMessageDto?> GetClientMessageAsync(int messageId);

        /// <summary>
        /// Create new message
        /// </summary>
        Task<ClientMessageDto> CreateClientMessageAsync(int clientUserId, CreateClientMessageRequest request);

        /// <summary>
        /// Reply to message
        /// </summary>
        Task<MessageReplyDto> ReplyToMessageAsync(int clientUserId, CreateMessageReplyRequest request);

        /// <summary>
        /// Get message replies
        /// </summary>
        Task<List<MessageReplyDto>> GetMessageRepliesAsync(int messageId);

        /// <summary>
        /// Mark message as read
        /// </summary>
        Task<bool> MarkMessageAsReadAsync(int messageId);

        #endregion

        #region Change Orders

        /// <summary>
        /// Get change order requests for client
        /// </summary>
        Task<List<ChangeOrderRequestDto>> GetChangeOrderRequestsAsync(int clientUserId, int? projectId = null);

        /// <summary>
        /// Get change order request by ID
        /// </summary>
        Task<ChangeOrderRequestDto?> GetChangeOrderRequestAsync(int requestId);

        /// <summary>
        /// Create change order request
        /// </summary>
        Task<ChangeOrderRequestDto> CreateChangeOrderRequestAsync(int clientUserId, CreateChangeOrderRequestRequest request);

        /// <summary>
        /// Update change order request (draft only)
        /// </summary>
        Task<ChangeOrderRequestDto?> UpdateChangeOrderRequestAsync(int requestId, UpdateChangeOrderRequestRequest request);

        /// <summary>
        /// Cancel change order request
        /// </summary>
        Task<bool> CancelChangeOrderRequestAsync(int requestId);

        #endregion

        #region Client Project Progress

        /// <summary>
        /// Get project progress for client
        /// </summary>
        Task<ClientProjectProgressDto?> GetClientProjectProgressAsync(int clientUserId, int projectId);

        #endregion

        #region Client Activity

        /// <summary>
        /// Get recent activities for client
        /// </summary>
        Task<List<ClientActivityDto>> GetClientActivitiesAsync(int clientUserId, int count = 20);

        #endregion

        #region Admin Functions

        /// <summary>
        /// Get all messages for company (admin)
        /// </summary>
        Task<List<ClientMessageDto>> GetAllClientMessagesAsync(int companyId, string? status = null, int? assignedTo = null);

        /// <summary>
        /// Assign message to staff
        /// </summary>
        Task<ClientMessageDto?> AssignMessageAsync(int messageId, int assignedToUserId);

        /// <summary>
        /// Update message status (admin)
        /// </summary>
        Task<ClientMessageDto?> UpdateMessageStatusAsync(int messageId, string status);

        /// <summary>
        /// Resolve message (admin)
        /// </summary>
        Task<ClientMessageDto?> ResolveMessageAsync(int messageId, string resolution);

        /// <summary>
        /// Get all change orders for company (admin)
        /// </summary>
        Task<List<ChangeOrderRequestDto>> GetAllChangeOrdersAsync(int companyId, string? status = null, int? projectId = null);

        /// <summary>
        /// Review change order (admin)
        /// </summary>
        Task<ChangeOrderRequestDto?> ReviewChangeOrderAsync(int requestId, int reviewedByUserId, string status, string? notes, decimal? budget, int? days);

        #endregion
    }
}

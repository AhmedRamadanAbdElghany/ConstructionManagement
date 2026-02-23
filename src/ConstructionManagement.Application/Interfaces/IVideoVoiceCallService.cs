using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IVideoVoiceCallService
    {
        #region Call Session Management

        /// <summary>
        /// Initiate a new call (video or voice)
        /// </summary>
        Task<CallSessionDto> InitiateCallAsync(int initiatorId, InitiateCallRequest request);

        /// <summary>
        /// Answer an incoming call
        /// </summary>
        Task<CallSessionDto> AnswerCallAsync(int userId, AnswerCallRequest request);

        /// <summary>
        /// End an active call
        /// </summary>
        Task<CallSessionDto> EndCallAsync(int userId, EndCallRequest request);

        /// <summary>
        /// Get call session details
        /// </summary>
        Task<CallSessionDto> GetCallSessionAsync(int callSessionId);

        /// <summary>
        /// Get active call for a user (if any)
        /// </summary>
        Task<CallSessionDto?> GetActiveCallForUserAsync(int userId);

        /// <summary>
        /// Get pending incoming calls for a user
        /// </summary>
        Task<List<IncomingCallDto>> GetPendingIncomingCallsAsync(int userId);

        #endregion

        #region Call History

        /// <summary>
        /// Get call history for a user
        /// </summary>
        Task<CallHistoryDto> GetCallHistoryAsync(int userId, int? skip = null, int? take = null, string? callType = null);

        /// <summary>
        /// Get call statistics for a user
        /// </summary>
        Task<CallStatsDto> GetCallStatsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get call history for a conversation
        /// </summary>
        Task<List<CallSessionDto>> GetConversationCallHistoryAsync(int conversationId, int skip = 0, int take = 50);

        #endregion

        #region Participant Management

        /// <summary>
        /// Join an existing group call
        /// </summary>
        Task<CallSessionDto> JoinCallAsync(int userId, JoinCallRequest request);

        /// <summary>
        /// Leave a call
        /// </summary>
        Task LeaveCallAsync(int userId, LeaveCallRequest request);

        /// <summary>
        /// Invite users to an existing call
        /// </summary>
        Task<CallSessionDto> InviteToCallAsync(int inviterId, InviteToCallRequest request);

        /// <summary>
        /// Update participant status (mute, video, screen share)
        /// </summary>
        Task<CallParticipantDto> UpdateParticipantStatusAsync(int userId, UpdateParticipantStatusRequest request);

        /// <summary>
        /// Kick a participant from a call (moderator only)
        /// </summary>
        Task KickParticipantAsync(int moderatorId, int callSessionId, int participantUserId);

        #endregion

        #region WebRTC Signaling

        /// <summary>
        /// Send a WebRTC signal message
        /// </summary>
        Task<SignalMessageResponse> SendSignalAsync(int senderId, SignalMessageDto signal);

        /// <summary>
        /// Get pending signals for a user
        /// </summary>
        Task<List<SignalMessageResponse>> GetPendingSignalsAsync(int userId, int callSessionId);

        /// <summary>
        /// Mark signals as delivered
        /// </summary>
        Task MarkSignalsDeliveredAsync(int userId, List<int> signalIds);

        #endregion

        #region Recording

        /// <summary>
        /// Start call recording
        /// </summary>
        Task<CallRecordingDto> StartRecordingAsync(int userId, StartRecordingRequest request);

        /// <summary>
        /// Stop call recording
        /// </summary>
        Task<CallRecordingDto> StopRecordingAsync(int userId, StopRecordingRequest request);

        /// <summary>
        /// Get recordings for a call
        /// </summary>
        Task<List<CallRecordingDto>> GetCallRecordingsAsync(int callSessionId);

        #endregion

        #region Group Call Settings

        /// <summary>
        /// Update group call settings
        /// </summary>
        Task<GroupCallSettingsDto> UpdateGroupCallSettingsAsync(int callSessionId, GroupCallSettingsDto settings);

        /// <summary>
        /// Get group call settings
        /// </summary>
        Task<GroupCallSettingsDto> GetGroupCallSettingsAsync(int callSessionId);

        #endregion
    }
}

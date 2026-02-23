using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    #region Call Session DTOs

    public class CallSessionDto
    {
        public int Id { get; set; }
        public int InitiatorId { get; set; }
        public string InitiatorName { get; set; } = string.Empty;
        public string? InitiatorAvatar { get; set; }
        public int? ReceiverId { get; set; }
        public string? ReceiverName { get; set; }
        public string? ReceiverAvatar { get; set; }
        public int? ConversationId { get; set; }
        public string CallType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? AnsweredAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public int? DurationSeconds { get; set; }
        public string? EndReason { get; set; }
        public bool IsGroupCall { get; set; }
        public int? ProjectId { get; set; }
        public string? RoomId { get; set; }
        public bool IsRecorded { get; set; }
        public List<CallParticipantDto> Participants { get; set; } = new();
    }

    public class CallParticipantDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
        public bool IsMuted { get; set; }
        public bool IsVideoEnabled { get; set; }
        public bool IsScreenSharing { get; set; }
    }

    public class IncomingCallDto
    {
        public int CallSessionId { get; set; }
        public int InitiatorId { get; set; }
        public string InitiatorName { get; set; } = string.Empty;
        public string? InitiatorAvatar { get; set; }
        public string CallType { get; set; } = string.Empty;
        public bool IsGroupCall { get; set; }
        public string? RoomId { get; set; }
        public List<CallParticipantDto> ExistingParticipants { get; set; } = new();
    }

    #endregion

    #region Request DTOs

    public class InitiateCallRequest
    {
        public int? ReceiverId { get; set; }
        public int? ConversationId { get; set; }
        public string CallType { get; set; } = "Video";
        public bool IsGroupCall { get; set; }
        public int? ProjectId { get; set; }
        public List<int>? ParticipantIds { get; set; }
    }

    public class AnswerCallRequest
    {
        public int CallSessionId { get; set; }
        public bool Accept { get; set; }
    }

    public class EndCallRequest
    {
        public int CallSessionId { get; set; }
        public string? Reason { get; set; }
        public string? Details { get; set; }
    }

    public class UpdateParticipantStatusRequest
    {
        public int CallSessionId { get; set; }
        public bool? IsMuted { get; set; }
        public bool? IsVideoEnabled { get; set; }
        public bool? IsScreenSharing { get; set; }
    }

    #endregion

    #region WebRTC Signaling DTOs

    public class SignalMessageDto
    {
        public int CallSessionId { get; set; }
        public string SignalType { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public int? ReceiverId { get; set; }
    }

    public class SignalMessageResponse
    {
        public int Id { get; set; }
        public int CallSessionId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public int? ReceiverId { get; set; }
        public string SignalType { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
    }

    public class IceCandidateDto
    {
        public string Candidate { get; set; } = string.Empty;
        public string SdpMid { get; set; } = string.Empty;
        public int SdpMLineIndex { get; set; }
    }

    public class SessionDescriptionDto
    {
        public string Type { get; set; } = string.Empty;
        public string Sdp { get; set; } = string.Empty;
    }

    #endregion

    #region Call History & Stats

    public class CallHistoryDto
    {
        public List<CallSessionDto> Calls { get; set; } = new();
        public int TotalCount { get; set; }
        public int TotalDurationSeconds { get; set; }
        public int MissedCount { get; set; }
        public int OutgoingCount { get; set; }
        public int IncomingCount { get; set; }
    }

    public class CallStatsDto
    {
        public int TotalCalls { get; set; }
        public int TotalDurationMinutes { get; set; }
        public int VideoCalls { get; set; }
        public int VoiceCalls { get; set; }
        public int GroupCalls { get; set; }
        public int MissedCalls { get; set; }
        public double AverageDurationMinutes { get; set; }
        public List<MonthlyCallStatsDto> MonthlyStats { get; set; } = new();
    }

    public class MonthlyCallStatsDto
    {
        public string Month { get; set; } = string.Empty;
        public int TotalCalls { get; set; }
        public int TotalDurationMinutes { get; set; }
        public int VideoCalls { get; set; }
        public int VoiceCalls { get; set; }
    }

    #endregion

    #region Group Call DTOs

    public class GroupCallSettingsDto
    {
        public int MaxParticipants { get; set; } = 10;
        public bool AllowScreenShare { get; set; } = true;
        public bool AllowRecording { get; set; } = false;
        public bool MuteOnJoin { get; set; } = false;
        public bool VideoOnJoin { get; set; } = true;
    }

    public class InviteToCallRequest
    {
        public int CallSessionId { get; set; }
        public List<int> UserIds { get; set; } = new();
    }

    public class JoinCallRequest
    {
        public int CallSessionId { get; set; }
    }

    public class LeaveCallRequest
    {
        public int CallSessionId { get; set; }
    }

    #endregion

    #region Recording DTOs

    public class CallRecordingDto
    {
        public int Id { get; set; }
        public int CallSessionId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public string Format { get; set; } = string.Empty;
        public int DurationSeconds { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? DownloadUrl { get; set; }
    }

    public class StartRecordingRequest
    {
        public int CallSessionId { get; set; }
    }

    public class StopRecordingRequest
    {
        public int CallSessionId { get; set; }
    }

    #endregion
}

using System;
using System.Collections.Generic;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Represents a video or voice call session
    /// </summary>
    public class CallSession : BaseEntity
    {
        public int InitiatorId { get; set; }
        public User Initiator { get; set; } = null!;

        public int? ReceiverId { get; set; }
        public User? Receiver { get; set; }

        public int? ConversationId { get; set; }
        public Conversation? Conversation { get; set; }

        public CallType CallType { get; set; }
        public CallStatus Status { get; set; }

        public DateTime StartedAt { get; set; }
        public DateTime? AnsweredAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public int? DurationSeconds { get; set; }

        public EndReason? EndReason { get; set; }
        public string? EndReasonDetails { get; set; }

        // For group calls
        public bool IsGroupCall { get; set; }
        public int? ProjectId { get; set; }
        public Project? Project { get; set; }

        // WebRTC signaling
        public string? RoomId { get; set; }
        public string? SessionToken { get; set; }

        // Recording (optional)
        public bool IsRecorded { get; set; }
        public string? RecordingUrl { get; set; }

        // Navigation
        public ICollection<CallParticipant> Participants { get; set; } = new List<CallParticipant>();
        public ICollection<CallSignal> Signals { get; set; } = new List<CallSignal>();
    }

    /// <summary>
    /// Participant in a call session
    /// </summary>
    public class CallParticipant : BaseEntity
    {
        public int CallSessionId { get; set; }
        public CallSession CallSession { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ParticipantRole Role { get; set; }
        public ParticipantStatus Status { get; set; }

        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }

        public bool IsMuted { get; set; }
        public bool IsVideoEnabled { get; set; }
        public bool IsScreenSharing { get; set; }

        public string? ConnectionId { get; set; }
    }

    /// <summary>
    /// WebRTC signaling messages
    /// </summary>
    public class CallSignal : BaseEntity
    {
        public int CallSessionId { get; set; }
        public CallSession CallSession { get; set; } = null!;

        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;

        public int? ReceiverId { get; set; }
        public User? Receiver { get; set; }

        public SignalType SignalType { get; set; }
        public string Payload { get; set; } = string.Empty;

        public DateTime SentAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }

    /// <summary>
    /// Call recording metadata
    /// </summary>
    public class CallRecording : BaseEntity
    {
        public int CallSessionId { get; set; }
        public CallSession CallSession { get; set; } = null!;

        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public string Format { get; set; } = "webm";
        public int DurationSeconds { get; set; }

        public RecordingStatus Status { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public string? TranscriptionText { get; set; }
        public string? TranscriptionLanguage { get; set; }
    }

    #region Enums

    public enum CallType
    {
        Voice = 1,
        Video = 2
    }

    public enum CallStatus
    {
        Initiating = 1,
        Ringing = 2,
        Connecting = 3,
        Active = 4,
        OnHold = 5,
        Ended = 6,
        Missed = 7,
        Rejected = 8,
        Failed = 9
    }

    public enum EndReason
    {
        Normal = 1,
        UserEnded = 2,
        ConnectionLost = 3,
        Timeout = 4,
        Rejected = 5,
        Busy = 6,
        Error = 7
    }

    public enum ParticipantRole
    {
        Initiator = 1,
        Receiver = 2,
        Moderator = 3,
        Participant = 4
    }

    public enum ParticipantStatus
    {
        Invited = 1,
        Joining = 2,
        Connected = 3,
        OnHold = 4,
        Left = 5,
        Kicked = 6
    }

    public enum SignalType
    {
        Offer = 1,
        Answer = 2,
        IceCandidate = 3,
        Bye = 4,
        Hold = 5,
        Resume = 6,
        Mute = 7,
        Unmute = 8,
        ScreenShareStart = 9,
        ScreenShareStop = 10
    }

    public enum RecordingStatus
    {
        Recording = 1,
        Processing = 2,
        Completed = 3,
        Failed = 4
    }

    #endregion
}

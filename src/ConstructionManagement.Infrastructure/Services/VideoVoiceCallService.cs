using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace ConstructionManagement.Infrastructure.Services
{
    public class VideoVoiceCallService : IVideoVoiceCallService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VideoVoiceCallService> _logger;
        private readonly IPushNotificationService _pushNotificationService;

        public VideoVoiceCallService(
            ApplicationDbContext context,
            ILogger<VideoVoiceCallService> logger,
            IPushNotificationService pushNotificationService)
        {
            _context = context;
            _logger = logger;
            _pushNotificationService = pushNotificationService;
        }

        #region Call Session Management

        public async Task<CallSessionDto> InitiateCallAsync(int initiatorId, InitiateCallRequest request)
        {
            var initiator = await _context.Users.FindAsync(initiatorId);
            if (initiator == null)
                throw new InvalidOperationException($"User {initiatorId} not found");

            var callType = Enum.Parse<CallType>(request.CallType, true);

            var callSession = new CallSession
            {
                InitiatorId = initiatorId,
                ReceiverId = request.ReceiverId,
                ConversationId = request.ConversationId,
                CallType = callType,
                Status = CallStatus.Initiating,
                StartedAt = DateTime.UtcNow,
                IsGroupCall = request.IsGroupCall,
                ProjectId = request.ProjectId,
                RoomId = GenerateRoomId(),
                SessionToken = GenerateSessionToken()
            };

            _context.CallSessions.Add(callSession);
            await _context.SaveChangesAsync();

            // Add initiator as participant
            var initiatorParticipant = new CallParticipant
            {
                CallSessionId = callSession.Id,
                UserId = initiatorId,
                Role = ParticipantRole.Initiator,
                Status = ParticipantStatus.Connected,
                JoinedAt = DateTime.UtcNow,
                IsVideoEnabled = callType == CallType.Video,
                ConnectionId = Guid.NewGuid().ToString()
            };

            _context.CallParticipants.Add(initiatorParticipant);

            // Add additional participants for group calls
            if (request.IsGroupCall && request.ParticipantIds?.Any() == true)
            {
                foreach (var participantId in request.ParticipantIds.Distinct().Where(id => id != initiatorId))
                {
                    var participant = new CallParticipant
                    {
                        CallSessionId = callSession.Id,
                        UserId = participantId,
                        Role = ParticipantRole.Participant,
                        Status = ParticipantStatus.Invited,
                        JoinedAt = DateTime.UtcNow
                    };
                    _context.CallParticipants.Add(participant);
                }
            }

            // Update status to ringing
            callSession.Status = CallStatus.Ringing;
            await _context.SaveChangesAsync();

            // Send push notification to receiver(s)
            await SendCallNotificationAsync(callSession, initiator);

            return await GetCallSessionAsync(callSession.Id);
        }

        public async Task<CallSessionDto> AnswerCallAsync(int userId, AnswerCallRequest request)
        {
            var callSession = await _context.CallSessions
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == request.CallSessionId);

            if (callSession == null)
                throw new InvalidOperationException($"Call session {request.CallSessionId} not found");

            if (callSession.Status != CallStatus.Ringing)
                throw new InvalidOperationException($"Call is not in ringing state");

            if (request.Accept)
            {
                callSession.Status = CallStatus.Active;
                callSession.AnsweredAt = DateTime.UtcNow;

                // Update participant status
                var participant = callSession.Participants.FirstOrDefault(p => p.UserId == userId);
                if (participant != null)
                {
                    participant.Status = ParticipantStatus.Connected;
                    participant.JoinedAt = DateTime.UtcNow;
                    participant.ConnectionId = Guid.NewGuid().ToString();
                }
                else
                {
                    // Add as new participant
                    _context.CallParticipants.Add(new CallParticipant
                    {
                        CallSessionId = callSession.Id,
                        UserId = userId,
                        Role = ParticipantRole.Receiver,
                        Status = ParticipantStatus.Connected,
                        JoinedAt = DateTime.UtcNow,
                        IsVideoEnabled = callSession.CallType == CallType.Video,
                        ConnectionId = Guid.NewGuid().ToString()
                    });
                }
            }
            else
            {
                callSession.Status = CallStatus.Rejected;
                callSession.EndedAt = DateTime.UtcNow;
                callSession.EndReason = EndReason.Rejected;
            }

            await _context.SaveChangesAsync();
            return await GetCallSessionAsync(callSession.Id);
        }

        public async Task<CallSessionDto> EndCallAsync(int userId, EndCallRequest request)
        {
            var callSession = await _context.CallSessions
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == request.CallSessionId);

            if (callSession == null)
                throw new InvalidOperationException($"Call session {request.CallSessionId} not found");

            if (callSession.Status == CallStatus.Ended || callSession.Status == CallStatus.Missed)
                throw new InvalidOperationException("Call already ended");

            callSession.EndedAt = DateTime.UtcNow;
            callSession.Status = CallStatus.Ended;

            if (Enum.TryParse<EndReason>(request.Reason, out var endReason))
            {
                callSession.EndReason = endReason;
            }
            else
            {
                callSession.EndReason = EndReason.UserEnded;
            }

            callSession.EndReasonDetails = request.Details;

            // Calculate duration
            if (callSession.AnsweredAt.HasValue)
            {
                callSession.DurationSeconds = (int)(callSession.EndedAt.Value - callSession.AnsweredAt.Value).TotalSeconds;
            }

            // Update all participants
            foreach (var participant in callSession.Participants.Where(p => p.Status == ParticipantStatus.Connected))
            {
                participant.Status = ParticipantStatus.Left;
                participant.LeftAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return await GetCallSessionAsync(callSession.Id);
        }

        public async Task<CallSessionDto> GetCallSessionAsync(int callSessionId)
        {
            var callSession = await _context.CallSessions
                .Include(c => c.Initiator)
                .Include(c => c.Receiver)
                .Include(c => c.Participants).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(c => c.Id == callSessionId);

            if (callSession == null)
                throw new InvalidOperationException($"Call session {callSessionId} not found");

            return MapToDto(callSession);
        }

        public async Task<CallSessionDto?> GetActiveCallForUserAsync(int userId)
        {
            var activeCall = await _context.CallSessions
                .Include(c => c.Initiator)
                .Include(c => c.Receiver)
                .Include(c => c.Participants).ThenInclude(p => p.User)
                .Where(c => c.Participants.Any(p => p.UserId == userId && p.Status == ParticipantStatus.Connected))
                .Where(c => c.Status == CallStatus.Active || c.Status == CallStatus.Connecting || c.Status == CallStatus.Ringing)
                .FirstOrDefaultAsync();

            return activeCall != null ? MapToDto(activeCall) : null;
        }

        public async Task<List<IncomingCallDto>> GetPendingIncomingCallsAsync(int userId)
        {
            var calls = await _context.CallSessions
                .Include(c => c.Initiator)
                .Include(c => c.Participants).ThenInclude(p => p.User)
                .Where(c => c.Status == CallStatus.Ringing)
                .Where(c => c.ReceiverId == userId || c.Participants.Any(p => p.UserId == userId && p.Status == ParticipantStatus.Invited))
                .OrderByDescending(c => c.StartedAt)
                .ToListAsync();

            return calls.Select(c => new IncomingCallDto
            {
                CallSessionId = c.Id,
                InitiatorId = c.InitiatorId,
                InitiatorName = c.Initiator?.FullName ?? c.Initiator?.Email ?? "Unknown",
                InitiatorAvatar = c.Initiator?.ProfileImageUrl,
                CallType = c.CallType.ToString(),
                IsGroupCall = c.IsGroupCall,
                RoomId = c.RoomId,
                ExistingParticipants = c.Participants
                    .Where(p => p.Status == ParticipantStatus.Connected)
                    .Select(p => new CallParticipantDto
                    {
                        Id = p.Id,
                        UserId = p.UserId,
                        UserName = p.User?.FullName ?? p.User?.Email ?? "Unknown",
                        UserAvatar = p.User?.ProfileImageUrl,
                        Role = p.Role.ToString(),
                        Status = p.Status.ToString(),
                        JoinedAt = p.JoinedAt,
                        IsMuted = p.IsMuted,
                        IsVideoEnabled = p.IsVideoEnabled,
                        IsScreenSharing = p.IsScreenSharing
                    }).ToList()
            }).ToList();
        }

        #endregion

        #region Call History

        public async Task<CallHistoryDto> GetCallHistoryAsync(int userId, int? skip = null, int? take = null, string? callType = null)
        {
            var query = _context.CallSessions
                .Include(c => c.Initiator)
                .Include(c => c.Receiver)
                .Include(c => c.Participants)
                .Where(c => c.InitiatorId == userId || c.ReceiverId == userId || c.Participants.Any(p => p.UserId == userId))
                .AsQueryable();

            if (!string.IsNullOrEmpty(callType) && Enum.TryParse<CallType>(callType, true, out var type))
            {
                query = query.Where(c => c.CallType == type);
            }

            var totalCount = await query.CountAsync();

            if (skip.HasValue)
                query = query.Skip(skip.Value);
            if (take.HasValue)
                query = query.Take(take.Value);

            var calls = await query.OrderByDescending(c => c.StartedAt).ToListAsync();

            var missedCount = calls.Count(c => c.Status == CallStatus.Missed || c.Status == CallStatus.Rejected);
            var outgoingCount = calls.Count(c => c.InitiatorId == userId);
            var incomingCount = calls.Count(c => c.InitiatorId != userId);
            var totalDuration = calls.Where(c => c.DurationSeconds.HasValue).Sum(c => c.DurationSeconds!.Value);

            return new CallHistoryDto
            {
                Calls = calls.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                TotalDurationSeconds = totalDuration,
                MissedCount = missedCount,
                OutgoingCount = outgoingCount,
                IncomingCount = incomingCount
            };
        }

        public async Task<CallStatsDto> GetCallStatsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.CallSessions
                .Where(c => c.InitiatorId == userId || c.ReceiverId == userId || c.Participants.Any(p => p.UserId == userId))
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(c => c.StartedAt >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(c => c.StartedAt <= endDate.Value);

            var calls = await query.ToListAsync();

            var totalDuration = calls.Where(c => c.DurationSeconds.HasValue).Sum(c => c.DurationSeconds!.Value);

            var monthlyStats = calls
                .GroupBy(c => new { c.StartedAt.Year, c.StartedAt.Month })
                .Select(g => new MonthlyCallStatsDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    TotalCalls = g.Count(),
                    TotalDurationMinutes = g.Where(c => c.DurationSeconds.HasValue).Sum(c => c.DurationSeconds!.Value) / 60,
                    VideoCalls = g.Count(c => c.CallType == CallType.Video),
                    VoiceCalls = g.Count(c => c.CallType == CallType.Voice)
                })
                .OrderByDescending(m => m.Month)
                .ToList();

            return new CallStatsDto
            {
                TotalCalls = calls.Count,
                TotalDurationMinutes = totalDuration / 60,
                VideoCalls = calls.Count(c => c.CallType == CallType.Video),
                VoiceCalls = calls.Count(c => c.CallType == CallType.Voice),
                GroupCalls = calls.Count(c => c.IsGroupCall),
                MissedCalls = calls.Count(c => c.Status == CallStatus.Missed || c.Status == CallStatus.Rejected),
                AverageDurationMinutes = calls.Any(c => c.DurationSeconds.HasValue)
                    ? calls.Where(c => c.DurationSeconds.HasValue).Average(c => c.DurationSeconds!.Value) / 60
                    : 0,
                MonthlyStats = monthlyStats
            };
        }

        public async Task<List<CallSessionDto>> GetConversationCallHistoryAsync(int conversationId, int skip = 0, int take = 50)
        {
            var calls = await _context.CallSessions
                .Include(c => c.Initiator)
                .Include(c => c.Receiver)
                .Include(c => c.Participants).ThenInclude(p => p.User)
                .Where(c => c.ConversationId == conversationId)
                .OrderByDescending(c => c.StartedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return calls.Select(MapToDto).ToList();
        }

        #endregion

        #region Participant Management

        public async Task<CallSessionDto> JoinCallAsync(int userId, JoinCallRequest request)
        {
            var callSession = await _context.CallSessions
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == request.CallSessionId);

            if (callSession == null)
                throw new InvalidOperationException($"Call session {request.CallSessionId} not found");

            if (callSession.Status != CallStatus.Active && callSession.Status != CallStatus.Ringing)
                throw new InvalidOperationException("Call is not active");

            var existingParticipant = callSession.Participants.FirstOrDefault(p => p.UserId == userId);
            if (existingParticipant != null)
            {
                existingParticipant.Status = ParticipantStatus.Connected;
                existingParticipant.JoinedAt = DateTime.UtcNow;
                existingParticipant.ConnectionId = Guid.NewGuid().ToString();
            }
            else
            {
                _context.CallParticipants.Add(new CallParticipant
                {
                    CallSessionId = callSession.Id,
                    UserId = userId,
                    Role = ParticipantRole.Participant,
                    Status = ParticipantStatus.Connected,
                    JoinedAt = DateTime.UtcNow,
                    IsVideoEnabled = callSession.CallType == CallType.Video,
                    ConnectionId = Guid.NewGuid().ToString()
                });
            }

            await _context.SaveChangesAsync();
            return await GetCallSessionAsync(callSession.Id);
        }

        public async Task LeaveCallAsync(int userId, LeaveCallRequest request)
        {
            var participant = await _context.CallParticipants
                .Include(p => p.CallSession).ThenInclude(c => c.Participants)
                .FirstOrDefaultAsync(p => p.CallSessionId == request.CallSessionId && p.UserId == userId);

            if (participant == null)
                throw new InvalidOperationException("Participant not found in call");

            participant.Status = ParticipantStatus.Left;
            participant.LeftAt = DateTime.UtcNow;

            // If this was the last participant, end the call
            var callSession = participant.CallSession;
            var activeParticipants = callSession.Participants.Count(p => p.Status == ParticipantStatus.Connected && p.Id != participant.Id);

            if (activeParticipants == 0)
            {
                callSession.Status = CallStatus.Ended;
                callSession.EndedAt = DateTime.UtcNow;
                callSession.EndReason = EndReason.Normal;

                if (callSession.AnsweredAt.HasValue)
                {
                    callSession.DurationSeconds = (int)(callSession.EndedAt.Value - callSession.AnsweredAt.Value).TotalSeconds;
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<CallSessionDto> InviteToCallAsync(int inviterId, InviteToCallRequest request)
        {
            var callSession = await _context.CallSessions
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == request.CallSessionId);

            if (callSession == null)
                throw new InvalidOperationException($"Call session {request.CallSessionId} not found");

            if (callSession.Status != CallStatus.Active)
                throw new InvalidOperationException("Call is not active");

            foreach (var userId in request.UserIds.Distinct())
            {
                if (!callSession.Participants.Any(p => p.UserId == userId))
                {
                    _context.CallParticipants.Add(new CallParticipant
                    {
                        CallSessionId = callSession.Id,
                        UserId = userId,
                        Role = ParticipantRole.Participant,
                        Status = ParticipantStatus.Invited,
                        JoinedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();

            // Send push notifications to invited users
            var inviter = await _context.Users.FindAsync(inviterId);
            foreach (var userId in request.UserIds.Distinct())
            {
                await _pushNotificationService.SendNotificationAsync(
                    userId,
                    "Incoming Call",
                    $"{inviter?.FullName ?? "Someone"} is inviting you to a {callSession.CallType.ToString().ToLower()} call",
                    new Dictionary<string, string>
                    {
                        { "type", "call_invite" },
                        { "callSessionId", callSession.Id.ToString() },
                        { "callType", callSession.CallType.ToString() }
                    }
                );
            }

            return await GetCallSessionAsync(callSession.Id);
        }

        public async Task<CallParticipantDto> UpdateParticipantStatusAsync(int userId, UpdateParticipantStatusRequest request)
        {
            var participant = await _context.CallParticipants
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.CallSessionId == request.CallSessionId && p.UserId == userId);

            if (participant == null)
                throw new InvalidOperationException("Participant not found in call");

            if (request.IsMuted.HasValue)
                participant.IsMuted = request.IsMuted.Value;
            if (request.IsVideoEnabled.HasValue)
                participant.IsVideoEnabled = request.IsVideoEnabled.Value;
            if (request.IsScreenSharing.HasValue)
                participant.IsScreenSharing = request.IsScreenSharing.Value;

            await _context.SaveChangesAsync();

            return new CallParticipantDto
            {
                Id = participant.Id,
                UserId = participant.UserId,
                UserName = participant.User?.FullName ?? participant.User?.Email ?? "Unknown",
                UserAvatar = participant.User?.ProfileImageUrl,
                Role = participant.Role.ToString(),
                Status = participant.Status.ToString(),
                JoinedAt = participant.JoinedAt,
                IsMuted = participant.IsMuted,
                IsVideoEnabled = participant.IsVideoEnabled,
                IsScreenSharing = participant.IsScreenSharing
            };
        }

        public async Task KickParticipantAsync(int moderatorId, int callSessionId, int participantUserId)
        {
            var callSession = await _context.CallSessions
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == callSessionId);

            if (callSession == null)
                throw new InvalidOperationException($"Call session {callSessionId} not found");

            var moderator = callSession.Participants.FirstOrDefault(p => p.UserId == moderatorId);
            if (moderator == null || (moderator.Role != ParticipantRole.Moderator && moderator.Role != ParticipantRole.Initiator))
                throw new UnauthorizedAccessException("Only moderators can kick participants");

            var participant = callSession.Participants.FirstOrDefault(p => p.UserId == participantUserId);
            if (participant == null)
                throw new InvalidOperationException("Participant not found in call");

            participant.Status = ParticipantStatus.Kicked;
            participant.LeftAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        #endregion

        #region WebRTC Signaling

        public async Task<SignalMessageResponse> SendSignalAsync(int senderId, SignalMessageDto signal)
        {
            var callSession = await _context.CallSessions.FindAsync(signal.CallSessionId);
            if (callSession == null)
                throw new InvalidOperationException($"Call session {signal.CallSessionId} not found");

            var sender = await _context.Users.FindAsync(senderId);
            if (sender == null)
                throw new InvalidOperationException($"User {senderId} not found");

            var signalEntity = new CallSignal
            {
                CallSessionId = signal.CallSessionId,
                SenderId = senderId,
                ReceiverId = signal.ReceiverId,
                SignalType = Enum.Parse<SignalType>(signal.SignalType, true),
                Payload = signal.Payload,
                SentAt = DateTime.UtcNow
            };

            _context.CallSignals.Add(signalEntity);
            await _context.SaveChangesAsync();

            return new SignalMessageResponse
            {
                Id = signalEntity.Id,
                CallSessionId = signalEntity.CallSessionId,
                SenderId = signalEntity.SenderId,
                SenderName = sender.FullName ?? sender.Email ?? "Unknown",
                ReceiverId = signalEntity.ReceiverId,
                SignalType = signalEntity.SignalType.ToString(),
                Payload = signalEntity.Payload,
                SentAt = signalEntity.SentAt
            };
        }

        public async Task<List<SignalMessageResponse>> GetPendingSignalsAsync(int userId, int callSessionId)
        {
            var signals = await _context.CallSignals
                .Include(s => s.Sender)
                .Where(s => s.CallSessionId == callSessionId)
                .Where(s => s.ReceiverId == userId || s.ReceiverId == null)
                .Where(s => s.DeliveredAt == null)
                .OrderBy(s => s.SentAt)
                .ToListAsync();

            return signals.Select(s => new SignalMessageResponse
            {
                Id = s.Id,
                CallSessionId = s.CallSessionId,
                SenderId = s.SenderId,
                SenderName = s.Sender?.FullName ?? s.Sender?.Email ?? "Unknown",
                ReceiverId = s.ReceiverId,
                SignalType = s.SignalType.ToString(),
                Payload = s.Payload,
                SentAt = s.SentAt
            }).ToList();
        }

        public async Task MarkSignalsDeliveredAsync(int userId, List<int> signalIds)
        {
            var signals = await _context.CallSignals
                .Where(s => signalIds.Contains(s.Id) && (s.ReceiverId == userId || s.ReceiverId == null))
                .ToListAsync();

            foreach (var signal in signals)
            {
                signal.DeliveredAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        #endregion

        #region Recording

        public async Task<CallRecordingDto> StartRecordingAsync(int userId, StartRecordingRequest request)
        {
            var callSession = await _context.CallSessions
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == request.CallSessionId);

            if (callSession == null)
                throw new InvalidOperationException($"Call session {request.CallSessionId} not found");

            // Check if user is a participant
            if (!callSession.Participants.Any(p => p.UserId == userId))
                throw new UnauthorizedAccessException("Only participants can start recording");

            var recording = new CallRecording
            {
                CallSessionId = request.CallSessionId,
                FileName = $"call_{request.CallSessionId}_{DateTime.UtcNow:yyyyMMddHHmmss}.webm",
                FilePath = $"/recordings/{request.CallSessionId}/",
                Status = RecordingStatus.Recording,
                StartedAt = DateTime.UtcNow
            };

            callSession.IsRecorded = true;

            _context.CallRecordings.Add(recording);
            await _context.SaveChangesAsync();

            return MapToDto(recording);
        }

        public async Task<CallRecordingDto> StopRecordingAsync(int userId, StopRecordingRequest request)
        {
            var recording = await _context.CallRecordings
                .Include(r => r.CallSession).ThenInclude(c => c.Participants)
                .FirstOrDefaultAsync(r => r.CallSessionId == request.CallSessionId && r.Status == RecordingStatus.Recording);

            if (recording == null)
                throw new InvalidOperationException("No active recording found for this call");

            // Check if user is a participant
            if (!recording.CallSession.Participants.Any(p => p.UserId == userId))
                throw new UnauthorizedAccessException("Only participants can stop recording");

            recording.Status = RecordingStatus.Completed;
            recording.CompletedAt = DateTime.UtcNow;
            recording.DurationSeconds = (int)(recording.CompletedAt.Value - recording.StartedAt).TotalSeconds;

            await _context.SaveChangesAsync();

            return MapToDto(recording);
        }

        public async Task<List<CallRecordingDto>> GetCallRecordingsAsync(int callSessionId)
        {
            var recordings = await _context.CallRecordings
                .Where(r => r.CallSessionId == callSessionId)
                .OrderByDescending(r => r.StartedAt)
                .ToListAsync();

            return recordings.Select(MapToDto).ToList();
        }

        #endregion

        #region Group Call Settings

        public async Task<GroupCallSettingsDto> UpdateGroupCallSettingsAsync(int callSessionId, GroupCallSettingsDto settings)
        {
            // Store settings in cache or database
            // For now, just return the settings
            return settings;
        }

        public async Task<GroupCallSettingsDto> GetGroupCallSettingsAsync(int callSessionId)
        {
            // Return default settings
            return new GroupCallSettingsDto();
        }

        #endregion

        #region Private Helpers

        private static string GenerateRoomId()
        {
            return Guid.NewGuid().ToString("N")[..12].ToUpper();
        }

        private static string GenerateSessionToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(bytes);
        }

        private async Task SendCallNotificationAsync(CallSession callSession, User initiator)
        {
            var title = callSession.CallType == CallType.Video ? "Incoming Video Call" : "Incoming Voice Call";
            var body = $"{initiator.FullName ?? initiator.Email ?? "Someone"} is calling you";

            var recipientIds = new List<int>();

            if (callSession.ReceiverId.HasValue)
            {
                recipientIds.Add(callSession.ReceiverId.Value);
            }

            var invitedParticipants = await _context.CallParticipants
                .Where(p => p.CallSessionId == callSession.Id && p.Status == ParticipantStatus.Invited)
                .Select(p => p.UserId)
                .ToListAsync();

            recipientIds.AddRange(invitedParticipants);

            foreach (var recipientId in recipientIds.Distinct())
            {
                await _pushNotificationService.SendNotificationAsync(
                    recipientId,
                    title,
                    body,
                    new Dictionary<string, string>
                    {
                        { "type", "incoming_call" },
                        { "callSessionId", callSession.Id.ToString() },
                        { "callType", callSession.CallType.ToString() },
                        { "roomId", callSession.RoomId ?? string.Empty }
                    }
                );
            }
        }

        private static CallSessionDto MapToDto(CallSession c) => new()
        {
            Id = c.Id,
            InitiatorId = c.InitiatorId,
            InitiatorName = c.Initiator?.FullName ?? c.Initiator?.Email ?? "Unknown",
            InitiatorAvatar = c.Initiator?.ProfileImageUrl,
            ReceiverId = c.ReceiverId,
            ReceiverName = c.Receiver?.FullName ?? c.Receiver?.Email,
            ReceiverAvatar = c.Receiver?.ProfileImageUrl,
            ConversationId = c.ConversationId,
            CallType = c.CallType.ToString(),
            Status = c.Status.ToString(),
            StartedAt = c.StartedAt,
            AnsweredAt = c.AnsweredAt,
            EndedAt = c.EndedAt,
            DurationSeconds = c.DurationSeconds,
            EndReason = c.EndReason?.ToString(),
            IsGroupCall = c.IsGroupCall,
            ProjectId = c.ProjectId,
            RoomId = c.RoomId,
            IsRecorded = c.IsRecorded,
            Participants = c.Participants?.Select(p => new CallParticipantDto
            {
                Id = p.Id,
                UserId = p.UserId,
                UserName = p.User?.FullName ?? p.User?.Email ?? "Unknown",
                UserAvatar = p.User?.ProfileImageUrl,
                Role = p.Role.ToString(),
                Status = p.Status.ToString(),
                JoinedAt = p.JoinedAt,
                LeftAt = p.LeftAt,
                IsMuted = p.IsMuted,
                IsVideoEnabled = p.IsVideoEnabled,
                IsScreenSharing = p.IsScreenSharing
            }).ToList() ?? new List<CallParticipantDto>()
        };

        private static CallRecordingDto MapToDto(CallRecording r) => new()
        {
            Id = r.Id,
            CallSessionId = r.CallSessionId,
            FileName = r.FileName,
            FilePath = r.FilePath,
            FileSizeBytes = r.FileSizeBytes,
            Format = r.Format,
            DurationSeconds = r.DurationSeconds,
            Status = r.Status.ToString(),
            StartedAt = r.StartedAt,
            CompletedAt = r.CompletedAt,
            DownloadUrl = $"{r.FilePath}{r.FileName}"
        };

        #endregion
    }
}

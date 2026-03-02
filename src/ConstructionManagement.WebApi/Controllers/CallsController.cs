using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CallsController : ControllerBase
    {
        private readonly IVideoVoiceCallService _callService;

        public CallsController(IVideoVoiceCallService callService)
        {
            _callService = callService;
        }

        #region Call Session Management

        [HttpPost]
        public async Task<ActionResult<CallSessionDto>> InitiateCall([FromBody] InitiateCallRequest request)
        {
            var userId = GetCurrentUserId();
            var call = await _callService.InitiateCallAsync(userId, request);
            return Ok(call);
        }

        [HttpPost("{id}/answer")]
        public async Task<ActionResult<CallSessionDto>> AnswerCall(int id, [FromBody] AnswerCallRequest request)
        {
            var userId = GetCurrentUserId();
            var answerRequest = new AnswerCallRequest
            {
                CallSessionId = id,
                Accept = request.Accept
            };
            var call = await _callService.AnswerCallAsync(userId, answerRequest);
            return Ok(call);
        }

        [HttpPost("{id}/end")]
        public async Task<ActionResult<CallSessionDto>> EndCall(int id, [FromBody] EndCallRequest request)
        {
            var userId = GetCurrentUserId();
            var endRequest = new EndCallRequest
            {
                CallSessionId = id,
                Reason = request.Reason,
                Details = request.Details
            };
            var call = await _callService.EndCallAsync(userId, endRequest);
            return Ok(call);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "SystemAdmin,CompanyAdmin")]
        public async Task<ActionResult<CallSessionDto>> GetCallSession(int id)
        {
            var call = await _callService.GetCallSessionAsync(id);
            return Ok(call);
        }

        [HttpGet("active")]
        public async Task<ActionResult<CallSessionDto?>> GetActiveCall()
        {
            var userId = GetCurrentUserId();
            var call = await _callService.GetActiveCallForUserAsync(userId);
            return Ok(call);
        }

        [HttpGet("incoming")]
        public async Task<ActionResult<List<IncomingCallDto>>> GetIncomingCalls()
        {
            var userId = GetCurrentUserId();
            var calls = await _callService.GetPendingIncomingCallsAsync(userId);
            return Ok(calls);
        }

        #endregion

        #region Call History

        [HttpGet("history")]
        public async Task<ActionResult<CallHistoryDto>> GetCallHistory(
            [FromQuery] int? skip,
            [FromQuery] int? take,
            [FromQuery] string? callType)
        {
            var userId = GetCurrentUserId();
            var history = await _callService.GetCallHistoryAsync(userId, skip, take, callType);
            return Ok(history);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<CallStatsDto>> GetCallStats(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var userId = GetCurrentUserId();
            var stats = await _callService.GetCallStatsAsync(userId, startDate, endDate);
            return Ok(stats);
        }

        [HttpGet("conversation/{conversationId}")]
        public async Task<ActionResult<List<CallSessionDto>>> GetConversationCallHistory(
            int conversationId,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 50)
        {
            var calls = await _callService.GetConversationCallHistoryAsync(conversationId, skip, take);
            return Ok(calls);
        }

        #endregion

        #region Participant Management

        [HttpPost("{id}/join")]
        public async Task<ActionResult<CallSessionDto>> JoinCall(int id)
        {
            var userId = GetCurrentUserId();
            var call = await _callService.JoinCallAsync(userId, new JoinCallRequest { CallSessionId = id });
            return Ok(call);
        }

        [HttpPost("{id}/leave")]
        public async Task<ActionResult> LeaveCall(int id)
        {
            var userId = GetCurrentUserId();
            await _callService.LeaveCallAsync(userId, new LeaveCallRequest { CallSessionId = id });
            return Ok();
        }

        [HttpPost("{id}/invite")]
        public async Task<ActionResult<CallSessionDto>> InviteToCall(int id, [FromBody] InviteToCallRequest request)
        {
            var userId = GetCurrentUserId();
            var inviteRequest = new InviteToCallRequest
            {
                CallSessionId = id,
                UserIds = request.UserIds
            };
            var call = await _callService.InviteToCallAsync(userId, inviteRequest);
            return Ok(call);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<CallParticipantDto>> UpdateParticipantStatus(
            int id,
            [FromBody] UpdateParticipantStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var statusRequest = new UpdateParticipantStatusRequest
            {
                CallSessionId = id,
                IsMuted = request.IsMuted,
                IsVideoEnabled = request.IsVideoEnabled,
                IsScreenSharing = request.IsScreenSharing
            };
            var participant = await _callService.UpdateParticipantStatusAsync(userId, statusRequest);
            return Ok(participant);
        }

        [HttpPost("{id}/kick/{participantUserId}")]
        public async Task<ActionResult> KickParticipant(int id, int participantUserId)
        {
            var userId = GetCurrentUserId();
            await _callService.KickParticipantAsync(userId, id, participantUserId);
            return Ok();
        }

        #endregion

        #region WebRTC Signaling

        [HttpPost("{id}/signal")]
        public async Task<ActionResult<SignalMessageResponse>> SendSignal(int id, [FromBody] SignalMessageDto signal)
        {
            var userId = GetCurrentUserId();
            var signalRequest = new SignalMessageDto
            {
                CallSessionId = id,
                SignalType = signal.SignalType,
                Payload = signal.Payload,
                ReceiverId = signal.ReceiverId
            };
            var response = await _callService.SendSignalAsync(userId, signalRequest);
            return Ok(response);
        }

        [HttpGet("{id}/signals")]
        public async Task<ActionResult<List<SignalMessageResponse>>> GetPendingSignals(int id)
        {
            var userId = GetCurrentUserId();
            var signals = await _callService.GetPendingSignalsAsync(userId, id);
            return Ok(signals);
        }

        [HttpPost("signals/delivered")]
        public async Task<ActionResult> MarkSignalsDelivered([FromBody] List<int> signalIds)
        {
            var userId = GetCurrentUserId();
            await _callService.MarkSignalsDeliveredAsync(userId, signalIds);
            return Ok();
        }

        #endregion

        #region Recording

        [HttpPost("{id}/recording/start")]
        public async Task<ActionResult<CallRecordingDto>> StartRecording(int id)
        {
            var userId = GetCurrentUserId();
            var recording = await _callService.StartRecordingAsync(userId, new StartRecordingRequest { CallSessionId = id });
            return Ok(recording);
        }

        [HttpPost("{id}/recording/stop")]
        public async Task<ActionResult<CallRecordingDto>> StopRecording(int id)
        {
            var userId = GetCurrentUserId();
            var recording = await _callService.StopRecordingAsync(userId, new StopRecordingRequest { CallSessionId = id });
            return Ok(recording);
        }

        [HttpGet("{id}/recordings")]
        public async Task<ActionResult<List<CallRecordingDto>>> GetRecordings(int id)
        {
            var recordings = await _callService.GetCallRecordingsAsync(id);
            return Ok(recordings);
        }

        #endregion

        #region Group Call Settings

        [HttpGet("{id}/settings")]
        public async Task<ActionResult<GroupCallSettingsDto>> GetGroupCallSettings(int id)
        {
            var settings = await _callService.GetGroupCallSettingsAsync(id);
            return Ok(settings);
        }

        [HttpPut("{id}/settings")]
        public async Task<ActionResult<GroupCallSettingsDto>> UpdateGroupCallSettings(
            int id,
            [FromBody] GroupCallSettingsDto settings)
        {
            var updated = await _callService.UpdateGroupCallSettingsAsync(id, settings);
            return Ok(updated);
        }

        #endregion

        #region Private Helpers

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }
            return userId;
        }

        private int? GetCompanyId()
        {
            var companyIdClaim = User.FindFirst("companyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
            {
                return null;
            }
            return companyId;
        }

        #endregion
    }
}


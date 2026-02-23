import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Call Session DTOs ─────────────────────────────────────────────────────────

export interface CallSessionDto {
    id: number;
    initiatorId: number;
    initiatorName: string;
    initiatorAvatar?: string;
    receiverId?: number;
    receiverName?: string;
    receiverAvatar?: string;
    conversationId?: number;
    callType: string;
    status: string;
    startedAt: string;
    answeredAt?: string;
    endedAt?: string;
    durationSeconds?: number;
    endReason?: string;
    isGroupCall: boolean;
    projectId?: number;
    roomId?: string;
    isRecorded: boolean;
    participants: CallParticipantDto[];
}

export interface CallParticipantDto {
    id: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    role: string;
    status: string;
    joinedAt: string;
    leftAt?: string;
    isMuted: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
}

export interface IncomingCallDto {
    callSessionId: number;
    initiatorId: number;
    initiatorName: string;
    initiatorAvatar?: string;
    callType: string;
    isGroupCall: boolean;
    roomId?: string;
    existingParticipants: CallParticipantDto[];
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface InitiateCallRequest {
    receiverId?: number;
    conversationId?: number;
    callType: string;
    isGroupCall: boolean;
    projectId?: number;
    participantIds?: number[];
}

export interface AnswerCallRequest {
    accept: boolean;
}

export interface EndCallRequest {
    reason?: string;
    details?: string;
}

export interface UpdateParticipantStatusRequest {
    isMuted?: boolean;
    isVideoEnabled?: boolean;
    isScreenSharing?: boolean;
}

// ── WebRTC Signaling DTOs ─────────────────────────────────────────────────────

export interface SignalMessageDto {
    signalType: string;
    payload: string;
    receiverId?: number;
}

export interface SignalMessageResponse {
    id: number;
    callSessionId: number;
    senderId: number;
    senderName: string;
    receiverId?: number;
    signalType: string;
    payload: string;
    sentAt: string;
}

// ── Call History & Stats ──────────────────────────────────────────────────────

export interface CallHistoryDto {
    calls: CallSessionDto[];
    totalCount: number;
    totalDurationSeconds: number;
    missedCount: number;
    outgoingCount: number;
    incomingCount: number;
}

export interface CallStatsDto {
    totalCalls: number;
    totalDurationMinutes: number;
    videoCalls: number;
    voiceCalls: number;
    groupCalls: number;
    missedCalls: number;
    averageDurationMinutes: number;
    monthlyStats: MonthlyCallStatsDto[];
}

export interface MonthlyCallStatsDto {
    month: string;
    totalCalls: number;
    totalDurationMinutes: number;
    videoCalls: number;
    voiceCalls: number;
}

// ── Group Call DTOs ───────────────────────────────────────────────────────────

export interface GroupCallSettingsDto {
    maxParticipants: number;
    allowScreenShare: boolean;
    allowRecording: boolean;
    muteOnJoin: boolean;
    videoOnJoin: boolean;
}

export interface InviteToCallRequest {
    userIds: number[];
}

// ── Recording DTOs ────────────────────────────────────────────────────────────

export interface CallRecordingDto {
    id: number;
    callSessionId: number;
    fileName: string;
    filePath: string;
    fileSizeBytes: number;
    format: string;
    durationSeconds: number;
    status: string;
    startedAt: string;
    completedAt?: string;
    downloadUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class VideoVoiceCallService {
    private http = inject(HttpClient);
    private baseUrl = '/api/calls';

    // ── Call Session Management ─────────────────────────────────────────────────

    initiateCall(request: InitiateCallRequest): Observable<CallSessionDto> {
        return this.http.post<CallSessionDto>(this.baseUrl, request);
    }

    answerCall(callSessionId: number, request: AnswerCallRequest): Observable<CallSessionDto> {
        return this.http.post<CallSessionDto>(`${this.baseUrl}/${callSessionId}/answer`, request);
    }

    endCall(callSessionId: number, request?: EndCallRequest): Observable<CallSessionDto> {
        return this.http.post<CallSessionDto>(`${this.baseUrl}/${callSessionId}/end`, request || {});
    }

    getCallSession(callSessionId: number): Observable<CallSessionDto> {
        return this.http.get<CallSessionDto>(`${this.baseUrl}/${callSessionId}`);
    }

    getActiveCall(): Observable<CallSessionDto | null> {
        return this.http.get<CallSessionDto | null>(`${this.baseUrl}/active`);
    }

    getIncomingCalls(): Observable<IncomingCallDto[]> {
        return this.http.get<IncomingCallDto[]>(`${this.baseUrl}/incoming`);
    }

    // ── Call History ────────────────────────────────────────────────────────────

    getCallHistory(skip?: number, take?: number, callType?: string): Observable<CallHistoryDto> {
        let params = new HttpParams();
        if (skip !== undefined) params = params.set('skip', skip.toString());
        if (take !== undefined) params = params.set('take', take.toString());
        if (callType) params = params.set('callType', callType);
        return this.http.get<CallHistoryDto>(`${this.baseUrl}/history`, { params });
    }

    getCallStats(startDate?: string, endDate?: string): Observable<CallStatsDto> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<CallStatsDto>(`${this.baseUrl}/stats`, { params });
    }

    getConversationCallHistory(conversationId: number, skip: number = 0, take: number = 50): Observable<CallSessionDto[]> {
        let params = new HttpParams()
            .set('skip', skip.toString())
            .set('take', take.toString());
        return this.http.get<CallSessionDto[]>(`${this.baseUrl}/conversation/${conversationId}`, { params });
    }

    // ── Participant Management ──────────────────────────────────────────────────

    joinCall(callSessionId: number): Observable<CallSessionDto> {
        return this.http.post<CallSessionDto>(`${this.baseUrl}/${callSessionId}/join`, {});
    }

    leaveCall(callSessionId: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${callSessionId}/leave`, {});
    }

    inviteToCall(callSessionId: number, request: InviteToCallRequest): Observable<CallSessionDto> {
        return this.http.post<CallSessionDto>(`${this.baseUrl}/${callSessionId}/invite`, request);
    }

    updateParticipantStatus(callSessionId: number, request: UpdateParticipantStatusRequest): Observable<CallParticipantDto> {
        return this.http.put<CallParticipantDto>(`${this.baseUrl}/${callSessionId}/status`, request);
    }

    kickParticipant(callSessionId: number, participantUserId: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${callSessionId}/kick/${participantUserId}`, {});
    }

    // ── WebRTC Signaling ────────────────────────────────────────────────────────

    sendSignal(callSessionId: number, signal: SignalMessageDto): Observable<SignalMessageResponse> {
        return this.http.post<SignalMessageResponse>(`${this.baseUrl}/${callSessionId}/signal`, signal);
    }

    getPendingSignals(callSessionId: number): Observable<SignalMessageResponse[]> {
        return this.http.get<SignalMessageResponse[]>(`${this.baseUrl}/${callSessionId}/signals`);
    }

    markSignalsDelivered(signalIds: number[]): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/signals/delivered`, signalIds);
    }

    // ── Recording ───────────────────────────────────────────────────────────────

    startRecording(callSessionId: number): Observable<CallRecordingDto> {
        return this.http.post<CallRecordingDto>(`${this.baseUrl}/${callSessionId}/recording/start`, {});
    }

    stopRecording(callSessionId: number): Observable<CallRecordingDto> {
        return this.http.post<CallRecordingDto>(`${this.baseUrl}/${callSessionId}/recording/stop`, {});
    }

    getRecordings(callSessionId: number): Observable<CallRecordingDto[]> {
        return this.http.get<CallRecordingDto[]>(`${this.baseUrl}/${callSessionId}/recordings`);
    }

    // ── Group Call Settings ─────────────────────────────────────────────────────

    getGroupCallSettings(callSessionId: number): Observable<GroupCallSettingsDto> {
        return this.http.get<GroupCallSettingsDto>(`${this.baseUrl}/${callSessionId}/settings`);
    }

    updateGroupCallSettings(callSessionId: number, settings: GroupCallSettingsDto): Observable<GroupCallSettingsDto> {
        return this.http.put<GroupCallSettingsDto>(`${this.baseUrl}/${callSessionId}/settings`, settings);
    }
}

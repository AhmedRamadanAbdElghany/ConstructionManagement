import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PublicCompanyDto {
    id: number;
    name: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    followerCount: number;
    portfolioItemCount: number;
    isFollowedByCurrentUser: boolean;
    ownerUserId?: number;
}

export interface PublicCompanyDetailDto extends PublicCompanyDto {
    businessId?: string;
    portfolioItems: PortfolioItemDto[];
    portfolioCategories: PortfolioCategoryDto[];
}

export interface PortfolioItemDto {
    id: number;
    name: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    categoryId?: number;
    categoryName?: string;
    completionDate?: string;
    clientName?: string;
    location?: string;
}

export interface PortfolioCategoryDto {
    id: number;
    name: string;
    description?: string;
    itemCount: number;
}

export interface ConversationDto {
    id: number;
    companyId: number;
    companyName: string;
    companyLogo?: string;
    initiatorUserId: number;
    initiatorName: string;
    initiatorAvatar?: string;
    initiatedBy: string; // 'User' | 'Company'
    conversationType: string; // 'Company' | 'Worker' | 'Client' | 'SystemAdmin'
    targetUserType?: string; // User type for company-initiated conversations
    status: string; // 'Pending' | 'Approved' | 'Blocked'
    createdAt: string;
    lastMessageAt?: string;
    lastMessage?: CompanyMessageDto;
    unreadCount: number;
    canSendMessage: boolean;
    isCompanyOwner: boolean;
}

export interface ConversationDetailDto extends ConversationDto {
    messages: CompanyMessageDto[];
}

export interface CompanyMessageDto {
    id: number;
    senderUserId: number;
    senderName: string;
    senderAvatar?: string;
    content: string;
    isFromCompany: boolean;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    attachments: MessageAttachmentDto[];
}

export interface MessageAttachmentDto {
    id: number;
    fileName: string;
    originalFileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    downloadUrl?: string;
}

export interface CanSendMessageResult {
    canSend: boolean;
    reason?: string;
    status?: string;
}

export interface BlockedUserDto {
    id: number;
    userId: number;
    userName: string;
    userEmail?: string;
    reason?: string;
    blockedAt: string;
    blockedByName: string;
    isActive: boolean;
}

export interface StartConversationRequest {
    recipientUserId: number;
    message: string;
}

export interface SendMessageRequest {
    content: string;
}

export interface BlockUserRequest {
    userId: number;
    reason?: string;
}

export interface BlockConversationRequest {
    reason?: string;
}

export interface ApproveConversationRequest {
    notes?: string;
}

// Search interfaces
export interface MessageSearchRequest {
    searchTerm: string;
    conversationId?: number;
    fromDate?: Date | string;
    toDate?: Date | string;
    hasAttachments?: boolean;
    page?: number;
    pageSize?: number;
}

export interface MessageSearchResultDto {
    messageId: number;
    conversationId: number;
    conversationTitle: string;
    content: string;
    contentSnippet: string;
    senderId: number;
    senderName: string;
    senderAvatar?: string;
    isFromCompany: boolean;
    createdAt: string;
    companyName: string;
    companyId: number;
    hasAttachments: boolean;
    attachments: MessageAttachmentDto[];
}

export interface MessagingStatusDto {
    isRestricted: boolean;
    restrictionReason?: string;
    SystemAdminCompanyId?: number;
    SystemAdminUserId?: number;
    isUnverifiedCompanyOwner: boolean;
    isWorker?: boolean;
    userCompanyId?: number;
}

// Company to User messaging
export interface StartConversationWithUserRequest {
    targetUserId: number;
    message: string;
}

export interface MessagableUserDto {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    userType: string;
    profilePicture?: string;
    hasExistingConversation: boolean;
    existingConversationId?: number;
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable({
    providedIn: 'root'
})
export class MessagingService {
    private http = inject(HttpClient);
    private baseUrl = '/api';

    // ── Public Companies ──────────────────────────────────────────────────────────

    /**
     * Get all public companies
     */
    getCompanies(search?: string): Observable<PublicCompanyDto[]> {
        let url = `${this.baseUrl}/publiccompanies`;
        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }
        return this.http.get<PublicCompanyDto[]>(url);
    }

    /**
     * Get company details with portfolio
     */
    getCompanyDetail(companyId: number): Observable<PublicCompanyDetailDto> {
        return this.http.get<PublicCompanyDetailDto>(`${this.baseUrl}/publiccompanies/${companyId}`);
    }

    /**
     * Get company portfolio items
     */
    getCompanyPortfolio(companyId: number, categoryId?: number): Observable<PortfolioItemDto[]> {
        let url = `${this.baseUrl}/publiccompanies/${companyId}/portfolio`;
        if (categoryId) {
            url += `?categoryId=${categoryId}`;
        }
        return this.http.get<PortfolioItemDto[]>(url);
    }

    /**
     * Follow a company
     */
    followCompany(companyId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/publiccompanies/${companyId}/follow`, {});
    }

    /**
     * Unfollow a company
     */
    unfollowCompany(companyId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/publiccompanies/${companyId}/follow`);
    }

    /**
     * Get companies the current user follows
     */
    getFollowingCompanies(): Observable<PublicCompanyDto[]> {
        return this.http.get<PublicCompanyDto[]>(`${this.baseUrl}/publiccompanies/following`);
    }

    // ── Conversations ──────────────────────────────────────────────────────────────

    /**
     * Start a new conversation with a company
     */
    startConversation(request: StartConversationRequest, attachments?: File[]): Observable<ConversationDto> {
        const formData = new FormData();
        formData.append('recipientUserId', request.recipientUserId.toString());
        formData.append('message', request.message);

        if (attachments) {
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
        }

        return this.http.post<ConversationDto>(`${this.baseUrl}/messaging/conversations`, formData);
    }

    /**
     * Start a conversation with SystemAdmin (for unverified company owners)
     */
    startSystemAdminConversation(message: string): Observable<ConversationDto> {
        const formData = new FormData();
        formData.append('message', message);

        return this.http.post<ConversationDto>(`${this.baseUrl}/messaging/conversations/system-admin`, formData);
    }

    /**
     * Get all conversations for current user
     */
    getConversations(): Observable<ConversationDto[]> {
        return this.http.get<ConversationDto[]>(`${this.baseUrl}/messaging/conversations`);
    }

    /**
     * Get a specific conversation with messages
     */
    getConversation(conversationId: number): Observable<ConversationDetailDto> {
        return this.http.get<ConversationDetailDto>(`${this.baseUrl}/messaging/conversations/${conversationId}`);
    }

    /**
     * Send a message in a conversation
     */
    sendMessage(conversationId: number, request: SendMessageRequest, attachments?: File[]): Observable<CompanyMessageDto> {
        const formData = new FormData();
        formData.append('content', request.content);

        if (attachments) {
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
        }

        return this.http.post<CompanyMessageDto>(`${this.baseUrl}/messaging/conversations/${conversationId}/messages`, formData);
    }

    /**
     * Check if user can send a message
     */
    canSendMessage(conversationId: number): Observable<CanSendMessageResult> {
        return this.http.get<CanSendMessageResult>(`${this.baseUrl}/messaging/conversations/${conversationId}/can-send`);
    }

    /**
     * Get unread message count
     */
    getUnreadCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.baseUrl}/messaging/unread-count`);
    }

    // ── Approval/Blocking ─────────────────────────────────────────────────────────

    /**
     * Approve a conversation (company owner only)
     */
    approveConversation(conversationId: number, request?: ApproveConversationRequest): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.baseUrl}/messaging/conversations/${conversationId}/approve`, request || {});
    }

    /**
     * Block a conversation (company owner only)
     */
    blockConversation(conversationId: number, request?: BlockConversationRequest): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.baseUrl}/messaging/conversations/${conversationId}/block`, request || {});
    }

    /**
     * Unblock a conversation (company owner only)
     */
    unblockConversation(conversationId: number): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.baseUrl}/messaging/conversations/${conversationId}/unblock`, {});
    }

    // ── User Blocking ─────────────────────────────────────────────────────────────

    /**
     * Block a user from messaging the company
     */
    blockUser(request: BlockUserRequest): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/messaging/company/block-user`, request);
    }

    /**
     * Unblock a user from messaging the company
     */
    unblockUser(userId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/messaging/company/block-user/${userId}`);
    }

    /**
     * Get blocked users for the company
     */
    getBlockedUsers(): Observable<BlockedUserDto[]> {
        return this.http.get<BlockedUserDto[]>(`${this.baseUrl}/messaging/company/blocked-users`);
    }

    // ── Search ─────────────────────────────────────────────────────────────────────

    /**
     * Search messages for the current user
     */
    searchMessages(request: MessageSearchRequest): Observable<MessageSearchResultDto[]> {
        return this.http.post<MessageSearchResultDto[]>(`${this.baseUrl}/messaging/search`, request);
    }

    /**
     * Search messages in a specific conversation
     */
    searchConversationMessages(conversationId: number, searchTerm: string): Observable<MessageSearchResultDto[]> {
        return this.http.get<MessageSearchResultDto[]>(`${this.baseUrl}/messaging/conversations/${conversationId}/search`, {
            params: { searchTerm }
        });
    }

    /**
     * Get messaging restriction status for the current user
     */
    getMessagingStatus(): Observable<MessagingStatusDto> {
        return this.http.get<MessagingStatusDto>(`${this.baseUrl}/messaging/messaging-status`);
    }

    // ── Company to User Messaging ─────────────────────────────────────────────────

    /**
     * Start a new conversation from a company to a user (client/worker)
     * Company owners can initiate conversations with clients and workers
     */
    startConversationWithUser(request: StartConversationWithUserRequest, attachments?: File[]): Observable<ConversationDto> {
        const formData = new FormData();
        formData.append('targetUserId', request.targetUserId.toString());
        formData.append('message', request.message);

        if (attachments) {
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
        }

        return this.http.post<ConversationDto>(`${this.baseUrl}/messaging/conversations/with-user`, formData);
    }

    /**
     * Get users that the company can message (clients and workers)
     */
    getMessagableUsers(userType?: string): Observable<MessagableUserDto[]> {
        let url = `${this.baseUrl}/messaging/messagable-users`;
        if (userType) {
            url += `?userType=${encodeURIComponent(userType)}`;
        }
        return this.http.get<MessagableUserDto[]>(url);
    }
}


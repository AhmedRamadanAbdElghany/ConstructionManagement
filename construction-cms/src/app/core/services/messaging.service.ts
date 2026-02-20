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
    companyId: number;
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
        formData.append('companyId', request.companyId.toString());
        formData.append('message', request.message);

        if (attachments) {
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
        }

        return this.http.post<ConversationDto>(`${this.baseUrl}/messaging/conversations`, formData);
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
}

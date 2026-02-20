# Company Messaging System Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive messaging system that allows normal users and workers to:
1. Browse companies and view their portfolios
2. Subscribe to companies to receive announcements
3. Send an initial message to company owners
4. Continue conversations after approval
5. Manage all conversations from a messages page

## Requirements Summary

### User Stories

1. **As a normal user/worker**, I want to see a "Companies" tab in the sidebar to browse all available companies
2. **As a normal user/worker**, I want to view a company's portfolio and offers before contacting them
3. **As a normal user/worker**, I want to subscribe to companies to receive their announcements
4. **As a normal user/worker**, I want to send ONE initial message to a company owner (text or file attachment)
5. **As a normal user/worker**, I cannot send more messages until the company owner approves the conversation
6. **As a normal user/worker**, once approved, I can send unlimited messages to the company
7. **As a company owner**, I want to receive initial messages from users
8. **As a company owner**, I want to approve or decline conversation requests
9. **As a company owner**, I want to block/disable a user from messaging at any time
10. **As a user**, I want to see all my conversations in a messages page

## Architecture Design

### Database Schema

```mermaid
erDiagram
    User ||--o{ CompanyConversation : initiates
    Company ||--o{ CompanyConversation : receives
    CompanyConversation ||--o{ CompanyMessage : contains
    CompanyMessage ||--o{ MessageFileAttachment : has
    User ||--o{ UserMessagingBlock : blocked_by
    Company ||--o{ UserMessagingBlock : blocks_users
    User ||--o{ CompanyFollower : follows
    Company ||--o{ CompanyFollower : followed_by

    CompanyConversation {
        int Id PK
        int CompanyId FK
        int InitiatorUserId FK
        string Status
        DateTime CreatedAt
        DateTime? ApprovedAt
        int? ApprovedByUserId
        DateTime? BlockedAt
        string? BlockReason
        DateTime? LastMessageAt
        int? LastMessageId
    }

    CompanyMessage {
        int Id PK
        int ConversationId FK
        int SenderUserId FK
        string Content
        bool IsFromCompany
        bool IsRead
        DateTime ReadAt
        DateTime CreatedAt
    }

    MessageFileAttachment {
        int Id PK
        int MessageId FK
        string FileName
        string OriginalFileName
        string FilePath
        string FileType
        long FileSize
        DateTime UploadedAt
    }

    UserMessagingBlock {
        int Id PK
        int CompanyId FK
        int UserId FK
        int BlockedByUserId FK
        string? Reason
        DateTime BlockedAt
        DateTime? UnblockedAt
        bool IsActive
    }
```

### Entity Definitions

#### CompanyConversation

```csharp
public class CompanyConversation : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    public virtual Company? Company { get; set; }
    
    public int InitiatorUserId { get; set; }
    public virtual User InitiatorUser { get; set; } = null!;
    
    // Status: Pending, Approved, Blocked
    public string Status { get; set; } = "Pending";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }
    public int? ApprovedByUserId { get; set; }
    public virtual User? ApprovedByUser { get; set; }
    
    public DateTime? BlockedAt { get; set; }
    public string? BlockReason { get; set; }
    
    public DateTime? LastMessageAt { get; set; }
    public int? LastMessageId { get; set; }
    
    public virtual ICollection<CompanyMessage> Messages { get; set; } = new List<CompanyMessage>();
}
```

#### CompanyMessage

```csharp
public class CompanyMessage : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    public virtual Company? Company { get; set; }
    
    public int ConversationId { get; set; }
    public virtual CompanyConversation Conversation { get; set; } = null!;
    
    public int SenderUserId { get; set; }
    public virtual User SenderUser { get; set; } = null!;
    
    public string Content { get; set; } = string.Empty;
    
    // True if sent by company owner/admin, false if sent by initiator
    public bool IsFromCompany { get; set; }
    
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual ICollection<MessageFileAttachment> Attachments { get; set; } = new List<MessageFileAttachment>();
}
```

#### MessageFileAttachment

```csharp
public class MessageFileAttachment : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    public virtual Company? Company { get; set; }
    
    public int MessageId { get; set; }
    public virtual CompanyMessage Message { get; set; } = null!;
    
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
```

#### UserMessagingBlock

```csharp
public class UserMessagingBlock : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    public virtual Company? Company { get; set; }
    
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    
    public int BlockedByUserId { get; set; }
    public virtual User BlockedByUser { get; set; } = null!;
    
    public string? Reason { get; set; }
    public DateTime BlockedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UnblockedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
```

### API Endpoints

#### Public Company Browsing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/companies` | List all active companies with pagination |
| GET | `/api/public/companies/{id}` | Get company details with portfolio |
| GET | `/api/public/companies/{id}/portfolio` | Get company portfolio items |
| POST | `/api/public/companies/{id}/follow` | Subscribe to company announcements |
| DELETE | `/api/public/companies/{id}/follow` | Unsubscribe from company |

#### Messaging System

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messaging/conversations` | Start a new conversation (sends initial message) |
| GET | `/api/messaging/conversations` | Get all conversations for current user |
| GET | `/api/messaging/conversations/{id}` | Get conversation with messages |
| POST | `/api/messaging/conversations/{id}/messages` | Send a message (only if approved) |
| PUT | `/api/messaging/conversations/{id}/approve` | Approve conversation (company owner only) |
| PUT | `/api/messaging/conversations/{id}/block` | Block user from messaging (company owner only) |
| PUT | `/api/messaging/conversations/{id}/unblock` | Unblock user (company owner only) |
| GET | `/api/messaging/conversations/{id}/can-send` | Check if user can send message |

#### Company Owner Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messaging/company/conversations` | Get all company conversations |
| GET | `/api/messaging/company/blocked-users` | Get blocked users list |
| POST | `/api/messaging/company/block-user` | Block a user from messaging |
| DELETE | `/api/messaging/company/block-user/{userId}` | Unblock a user |

### DTOs

#### ConversationDtos.cs

```csharp
public class StartConversationRequest
{
    public int CompanyId { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<IFormFile>? Attachments { get; set; }
}

public class ConversationDto
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLogo { get; set; }
    public int InitiatorUserId { get; set; }
    public string InitiatorName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public CompanyMessageDto? LastMessage { get; set; }
    public int UnreadCount { get; set; }
    public bool CanSendMessage { get; set; }
}

public class ConversationDetailDto : ConversationDto
{
    public List<CompanyMessageDto> Messages { get; set; } = new();
}

public class CompanyMessageDto
{
    public int Id { get; set; }
    public int SenderUserId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsFromCompany { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MessageAttachmentDto> Attachments { get; set; } = new();
}

public class SendMessageRequest
{
    public string Content { get; set; } = string.Empty;
    public List<IFormFile>? Attachments { get; set; }
}

public class ApproveConversationRequest
{
    public string? Notes { get; set; }
}

public class BlockUserRequest
{
    public int UserId { get; set; }
    public string? Reason { get; set; }
}
```

### Service Interface

```csharp
public interface IMessagingService
{
    // Conversation Management
    Task<ConversationDto> StartConversationAsync(int userId, StartConversationRequest request, List<IFormFile>? attachments);
    Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(int userId);
    Task<IEnumerable<ConversationDto>> GetCompanyConversationsAsync(int companyId);
    Task<ConversationDetailDto> GetConversationAsync(int conversationId, int userId);
    
    // Messaging
    Task<CompanyMessageDto> SendMessageAsync(int conversationId, int senderId, SendMessageRequest request, List<IFormFile>? attachments);
    Task<bool> CanUserSendMessageAsync(int conversationId, int userId);
    Task MarkMessagesAsReadAsync(int conversationId, int userId);
    
    // Approval/Blocking
    Task ApproveConversationAsync(int conversationId, int approverId, string? notes = null);
    Task BlockConversationAsync(int conversationId, int blockerId, string? reason = null);
    Task UnblockConversationAsync(int conversationId, int unblockerId);
    
    // User Blocking
    Task BlockUserFromCompanyAsync(int companyId, int userId, int blockedBy, string? reason = null);
    Task UnblockUserFromCompanyAsync(int companyId, int userId, int unblockedBy);
    Task<IEnumerable<BlockedUserDto>> GetBlockedUsersAsync(int companyId);
    Task<bool> IsUserBlockedAsync(int companyId, int userId);
}
```

### Business Logic Rules

1. **Initial Message**
   - User can only send ONE message to start a conversation
   - Conversation status starts as "Pending"
   - If user is blocked by company, cannot start conversation

2. **Conversation Approval**
   - Only company owner/admin can approve
   - Status changes from "Pending" to "Approved"
   - User can now send unlimited messages

3. **Blocking**
   - Company owner can block user at any time
   - Status changes to "Blocked"
   - User cannot send any more messages
   - Block applies to all future conversations

4. **Message Sending Rules**
   - Check if conversation exists
   - Check if user is participant
   - Check if user is blocked
   - Check if conversation is approved (or if this is the first message)
   - Validate message content

### Frontend Components

#### 1. Companies Browse Page
- Path: `/companies`
- Component: `CompaniesBrowseComponent`
- Features:
  - Grid/list view of all active companies
  - Search and filter
  - Company card with logo, name, description
  - Click to view company detail

#### 2. Company Detail Page
- Path: `/companies/:id`
- Component: `CompanyDetailComponent`
- Features:
  - Company info (name, logo, description, contact)
  - Portfolio gallery with categories
  - Follow/Unfollow button
  - "Send Message" button
  - Follower count

#### 3. Messages Page
- Path: `/messages`
- Component: `MessagesComponent`
- Features:
  - List of all conversations
  - Unread message indicators
  - Conversation status badges (Pending, Approved, Blocked)
  - Click to open conversation

#### 4. Conversation Detail Page
- Path: `/messages/:id`
- Component: `ConversationDetailComponent`
- Features:
  - Message thread view
  - Send message form (if allowed)
  - File attachment support
  - Status indicator
  - For company owners: Approve/Block buttons

#### 5. Send Message Dialog
- Component: `SendMessageDialogComponent`
- Features:
  - Text input
  - File attachment
  - Send button
  - Validation for blocked/pending status

### Sidebar Updates

Add "Companies" menu item for all authenticated users:
```typescript
{
  label: 'Companies',
  icon: 'building',
  route: '/companies',
  roles: ['User', 'Worker', 'CompanyAdmin', 'SuperAdmin']
}
```

Add "Messages" menu item with unread count badge:
```typescript
{
  label: 'Messages',
  icon: 'message',
  route: '/messages',
  badge: unreadCount$,
  roles: ['User', 'Worker', 'CompanyAdmin', 'SuperAdmin']
}
```

## Implementation Steps

### Phase 1: Backend Entities and Database
1. Create entity classes in Domain project
2. Add to DbContext with configurations
3. Create and run EF migration

### Phase 2: Backend Services
1. Create DTOs in Application project
2. Create IMessagingService interface
3. Implement MessagingService
4. Register service in DI container

### Phase 3: Backend API
1. Create PublicCompaniesController
2. Create MessagingController
3. Add authorization policies
4. Test endpoints with Swagger

### Phase 4: Frontend Services
1. Create messaging.service.ts
2. Update companies.service.ts for public endpoints
3. Add TypeScript interfaces

### Phase 5: Frontend Components
1. Create CompaniesBrowseComponent
2. Create CompanyDetailComponent
3. Create MessagesComponent
4. Create ConversationDetailComponent
5. Create SendMessageDialogComponent

### Phase 6: Integration
1. Update sidebar navigation
2. Add routes to app.routes.ts
3. Add translation keys
4. Test end-to-end flow

## Security Considerations

1. **Authorization**
   - All messaging endpoints require authentication
   - Company owner actions require CompanyAdmin role
   - Users can only access their own conversations

2. **Validation**
   - Validate file types and sizes for attachments
   - Sanitize message content
   - Rate limiting on message sending

3. **Privacy**
   - Users can only see conversations they participate in
   - Company owners see all company conversations
   - File access restricted to conversation participants

## File Structure

```
src/ConstructionManagement.Domain/Entities/
├── CompanyConversation.cs
├── CompanyMessage.cs
├── MessageFileAttachment.cs
└── UserMessagingBlock.cs

src/ConstructionManagement.Application/DTOs/Messaging/
├── ConversationDtos.cs
├── MessageDtos.cs
└── BlockedUserDto.cs

src/ConstructionManagement.Application/Interfaces/
└── IMessagingService.cs

src/ConstructionManagement.Infrastructure/Services/
└── MessagingService.cs

src/ConstructionManagement.WebApi/Controllers/
├── PublicCompaniesController.cs
└── MessagingController.cs

construction-cms/src/app/core/services/
└── messaging.service.ts

construction-cms/src/app/features/common/companies/
├── companies-browse.component.ts
└── company-detail.component.ts

construction-cms/src/app/features/common/messages/
├── messages.component.ts
├── conversation-detail.component.ts
└── send-message-dialog.component.ts
```

## Estimated Effort

This is a significant feature requiring:
- 4 new database entities
- 1 new service with complex business logic
- 2 new controllers
- 6 new frontend components
- Updates to sidebar and routing

## Dependencies

- Existing `CompanyFollower` entity for subscriptions
- Existing `PortfolioItem` and `PortfolioCategory` for portfolio display
- Existing `Company` entity
- Existing `User` entity
- Existing file storage service for attachments

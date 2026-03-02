# Messaging System Rules

## Overview

This document defines the messaging rules for different user types in the Construction Management System.

## User Types and Messaging Capabilities

### 1. Unverified Company Owner
**Definition**: A user with `UserType.CompanyOwner` who has registered but their company request has NOT been approved yet.

**Messaging Capabilities**:
- ✅ Can ONLY message SystemAdmin
- ❌ Cannot browse companies
- ❌ Cannot view company profiles
- ❌ Cannot message any other company

**UI Behavior**:
- Shows restriction notice on Messages page
- Shows "Start Conversation with SystemAdmin" button
- Hides "Browse Companies" button
- Hides "Message User" button
- Hides "View Company Profile" link

---

### 2. Verified Company Owner
**Definition**: A user with `UserType.CompanyOwner` whose company request HAS been approved.

**Messaging Capabilities**:
- ✅ Can message their own company's users (clients associated with the company)
- ✅ Can message their own company's workers
- ✅ Can message SystemAdmin
- ✅ Can browse other companies
- ✅ Can message other companies (requires approval from those companies)

**UI Behavior**:
- Shows "Message User" button to message clients/workers
- Shows "Browse Companies" button
- Can view company profiles

---

### 3. NormalUser (Client)
**Definition**: A regular user with `UserType.NormalUser` who may or may not be associated with a company.

**Messaging Capabilities**:
- ✅ Can message their own companies freely (unlimited messages, no approval needed)
- ✅ Can message other companies (one initial message, then requires approval)
- ✅ Can message SystemAdmin
- ❌ Cannot initiate conversations with users (only companies can initiate with users)

**UI Behavior**:
- Shows "Browse Companies" button
- Shows conversation list with approval status

---

### 4. Worker
**Definition**: A user with `UserType.Worker` who may be associated with a company.

**Messaging Capabilities**:
- ✅ Can message their own companies freely (unlimited messages, no approval needed)
- ✅ Can message other companies (one initial message, then requires approval)
- ✅ Can message SystemAdmin
- ✅ Can message other workers in the same company

**UI Behavior**:
- Shows "Browse Companies" button
- Shows conversation list with approval status

---

## Conversation Flow

### User → Company Flow
1. User sends initial message to a company
2. Conversation status is "Pending"
3. User cannot send more messages until approved
4. Company owner reviews and approves/rejects
5. If approved, status changes to "Approved" and user can send unlimited messages

### User → Own Company Flow
1. User sends message to their own company
2. Conversation is auto-approved (status = "Approved")
3. Both parties can exchange messages immediately

### Company → User Flow (Verified Company Owners Only)
1. Company owner selects a user (client/worker) from their company
2. Conversation is auto-approved (status = "Approved")
3. Both parties can exchange messages immediately

### Unverified Owner → SystemAdmin Flow
1. Unverified owner can only see "Start Conversation with SystemAdmin" option
2. Sends message to SystemAdmin's company
3. Conversation is auto-approved
4. Can exchange messages with SystemAdmin

---

## Database Schema

### CompanyConversation Entity
```
- Id: int
- CompanyId: int (target company)
- InitiatorUserId: int (user who started conversation)
- InitiatedBy: string ("User" | "Company")
- Status: string ("Pending" | "Approved" | "Blocked")
- CreatedAt: DateTime
- ApprovedAt: DateTime?
- ApprovedByUserId: int?
```

---

## API Endpoints

### For All Users
- `GET /api/messaging/conversations` - Get user's conversations
- `GET /api/messaging/conversations/{id}` - Get specific conversation
- `POST /api/messaging/conversations/{id}/messages` - Send message
- `GET /api/messaging/messaging-status` - Get restriction status

### For User → Company Messaging
- `POST /api/messaging/conversations` - Start conversation with company

### For Company → User Messaging (Company Owners Only)
- `POST /api/messaging/conversations/with-user` - Start conversation with user
- `GET /api/messaging/messagable-users` - Get list of messagable users (from own company)

### For Company Owners Only
- `PUT /api/messaging/conversations/{id}/approve` - Approve conversation
- `PUT /api/messaging/conversations/{id}/block` - Block conversation
- `POST /api/messaging/company/block-user` - Block user from messaging

---

## Frontend Components

### MessagesComponent
- Shows restriction notice for unverified owners
- Shows "Message User" button for verified company owners
- Shows "Browse Companies" for users who can browse
- Shows conversation list with status indicators

### Company Browse/List
- Hidden for unverified company owners
- Visible for all other user types
- Shows "Message Company" button with approval indicator

---

## Implementation Checklist

- [x] Backend: Update `GetMessagableUsersAsync` to only return users from company owner's company
- [x] Backend: Update `StartConversationWithUserAsync` to verify user belongs to company
- [x] Frontend: Hide "View Company Profile" for unverified owners
- [ ] Backend: Allow users to message their own companies freely (auto-approve)
- [ ] Backend: Allow workers to message other workers in same company
- [ ] Frontend: Update UI based on user type permissions
- [ ] Test all messaging scenarios

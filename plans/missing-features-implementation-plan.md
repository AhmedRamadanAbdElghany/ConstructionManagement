# Missing Features Implementation Plan

## Overview

This document outlines the implementation plan for all missing features identified in the Construction Management System.

---

## HIGH PRIORITY FEATURES

### 1. Payment Gateway Integration

**Objective**: Enable clients to make online payments for invoices and projects.

**Payment Methods**:
1. **Online Payment**: Client pays through the system using credit card/bank transfer
2. **Offline Payment**: Client pays at company office, company records the payment

#### Backend Implementation

**Existing Entities** (Already Implemented):
```csharp
// Domain/Entities/ClientPayment.cs - ALREADY EXISTS
public class ClientPayment
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Method { get; set; } // Bank Transfer, Cash, Cheque
    public string ReferenceNumber { get; set; }
    public string Status { get; set; } // Received, Pending, Bounced
    public string Notes { get; set; }
    public string PhotoUrl { get; set; }
}
```

**New Entities for Online Payments**:
```csharp
// Domain/Entities/PaymentTransaction.cs
public class PaymentTransaction
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int? ProjectId { get; set; }
    public int? InvoiceId { get; set; }
    public int? ClientPaymentId { get; set; } // Link to ClientPayment
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentChannel Channel { get; set; } // Online, Offline
    public string PaymentMethod { get; set; } // CreditCard, BankTransfer, Cash, Cheque
    public string TransactionReference { get; set; }
    public string GatewayResponse { get; set; } // For online payments
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? RecordedBy { get; set; } // User who recorded offline payment
}

public enum PaymentChannel
{
    Online,  // Paid through system
    Offline  // Paid at company, recorded by admin
}

public enum PaymentStatus
{
    Pending,
    Processing,
    Completed,
    Failed,
    Refunded
}
```

**New Services**:
- `IPaymentGatewayService` - Interface for payment gateway abstraction
- `StripePaymentService` - Stripe implementation
- `PayPalPaymentService` - PayPal implementation
- `PaymentService` - Main payment processing service

**New Controller**:
- `PaymentsController` - API endpoints for payment operations

**Database Migration**:
- Add `PaymentTransactions` table
- Add `PaymentSettings` to `CompanySettings`
- Update `ClientPayment` to link to `PaymentTransaction`

#### Frontend Implementation

**For Clients (Online Payment)**:
- `payment-method-selector.component.ts` - Select payment method
- `payment-form.component.ts` - Credit card form
- `payment-success.component.ts` - Success page
- `payment-history.component.ts` - View payment history

**For Company (Record Offline Payment)**:
- `record-payment-modal.component.ts` - Record payment received at office
- Update `client-payments-tab.component.ts` - Add record payment button

**New Service**:
- `payment.service.ts` - Payment API calls

**Routes**:
```typescript
// Client routes - Online payment
{ path: 'client-portal/payments/make', component: PaymentFormComponent }
{ path: 'client-portal/payments/history', component: PaymentHistoryComponent }

// Admin routes - Record offline payment
{ path: 'admin/projects/:id/payments/record', component: RecordPaymentModalComponent }
```

#### User Access
- **Client**: 
  - Make online payments
  - View payment history
  - Download payment receipts
- **CompanyOwner**: 
  - Record offline payments (cash, cheque, bank transfer received at office)
  - View all payments
  - Configure payment settings
  - Verify/reject pending payments

---

### 2. Push Notifications

**Objective**: Real-time alerts for messages, approvals, and updates.

#### Backend Implementation

**New Entities**:
```csharp
// Domain/Entities/DeviceToken.cs
public class DeviceToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; }
    public string Platform { get; set; } // Web, iOS, Android
    public DateTime RegisteredAt { get; set; }
    public bool IsActive { get; set; }
}

// Domain/Entities/Notification.cs
public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public string Type { get; set; } // Message, Approval, Update
    public string ActionUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**New Services**:
- `IPushNotificationService` - Interface for push notifications
- `FirebasePushService` - Firebase Cloud Messaging implementation
- `NotificationService` - Notification management

**Background Jobs**:
- `NotificationDispatchJob` - Process notification queue

#### Frontend Implementation

**New Components**:
- `notification-bell.component.ts` - Notification dropdown in header
- `notification-list.component.ts` - Full notification list
- `notification-settings.component.ts` - User preferences

**Service Worker**:
- Add Firebase messaging service worker
- Handle background notifications

#### User Access
- **All Users**: Receive and manage notifications

---

### 3. Leave Management System

**Objective**: Complete leave request/approval workflow.

#### Backend Implementation

**New Entities**:
```csharp
// Domain/Entities/LeaveRequest.cs
public class LeaveRequest
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CompanyId { get; set; }
    public LeaveType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysCount { get; set; }
    public string Reason { get; set; }
    public LeaveStatus Status { get; set; }
    public int? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public enum LeaveType
{
    Annual,
    Sick,
    Emergency,
    Unpaid,
    Maternity,
    Paternity
}

public enum LeaveStatus
{
    Pending,
    Approved,
    Rejected,
    Cancelled
}

// Domain/Entities/LeaveBalance.cs
public class LeaveBalance
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int Year { get; set; }
    public LeaveType Type { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays { get; set; }
}
```

**New Services**:
- `ILeaveService` - Leave management operations
- `LeaveService` - Implementation

**New Controller**:
- `LeaveController` - API endpoints

#### Frontend Implementation

**New Components**:
- `leave-request-form.component.ts` - Submit leave request
- `leave-approval-list.component.ts` - Manager approval queue
- `leave-balance.component.ts` - View leave balance
- `leave-calendar.component.ts` - Calendar view

**Routes**:
```typescript
// Worker routes
{ path: 'worker/leave/request', component: LeaveRequestFormComponent }
{ path: 'worker/leave/balance', component: LeaveBalanceComponent }

// Admin routes
{ path: 'admin/leave/approvals', component: LeaveApprovalListComponent }
{ path: 'admin/leave/calendar', component: LeaveCalendarComponent }
```

#### User Access
- **Worker**: Request leave, view balance
- **CompanyOwner**: Approve/reject requests, manage leave types

---

## MEDIUM PRIORITY FEATURES

### 4. Financial Reports Export

**Objective**: PDF/Excel export for financial data.

#### Implementation

**New Services**:
- `IReportExportService` - Export interface
- `PdfExportService` - PDF generation using iTextSharp
- `ExcelExportService` - Excel generation using EPPlus

**New Controller**:
- `ReportsController` - Export endpoints

**Export Types**:
- Invoice report
- Payment history
- Budget vs Actual
- Profit/Loss statement
- Cash flow report

#### Frontend

**New Components**:
- `report-export-modal.component.ts` - Export options dialog

**Features**:
- Date range selection
- Format selection (PDF/Excel)
- Email report option

---

### 5. Message Search

**Objective**: Search through conversation history.

#### Backend Implementation

**Database**:
- Add full-text search index on `CompanyMessage.Content`

**New Endpoint**:
```csharp
GET /api/messages/search?query={query}&conversationId={id}
```

**Service**:
- `SearchMessages(query, filters)` - Full-text search with filters

#### Frontend Implementation

**New Component**:
- `message-search.component.ts` - Search input with results

**Features**:
- Search by keyword
- Filter by date range
- Filter by sender
- Jump to message in conversation

---

### 6. Performance Evaluation

**Objective**: Worker performance tracking.

#### Backend Implementation

**New Entities**:
```csharp
// Domain/Entities/PerformanceReview.cs
public class PerformanceReview
{
    public int Id { get; set; }
    public int WorkerId { get; set; }
    public int ReviewerId { get; set; }
    public int CompanyId { get; set; }
    public DateTime ReviewDate { get; set; }
    public string Period { get; set; } // Q1 2024, etc.
    public decimal OverallRating { get; set; }
    public string Strengths { get; set; }
    public string AreasForImprovement { get; set; }
    public string Goals { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Domain/Entities/PerformanceMetric.cs
public class PerformanceMetric
{
    public int Id { get; set; }
    public int ReviewId { get; set; }
    public string Category { get; set; }
    public string Description { get; set; }
    public decimal Rating { get; set; }
    public string Comments { get; set; }
}
```

**New Services**:
- `IPerformanceService` - Performance management
- `PerformanceService` - Implementation

#### Frontend Implementation

**New Components**:
- `performance-review-form.component.ts` - Create review
- `performance-dashboard.component.ts` - View metrics
- `worker-performance.component.ts` - Individual worker view

---

## LOW PRIORITY FEATURES

### 7. Video/Voice Calls

**Objective**: Integrated communication.

#### Implementation Options
- **Option A**: Twilio Video Integration
- **Option B**: WebRTC with SignalR
- **Option C**: Third-party embed (Zoom, Google Meet)

**New Components**:
- `video-call.component.ts` - Video call interface
- `call-controls.component.ts` - Mute, camera, screen share

---

### 8. Multi-Currency Support

**Objective**: Support for different currencies.

#### Backend Implementation

**New Entities**:
```csharp
public class Currency
{
    public int Id { get; set; }
    public string Code { get; set; } // USD, EUR, EGP
    public string Symbol { get; set; }
    public decimal ExchangeRate { get; set; }
    public DateTime LastUpdated { get; set; }
}
```

**Changes**:
- Add `CurrencyId` to `Transaction`, `Invoice`, `ClientPayment`
- Add currency conversion service
- Update all financial calculations

---

### 9. Training Tracking

**Objective**: Employee training records.

#### Backend Implementation

**New Entities**:
```csharp
public class Training
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public int DurationHours { get; set; }
    public bool IsRequired { get; set; }
}

public class WorkerTraining
{
    public int Id { get; set; }
    public int WorkerId { get; set; }
    public int TrainingId { get; set; }
    public DateTime CompletedAt { get; set; }
    public decimal Score { get; set; }
    public string CertificateUrl { get; set; }
}
```

---

## Implementation Timeline

### Phase 1: High Priority (Weeks 1-4)
- Week 1: Payment Gateway Integration
- Week 2: Push Notifications
- Week 3-4: Leave Management System

### Phase 2: Medium Priority (Weeks 5-7)
- Week 5: Financial Reports Export
- Week 6: Message Search
- Week 7: Performance Evaluation

### Phase 3: Low Priority (Weeks 8-10)
- Week 8: Video/Voice Calls
- Week 9: Multi-Currency Support
- Week 10: Training Tracking

---

## Technical Dependencies

| Feature | Backend Dependencies | Frontend Dependencies |
|---------|---------------------|----------------------|
| Payment Gateway | Stripe/PayPal SDK | Stripe Elements |
| Push Notifications | Firebase Admin SDK | Firebase Web SDK |
| Leave Management | None | Calendar library |
| Reports Export | iTextSharp, EPPlus | File download |
| Message Search | Full-text search | Search UI |
| Performance | None | Charts library |
| Video Calls | Twilio/WebRTC | Video components |
| Multi-Currency | Exchange rate API | Currency selector |
| Training | None | File upload |

---

## Files to Create

### Backend (per feature)
- `Domain/Entities/{EntityName}.cs`
- `Application/DTOs/{Feature}DTOs.cs`
- `Application/Interfaces/I{Feature}Service.cs`
- `Infrastructure/Services/{Feature}Service.cs`
- `WebApi/Controllers/{Feature}Controller.cs`
- `Infrastructure/Migrations/{MigrationName}.cs`

### Frontend (per feature)
- `core/services/{feature}.service.ts`
- `features/{module}/{feature}.component.ts`
- Update `app.routes.ts`
- Update `en.json` / `ar.json`

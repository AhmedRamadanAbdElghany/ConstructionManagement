# Multi-Branch Warehouse Design for Cement Inventory

## Overview

This document outlines the design for supporting multi-branch warehouses, specifically for cement inventory management. The system should support a main warehouse with multiple branches, each with its own stock levels, transfers, and reporting.

---

## Business Requirements

### Use Cases

1. **Main Warehouse with Multiple Branches**
   - A cement warehouse can have one main location and multiple branch locations
   - Each branch operates semi-independently with its own stock
   - Stock can be transferred between branches

2. **Stock Visibility**
   - View stock levels across all branches
   - Consolidated stock report for the entire warehouse network
   - Individual branch stock reports

3. **Inter-Branch Transfers**
   - Transfer cement between branches
   - Track in-transit stock
   - Record transfer costs

4. **Branch-Specific Operations**
   - Each branch can receive orders
   - Each branch can issue materials to projects
   - Branch-level reporting

---

## Current System Analysis

### Existing Entities

The current system has two warehouse entities:

1. **[`Warehouse`](src/ConstructionManagement.Domain/Entities/Warehouse.cs)** - Company warehouse
   - Basic warehouse with name, code, address, manager
   - Has collection of `MaterialStock`

2. **[`InventoryWarehouse`](src/ConstructionManagement.Domain/Entities/InventoryWarehouse.cs)** - Inventory Owner warehouse
   - Owned by a User (Inventory Owner)
   - Has location, capacity, approval status
   - Has collection of `InventoryStock`

### Gap Analysis

Neither entity supports:
- Hierarchical structure (main warehouse → branches)
- Branch relationships
- Inter-branch transfers

---

## Proposed Design

### Option 1: Self-Referencing Warehouse (Recommended)

Add a self-referencing relationship to existing warehouse entities.

```mermaid
erDiagram
    WAREHOUSE ||--o{ WAREHOUSE : has_branches
    WAREHOUSE ||--o{ MATERIAL_STOCK : contains
    WAREHOUSE ||--o{ STOCK_TRANSFER : sources
    WAREHOUSE ||--o{ STOCK_TRANSFER : destinations
    
    WAREHOUSE {
        int Id PK
        string Name
        string Code
        int? ParentWarehouseId FK
        int WarehouseType
        string Address
        string City
        bool IsDefault
        bool IsActive
        int? ManagerUserId
        string Phone
        string Email
        string OperatingHours
        decimal? Capacity
        string Notes
    }
```

### Option 2: Separate Branch Entity

Create a separate entity for branches.

```mermaid
erDiagram
    WAREHOUSE ||--o{ WAREHOUSE_BRANCH : has_branches
    WAREHOUSE_BRANCH ||--o{ MATERIAL_STOCK : contains
    
    WAREHOUSE {
        int Id PK
        string Name
        string Code
        bool IsMain
    }
    
    WAREHOUSE_BRANCH {
        int Id PK
        int WarehouseId FK
        string Name
        string Code
        string Address
        int? ManagerUserId
        bool IsActive
    }
```

### Recommended: Option 1 with Enhancements

Option 1 is recommended because:
- Simpler data model
- Easier to query (single table)
- Supports unlimited hierarchy levels
- Less JOIN operations

---

## Detailed Entity Design

### Enhanced Warehouse Entity

```csharp
// src/ConstructionManagement.Domain/Entities/Warehouse.cs

public class Warehouse : BaseEntity, ICompanyEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // ── Hierarchy Support ─────────────────────────────────
    /// <summary>
    /// Parent warehouse (null for main warehouse)
    /// </summary>
    public int? ParentWarehouseId { get; set; }
    [ForeignKey(nameof(ParentWarehouseId))]
    public virtual Warehouse? ParentWarehouse { get; set; }
    
    /// <summary>
    /// Child branches (if this is a main warehouse)
    /// </summary>
    public virtual ICollection<Warehouse> Branches { get; set; } = new List<Warehouse>();
    
    // ── Warehouse Type ────────────────────────────────────
    /// <summary>
    /// Type: Main = 0, Branch = 1, Mobile = 2, Site = 3
    /// </summary>
    public WarehouseType Type { get; set; } = WarehouseType.Main;
    
    // ── Location ──────────────────────────────────────────
    public string? Address { get; set; }
    public string? City { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // ── Capacity & Limits ─────────────────────────────────
    public decimal? Capacity { get; set; } // Total capacity in cubic meters or tons
    public string? CapacityUnit { get; set; } // "m3", "tons", "bags"
    
    // ── Status & Flags ────────────────────────────────────
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = true; // For inventory owner warehouses
    
    // ── Contact Information ───────────────────────────────
    public int? ManagerUserId { get; set; }
    [ForeignKey(nameof(ManagerUserId))]
    public virtual User? ManagerUser { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? OperatingHours { get; set; }
    
    // ── Additional Info ───────────────────────────────────
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
    
    // ── Navigation Properties ─────────────────────────────
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
    
    public virtual ICollection<MaterialStock> Stocks { get; set; } = new List<MaterialStock>();
    public virtual ICollection<StockTransfer> OutgoingTransfers { get; set; } = new List<StockTransfer>();
    public virtual ICollection<StockTransfer> IncomingTransfers { get; set; } = new List<StockTransfer>();
}

/// <summary>
/// Warehouse type enumeration
/// </summary>
public enum WarehouseType
{
    /// <summary>
    /// Main warehouse - central storage facility
    /// </summary>
    Main = 0,
    
    /// <summary>
    /// Branch - satellite location under main warehouse
    /// </summary>
    Branch = 1,
    
    /// <summary>
    /// Mobile - temporary/mobile storage unit
    /// </summary>
    Mobile = 2,
    
    /// <summary>
    /// Site - project site storage
    /// </summary>
    Site = 3
}
```

### Stock Transfer Entity

```csharp
// src/ConstructionManagement.Domain/Entities/StockTransfer.cs

public class StockTransfer : BaseEntity, ICompanyEntity
{
    public string TransferNumber { get; set; } = string.Empty;
    
    // ── Source & Destination ─────────────────────────────
    public int SourceWarehouseId { get; set; }
    [ForeignKey(nameof(SourceWarehouseId))]
    public virtual Warehouse SourceWarehouse { get; set; } = null!;
    
    public int DestinationWarehouseId { get; set; }
    [ForeignKey(nameof(DestinationWarehouseId))]
    public virtual Warehouse DestinationWarehouse { get; set; } = null!;
    
    // ── Status ───────────────────────────────────────────
    public TransferStatus Status { get; set; } = TransferStatus.Draft;
    
    // ── Dates ─────────────────────────────────────────────
    public DateTime TransferDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpectedArrivalDate { get; set; }
    public DateTime? ActualArrivalDate { get; set; }
    public DateTime? ShippedDate { get; set; }
    
    // ── Responsibility ───────────────────────────────────
    public int RequestedByUserId { get; set; }
    [ForeignKey(nameof(RequestedByUserId))]
    public virtual User RequestedByUser { get; set; } = null!;
    
    public int? ApprovedByUserId { get; set; }
    [ForeignKey(nameof(ApprovedByUserId))]
    public virtual User? ApprovedByUser { get; set; }
    
    public int? ShippedByUserId { get; set; }
    [ForeignKey(nameof(ShippedByUserId))]
    public virtual User? ShippedByUser { get; set; }
    
    public int? ReceivedByUserId { get; set; }
    [ForeignKey(nameof(ReceivedByUserId))]
    public virtual User? ReceivedByUser { get; set; }
    
    // ── Transport ────────────────────────────────────────
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }
    public string? VehicleNumber { get; set; }
    
    // ── Financial ────────────────────────────────────────
    public decimal? TransportCost { get; set; }
    public decimal? HandlingCost { get; set; }
    public decimal? TotalCost => TransportCost + HandlingCost;
    
    // ── Notes ────────────────────────────────────────────
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
    
    // ── Navigation ───────────────────────────────────────
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
    
    public virtual ICollection<StockTransferItem> Items { get; set; } = new List<StockTransferItem>();
    public virtual ICollection<StockTransferStatusHistory> StatusHistory { get; set; } = new List<StockTransferStatusHistory>();
}

public enum TransferStatus
{
    Draft = 0,
    PendingApproval = 1,
    Approved = 2,
    InTransit = 3,
    Delivered = 4,
    Received = 5,
    Cancelled = 6,
    Rejected = 7
}
```

### Stock Transfer Item Entity

```csharp
// src/ConstructionManagement.Domain/Entities/StockTransferItem.cs

public class StockTransferItem : BaseEntity, ICompanyEntity
{
    public int StockTransferId { get; set; }
    [ForeignKey(nameof(StockTransferId))]
    public virtual StockTransfer StockTransfer { get; set; } = null!;
    
    public int MaterialId { get; set; }
    [ForeignKey(nameof(MaterialId))]
    public virtual Material Material { get; set; } = null!;
    
    // ── Quantities ───────────────────────────────────────
    public decimal RequestedQuantity { get; set; }
    public decimal ApprovedQuantity { get; set; }
    public decimal ShippedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    
    // ── Unit ─────────────────────────────────────────────
    public string Unit { get; set; } = string.Empty;
    
    // ── Cost ─────────────────────────────────────────────
    public decimal? UnitCost { get; set; }
    public decimal? TotalCost => UnitCost * ShippedQuantity;
    
    // ── Notes ────────────────────────────────────────────
    public string? Notes { get; set; }
    
    // ── Batch/Lot Info ───────────────────────────────────
    public string? BatchNumber { get; set; }
    public DateTime? ExpirationDate { get; set; }
    
    // ── Navigation ───────────────────────────────────────
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
```

### Stock Transfer Status History

```csharp
// src/ConstructionManagement.Domain/Entities/StockTransferStatusHistory.cs

public class StockTransferStatusHistory : BaseEntity
{
    public int StockTransferId { get; set; }
    [ForeignKey(nameof(StockTransferId))]
    public virtual StockTransfer StockTransfer { get; set; } = null!;
    
    public TransferStatus PreviousStatus { get; set; }
    public TransferStatus NewStatus { get; set; }
    
    public int ChangedByUserId { get; set; }
    [ForeignKey(nameof(ChangedByUserId))]
    public virtual User ChangedByUser { get; set; } = null!;
    
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}
```

---

## Service Interface Design

### IStockTransferService

```csharp
public interface IStockTransferService
{
    // ── CRUD Operations ──────────────────────────────────
    Task<IReadOnlyList<StockTransfer>> GetTransfersAsync(int? companyId = null);
    Task<StockTransfer?> GetTransferByIdAsync(int id);
    Task<StockTransfer> CreateTransferAsync(StockTransfer transfer);
    Task<StockTransfer> UpdateTransferAsync(StockTransfer transfer);
    Task<bool> DeleteTransferAsync(int id);
    
    // ── By Warehouse ─────────────────────────────────────
    Task<IReadOnlyList<StockTransfer>> GetTransfersBySourceWarehouseAsync(int warehouseId);
    Task<IReadOnlyList<StockTransfer>> GetTransfersByDestinationWarehouseAsync(int warehouseId);
    Task<IReadOnlyList<StockTransfer>> GetTransfersByWarehouseAsync(int warehouseId);
    
    // ── By Status ────────────────────────────────────────
    Task<IReadOnlyList<StockTransfer>> GetTransfersByStatusAsync(TransferStatus status);
    Task<IReadOnlyList<StockTransfer>> GetInTransitTransfersAsync(int? companyId = null);
    
    // ── Workflow ─────────────────────────────────────────
    Task<StockTransfer> SubmitForApprovalAsync(int transferId, int requestedByUserId);
    Task<StockTransfer> ApproveTransferAsync(int transferId, int approvedByUserId);
    Task<StockTransfer> RejectTransferAsync(int transferId, string reason, int rejectedByUserId);
    Task<StockTransfer> ShipTransferAsync(int transferId, ShipTransferRequest request);
    Task<StockTransfer> ReceiveTransferAsync(int transferId, ReceiveTransferRequest request);
    Task<StockTransfer> CancelTransferAsync(int transferId, string reason, int cancelledByUserId);
    
    // ── Validation ───────────────────────────────────────
    Task<bool> ValidateStockAvailabilityAsync(int sourceWarehouseId, int materialId, decimal quantity);
    Task<Dictionary<int, decimal>> GetAvailableStockForTransferAsync(int sourceWarehouseId);
}
```

### Enhanced IWarehouseService

```csharp
public interface IWarehouseService
{
    // ── Existing Methods ─────────────────────────────────
    Task<IReadOnlyList<Warehouse>> GetWarehousesAsync(int? companyId = null);
    Task<Warehouse?> GetWarehouseByIdAsync(int id);
    Task<Warehouse> CreateWarehouseAsync(Warehouse warehouse);
    Task<Warehouse> UpdateWarehouseAsync(Warehouse warehouse);
    Task<bool> DeleteWarehouseAsync(int id);
    Task<Warehouse?> GetDefaultWarehouseAsync(int? companyId = null);
    Task<Warehouse?> GetWarehouseByCodeAsync(string code);
    
    // ── New Hierarchy Methods ────────────────────────────
    Task<IReadOnlyList<Warehouse>> GetMainWarehousesAsync(int? companyId = null);
    Task<IReadOnlyList<Warehouse>> GetBranchesAsync(int mainWarehouseId);
    Task<Warehouse?> GetMainWarehouseAsync(int branchId);
    Task<WarehouseTreeDto> GetWarehouseTreeAsync(int? companyId = null);
    
    // ── Stock Summary ────────────────────────────────────
    Task<WarehouseStockSummaryDto> GetStockSummaryAsync(int warehouseId);
    Task<WarehouseStockSummaryDto> GetConsolidatedStockSummaryAsync(int mainWarehouseId);
    Task<IReadOnlyList<WarehouseStockSummaryDto>> GetAllBranchesStockSummaryAsync(int mainWarehouseId);
}
```

---

## API Endpoints Design

### Warehouse Controller

```
GET    /api/warehouses                    - List all warehouses
GET    /api/warehouses/{id}               - Get warehouse details
POST   /api/warehouses                    - Create warehouse
PUT    /api/warehouses/{id}               - Update warehouse
DELETE /api/warehouses/{id}               - Delete warehouse

GET    /api/warehouses/main               - List main warehouses
GET    /api/warehouses/{id}/branches      - Get branches of a main warehouse
GET    /api/warehouses/{id}/tree          - Get warehouse hierarchy tree
GET    /api/warehouses/{id}/stock-summary - Get stock summary
GET    /api/warehouses/{id}/consolidated  - Get consolidated stock (main + branches)
```

### Stock Transfer Controller

```
GET    /api/stock-transfers                        - List all transfers
GET    /api/stock-transfers/{id}                   - Get transfer details
POST   /api/stock-transfers                        - Create transfer
PUT    /api/stock-transfers/{id}                   - Update transfer
DELETE /api/stock-transfers/{id}                   - Delete transfer

POST   /api/stock-transfers/{id}/submit            - Submit for approval
POST   /api/stock-transfers/{id}/approve           - Approve transfer
POST   /api/stock-transfers/{id}/reject            - Reject transfer
POST   /api/stock-transfers/{id}/ship              - Ship transfer
POST   /api/stock-transfers/{id}/receive           - Receive transfer
POST   /api/stock-transfers/{id}/cancel            - Cancel transfer

GET    /api/stock-transfers/in-transit             - List in-transit transfers
GET    /api/stock-transfers/by-warehouse/{id}      - Transfers by warehouse
```

---

## UI Components Design

### Warehouse Management Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  WAREHOUSES                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ Add Main Warehouse]  [+ Add Branch]                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🏭 Main Warehouse - Cairo Cement Depot                   │    │
│  │    Code: CEM-MAIN | Capacity: 5,000 tons                │    │
│  │    📍 Cairo Industrial Zone | 📞 02-12345678            │    │
│  │                                                          │    │
│  │    Branches (3):                                        │    │
│  │    ├── 🏬 Giza Branch      | Stock: 850 tons            │    │
│  │    ├── 🏬 Alexandria Branch| Stock: 620 tons            │    │
│  │    └── 🏬 Aswan Branch     | Stock: 340 tons            │    │
│  │                                                          │    │
│  │    [View Stock] [Transfer Stock] [Manage Branches]      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🏭 Main Warehouse - Delta Cement Center                  │    │
│  │    Code: DELTA-MAIN | Capacity: 3,000 tons              │    │
│  │    📍 Mansoura Industrial Area | 📞 050-1234567         │    │
│  │                                                          │    │
│  │    Branches (2):                                        │    │
│  │    ├── 🏬 Tanta Branch    | Stock: 450 tons             │    │
│  │    └── 🏬 Zagazig Branch  | Stock: 380 tons             │    │
│  │                                                          │    │
│  │    [View Stock] [Transfer Stock] [Manage Branches]      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Stock Transfer Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  NEW STOCK TRANSFER                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Source Warehouse:      [Cairo Cement Depot    ▼]               │
│  Destination Warehouse: [Giza Branch           ▼]               │
│                                                                  │
│  Transfer Date:         [2026-02-16]                            │
│  Expected Arrival:      [2026-02-17]                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Items                                                    │    │
│  │                                                          │    │
│  │ Material          │ Available │ Transfer Qty │ Unit      │    │
│  │ ──────────────────┼───────────┼──────────────┼─────────  │    │
│  │ Cement Portland   │ 2,500     │ [    200   ] │ bags      │    │
│  │ Cement Sulphate   │ 800       │ [     50   ] │ bags      │    │
│  │                                                          │    │
│  │ [+ Add Item]                                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Transport Details:                                              │
│  Driver Name:    [________________________]                      │
│  Driver Phone:   [________________________]                      │
│  Vehicle Number: [________________________]                      │
│  Transport Cost: [__________] EGP                                │
│                                                                  │
│  Notes:                                                          │
│  [________________________________________________]              │
│                                                                  │
│  [Cancel]  [Save Draft]  [Submit for Approval]                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Migration

### SQL Script for Warehouse Enhancement

```sql
-- Add new columns to Warehouses table
ALTER TABLE Warehouses ADD ParentWarehouseId INT NULL;
ALTER TABLE Warehouses ADD Type INT NOT NULL DEFAULT 0;
ALTER TABLE Warehouses ADD Latitude FLOAT NULL;
ALTER TABLE Warehouses ADD Longitude FLOAT NULL;
ALTER TABLE Warehouses ADD Capacity DECIMAL(18,2) NULL;
ALTER TABLE Warehouses ADD CapacityUnit NVARCHAR(50) NULL;
ALTER TABLE Warehouses ADD IsApproved BIT NOT NULL DEFAULT 1;
ALTER TABLE Warehouses ADD ImageUrl NVARCHAR(500) NULL;

-- Add foreign key for self-reference
ALTER TABLE Warehouses ADD CONSTRAINT FK_Warehouses_ParentWarehouse 
    FOREIGN KEY (ParentWarehouseId) REFERENCES Warehouses(Id);

-- Create StockTransfers table
CREATE TABLE StockTransfers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TransferNumber NVARCHAR(50) NOT NULL,
    SourceWarehouseId INT NOT NULL,
    DestinationWarehouseId INT NOT NULL,
    Status INT NOT NULL DEFAULT 0,
    TransferDate DATETIME2 NOT NULL,
    ExpectedArrivalDate DATETIME2 NULL,
    ActualArrivalDate DATETIME2 NULL,
    ShippedDate DATETIME2 NULL,
    RequestedByUserId INT NOT NULL,
    ApprovedByUserId INT NULL,
    ShippedByUserId INT NULL,
    ReceivedByUserId INT NULL,
    DriverName NVARCHAR(200) NULL,
    DriverPhone NVARCHAR(50) NULL,
    VehicleNumber NVARCHAR(50) NULL,
    TransportCost DECIMAL(18,2) NULL,
    HandlingCost DECIMAL(18,2) NULL,
    Notes NVARCHAR(MAX) NULL,
    RejectionReason NVARCHAR(500) NULL,
    CompanyId INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_StockTransfers_SourceWarehouse FOREIGN KEY (SourceWarehouseId) REFERENCES Warehouses(Id),
    CONSTRAINT FK_StockTransfers_DestinationWarehouse FOREIGN KEY (DestinationWarehouseId) REFERENCES Warehouses(Id),
    CONSTRAINT FK_StockTransfers_RequestedByUser FOREIGN KEY (RequestedByUserId) REFERENCES Users(Id),
    CONSTRAINT FK_StockTransfers_Company FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
);

-- Create StockTransferItems table
CREATE TABLE StockTransferItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    StockTransferId INT NOT NULL,
    MaterialId INT NOT NULL,
    RequestedQuantity DECIMAL(18,2) NOT NULL,
    ApprovedQuantity DECIMAL(18,2) NOT NULL DEFAULT 0,
    ShippedQuantity DECIMAL(18,2) NOT NULL DEFAULT 0,
    ReceivedQuantity DECIMAL(18,2) NOT NULL DEFAULT 0,
    Unit NVARCHAR(50) NOT NULL,
    UnitCost DECIMAL(18,2) NULL,
    Notes NVARCHAR(MAX) NULL,
    BatchNumber NVARCHAR(100) NULL,
    ExpirationDate DATETIME2 NULL,
    CompanyId INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_StockTransferItems_StockTransfer FOREIGN KEY (StockTransferId) REFERENCES StockTransfers(Id),
    CONSTRAINT FK_StockTransferItems_Material FOREIGN KEY (MaterialId) REFERENCES Materials(Id),
    CONSTRAINT FK_StockTransferItems_Company FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
);

-- Create StockTransferStatusHistory table
CREATE TABLE StockTransferStatusHistory (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    StockTransferId INT NOT NULL,
    PreviousStatus INT NOT NULL,
    NewStatus INT NOT NULL,
    ChangedByUserId INT NOT NULL,
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_StockTransferStatusHistory_StockTransfer FOREIGN KEY (StockTransferId) REFERENCES StockTransfers(Id),
    CONSTRAINT FK_StockTransferStatusHistory_User FOREIGN KEY (ChangedByUserId) REFERENCES Users(Id)
);

-- Create indexes for performance
CREATE INDEX IX_Warehouses_ParentWarehouseId ON Warehouses(ParentWarehouseId);
CREATE INDEX IX_Warehouses_Type ON Warehouses(Type);
CREATE INDEX IX_StockTransfers_SourceWarehouseId ON StockTransfers(SourceWarehouseId);
CREATE INDEX IX_StockTransfers_DestinationWarehouseId ON StockTransfers(DestinationWarehouseId);
CREATE INDEX IX_StockTransfers_Status ON StockTransfers(Status);
CREATE INDEX IX_StockTransferItems_StockTransferId ON StockTransferItems(StockTransferId);
CREATE INDEX IX_StockTransferItems_MaterialId ON StockTransferItems(MaterialId);
```

---

## Implementation Checklist

### Phase 1: Entity & Database
- [ ] Update `Warehouse` entity with hierarchy support
- [ ] Create `StockTransfer` entity
- [ ] Create `StockTransferItem` entity
- [ ] Create `StockTransferStatusHistory` entity
- [ ] Add `WarehouseType` enum
- [ ] Add `TransferStatus` enum
- [ ] Update `ApplicationDbContext`
- [ ] Create database migration

### Phase 2: Services
- [ ] Create `IStockTransferService` interface
- [ ] Implement `StockTransferService`
- [ ] Update `IWarehouseService` interface
- [ ] Update `WarehouseService` implementation
- [ ] Add DTOs for transfers and warehouse tree

### Phase 3: API
- [ ] Create `StockTransfersController`
- [ ] Update `WarehousesController` with new endpoints
- [ ] Add validation and error handling

### Phase 4: Frontend
- [ ] Create warehouse management component
- [ ] Create branch management component
- [ ] Create stock transfer form component
- [ ] Create transfer list/history component
- [ ] Add warehouse tree view

### Phase 5: Testing
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests for UI

---

## Summary

This design enables:

1. **Multi-Branch Support** - Main warehouse with unlimited branches
2. **Stock Transfers** - Full workflow for moving stock between branches
3. **Consolidated Reporting** - View stock across all branches
4. **Hierarchical Management** - Manage branches under main warehouse

The implementation follows the existing patterns in the codebase and integrates seamlessly with the current inventory management system.

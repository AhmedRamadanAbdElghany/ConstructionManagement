# Construction Management System - Missing Features Specification

## Table of Contents
1. [Budget Management & Cost Control](#1-budget-management--cost-control)
2. [Task Management (WBS)](#2-task-management-wbs)
3. [Resource Planning & Allocation](#3-resource-planning--allocation)
4. [Procurement & Purchase Orders](#4-procurement--purchase-orders)
5. [Time Tracking & Timesheets](#5-time-tracking--timesheets)
6. [Advanced Document Management](#6-advanced-document-management)
7. [Communication Hub](#7-communication-hub)
8. [Health & Safety Enhancements](#8-health--safety-enhancements)
9. [Client Portal Enhancements](#9-client-portal-enhancements)
10. [AI/ML Predictions](#10-aiml-predictions)
11. [GIS/Mapping Integration](#11/gismapping-integration)
12. [Integration Framework](#12-integration-framework)

---

## 1. Budget Management & Cost Control

### 1.1 Overview
Comprehensive budget tracking system for projects with variance analysis, cost forecasting, and approval workflows.

### 1.2 Entities

#### Budget Entity
```csharp
public class Budget : Entity<int>
{
    public int ProjectId { get; set; }
    public string BudgetNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BudgetType Type { get; set; }
    public BudgetStatus Status { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal RevisedAmount { get; set; }
    public decimal ContingencyAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public ICollection<BudgetLineItem> LineItems { get; set; } = new List<BudgetLineItem>();
    public ICollection<BudgetRevision> Revisions { get; set; } = new List<BudgetRevision>();
}

public enum BudgetType
{
    Original = 1,
    Revised = 2,
    Contingency = 3
}

public enum BudgetStatus
{
    Draft = 1,
    Submitted = 2,
    Approved = 3,
    Rejected = 4,
    Closed = 5
}
```

#### BudgetLineItem Entity
```csharp
public class BudgetLineItem : Entity<int>
{
    public int BudgetId { get; set; }
    public string Category { get; set; } = string.Empty; // Labor, Material, Equipment, Subcontract
    public string Code { get; set; } = string.Empty; // WBS or Cost Code
    public string Description { get; set; } = string.Empty;
    public decimal OriginalQuantity { get; set; }
    public decimal RevisedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal RevisedAmount { get; set; }
    public decimal CommittedCost { get; set; }
    public decimal ActualCost { get; set; }
    public decimal PendingCost { get; set; }
    
    // Navigation properties
    public Budget Budget { get; set; } = null!;
}
```

#### BudgetRevision Entity
```csharp
public class BudgetRevision : Entity<int>
{
    public int BudgetId { get; set; }
    public int RevisionNumber { get; set; }
    public string Reason { get; set; } = string.Empty;
    public decimal AmountChange { get; set; }
    public int RequestedByUserId { get; set; }
    public DateTime RequestedAt { get; set; }
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public RevisionStatus Status { get; set; }
    
    // Navigation properties
    public Budget Budget { get; set; } = null!;
}

public enum RevisionStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}
```

### 1.3 DTOs

#### CreateBudgetRequest
```csharp
public class CreateBudgetRequest
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BudgetType Type { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal ContingencyAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<CreateBudgetLineItemRequest> LineItems { get; set; } = new();
}

public class CreateBudgetLineItemRequest
{
    public string Category { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
```

#### BudgetDto
```csharp
public class BudgetDto
{
    public int Id { get; set; }
    public string BudgetNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BudgetType Type { get; set; }
    public BudgetStatus Status { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal RevisedAmount { get; set; }
    public decimal ContingencyAmount { get; set; }
    public decimal TotalCommitted { get; set; }
    public decimal TotalActual { get; set; }
    public decimal TotalPending { get; set; }
    public decimal Variance { get; set; }
    public decimal VariancePercentage { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<BudgetLineItemDto> LineItems { get; set; } = new();
}

public class BudgetLineItemDto
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal OriginalAmount { get; set; }
    public decimal RevisedAmount { get; set; }
    public decimal CommittedCost { get; set; }
    public decimal ActualCost { get; set; }
    public decimal PendingCost { get; set; }
    public decimal Variance { get; set; }
    public decimal VariancePercentage { get; set; }
}
```

#### BudgetVarianceReportDto
```csharp
public class BudgetVarianceReportDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int BudgetId { get; set; }
    public decimal OriginalBudget { get; set; }
    public decimal RevisedBudget { get; set; }
    public decimal TotalCommitted { get; set; }
    public decimal TotalActual { get; set; }
    public decimal TotalPending { get; set; }
    public decimal ForecastedTotal { get; set; }
    public decimal Variance { get; set; }
    public decimal VariancePercentage { get; set; }
    public List<VarianceByCategoryDto> VarianceByCategory { get; set; } = new();
    public List<VarianceByMonthDto> VarianceByMonth { get; set; } = new();
}

public class VarianceByCategoryDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public decimal Actual { get; set; }
    public decimal Variance { get; set; }
    public decimal VariancePercentage { get; set; }
}

public class VarianceByMonthDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Budget { get; set; }
    public decimal Actual { get; set; }
    public decimal CumulativeBudget { get; set; }
    public decimal CumulativeActual { get; set; }
    public decimal Variance { get; set; }
}
```

### 1.4 API Endpoints

```
GET    /api/budgets                                    # List all budgets
GET    /api/budgets/{id}                              # Get budget by ID
GET    /api/budgets/project/{projectId}                # Get budgets by project
POST   /api/budgets                                   # Create new budget
PUT    /api/budgets/{id}                             # Update budget
POST   /api/budgets/{id}/submit                       # Submit for approval
POST   /api/budgets/{id}/approve                      # Approve budget
POST   /api/budgets/{id}/reject                       # Reject budget
POST   /api/budgets/{id}/revision                     # Create revision
GET    /api/budgets/{id}/variances                    # Get variance report
GET    /api/budgets/{id}/report                       # Get budget report
DELETE /api/budgets/{id}                              # Delete draft budget
```

### 1.5 Service Methods

```csharp
public interface IBudgetService
{
    Task<int> CreateBudgetAsync(CreateBudgetRequest request);
    Task UpdateBudgetAsync(int id, UpdateBudgetRequest request);
    Task<BudgetDto> GetBudgetByIdAsync(int id);
    Task<List<BudgetDto>> GetBudgetsByProjectAsync(int projectId);
    Task SubmitForApprovalAsync(int id, int userId);
    Task ApproveBudgetAsync(int id, int userId);
    Task RejectBudgetAsync(int id, int userId, string reason);
    Task<int> CreateRevisionAsync(int id, CreateBudgetRevisionRequest request);
    Task<BudgetVarianceReportDto> GetVarianceReportAsync(int budgetId);
    Task<BudgetReportDto> GetBudgetReportAsync(int budgetId);
    Task RecalculateBudgetTotalsAsync(int budgetId);
    Task SyncWithTransactionsAsync(int budgetId);
}
```

### 1.6 Features & Business Rules

#### Budget Creation
- Budget must be linked to an active project
- Budget number is auto-generated (format: BGT-YYYY-XXXX)
- Original amount is sum of line items
- Contingency is separate allocation
- Status starts as Draft

#### Budget Approval
- Draft budgets can be submitted for approval
- Only managers can approve/reject budgets
- Approval creates audit trail
- Approved budgets cannot be modified (create revisions instead)

#### Variance Calculation
- Variance = Revised Budget - (Actual + Committed + Pending)
- Variance % = (Variance / Revised Budget) * 100
- Real-time calculation based on transactions

#### Cost Syncing
- Line item costs sync with:
  - Project transactions (material, labor, equipment)
  - Purchase order commitments
  - Subcontractor invoices
- Automatic updates when transactions are posted

---

## 2. Task Management (WBS)

### 2.1 Overview
Work Breakdown Structure for breaking down projects into manageable tasks with dependencies.

### 2.2 Entities

#### ProjectTask Entity
```csharp
public class ProjectTask : Entity<int>
{
    public int ProjectId { get; set; }
    public int? ParentTaskId { get; set; }
    public string TaskNumber { get; set; } = string.Empty; // WBS Code
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskType Type { get; set; } // Milestone, Activity, Summary
    public TaskStatus Status { get; set; }
    public int? AssignedToUserId { get; set; }
    public int? AssignedToTeamId { get; set; }
    public DateTime? PlannedStartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public decimal PlannedDuration { get; set; } // In hours
    public decimal ActualDuration { get; set; }
    public decimal PlannedCost { get; set; }
    public decimal ActualCost { get; set; }
    public decimal ProgressPercentage { get; set; }
    public int Priority { get; set; }
    public bool IsCritical { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public ProjectTask? ParentTask { get; set; }
    public ICollection<ProjectTask> ChildTasks { get; set; } = new List<ProjectTask>();
    public ICollection<TaskDependency> Predecessors { get; set; } = new List<TaskDependency>();
    public ICollection<TaskDependency> Successors { get; set; } = new List<TaskDependency>();
    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
    public ICollection<TaskTimeEntry> TimeEntries { get; set; } = new List<TaskTimeEntry>();
}

public enum TaskType
{
    Milestone = 1,
    Activity = 2,
    Summary = 3,
    Hammock = 4,
    Deadlines = 5
}

public enum TaskStatus
{
    NotStarted = 1,
    InProgress = 2,
    Completed = 3,
    OnHold = 4,
    Cancelled = 5
}
```

#### TaskDependency Entity
```csharp
public class TaskDependency : Entity<int>
{
    public int PredecessorTaskId { get; set; }
    public int SuccessorTaskId { get; set; }
    public DependencyType Type { get; set; }
    public decimal Lag { get; set; } // In hours
    public string? Description { get; set; }
    
    // Navigation properties
    public ProjectTask PredecessorTask { get; set; } = null!;
    public ProjectTask SuccessorTask { get; set; } = null!;
}

public enum DependencyType
{
    FinishToStart = 1,    // FS: Successor starts after predecessor finishes
    StartToStart = 2,      // SS: Both tasks start at the same time
    FinishToFinish = 3,    // FF: Both tasks finish at the same time
    StartToFinish = 4     // SF: Successor finishes after predecessor starts
}
```

#### TaskAssignment Entity
```csharp
public class TaskAssignment : Entity<int>
{
    public int TaskId { get; set; }
    public int UserId { get; set; }
    public AssignmentType Type { get; set; }
    public decimal AllocatedHours { get; set; }
    public decimal UsedHours { get; set; }
    public DateTime AssignedAt { get; set; }
    public int AssignedByUserId { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public ProjectTask Task { get; set; } = null!;
    public User User { get; set; } = null!;
}

public enum AssignmentType
{
    Primary = 1,
    Secondary = 2,
    Backup = 3,
    Reviewer = 4
}
```

### 2.3 DTOs

#### CreateTaskRequest
```csharp
public class CreateTaskRequest
{
    public int ProjectId { get; set; }
    public int? ParentTaskId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskType Type { get; set; }
    public int? AssignedToUserId { get; set; }
    public DateTime? PlannedStartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public decimal PlannedDuration { get; set; }
    public decimal PlannedCost { get; set; }
    public int Priority { get; set; }
    public List<CreateDependencyRequest> Dependencies { get; set; } = new();
    public List<int> AssignedUserIds { get; set; } = new();
}

public class CreateDependencyRequest
{
    public int PredecessorTaskId { get; set; }
    public DependencyType Type { get; set; }
    public decimal Lag { get; set; }
}
```

#### TaskDto
```csharp
public class TaskDto
{
    public int Id { get; set; }
    public string TaskNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskType Type { get; set; }
    public TaskStatus Status { get; set; }
    public string? AssignedToUserName { get; set; }
    public int? AssignedToUserId { get; set; }
    public DateTime? PlannedStartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public decimal PlannedDuration { get; set; }
    public decimal ActualDuration { get; set; }
    public decimal PlannedCost { get; set; }
    public decimal ActualCost { get; set; }
    public decimal ProgressPercentage { get; set; }
    public int Priority { get; set; }
    public bool IsCritical { get; set; }
    public List<TaskDto> ChildTasks { get; set; } = new();
    public List<DependencyDto> Dependencies { get; set; } = new();
    public List<AssignmentDto> Assignments { get; set; } = new();
    public decimal RemainingHours { get; set; }
    public int? DaysRemaining { get; set; }
}

public class DependencyDto
{
    public int Id { get; set; }
    public int PredecessorTaskId { get; set; }
    public string PredecessorTaskNumber { get; set; } = string.Empty;
    public string PredecessorTaskName { get; set; } = string.Empty;
    public DependencyType Type { get; set; }
    public decimal Lag { get; set; }
}

public class AssignmentDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public AssignmentType Type { get; set; }
    public decimal AllocatedHours { get; set; }
    public decimal UsedHours { get; set; }
}
```

#### WBSStructureDto
```csharp
public class WBSStructureDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public List<TaskDto> RootTasks { get; set; } = new();
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public decimal TotalPlannedHours { get; set; }
    public decimal TotalActualHours { get; set; }
    public int CriticalPathTaskIds { get; set; }
}
```

### 2.4 API Endpoints

```
GET    /api/tasks                                    # List all tasks
GET    /api/tasks/{id}                               # Get task by ID
GET    /api/tasks/project/{projectId}                # Get tasks by project
GET    /api/tasks/project/{projectId}/wbs            # Get WBS structure
GET    /api/tasks/project/{projectId}/critical-path   # Get critical path
POST   /api/tasks                                    # Create new task
PUT    /api/tasks/{id}                               # Update task
POST   /api/tasks/{id}/start                         # Start task
POST   /api/tasks/{id}/complete                       # Complete task
POST   /api/tasks/{id}/assign                        # Assign user
POST   /api/tasks/{id}/dependencies                   # Add dependencies
DELETE /api/tasks/{id}                               # Delete task
POST   /api/tasks/bulk-update                        # Bulk update tasks
GET    /api/tasks/my-tasks                           # Get tasks assigned to current user
GET    /api/tasks/overdue                            # Get overdue tasks
GET    /api/tasks/gantt/{projectId}                  # Get Gantt chart data
```

### 2.5 Service Methods

```csharp
public interface ITaskService
{
    Task<int> CreateTaskAsync(CreateTaskRequest request);
    Task UpdateTaskAsync(int id, UpdateTaskRequest request);
    Task<TaskDto> GetTaskByIdAsync(int id);
    Task<List<TaskDto>> GetTasksByProjectAsync(int projectId);
    Task<WBSStructureDto> GetWBSStructureAsync(int projectId);
    Task<List<TaskDto>> GetCriticalPathAsync(int projectId);
    Task StartTaskAsync(int id, int userId);
    Task CompleteTaskAsync(int id, int userId, decimal actualDuration);
    Task AssignUserAsync(int taskId, int userId, AssignmentType type);
    Task AddDependencyAsync(int taskId, CreateDependencyRequest request);
    Task RemoveDependencyAsync(int dependencyId);
    Task RecalculateTaskDatesAsync(int taskId);
    Task RecalculateCriticalPathAsync(int projectId);
    Task RecalculateProgressAsync(int projectId);
    Task<List<TaskDto>> GetMyTasksAsync(int userId);
    Task<List<TaskDto>> GetOverdueTasksAsync(int? projectId = null);
    Task<GanttChartDataDto> GetGanttDataAsync(int projectId);
    Task BulkUpdateAsync(BulkTaskUpdateRequest request);
}
```

### 2.6 Critical Path Calculation Algorithm

```csharp
public class CriticalPathCalculator
{
    public List<int> CalculateCriticalPath(int projectId)
    {
        // Forward pass - calculate early start/finish
        var tasks = GetProjectTasks(projectId);
        CalculateEarlyDates(tasks);
        
        // Backward pass - calculate late start/finish
        CalculateLateDates(tasks);
        
        // Identify critical tasks (total float = 0)
        var criticalTasks = tasks
            .Where(t => t.TotalFloat == 0)
            .OrderBy(t => t.EarlyStartDate)
            .Select(t => t.Id)
            .ToList();
        
        return criticalTasks;
    }
    
    private void CalculateEarlyDates(List<ProjectTask> tasks)
    {
        // Calculate Early Start (ES) and Early Finish (EF)
        foreach (var task in tasks.OrderBy(t => t.PlannedStartDate))
        {
            if (task.Predecessors.Any())
            {
                task.EarlyStartDate = task.Predecessors
                    .Max(p => GetFinishDate(p.PredecessorTask, p.Type, p.Lag));
            }
            else
            {
                task.EarlyStartDate = task.PlannedStartDate ?? DateTime.UtcNow;
            }
            task.EarlyFinishDate = task.EarlyStartDate.AddHours(task.PlannedDuration);
        }
    }
    
    private void CalculateLateDates(List<ProjectTask> tasks)
    {
        // Calculate Late Start (LS) and Late Finish (LF)
        var orderedTasks = tasks.OrderByDescending(t => t.PlannedEndDate).ToList();
        
        foreach (var task in orderedTasks)
        {
            if (task.Successors.Any())
            {
                task.LateFinishDate = task.Successors
                    .Min(s => GetStartDate(s.SuccessorTask, s.Type, s.Lag));
            }
            else
            {
                task.LateFinishDate = task.PlannedEndDate ?? task.EarlyFinishDate;
            }
            task.LateStartDate = task.LateFinishDate.SubtractHours(task.PlannedDuration);
            task.TotalFloat = (task.LateStartDate - task.EarlyStartDate).TotalHours;
        }
    }
}
```

### 2.7 Business Rules

#### WBS Validation
- Task numbers must follow WBS hierarchy (e.g., 1.2.3)
- Parent task must exist before child tasks
- Cannot delete task with children (cascade or prevent)
- Progress cannot exceed 100%
- Cannot start task if predecessors not completed (unless SS dependency)

#### Dependencies
- Circular dependencies are not allowed
- FS: Successor ES = Predecessor EF + Lag
- SS: Successor ES = Predecessor ES + Lag
- FF: Successor EF = Predecessor EF + Lag
- SF: Successor EF = Predecessor ES + Lag

#### Auto-Calculations
- Task duration = End Date - Start Date
- Progress = Actual Duration / Planned Duration * 100
- Critical path recalculated on any date/duration change
- Parent task progress = Weighted average of children

---

## 3. Resource Planning & Allocation

### 3.1 Overview
Manage and allocate labor, equipment, and material resources across projects.

### 3.2 Entities

#### Resource Entity
```csharp
public class Resource : Entity<int>
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ResourceType Type { get; set; }
    public ResourceCategory Category { get; set; }
    public string? Description { get; set; }
    public string? Unit { get; set; } // hours, days, each
    public decimal StandardRate { get; set; }
    public decimal OvertimeRate { get; set; }
    public bool IsAvailable { get; set; }
    public int? MaxQuantityPerProject { get; set; }
    public int? CompanyId { get; set; }
    public string? ExternalId { get; set; } // For external vendor resources
    
    // Navigation properties
    public Company? Company { get; set; }
    public ICollection<ResourceAllocation> Allocations { get; set; } = new List<ResourceAllocation>();
    public ICollection<ResourceBooking> Bookings { get; set; } = new List<ResourceBooking>();
}

public enum ResourceType
{
    Labor = 1,
    Equipment = 2,
    Material = 3,
    Subcontractor = 4,
    Other = 5
}

public enum ResourceCategory
{
    // Labor categories
    Engineer = 1,
    Supervisor = 2,
    Worker = 3,
    Technician = 4,
    
    // Equipment categories
    HeavyEquipment = 10,
    LightEquipment = 11,
    Tools = 12,
    Vehicles = 13,
    
    // Material categories
    RawMaterial = 20,
    Consumable = 21,
    
    // Other
    Other = 99
}
```

#### ResourceAllocation Entity
```csharp
public class ResourceAllocation : Entity<int>
{
    public int ResourceId { get; set; }
    public int ProjectId { get; set; }
    public int? TaskId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Quantity { get; set; } // Number of resources
    public decimal HoursPerDay { get; set; }
    public decimal TotalHours { get; set; }
    public decimal UsedHours { get; set; }
    public decimal Rate { get; set; }
    public decimal TotalCost { get; set; }
    public AllocationStatus Status { get; set; }
    public int AllocatedByUserId { get; set; }
    public DateTime AllocatedAt { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Resource Resource { get; set; } = null!;
    public Project Project { get; set; } = null!;
    public ProjectTask? Task { get; set; }
}

public enum AllocationStatus
{
    Draft = 1,
    Approved = 2,
    Active = 3,
    Completed = 4,
    Cancelled = 5
}
```

#### ResourceBooking Entity
```csharp
public class ResourceBooking : Entity<int>
{
    public int ResourceId { get; set; }
    public int ProjectId { get; set; }
    public DateTime BookingDate { get; set; }
    public decimal Quantity { get; set; }
    public decimal Hours { get; set; }
    public BookingType Type { get; set; }
    public BookingStatus Status { get; set; }
    public int? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public Resource Resource { get; set; } = null!;
    public Project Project { get; set; } = null!;
}

public enum BookingType
{
    Planned = 1,
    Actual = 2,
    OverTime = 3,
    Standby = 4
}

public enum BookingStatus
{
    Pending = 1,
    Confirmed = 2,
   utilization calculations across projects and time periods.

    // Resource Utilization
    public decimal UtilizationPercentage { get; set; }
    public int AvailableHoursPerDay { get; set; }
    public int PlannedHoursPerDay { get; set; }
    public int OverallocatedThreshold { get; set; }
}

public class ResourceCapacityDto
{
    public int ResourceId { get; set; }
    public string ResourceName { get; set; } = string.Empty;
    public ResourceType Type { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalAvailableHours { get; set; }
    public int PlannedHours { get; set; }
    public int ActualHours { get; set; }
    public int AvailableHours { get; set; }
    public decimal UtilizationPercentage { get; set; }
}
```

### 3.4 API Endpoints

```
# Resource Management
GET    /api/resources                                   # List all resources
GET    /api/resources/{id}                             # Get resource by ID
POST   /api/resources                                 # Create new resource
PUT    /api/resources/{id}                            # Update resource
DELETE /api/resources/{id}                            # Delete resource
GET    /api/resources/available                        # Get available resources
GET    /api/resources/by-type/{type}                  # Get resources by type
GET    /api/resources/by-category/{category}           # Get resources by category

# Resource Allocation
GET    /api/resource-allocations                      # List all allocations
GET    /api/resource-allocations/{id}                  # Get allocation by ID
POST   /api/resource-allocations                      # Create allocation
PUT    /api/resource-allocations/{id}                 # Update allocation
POST   /api/resource-allocations/{id}/approve         # Approve allocation
POST   /api/resource-allocations/{id}/cancel           # Cancel allocation
DELETE /api/resource-allocations/{id}                 # Delete allocation

# Resource Booking
GET    /api/resource-bookings                         # List all bookings
POST   /api/resource-bookings                         # Create booking
PUT    /api/resource-bookings/{id}                    # Update booking
POST   /api/resource-bookings/{id}/confirm            # Confirm booking
POST   /api/resource-bookings/{id}/cancel             # Cancel booking

# Resource Reports
GET    /api/resources/utilization                     # Get utilization report
GET    /api/resources/{id}/capacity                   # Get resource capacity
GET    /api/resources/{id}/schedule                  # Get resource schedule
GET    /api/resources/overallocated                   # Get overallocated resources
GET    /api/resources/availability-calendar           # Get availability calendar
```

### 3.5 Service Methods

```csharp
public interface IResourceService
{
    Task<int> CreateResourceAsync(CreateResourceRequest request);
    Task UpdateResourceAsync(int id, UpdateResourceRequest request);
    Task<ResourceDto> GetResourceByIdAsync(int id);
    Task<List<ResourceDto>> GetResourcesAsync(ResourceFilterRequest filter);
    Task<List<ResourceDto>> GetAvailableResourcesAsync(DateTime startDate, DateTime endDate);
    
    Task<int> CreateAllocationAsync(CreateAllocationRequest request);
    Task UpdateAllocationAsync(int id, UpdateAllocationRequest request);
    Task ApproveAllocationAsync(int id, int userId);
    Task CancelAllocationAsync(int id, string reason);
    
    Task<int> CreateBookingAsync(CreateBookingRequest request);
    Task UpdateBookingAsync(int id, UpdateBookingRequest request);
    
    Task<ResourceUtilizationDto> GetUtilizationReportAsync(ResourceUtilizationFilter filter);
    Task<List<ResourceCapacityDto>> GetResourceCapacityAsync(int resourceId, int year, int month);
    Task<ResourceScheduleDto> GetResourceScheduleAsync(int resourceId, DateTime startDate, DateTime endDate);
    Task<List<ResourceDto>> GetOverallocatedResourcesAsync(DateTime startDate, DateTime endDate);
    Task<AvailabilityCalendarDto> GetAvailabilityCalendarAsync(int resourceId, DateTime startDate, DateTime endDate);
    Task CheckAndAlertOverallocationAsync();
}
```

### 3.6 Business Rules

#### Resource Availability
- Resources can be allocated to multiple projects
- Overallocation triggers alerts
- Maximum quantity per project can be set
- Resources can be marked unavailable

#### Allocation Validation
- No overlapping allocations for same resource (unless quantity allows)
- Start date must be before end date
- Total hours = (End - Start) * Hours/Day * Quantity
- Allocations require approval based on threshold

#### Utilization Calculation
- Utilization % = (Planned + Actual Hours) / Available Hours * 100
- Available hours based on work calendar
- Overallocation threshold (default: 100%)
- Alerts sent when utilization exceeds threshold

#### Booking Rules
- Bookings create commitments
- Actual bookings update utilization
- Standby bookings don't count toward utilization
- Cancellations release resources

---

## 4. Procurement & Purchase Orders

### 4.1 Overview
Manage procurement process from purchase requests to purchase orders to goods receipt.

### 4.2 Entities

#### PurchaseRequest Entity
```csharp
public class PurchaseRequest : Entity<int>
{
    public string RequestNumber { get; set; } = string.Empty;
    public int ProjectId { get; set; }
    public int RequestorUserId { get; set; }
    public RequestType Type { get; set; }
    public RequestStatus Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? VendorId { get; set; }
    public decimal EstimatedAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime RequiredDate { get; set; }
    public string Priority { get; set; } = "Normal"; // Low, Normal, High, Urgent
    public string? Justification { get; set; }
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovalNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public User Requestor { get; set; } = null!;
    public Vendor? Vendor { get; set; }
    public ICollection<PurchaseRequestItem> Items { get; set; } = new List<PurchaseRequestItem>();
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}

public enum RequestType
{
    Materials = 1,
    Equipment = 2,
    Services = 3,
    Subcontract = 4,
    Other = 5
}

public enum RequestStatus
{
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    Approved = 4,
    Rejected = 5,
    ConvertedToPO = 6,
    Cancelled = 7
}
```

#### PurchaseOrder Entity
```csharp
public class PurchaseOrder : Entity<int>
{
    public string PONumber { get; set; } = string.Empty;
    public int ProjectId { get; set; }
    public int? PurchaseRequestId { get; set; }
    public int VendorId { get; set; }
    public int CreatedByUserId { get; set; }
    public POStatus Status { get; set; }
    public DateTime PODate { get; set; }
    public DateTime ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? TermsAndConditions { get; set; }
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public PurchaseRequest? PurchaseRequest { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public User CreatedBy { get; set; } = null!;
    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    public ICollection<GoodsReceipt> GoodsReceipts { get; set; } = new List<GoodsReceipt>();
    public ICollection<InvoiceReceipt> InvoiceReceipts { get; set; } = new List<InvoiceReceipt>();
}

public enum POStatus
{
    Draft = 1,
    Submitted = 2,
    Approved = 3,
    SentToVendor = 4,
    Acknowledged = 5,
    PartiallyReceived = 6,
    FullyReceived = 7,
    Invoiced = 8,
    Completed = 9,
    Cancelled = 10
}
```

#### PurchaseOrderItem Entity
```csharp
public class PurchaseOrderItem : Entity<int>
{
    public int PurchaseOrderId { get; set; }
    public int SequenceNumber { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal TaxPercentage { get; set; }
    public decimal LineTotal { get; set; }
    public DateTime? RequiredDate { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
}
```

#### GoodsReceipt Entity
```csharp
public class GoodsReceipt : Entity<int>
{
    public string ReceiptNumber { get; set; } = string.Empty;
    public int PurchaseOrderId { get; set; }
    public int ReceivedByUserId { get; set; }
    public DateTime ReceiptDate { get; set; }
    public ReceiptStatus Status { get; set; }
    public string DeliveryNoteNumber { get; set; } = string.Empty;
    public string CarrierName { get; set; } = string.Empty;
    public string? CarrierTrackingNumber { get; set; }
    public string ReceivingLocation { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public User ReceivedBy { get; set; } = null!;
    public ICollection<GoodsReceiptItem> Items { get; set; } = new List<GoodsReceiptItem>();
}

public enum ReceiptStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    Rejected = 4
}
```

### 4.3 DTOs

#### CreatePurchaseRequest
```csharp
public class CreatePurchaseRequestRequest
{
    public int ProjectId { get; set; }
    public RequestType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? PreferredVendorId { get; set; }
    public decimal EstimatedAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime RequiredDate { get; set; }
    public string Priority { get; set; } = "Normal";
    public string? Justification { get; set; }
    public List<CreatePurchaseRequestItemRequest> Items { get; set; } = new();
}

public class CreatePurchaseRequestItemRequest
{
    public string ItemCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal EstimatedUnitPrice { get; set; }
}
```

#### CreatePurchaseOrderRequest
```csharp
public class CreatePurchaseOrderRequest
{
    public int ProjectId { get; set; }
    public int? PurchaseRequestId { get; set; }
    public int VendorId { get; set; }
    public DateTime ExpectedDeliveryDate { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal TaxPercentage { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal DiscountPercentage { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? TermsAndConditions { get; set; }
    public List<CreatePurchaseOrderItemRequest> Items { get; set; } = new();
}
```

### 4.4 API Endpoints

```
# Purchase Requests
GET    /api/purchase-requests                        # List all requests
GET    /api/purchase-requests/{id}                   # Get request by ID
GET    /api/purchase-requests/project/{projectId}   # Get requests by project
POST   /api/purchase-requests                        # Create request
PUT    /api/purchase-requests/{id}                   # Update request
POST   /api/purchase-requests/{id}/submit            # Submit for approval
POST   /api/purchase-requests/{id}/approve           # Approve request
POST   /api/purchase-requests/{id}/reject            # Reject request
POST   /api/purchase-requests/{id}/convert-to-po     # Convert to PO
POST   /api/purchase-requests/{id}/cancel             # Cancel request

# Purchase Orders
GET    /api/purchase-orders                         # List all POs
GET    /api/purchase-orders/{id}                     # Get PO by ID
GET    /api/purchase-orders/project/{projectId}      # Get POs by project
GET    /api/purchase-orders/vendor/{vendorId}        # Get POs by vendor
POST   /api/purchase-orders                          # Create PO
PUT    /api/purchase-orders/{id}                     # Update PO
POST   /api/purchase-orders/{id}/submit              # Submit for approval
POST   /api/purchase-orders/{id}/approve             # Approve PO
POST   /api/purchase-orders/{id}/send                # Send to vendor
POST   /api/purchase-orders/{id}/acknowledge         # Vendor acknowledgment
POST   /api/purchase-orders/{id}/cancel              # Cancel PO

# Goods Receipts
GET    /api/goods-receipts                          # List all receipts
GET    /api/goods-receipts/{id}                      # Get receipt by ID
POST   /api/goods-receipts                          # Create receipt
POST   /api/goods-receipts/{id}/complete            # Complete receipt
POST   /api/goods-receipts/{id}/reject               # Reject receipt
```

### 4.5 Service Methods

```csharp
public interface IProcurementService
{
    // Purchase Requests
    Task<int> CreatePurchaseRequestAsync(CreatePurchaseRequestRequest request);
    Task UpdatePurchaseRequestAsync(int id, UpdatePurchaseRequestRequest request);
    Task<PurchaseRequestDto> GetPurchaseRequestByIdAsync(int id);
    Task<List<PurchaseRequestDto>> GetPurchaseRequestsAsync(PurchaseRequestFilter filter);
    Task SubmitForApprovalAsync(int id, int userId);
    Task ApprovePurchaseRequestAsync(int id, int userId, string? notes);
    Task RejectPurchaseRequestAsync(int id, int userId, string reason);
    Task<int> ConvertToPurchaseOrderAsync(int requestId, CreatePurchaseOrderRequest request);
    
    // Purchase Orders
    Task<int> CreatePurchaseOrderAsync(CreatePurchaseOrderRequest request);
    Task UpdatePurchaseOrderAsync(int id, UpdatePurchaseOrderRequest request);
    Task<PurchaseOrderDto> GetPurchaseOrderByIdAsync(int id);
    Task<List<PurchaseOrderDto>> GetPurchaseOrdersAsync(PurchaseOrderFilter filter);
    Task ApprovePurchaseOrderAsync(int id, int userId);
    Task SendToVendorAsync(int id);
    
    // Goods Receipts
    Task<int> CreateGoodsReceiptAsync(CreateGoodsReceiptRequest request);
    Task CompleteGoodsReceiptAsync(int id, int userId);
    Task RejectGoodsReceiptAsync(int id, int userId, string reason);
    
    // Reports
    Task<PurchaseSummaryReportDto> GetPurchaseSummaryReportAsync(PurchaseReportFilter filter);
    Task<List<VendorPerformanceDto>> GetVendorPerformanceReportAsync(int vendorId);
}
```

---

## 5. Time Tracking & Timesheets

[Detailed specification continues with similar structure...]

## 6-12. Remaining Features

The remaining features would follow the same detailed specification format with:
- Entity definitions
- DTOs
- API endpoints
- Service methods
- Business rules
- Implementation notes

---

## Implementation Priority Recommendation

### Phase 1 (High Priority - 4-6 weeks)
1. Budget Management & Cost Control
2. Task Management (WBS)

### Phase 2 (Medium Priority - 4-6 weeks)
3. Resource Planning & Allocation
4. Procurement & Purchase Orders

### Phase 3 (Lower Priority - 4-6 weeks)
5-12. Additional features based on business requirements

---

## Dependencies Between Features

```
Budget Management
    ↑
    ├── Task Management (uses budget for cost tracking)
    └── Procurement (syncs with budget)
    
Resource Planning
    ↑
    └── Task Management (resources assigned to tasks)
    
Procurement
    ↑
    └── Inventory (goods receipts update inventory)
    
Timesheets
    ↑
    └── Resource Planning (actual hours vs planned)
```

Would you like me to create detailed specifications for any additional features, or shall we proceed with implementing one of these features?

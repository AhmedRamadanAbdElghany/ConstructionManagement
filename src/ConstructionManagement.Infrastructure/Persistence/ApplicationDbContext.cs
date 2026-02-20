using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Linq.Expressions;

using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    private readonly ICompanyContext _companyContext;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICompanyContext? companyContext = null)
        : base(options)
    {
        _companyContext = companyContext ?? new Services.CompanyContext();
    }

    // ── DbSets ──────────────────────────────────────────────────────────────────
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyDefaultPhase> CompanyDefaultPhases => Set<CompanyDefaultPhase>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<ProjectRolePermission> ProjectRolePermissions => Set<ProjectRolePermission>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTeamMember> ProjectTeamMembers => Set<ProjectTeamMember>();
    public DbSet<ProjectTeamRole> ProjectTeamRoles => Set<ProjectTeamRole>();
    public DbSet<ProjectRole> ProjectRoles => Set<ProjectRole>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<ProjectSettings> ProjectSettings => Set<ProjectSettings>();
    public DbSet<ProjectApprovalRule> ProjectApprovalRules => Set<ProjectApprovalRule>();
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();
    public DbSet<ItemDailyLog> ItemDailyLogs => Set<ItemDailyLog>();
    public DbSet<ItemInvoice> ItemInvoices => Set<ItemInvoice>();
    public DbSet<ClientPayment> ClientPayments => Set<ClientPayment>();
    public DbSet<SiteMedia> SiteMedias => Set<SiteMedia>();
    public DbSet<EscalationLog> EscalationLogs => Set<EscalationLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<UserTypeHistory> UserTypeHistories => Set<UserTypeHistory>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<CatalogItem> CatalogItems => Set<CatalogItem>();
    public DbSet<ApprovalRequest> ApprovalRequests => Set<ApprovalRequest>();
    public DbSet<ApprovalStep> ApprovalSteps => Set<ApprovalStep>();
    public DbSet<CompanyPackage> CompanyPackages => Set<CompanyPackage>();
    public DbSet<InvoiceSequence> InvoiceSequences => Set<InvoiceSequence>();
    public DbSet<Phase> Phases => Set<Phase>();
    public DbSet<CompanyDefaultPhaseItem> CompanyDefaultPhaseItems => Set<CompanyDefaultPhaseItem>();
    
    // ProjectItem entities (renamed from BOQ)
    public DbSet<ProjectItem> ProjectItems => Set<ProjectItem>();
    public DbSet<ProjectItemExecutedDelta> ProjectItemExecutedDeltas => Set<ProjectItemExecutedDelta>();
    public DbSet<ProjectItemNote> ProjectItemNotes => Set<ProjectItemNote>();
    public DbSet<ProjectItemProfitabilityLog> ProjectItemProfitabilityLogs => Set<ProjectItemProfitabilityLog>();

    // HR / Job Postings
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();

    // Company and Join Requests
    public DbSet<CompanyRequest> CompanyRequests => Set<CompanyRequest>();
    public DbSet<JoinRequest> JoinRequests => Set<JoinRequest>();

    // Expenses
    public DbSet<MiscExpense> MiscExpenses => Set<MiscExpense>();
    public DbSet<CashVoucher> CashVouchers => Set<CashVoucher>();

    // Alias for AnalyticsService compatibility
    public DbSet<ProjectTeamMember> TeamMembers => Set<ProjectTeamMember>();
    public DbSet<ItemInvoice> Invoices => Set<ItemInvoice>();
    public DbSet<MiscExpense> Expenses => Set<MiscExpense>();
    public DbSet<ProjectTeamMember> ProjectAssignments => Set<ProjectTeamMember>();
    
    // Equipment Management
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<EquipmentType> EquipmentTypes => Set<EquipmentType>();
    public DbSet<EquipmentAssignment> EquipmentAssignments => Set<EquipmentAssignment>();
    public DbSet<EquipmentMaintenance> EquipmentMaintenances => Set<EquipmentMaintenance>();
    public DbSet<EquipmentUtilization> EquipmentUtilizations => Set<EquipmentUtilization>();

    // Safety Management
    public DbSet<SafetyChecklist> SafetyChecklists => Set<SafetyChecklist>();
    public DbSet<SafetyChecklistItem> SafetyChecklistItems => Set<SafetyChecklistItem>();
    public DbSet<SafetyInspection> SafetyInspections => Set<SafetyInspection>();
    public DbSet<SafetyInspectionItemResult> SafetyInspectionItemResults => Set<SafetyInspectionItemResult>();
    public DbSet<SafetyIncident> SafetyIncidents => Set<SafetyIncident>();
    public DbSet<SafetyTraining> SafetyTrainings => Set<SafetyTraining>();
    public DbSet<SafetyCompliance> SafetyCompliances => Set<SafetyCompliance>();

    // Subcontractor Management
    public DbSet<Subcontractor> Subcontractors => Set<Subcontractor>();
    public DbSet<SubcontractorContract> SubcontractorContracts => Set<SubcontractorContract>();
    public DbSet<SubcontractorPayment> SubcontractorPayments => Set<SubcontractorPayment>();
    public DbSet<SubcontractorRating> SubcontractorRatings => Set<SubcontractorRating>();

    // Document Management
    public DbSet<DocumentCategory> DocumentCategories => Set<DocumentCategory>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentVersion> DocumentVersions => Set<DocumentVersion>();
    public DbSet<DocumentApproval> DocumentApprovals => Set<DocumentApproval>();

    // Design Management
    public DbSet<DesignCategory> DesignCategories => Set<DesignCategory>();
    public DbSet<Design> Designs => Set<Design>();

    // Material Management
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<MaterialCategory> MaterialCategories => Set<MaterialCategory>();
    public DbSet<MaterialStock> MaterialStocks => Set<MaterialStock>();
    public DbSet<MaterialRequest> MaterialRequests => Set<MaterialRequest>();
    public DbSet<MaterialRequestItem> MaterialRequestItems => Set<MaterialRequestItem>();
    public DbSet<MaterialConsumption> MaterialConsumptions => Set<MaterialConsumption>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();

    // Vendors & Invoices
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<VendorInvoice> VendorInvoices => Set<VendorInvoice>();
    public DbSet<VendorProduct> VendorProducts => Set<VendorProduct>();
    public DbSet<VendorTransaction> VendorTransactions => Set<VendorTransaction>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    // ── Inventory Order System ──────────────────────────────────────────────────
    // Warehouse & Stock
    public DbSet<InventoryWarehouse> InventoryWarehouses => Set<InventoryWarehouse>();
    public DbSet<InventoryStock> InventoryStocks => Set<InventoryStock>();
    public DbSet<VendorReview> VendorReviews => Set<VendorReview>();
    public DbSet<WarehouseOrderRequest> WarehouseOrderRequests => Set<WarehouseOrderRequest>();
    
    // Worker Management
    public DbSet<Worker> Workers => Set<Worker>();
    public DbSet<ProjectWorkerContact> ProjectWorkerContacts => Set<ProjectWorkerContact>();
    
    // Discounts
    public DbSet<StockDiscountTier> StockDiscountTiers => Set<StockDiscountTier>();
    public DbSet<CustomerTierDiscount> CustomerTierDiscounts => Set<CustomerTierDiscount>();
    public DbSet<SpecialPromotion> SpecialPromotions => Set<SpecialPromotion>();
    
    // Orders
    public DbSet<InventoryOrder> InventoryOrders => Set<InventoryOrder>();
    public DbSet<InventoryOrderItem> InventoryOrderItems => Set<InventoryOrderItem>();
    public DbSet<InventoryOrderEvent> InventoryOrderEvents => Set<InventoryOrderEvent>();
    
    // Payments
    public DbSet<PaymentHistory> PaymentHistories => Set<PaymentHistory>();
    
    // Recurring Orders
    public DbSet<RecurringOrder> RecurringOrders => Set<RecurringOrder>();
    public DbSet<RecurringOrderItem> RecurringOrderItems => Set<RecurringOrderItem>();

    // Quality Management
    public DbSet<QualityStandard> QualityStandards => Set<QualityStandard>();
    public DbSet<QualityInspection> QualityInspections => Set<QualityInspection>();
    public DbSet<QualityInspectionItem> QualityInspectionItems => Set<QualityInspectionItem>();
    public DbSet<Defect> Defects => Set<Defect>();
    public DbSet<PunchListItem> PunchListItems => Set<PunchListItem>();
    public DbSet<DefectResolution> DefectResolutions => Set<DefectResolution>();

    // HR Management
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<Certification> Certifications => Set<Certification>();
    public DbSet<Payroll> Payrolls => Set<Payroll>();
    public DbSet<OvertimeRule> OvertimeRules => Set<OvertimeRule>();
    public DbSet<OvertimeRecord> OvertimeRecords => Set<OvertimeRecord>();
    public DbSet<RetentionSchedule> RetentionSchedules => Set<RetentionSchedule>();
    public DbSet<EquipmentROI> EquipmentROIs => Set<EquipmentROI>();
    public DbSet<EquipmentCostBreakdown> EquipmentCostBreakdowns => Set<EquipmentCostBreakdown>();

    // Analytics & Reporting
    public DbSet<ReportDefinition> ReportDefinitions => Set<ReportDefinition>();
    public DbSet<ReportExecution> ReportExecutions => Set<ReportExecution>();
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();
    public DbSet<AnalyticsSnapshot> AnalyticsSnapshots => Set<AnalyticsSnapshot>();
    public DbSet<KPIDefinition> KPIDefinitions => Set<KPIDefinition>();
    public DbSet<KPIResult> KPIResults => Set<KPIResult>();
    public DbSet<ResourceUtilization> ResourceUtilizations => Set<ResourceUtilization>();

    // Client Portal
    public DbSet<ClientPortalSettings> ClientPortalSettings => Set<ClientPortalSettings>();
    public DbSet<ClientUser> ClientUsers => Set<ClientUser>();
    public DbSet<ClientProjectAccess> ClientProjectAccesses => Set<ClientProjectAccess>();
    public DbSet<ClientMessage> ClientMessages => Set<ClientMessage>();
    public DbSet<MessageAttachment> MessageAttachments => Set<MessageAttachment>();
    public DbSet<MessageReply> MessageReplies => Set<MessageReply>();
    public DbSet<ChangeOrderRequest> ChangeOrderRequests => Set<ChangeOrderRequest>();
    public DbSet<ChangeOrderDocument> ChangeOrderDocuments => Set<ChangeOrderDocument>();
    public DbSet<ClientActivityLog> ClientActivityLogs => Set<ClientActivityLog>();

    // Company Portfolio
    public DbSet<PortfolioCategory> PortfolioCategories => Set<PortfolioCategory>();
    public DbSet<PortfolioItem> PortfolioItems => Set<PortfolioItem>();

    // Company Announcements & Followers (Subscribers)
    public DbSet<CompanyAnnouncement> CompanyAnnouncements => Set<CompanyAnnouncement>();
    public DbSet<CompanyFollower> CompanyFollowers => Set<CompanyFollower>();

    // Company Messaging System
    public DbSet<CompanyConversation> CompanyConversations => Set<CompanyConversation>();
    public DbSet<CompanyMessage> CompanyMessages => Set<CompanyMessage>();
    public DbSet<MessageFileAttachment> MessageFileAttachments => Set<MessageFileAttachment>();
    public DbSet<UserMessagingBlock> UserMessagingBlocks => Set<UserMessagingBlock>();

    // Location Tracking System
    public DbSet<CompanyLocationSettings> CompanyLocationSettings => Set<CompanyLocationSettings>();
    public DbSet<WorkerLocation> WorkerLocations => Set<WorkerLocation>();
    public DbSet<LocationRequest> LocationRequests => Set<LocationRequest>();
    public DbSet<LocationRequestTarget> LocationRequestTargets => Set<LocationRequestTarget>();

    // Geofencing System
    public DbSet<GeofenceZone> GeofenceZones => Set<GeofenceZone>();
    public DbSet<GeofenceEvent> GeofenceEvents => Set<GeofenceEvent>();
    public DbSet<WorkerGeofenceAssignment> WorkerGeofenceAssignments => Set<WorkerGeofenceAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Automated SaaS Data Isolation ───────────────────────────────────────
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ICompanyEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(SetCompanyFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                    ?.MakeGenericMethod(entityType.ClrType);
                method?.Invoke(this, new object[] { modelBuilder });
            }
        }


        // 1. Composite / Junction Table Keys
        modelBuilder.Entity<UserRole>().HasKey(ur => new { ur.UserId, ur.RoleId });
        modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.RoleId, rp.PermissionId });
        modelBuilder.Entity<ProjectRolePermission>().HasKey(prp => new { prp.ProjectRoleId, prp.PermissionId });
        modelBuilder.Entity<ProjectTeamRole>().HasKey(ptr => ptr.Id); // Switched to surrogate PK from BaseEntity
        modelBuilder.Entity<ProjectTeamMember>().HasIndex(ptm => new { ptm.ProjectId, ptm.UserId }).IsUnique();

        // 2. 1:1 Relationships with Shared Primary Key
        modelBuilder.Entity<ProjectSettings>().HasKey(ps => ps.Id);
        modelBuilder.Entity<ProjectSettings>().Property(ps => ps.Id).ValueGeneratedNever();
        modelBuilder.Entity<ProjectSettings>().HasOne(ps => ps.Project).WithOne(p => p.Settings).HasForeignKey<ProjectSettings>(ps => ps.Id).OnDelete(DeleteBehavior.Cascade);

        // ═══════════════════════════════════════════════════════════════════════════
        // ProjectItem Entity Configurations
        // ═══════════════════════════════════════════════════════════════════════════
        
        // ProjectItemExecutedDelta indexes
        modelBuilder.Entity<ProjectItemExecutedDelta>().HasIndex(d => d.ProjectItemId);
        modelBuilder.Entity<ProjectItemExecutedDelta>().HasIndex(d => d.ProcessedAt);

        // ProjectItem relationships
        modelBuilder.Entity<ProjectItem>()
            .HasOne(pi => pi.Phase)
            .WithMany(p => p.Items)
            .HasForeignKey(pi => pi.PhaseId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ProjectItem>().HasOne(pi => pi.Project).WithMany().HasForeignKey(pi => pi.ProjectId).OnDelete(DeleteBehavior.NoAction);

        // ProjectItemProfitabilityLog relationship
        modelBuilder.Entity<ProjectItemProfitabilityLog>().HasOne(pl => pl.ProjectItem).WithMany(pi => pi.ProfitabilityLogs).HasForeignKey(pl => pl.ProjectItemId).OnDelete(DeleteBehavior.Cascade);

        // ItemDailyLog relationship with ProjectItem
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.ProjectItem).WithMany(pi => pi.DailyLogs).HasForeignKey(dl => dl.ProjectItemId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ItemDailyLog>().HasIndex(dl => new { dl.ProjectItemId, dl.LogDate }).IsUnique();

        // SiteMedia relationship with ProjectItem
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.ProjectItem).WithMany(p => p.SiteMedias).HasForeignKey(sm => sm.ProjectItemId).OnDelete(DeleteBehavior.NoAction);

        // Transaction relationship with ProjectItem
        modelBuilder.Entity<Transaction>().HasOne(t => t.ProjectItem).WithMany(p => p.Transactions).HasForeignKey(t => t.ProjectItemId).OnDelete(DeleteBehavior.NoAction);

        // EscalationLog relationship with ProjectItem
        modelBuilder.Entity<EscalationLog>().HasOne(el => el.ProjectItem).WithMany(p => p.EscalationLogs).HasForeignKey(el => el.ProjectItemId).OnDelete(DeleteBehavior.NoAction);

        // ItemInvoice relationship with ProjectItem
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.ProjectItem).WithMany(p => p.Invoices).HasForeignKey(ii => ii.ProjectItemId).OnDelete(DeleteBehavior.NoAction);

        // 3. Hierarchical Phases
        modelBuilder.Entity<Phase>()
            .HasOne(p => p.Project)
            .WithMany(pr => pr.Phases)
            .HasForeignKey(p => p.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Phase>()
            .HasOne(p => p.ParentPhase)
            .WithMany(p => p.ChildPhases)
            .HasForeignKey(p => p.ParentPhaseId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<CompanyDefaultPhase>()
            .HasOne(p => p.Parent)
            .WithMany(p => p.Children)
            .HasForeignKey(p => p.ParentId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<CompanyDefaultPhaseItem>()
            .HasOne(i => i.DefaultPhase)
            .WithMany(p => p.Items)
            .HasForeignKey(i => i.DefaultPhaseId)
            .OnDelete(DeleteBehavior.Cascade);

        // 4. InvoiceSequence & Constraints
        modelBuilder.Entity<InvoiceSequence>().ToTable("InvoiceSequences").HasKey(s => s.YearPart);
        modelBuilder.Entity<InvoiceSequence>().Property(s => s.YearPart).ValueGeneratedNever();
        modelBuilder.Entity<InvoiceSequence>().Property(s => s.NextNumber).HasDefaultValue(1);
        modelBuilder.Entity<ItemInvoice>().HasIndex(ii => ii.InvoiceNumber).IsUnique().HasDatabaseName("IX_ItemInvoice_InvoiceNumber_Unique");

        // 4. Critical Relationships (NoAction to prevent cascade conflicts)
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.Project).WithMany().HasForeignKey(ar => ar.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.ProjectItem).WithMany().HasForeignKey(ar => ar.ProjectItemId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.ApprovalRule).WithMany(r => r.ApprovalRequests).HasForeignKey(ar => ar.ProjectApprovalRuleId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Project).WithMany(p => p.SiteMedias).HasForeignKey(sm => sm.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.Project).WithMany(p => p.ItemInvoices).HasForeignKey(ii => ii.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EscalationLog>().HasOne(el => el.Project).WithMany(p => p.EscalationLogs).HasForeignKey(el => el.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ClientPayment>().HasOne(cp => cp.Project).WithMany(p => p.ClientPayments).HasForeignKey(cp => cp.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ProjectTeamRole>().HasOne(ptr => ptr.ProjectTeamMember).WithMany(ptm => ptm.ProjectTeamRoles).HasForeignKey(ptr => ptr.ProjectTeamMemberId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ProjectTeamRole>().HasOne(ptr => ptr.ProjectRole).WithMany(pr => pr.Assignments).HasForeignKey(ptr => ptr.ProjectRoleId).OnDelete(DeleteBehavior.NoAction);

        // 5. User-related relationships (NoAction)
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.CreatedByUser).WithMany(u => u.CreatedDailyLogs).HasForeignKey(dl => dl.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.ClosedByUser).WithMany(u => u.ClosedDailyLogs).HasForeignKey(dl => dl.ClosedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.ReopenedByUser).WithMany(u => u.ReopenedDailyLogs).HasForeignKey(dl => dl.ReopenedByUserId).OnDelete(DeleteBehavior.NoAction);
        
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.CreatedBy).WithMany(u => u.CreatedInvoices).HasForeignKey(ii => ii.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.Reviewer).WithMany(u => u.ReviewedInvoices).HasForeignKey(ii => ii.ReviewerUserId).OnDelete(DeleteBehavior.NoAction);
        
        modelBuilder.Entity<Project>().HasOne(p => p.Owner).WithMany(u => u.OwnedProjects).HasForeignKey(p => p.OwnerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>().HasOne(p => p.GeneralManager).WithMany(u => u.ManagedProjects).HasForeignKey(p => p.GeneralManagerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>().HasOne(p => p.ClosedBy).WithMany(u => u.ClosedProjects).HasForeignKey(p => p.ClosedByUserId).OnDelete(DeleteBehavior.NoAction);
        
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Uploader).WithMany(u => u.UploadedMedias).HasForeignKey(sm => sm.UploaderUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Reviewer).WithMany(u => u.ReviewedMedias).HasForeignKey(sm => sm.ReviewerUserId).OnDelete(DeleteBehavior.NoAction);
        
        modelBuilder.Entity<Transaction>().HasOne(t => t.CreatedBy).WithMany(u => u.CreatedTransactions).HasForeignKey(t => t.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Transaction>().HasOne(t => t.ReviewedBy).WithMany(u => u.ReviewedTransactions).HasForeignKey(t => t.ReviewedByUserId).OnDelete(DeleteBehavior.NoAction);

        // 6. Reporting Hierarchy
        modelBuilder.Entity<ProjectTeamMember>().HasOne(ptm => ptm.ReportsTo).WithMany(u => u.Subordinates).HasForeignKey(ptm => ptm.ReportsToUserId).OnDelete(DeleteBehavior.NoAction);

        // 7. Safe Cascade on Child Entities
        modelBuilder.Entity<ApprovalStep>().HasOne(step => step.Request).WithMany(req => req.Steps).HasForeignKey(step => step.ApprovalRequestId).OnDelete(DeleteBehavior.Cascade);

        // 8. Performance Indexes
        modelBuilder.Entity<SiteMedia>().HasIndex(sm => sm.ProjectId);
        modelBuilder.Entity<Notification>().HasIndex(n => n.UserId);
        modelBuilder.Entity<Certification>().HasIndex(c => c.UserId);
        modelBuilder.Entity<Payroll>().HasIndex(p => new { p.UserId, p.Year, p.Month }).IsUnique();

        // 9. Precision
        foreach (var property in modelBuilder.Model.GetEntityTypes().SelectMany(t => t.GetProperties()).Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // Safety Management Constraints (Prevent cycles)
        modelBuilder.Entity<SafetyInspection>()
            .HasOne(i => i.SafetyChecklist)
            .WithMany(c => c.Inspections)
            .HasForeignKey(i => i.SafetyChecklistId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<SafetyInspectionItemResult>()
            .HasOne(r => r.SafetyChecklistItem)
            .WithMany()
            .HasForeignKey(r => r.SafetyChecklistItemId)
            .OnDelete(DeleteBehavior.NoAction);

        // 11. Design & Categories
        modelBuilder.Entity<DesignCategory>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.ChildCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<DesignCategory>()
            .HasOne(c => c.Project)
            .WithMany()
            .HasForeignKey(c => c.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Design>()
            .HasOne(d => d.Category)
            .WithMany(c => c.Designs)
            .HasForeignKey(d => d.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Design>()
            .HasOne(d => d.Project)
            .WithMany()
            .HasForeignKey(d => d.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Design>()
            .HasOne(d => d.ParentDesign)
            .WithMany(d => d.Versions)
            .HasForeignKey(d => d.ParentDesignId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Vendor>().HasOne(v => v.User).WithMany().HasForeignKey(v => v.UserId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<VendorInvoice>().HasOne(i => i.Vendor).WithMany(v => v.Invoices).HasForeignKey(i => i.VendorId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<VendorInvoice>().HasOne(i => i.Project).WithMany().HasForeignKey(i => i.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<VendorProduct>().HasOne(p => p.Vendor).WithMany(v => v.Products).HasForeignKey(p => p.VendorId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<VendorTransaction>().HasOne(t => t.Vendor).WithMany().HasForeignKey(t => t.VendorId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<VendorTransaction>().HasOne(t => t.VendorProduct).WithMany().HasForeignKey(t => t.VendorProductId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CompanySettings>().HasOne(cs => cs.Company).WithOne(c => c.Settings).HasForeignKey<CompanySettings>(cs => cs.CompanyId).OnDelete(DeleteBehavior.Cascade);
        
        // Equipment Management configurations
        ConfigureEquipmentEntities(modelBuilder);
        
        // Inventory Order System configurations
        ConfigureInventoryEntities(modelBuilder);
        
        // Portfolio Management
        ConfigurePortfolioEntities(modelBuilder);

        // Announcements & Subscriptions
        ConfigureAnnouncementEntities(modelBuilder);
        
        // HR Management configurations
        ConfigureHREntities(modelBuilder);
        
        // Messaging System configurations
        ConfigureMessagingEntities(modelBuilder);
        
        // Location Tracking System configurations
        ConfigureLocationTrackingEntities(modelBuilder);
        
        // Geofencing System configurations
        ConfigureGeofencingEntities(modelBuilder);
        
        // Advanced Gap Analysis Features
        ConfigureGapAnalysisEntities(modelBuilder);
        
        // 10. SEEDING
        SeedData(modelBuilder);
    }

    private void ConfigureMessagingEntities(ModelBuilder modelBuilder)
    {
        // CompanyConversation configuration
        modelBuilder.Entity<CompanyConversation>(entity =>
        {
            entity.HasOne(c => c.Company)
                .WithMany()
                .HasForeignKey(c => c.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(c => c.InitiatorUser)
                .WithMany()
                .HasForeignKey(c => c.InitiatorUserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(c => c.ApprovedByUser)
                .WithMany()
                .HasForeignKey(c => c.ApprovedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            // LastMessage relationship - one-to-one with CompanyMessage
            entity.HasOne(c => c.LastMessage)
                .WithMany()
                .HasForeignKey(c => c.LastMessageId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasIndex(c => c.CompanyId);
            entity.HasIndex(c => c.InitiatorUserId);
            entity.HasIndex(c => c.Status);
        });
        
        // CompanyMessage configuration
        modelBuilder.Entity<CompanyMessage>(entity =>
        {
            entity.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(m => m.SenderUser)
                .WithMany()
                .HasForeignKey(m => m.SenderUserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(m => m.Company)
                .WithMany()
                .HasForeignKey(m => m.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasIndex(m => m.ConversationId);
            entity.HasIndex(m => m.SenderUserId);
            entity.HasIndex(m => m.CreatedAt);
        });
        
        // MessageFileAttachment configuration
        modelBuilder.Entity<MessageFileAttachment>(entity =>
        {
            entity.HasOne(a => a.Message)
                .WithMany(m => m.Attachments)
                .HasForeignKey(a => a.MessageId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(a => a.Company)
                .WithMany()
                .HasForeignKey(a => a.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasIndex(a => a.MessageId);
        });
        
        // UserMessagingBlock configuration
        modelBuilder.Entity<UserMessagingBlock>(entity =>
        {
            entity.HasOne(b => b.Company)
                .WithMany()
                .HasForeignKey(b => b.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(b => b.BlockedByUser)
                .WithMany()
                .HasForeignKey(b => b.BlockedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasIndex(b => new { b.CompanyId, b.UserId }).IsUnique();
        });
    }

    private void ConfigureLocationTrackingEntities(ModelBuilder modelBuilder)
    {
        // CompanyLocationSettings configuration
        modelBuilder.Entity<CompanyLocationSettings>(entity =>
        {
            entity.HasOne(s => s.Company)
                .WithOne()
                .HasForeignKey<CompanyLocationSettings>(s => s.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(s => s.CompanyId).IsUnique();
        });
        
        // WorkerLocation configuration
        modelBuilder.Entity<WorkerLocation>(entity =>
        {
            entity.HasOne(l => l.Company)
                .WithMany()
                .HasForeignKey(l => l.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(l => l.User)
                .WithMany()
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(l => l.Request)
                .WithMany()
                .HasForeignKey(l => l.RequestId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasIndex(l => l.CompanyId);
            entity.HasIndex(l => l.UserId);
            entity.HasIndex(l => l.RecordedAt);
            entity.HasIndex(l => new { l.UserId, l.RecordedAt });
        });
        
        // LocationRequest configuration
        modelBuilder.Entity<LocationRequest>(entity =>
        {
            entity.HasOne(r => r.Company)
                .WithMany()
                .HasForeignKey(r => r.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(r => r.RequestedByUser)
                .WithMany()
                .HasForeignKey(r => r.RequestedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasIndex(r => r.CompanyId);
            entity.HasIndex(r => r.Status);
            entity.HasIndex(r => r.ExpiresAt);
            entity.HasIndex(r => r.ScheduledFor);
        });
        
        // LocationRequestTarget configuration
        modelBuilder.Entity<LocationRequestTarget>(entity =>
        {
            entity.HasOne(t => t.Request)
                .WithMany(r => r.Targets)
                .HasForeignKey(t => t.RequestId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(t => t.Location)
                .WithMany()
                .HasForeignKey(t => t.LocationId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasIndex(t => t.RequestId);
            entity.HasIndex(t => t.UserId);
            entity.HasIndex(t => t.Status);
            entity.HasIndex(t => new { t.RequestId, t.UserId });
        });
    }

    private void ConfigureGeofencingEntities(ModelBuilder modelBuilder)
    {
        // GeofenceZone configuration
        modelBuilder.Entity<GeofenceZone>(entity =>
        {
            entity.HasOne(z => z.Company)
                .WithMany()
                .HasForeignKey(z => z.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(z => z.Project)
                .WithMany()
                .HasForeignKey(z => z.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasIndex(z => z.CompanyId);
            entity.HasIndex(z => z.ProjectId);
            entity.HasIndex(z => z.IsActive);
        });
        
        // GeofenceEvent configuration
        modelBuilder.Entity<GeofenceEvent>(entity =>
        {
            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(e => e.Zone)
                .WithMany(z => z.Events)
                .HasForeignKey(e => e.ZoneId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Location)
                .WithMany()
                .HasForeignKey(e => e.LocationId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ZoneId);
            entity.HasIndex(e => e.EventTime);
            entity.HasIndex(e => new { e.UserId, e.ZoneId, e.EventTime });
        });
        
        // WorkerGeofenceAssignment configuration
        modelBuilder.Entity<WorkerGeofenceAssignment>(entity =>
        {
            entity.HasOne(a => a.Zone)
                .WithMany(z => z.WorkerAssignments)
                .HasForeignKey(a => a.ZoneId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(a => a.AssignedByUser)
                .WithMany()
                .HasForeignKey(a => a.AssignedBy)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasIndex(a => a.ZoneId);
            entity.HasIndex(a => a.UserId);
            entity.HasIndex(a => a.IsActive);
            entity.HasIndex(a => new { a.ZoneId, a.UserId, a.IsActive });
        });
    }

    private void ConfigureEquipmentEntities(ModelBuilder modelBuilder)
    {
        // EquipmentType configuration
        modelBuilder.Entity<EquipmentType>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique(false);
            entity.HasIndex(e => new { e.CompanyId, e.Code }).IsUnique(false);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.IsActive);
        });

        // Equipment configuration
        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.HasIndex(e => e.SerialNumber).IsUnique();
            entity.HasIndex(e => e.Barcode);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.CompanyId, e.SerialNumber }).IsUnique(false);
            entity.HasIndex(e => e.EquipmentTypeId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.NextMaintenanceDate);
        });

        // EquipmentAssignment configuration
        modelBuilder.Entity<EquipmentAssignment>(entity =>
        {
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.StartDate);
            entity.HasIndex(e => e.EndDate);
            entity.HasIndex(e => new { e.EquipmentId, e.Status });
            entity.HasIndex(e => new { e.ProjectId, e.Status });
            entity.HasIndex(e => new { e.AssignedToUserId, e.Status });
        });

        // EquipmentMaintenance configuration
        modelBuilder.Entity<EquipmentMaintenance>(entity =>
        {
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ScheduledDate);
            entity.HasIndex(e => e.EquipmentId);
            entity.HasIndex(e => new { e.EquipmentId, e.Status });
            entity.HasIndex(e => e.NextMaintenanceDue);
        });

        // EquipmentUtilization configuration
        modelBuilder.Entity<EquipmentUtilization>(entity =>
        {
            entity.HasIndex(e => e.UtilizationDate);
            entity.HasIndex(e => e.EquipmentId);
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => new { e.EquipmentId, e.UtilizationDate });
        });

        // Relationships
        modelBuilder.Entity<Equipment>()
            .HasOne(e => e.EquipmentType)
            .WithMany(t => t.Equipment)
            .HasForeignKey(e => e.EquipmentTypeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EquipmentAssignment>()
            .HasOne(ea => ea.Equipment)
            .WithMany(e => e.Assignments)
            .HasForeignKey(ea => ea.EquipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EquipmentAssignment>()
            .HasOne(ea => ea.Project)
            .WithMany()
            .HasForeignKey(ea => ea.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EquipmentAssignment>()
            .HasOne(ea => ea.AssignedToUser)
            .WithMany()
            .HasForeignKey(ea => ea.AssignedToUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EquipmentMaintenance>()
            .HasOne(em => em.Equipment)
            .WithMany(e => e.Maintenances)
            .HasForeignKey(em => em.EquipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EquipmentUtilization>()
            .HasOne(eu => eu.Equipment)
            .WithMany(e => e.UtilizationRecords)
            .HasForeignKey(eu => eu.EquipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EquipmentUtilization>()
            .HasOne(eu => eu.Project)
            .WithMany()
            .HasForeignKey(eu => eu.ProjectId)
            .OnDelete(DeleteBehavior.NoAction);
    }

    private void ConfigureGapAnalysisEntities(ModelBuilder modelBuilder)
    {
        // RetentionSchedule
        modelBuilder.Entity<RetentionSchedule>(entity =>
        {
            entity.HasOne(r => r.Project)
                .WithMany()
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(r => r.ProgressInvoice)
                .WithMany()
                .HasForeignKey(r => r.ProgressInvoiceId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.ProjectId);
            entity.HasIndex(r => r.Status);
            entity.HasIndex(r => r.ReleaseDate);
        });

        // OvertimeRule
        modelBuilder.Entity<OvertimeRule>(entity =>
        {
            entity.HasIndex(r => r.CompanyId);
            entity.HasIndex(r => r.IsActive);
        });

        // OvertimeRecord
        modelBuilder.Entity<OvertimeRecord>(entity =>
        {
            entity.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(r => r.Project)
                .WithMany()
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.UserId);
            entity.HasIndex(r => r.Date);
            entity.HasIndex(r => r.Status);
        });

        // EquipmentROI
        modelBuilder.Entity<EquipmentROI>(entity =>
        {
            entity.HasOne(r => r.Equipment)
                .WithMany()
                .HasForeignKey(r => r.EquipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Project)
                .WithMany()
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.EquipmentId);
            entity.HasIndex(r => new { r.PeriodStart, r.PeriodEnd });
            entity.HasIndex(r => r.PerformanceRating);
        });

        // EquipmentCostBreakdown
        modelBuilder.Entity<EquipmentCostBreakdown>(entity =>
        {
            entity.HasOne(c => c.Equipment)
                .WithMany()
                .HasForeignKey(c => c.EquipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.EquipmentROI)
                .WithMany()
                .HasForeignKey(c => c.EquipmentROIId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => c.EquipmentId);
            entity.HasIndex(c => c.Date);
            entity.HasIndex(c => c.CostType);
        });
    }

    private void ConfigureInventoryEntities(ModelBuilder modelBuilder)
    {
        // InventoryWarehouse
        modelBuilder.Entity<InventoryWarehouse>(entity =>
        {
            entity.HasIndex(e => e.OwnerUserId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.IsApproved);
        });

        // InventoryStock
        modelBuilder.Entity<InventoryStock>(entity =>
        {
            entity.HasIndex(e => e.WarehouseId);
            entity.HasIndex(e => e.MaterialType);
            entity.HasIndex(e => new { e.WarehouseId, e.MaterialType });
        });

        // StockDiscountTier
        modelBuilder.Entity<StockDiscountTier>(entity =>
        {
            entity.HasIndex(e => e.StockId);
            entity.HasIndex(e => e.IsActive);
        });

        // CustomerTierDiscount
        modelBuilder.Entity<CustomerTierDiscount>(entity =>
        {
            entity.HasIndex(e => new { e.CustomerUserId, e.SupplierUserId }).IsUnique();
            entity.HasIndex(e => e.Tier);
            
            // Configure foreign keys with NoAction to prevent cascade cycles
            entity.HasOne(e => e.CustomerUser)
                .WithMany()
                .HasForeignKey(e => e.CustomerUserId)
                .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(e => e.SupplierUser)
                .WithMany()
                .HasForeignKey(e => e.SupplierUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // SpecialPromotion
        modelBuilder.Entity<SpecialPromotion>(entity =>
        {
            entity.HasIndex(e => e.SupplierUserId);
            entity.HasIndex(e => e.DiscountCode).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // InventoryOrder
        modelBuilder.Entity<InventoryOrder>(entity =>
        {
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.HasIndex(e => e.CompanyOwnerUserId);
            entity.HasIndex(e => e.InventoryOwnerUserId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.PaymentStatus);
            entity.HasIndex(e => e.OrderDate);
        });

        // InventoryOrderItem
        modelBuilder.Entity<InventoryOrderItem>(entity =>
        {
            entity.HasIndex(e => e.OrderId);
            entity.HasIndex(e => e.StockId);
        });

        // InventoryOrderEvent
        modelBuilder.Entity<InventoryOrderEvent>(entity =>
        {
            entity.HasIndex(e => e.OrderId);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.EventDate);
        });

        // PaymentHistory
        modelBuilder.Entity<PaymentHistory>(entity =>
        {
            entity.HasIndex(e => e.OrderId);
            entity.HasIndex(e => e.PaymentDate);
        });

        // RecurringOrder
        modelBuilder.Entity<RecurringOrder>(entity =>
        {
            entity.HasIndex(e => e.CustomerUserId);
            entity.HasIndex(e => e.SupplierUserId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.NextOrderDate);
        });

        // RecurringOrderItem
        modelBuilder.Entity<RecurringOrderItem>(entity =>
        {
            entity.HasIndex(e => e.RecurringOrderId);
            entity.HasIndex(e => e.StockId);
        });

        // Relationships
        modelBuilder.Entity<InventoryWarehouse>()
            .HasOne(w => w.OwnerUser)
            .WithMany()
            .HasForeignKey(w => w.OwnerUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<InventoryStock>()
            .HasOne(s => s.Warehouse)
            .WithMany(w => w.Stocks)
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StockDiscountTier>()
            .HasOne(t => t.Stock)
            .WithMany(s => s.DiscountTiers)
            .HasForeignKey(t => t.StockId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InventoryOrder>()
            .HasOne(o => o.CompanyOwnerUser)
            .WithMany()
            .HasForeignKey(o => o.CompanyOwnerUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<InventoryOrder>()
            .HasOne(o => o.InventoryOwnerUser)
            .WithMany()
            .HasForeignKey(o => o.InventoryOwnerUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<InventoryOrder>()
            .HasOne(o => o.Warehouse)
            .WithMany(w => w.ReceivedOrders)
            .HasForeignKey(o => o.WarehouseId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<InventoryOrderItem>()
            .HasOne(i => i.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InventoryOrderItem>()
            .HasOne(i => i.Stock)
            .WithMany(s => s.OrderItems)
            .HasForeignKey(i => i.StockId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<InventoryOrderEvent>()
            .HasOne(e => e.Order)
            .WithMany(o => o.Events)
            .HasForeignKey(e => e.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PaymentHistory>()
            .HasOne(p => p.Order)
            .WithMany(o => o.PaymentHistory)
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RecurringOrder>()
            .HasOne(r => r.CustomerUser)
            .WithMany()
            .HasForeignKey(r => r.CustomerUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<RecurringOrder>()
            .HasOne(r => r.SupplierUser)
            .WithMany()
            .HasForeignKey(r => r.SupplierUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<RecurringOrderItem>()
            .HasOne(i => i.RecurringOrder)
            .WithMany(r => r.Items)
            .HasForeignKey(i => i.RecurringOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RecurringOrderItem>()
            .HasOne(i => i.Stock)
            .WithMany(s => s.RecurringItems)
            .HasForeignKey(i => i.StockId)
            .OnDelete(DeleteBehavior.NoAction);
    }

    private void ConfigurePortfolioEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PortfolioCategory>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.ChildCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<PortfolioItem>()
            .HasOne(i => i.Category)
            .WithMany(c => c.Items)
            .HasForeignKey(i => i.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureAnnouncementEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CompanyAnnouncement>()
            .HasOne(a => a.Company)
            .WithMany()
            .HasForeignKey(a => a.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CompanyFollower>()
            .HasOne(f => f.Company)
            .WithMany()
            .HasForeignKey(f => f.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CompanyFollower>()
            .HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        // One user can only follow a company once
        modelBuilder.Entity<CompanyFollower>()
            .HasIndex(f => new { f.CompanyId, f.UserId })
            .IsUnique();
    }

    private void ConfigureHREntities(ModelBuilder modelBuilder)
    {
        // Attendance
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Date);
            entity.HasIndex(e => new { e.UserId, e.Date });
            entity.HasIndex(e => e.Status);
        });

        // LeaveRequest
        modelBuilder.Entity<LeaveRequest>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.StartDate);
            entity.HasIndex(e => e.EndDate);
            entity.HasIndex(e => e.Status);
        });

        // LeaveType
        modelBuilder.Entity<LeaveType>(entity =>
        {
            entity.HasIndex(e => e.Name);
        });

        // Certification
        modelBuilder.Entity<Certification>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ExpiryDate);
        });

        // Relationships (Prevent cascades if needed, but these are mostly simple)
        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(l => l.ApprovedByUser)
            .WithMany()
            .HasForeignKey(l => l.ApprovedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Certification>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        var fixedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        const string passwordHash = "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6"; // "admin"

        // --- Users ---
        modelBuilder.Entity<User>().HasData(
            new User 
            { 
                Id = 1, 
                FirstName = "System", 
                LastName = "Admin", 
                Email = "admin@construction.com", 
                Username = "admin", 
                PasswordHash = passwordHash, 
                CreatedAt = fixedDate, 
                CompanyId = null // Super Admin is global
            }
        );

        // --- Global Permissions (CompanyId = null) ---
        var permissions = new List<Permission>
        {
            // System Administration (1-10)
            new Permission { Id = 1, Name = "All", Description = "Full system access", CreatedAt = fixedDate },
            new Permission { Id = 2, Name = "System.ManageCompanies", Description = "Create and manage tenant companies", CreatedAt = fixedDate },
            new Permission { Id = 3, Name = "System.ManagePackages", Description = "Manage subscription packages", CreatedAt = fixedDate },
            
            // Company Management (11-30)
            new Permission { Id = 11, Name = "Company.ManageSettings", Description = "Manage company-wide settings", CreatedAt = fixedDate },
            new Permission { Id = 12, Name = "Company.ManageUsers", Description = "Manage company employees and roles", CreatedAt = fixedDate },
            new Permission { Id = 13, Name = "Company.ViewAnalytics", Description = "Access company-level dashboards", CreatedAt = fixedDate },
            new Permission { Id = 14, Name = "Company.ManageCatalog", Description = "Manage company standard items", CreatedAt = fixedDate },
            new Permission { Id = 15, Name = "Company.ManageHierarchy", Description = "Manage project phase templates", CreatedAt = fixedDate },

            // Project Management (31-60)
            new Permission { Id = 31, Name = "Project.Create", Description = "Create new projects", CreatedAt = fixedDate },
            new Permission { Id = 32, Name = "Project.EditAll", Description = "Edit any project information", CreatedAt = fixedDate },
            new Permission { Id = 33, Name = "Project.Delete", Description = "Delete projects", CreatedAt = fixedDate },
            new Permission { Id = 34, Name = "Project.ViewDetails", Description = "View project details and progress", CreatedAt = fixedDate },
            new Permission { Id = 35, Name = "Project.ManageTeam", Description = "Assign and manage project members", CreatedAt = fixedDate },
            new Permission { Id = 36, Name = "Project.Close", Description = "Close or finalize projects", CreatedAt = fixedDate },

            // Project Items & Financials (61-90)
            new Permission { Id = 61, Name = "Finance.ViewFinancials", Description = "View project budgets and costs", CreatedAt = fixedDate },
            new Permission { Id = 62, Name = "Finance.CreateInvoice", Description = "Create project invoices", CreatedAt = fixedDate },
            new Permission { Id = 63, Name = "Finance.ApproveInvoice", Description = "Review and approve invoices", CreatedAt = fixedDate },
            new Permission { Id = 64, Name = "Finance.ManageProjectItems", Description = "Update project items quantities and rates", CreatedAt = fixedDate },
            new Permission { Id = 65, Name = "Finance.AddTransaction", Description = "Add expenses and vouchers", CreatedAt = fixedDate },
            new Permission { Id = 66, Name = "Finance.ReviewTransaction", Description = "Approve or reject transactions", CreatedAt = fixedDate },

            // Site Operations (91-120)
            new Permission { Id = 91, Name = "Ops.AddDailyLog", Description = "Submit daily progress reports", CreatedAt = fixedDate },
            new Permission { Id = 92, Name = "Ops.ReviewDailyLog", Description = "Review and close daily logs", CreatedAt = fixedDate },
            new Permission { Id = 93, Name = "Ops.ApproveMedia", Description = "Review and approve site photos", CreatedAt = fixedDate },
            new Permission { Id = 94, Name = "Ops.ManageInventory", Description = "Track materials and warehouse stock", CreatedAt = fixedDate },
            new Permission { Id = 95, Name = "Ops.EquipmentTracking", Description = "Manage equipment assignments", CreatedAt = fixedDate },
            new Permission { Id = 96, Name = "Ops.SafetyInspection", Description = "Perform and log safety checks", CreatedAt = fixedDate },
            new Permission { Id = 97, Name = "Ops.QualityControl", Description = "Manage inspections and defects", CreatedAt = fixedDate },

            // Human Resources (121-140)
            new Permission { Id = 121, Name = "HR.ManageWorkers", Description = "Track site worker attendance and contacts", CreatedAt = fixedDate },
            new Permission { Id = 122, Name = "HR.JobPostings", Description = "Manage company job recruitment", CreatedAt = fixedDate },
            new Permission { Id = 123, Name = "HR.Attendance", Description = "Manage employee attendance", CreatedAt = fixedDate },
            new Permission { Id = 124, Name = "HR.LeaveManagement", Description = "Manage employee leave requests", CreatedAt = fixedDate },
            new Permission { Id = 125, Name = "HR.Certifications", Description = "Manage employee certifications", CreatedAt = fixedDate }
        };
        modelBuilder.Entity<Permission>().HasData(permissions);

        // --- System-Level Roles (CompanyId = null) ---
        // These are the only roles that exist at the platform level.
        // Company-internal roles (ProjectManager, SiteEngineer, etc.) are
        // created at runtime per-company by the Company Admin.
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "SuperAdmin", Description = "Platform-level system administrator", CreatedAt = fixedDate, CompanyId = null },
            new Role { Id = 2, Name = "CompanyAdmin", Description = "Organization administrator", CreatedAt = fixedDate, CompanyId = null },
            new Role { Id = 3, Name = "User", Description = "Default authenticated user", CreatedAt = fixedDate, CompanyId = null },
            new Role { Id = 4, Name = "CompanyUser", Description = "Standard company staff/worker", CreatedAt = fixedDate, CompanyId = null },
            new Role { Id = 5, Name = "InventoryOwner", Description = "Inventory/warehouse owner", CreatedAt = fixedDate, CompanyId = null }
        );

        // --- Leave Types (Global/Default) ---
        modelBuilder.Entity<LeaveType>().HasData(
            new LeaveType { Id = 1, Name = "Annual Leave", Description = "Standard yearly vacation", DefaultDays = 21, IsPaid = true, RequiresApproval = true, CreatedAt = fixedDate },
            new LeaveType { Id = 2, Name = "Sick Leave", Description = "Medical leave", DefaultDays = 15, IsPaid = true, RequiresApproval = true, CreatedAt = fixedDate },
            new LeaveType { Id = 3, Name = "Unpaid Leave", Description = "Leave without pay", DefaultDays = 0, IsPaid = false, RequiresApproval = true, CreatedAt = fixedDate }
        );

        // --- Role-Permission Mapping ---
        var rolePermissions = new List<RolePermission>();

        // 1. SuperAdmin (Role 1) -> ONLY role to get the "All" wildcard
        // This grants absolute access to every corner of the system.
        rolePermissions.Add(new RolePermission { RoleId = 1, PermissionId = 1 });

        // 2. CompanyAdmin (Role 2) & User (Role 3)
        // We do NOT assign global permissions here. 
        // CompanyAdmin permissions are synced dynamically in the CompaniesController
        // based on enabled features and subscription packages.

        modelBuilder.Entity<RolePermission>().HasData(rolePermissions);

        // --- Global User Assignments ---
        modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = 1, RoleId = 1 } // Admin -> SuperAdmin
        );

        // --- Base Packages ---
        modelBuilder.Entity<Package>().HasData(
            new Package { Id = 1, Name = "Free", Description = "Starter plan", Price = 0, MaxTeamMembers = 5, MaxBOQItems = 50, CreatedAt = fixedDate },
            new Package { Id = 2, Name = "Pro", Description = "Professional tracking", Price = 1500, MaxTeamMembers = 20, MaxBOQItems = 200, CreatedAt = fixedDate },
            new Package { Id = 3, Name = "Premium", Description = "Full enterprise features", Price = 5000, MaxTeamMembers = 100, MaxBOQItems = 1000, AllowAIAssistance = true, CreatedAt = fixedDate }
        );

    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var now = DateTime.UtcNow;

        // Auto-set CompanyId for all ICompanyEntity entries
        if (_companyContext?.CompanyId != null)
        {
            var companyEntries = ChangeTracker.Entries<ICompanyEntity>()
                .Where(e => e.State == EntityState.Added);

            foreach (var entry in companyEntries)
            {
                if (entry.Entity.CompanyId == null)
                    entry.Entity.CompanyId = _companyContext.CompanyId;
            }
        }

        var entries = ChangeTracker.Entries<IAuditableEntity>()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = now;

            entry.Entity.UpdatedAt = now;
        }
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
    }
        // Single database mode - uses connection string from configuration only
    private void SetCompanyFilter<T>(ModelBuilder modelBuilder) where T : class, ICompanyEntity
    {
        modelBuilder.Entity<T>().HasQueryFilter(e => 
            _companyContext.CompanyId == null || 
            e.CompanyId == null ||
            e.CompanyId == _companyContext.CompanyId);
    }
}

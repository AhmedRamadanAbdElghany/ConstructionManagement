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
        _companyContext = companyContext;
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
    public DbSet<BOQItem> BOQItems => Set<BOQItem>();
    public DbSet<BOQMeasured> BOQMeasured => Set<BOQMeasured>();
    public DbSet<BOQExecutedDelta> BOQExecutedDeltas => Set<BOQExecutedDelta>();
    public DbSet<BOQSupervision> BOQSupervision => Set<BOQSupervision>();
    public DbSet<ItemDailyLog> ItemDailyLogs => Set<ItemDailyLog>();
    public DbSet<ItemInvoice> ItemInvoices => Set<ItemInvoice>();
    public DbSet<ClientPayment> ClientPayments => Set<ClientPayment>();
    public DbSet<SiteMedia> SiteMedias => Set<SiteMedia>();
    public DbSet<BOQItemNote> BOQItemNotes => Set<BOQItemNote>();
    public DbSet<BOQProfitabilityLog> BOQProfitabilityLogs => Set<BOQProfitabilityLog>();
    public DbSet<EscalationLog> EscalationLogs => Set<EscalationLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<UserTypeHistory> UserTypeHistories => Set<UserTypeHistory>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<CatalogItem> CatalogItems => Set<CatalogItem>();
    public DbSet<ApprovalRequest> ApprovalRequests => Set<ApprovalRequest>();
    public DbSet<ApprovalStep> ApprovalSteps => Set<ApprovalStep>();
    public DbSet<BOQPackage> BOQPackages => Set<BOQPackage>();
    public DbSet<CompanyPackage> CompanyPackages => Set<CompanyPackage>(); // Renamed from ClientPackage
    public DbSet<InvoiceSequence> InvoiceSequences => Set<InvoiceSequence>();
    public DbSet<Phase> Phases => Set<Phase>();
    public DbSet<CompanyDefaultPhaseItem> CompanyDefaultPhaseItems => Set<CompanyDefaultPhaseItem>();

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

        modelBuilder.Entity<BOQMeasured>().HasKey(m => m.Id);
        modelBuilder.Entity<BOQMeasured>().Property(m => m.Id).ValueGeneratedNever();
        modelBuilder.Entity<BOQMeasured>().HasOne(m => m.Item).WithOne(i => i.MeasuredData).HasForeignKey<BOQMeasured>(m => m.Id).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQSupervision>().HasKey(s => s.Id);
        modelBuilder.Entity<BOQSupervision>().Property(s => s.Id).ValueGeneratedNever();
        modelBuilder.Entity<BOQSupervision>().HasOne(s => s.Item).WithOne(i => i.SupervisionData).HasForeignKey<BOQSupervision>(s => s.Id).OnDelete(DeleteBehavior.Cascade);

        // Add Configuration for BOQPackage
        modelBuilder.Entity<BOQPackage>().HasKey(p => p.Id);
        modelBuilder.Entity<BOQPackage>().Property(p => p.Id).ValueGeneratedNever();
        modelBuilder.Entity<BOQPackage>().HasOne(p => p.BOQItem).WithOne(i => i.PackageData).HasForeignKey<BOQPackage>(p => p.Id).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQExecutedDelta>().HasIndex(d => d.BOQItemId);
        modelBuilder.Entity<BOQExecutedDelta>().HasIndex(d => d.ProcessedAt);

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

        modelBuilder.Entity<BOQItem>()
            .HasOne(b => b.Phase)
            .WithMany(p => p.Items)
            .HasForeignKey(b => b.PhaseId)
            .OnDelete(DeleteBehavior.NoAction);

        // 4. InvoiceSequence & Constraints
        modelBuilder.Entity<InvoiceSequence>().ToTable("InvoiceSequences").HasKey(s => s.YearPart);
        modelBuilder.Entity<InvoiceSequence>().Property(s => s.YearPart).ValueGeneratedNever();
        modelBuilder.Entity<InvoiceSequence>().Property(s => s.NextNumber).HasDefaultValue(1);
        modelBuilder.Entity<ItemInvoice>().HasIndex(ii => ii.InvoiceNumber).IsUnique().HasDatabaseName("IX_ItemInvoice_InvoiceNumber_Unique");

        // 4. Critical Relationships (NoAction to prevent cascade conflicts)
        modelBuilder.Entity<BOQItem>().HasOne(b => b.Project).WithMany(p => p.BOQItems).HasForeignKey(b => b.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.Project).WithMany().HasForeignKey(ar => ar.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.BOQItem).WithMany().HasForeignKey(ar => ar.BOQItemId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<ApprovalRequest>().HasOne(ar => ar.ApprovalRule).WithMany(r => r.ApprovalRequests).HasForeignKey(ar => ar.ProjectApprovalRuleId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Project).WithMany(p => p.SiteMedias).HasForeignKey(sm => sm.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.Project).WithMany(p => p.ItemInvoices).HasForeignKey(ii => ii.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<EscalationLog>().HasOne(el => el.Project).WithMany(p => p.EscalationLogs).HasForeignKey(el => el.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ClientPayment>().HasOne(cp => cp.Project).WithMany(p => p.ClientPayments).HasForeignKey(cp => cp.ProjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ProjectTeamRole>().HasOne(ptr => ptr.ProjectTeamMember).WithMany(ptm => ptm.ProjectTeamRoles).HasForeignKey(ptr => ptr.ProjectTeamMemberId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ProjectTeamRole>().HasOne(ptr => ptr.ProjectRole).WithMany(pr => pr.Assignments).HasForeignKey(ptr => ptr.ProjectRoleId).OnDelete(DeleteBehavior.NoAction);

        // 5. User-related relationships (NoAction)
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.CreatedByUser).WithMany().HasForeignKey(dl => dl.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.ClosedByUser).WithMany().HasForeignKey(dl => dl.ClosedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.ReopenedByUser).WithMany(u => u.ReopenedDailyLogs).HasForeignKey(dl => dl.ReopenedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.CreatedBy).WithMany().HasForeignKey(ii => ii.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ItemInvoice>().HasOne(ii => ii.Reviewer).WithMany().HasForeignKey(ii => ii.ReviewerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>().HasOne(p => p.Owner).WithMany().HasForeignKey(p => p.OwnerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>().HasOne(p => p.GeneralManager).WithMany().HasForeignKey(p => p.GeneralManagerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Project>().HasOne(p => p.ClosedBy).WithMany().HasForeignKey(p => p.ClosedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Uploader).WithMany().HasForeignKey(sm => sm.UploaderUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SiteMedia>().HasOne(sm => sm.Reviewer).WithMany().HasForeignKey(sm => sm.ReviewerUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Transaction>().HasOne(t => t.CreatedBy).WithMany().HasForeignKey(t => t.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Transaction>().HasOne(t => t.ReviewedBy).WithMany().HasForeignKey(t => t.ReviewedByUserId).OnDelete(DeleteBehavior.NoAction);

        // 6. Reporting Hierarchy
        modelBuilder.Entity<ProjectTeamMember>().HasOne(ptm => ptm.ReportsTo).WithMany(u => u.Subordinates).HasForeignKey(ptm => ptm.ReportsToUserId).OnDelete(DeleteBehavior.NoAction);

        // 7. Safe Cascade on Child Entities
        modelBuilder.Entity<ApprovalStep>().HasOne(step => step.Request).WithMany(req => req.Steps).HasForeignKey(step => step.ApprovalRequestId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<BOQProfitabilityLog>().HasOne(pl => pl.BOQItem).WithMany(b => b.ProfitabilityLogs).HasForeignKey(pl => pl.BOQItemId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ItemDailyLog>().HasOne(dl => dl.BOQItem).WithMany(b => b.DailyLogs).HasForeignKey(dl => dl.BOQItemId).OnDelete(DeleteBehavior.Cascade);

        // 8. Performance Indexes
        modelBuilder.Entity<ItemDailyLog>().HasIndex(dl => new { dl.BOQItemId, dl.LogDate }).IsUnique();
        modelBuilder.Entity<SiteMedia>().HasIndex(sm => sm.ProjectId);
        modelBuilder.Entity<Notification>().HasIndex(n => n.UserId);

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
        
        // 10. SEEDING
        SeedData(modelBuilder);
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

            // BOQ & Financials (61-90)
            new Permission { Id = 61, Name = "Finance.ViewFinancials", Description = "View project budgets and costs", CreatedAt = fixedDate },
            new Permission { Id = 62, Name = "Finance.CreateInvoice", Description = "Create project invoices", CreatedAt = fixedDate },
            new Permission { Id = 63, Name = "Finance.ApproveInvoice", Description = "Review and approve invoices", CreatedAt = fixedDate },
            new Permission { Id = 64, Name = "Finance.ManageBOQ", Description = "Update BOQ quantities and rates", CreatedAt = fixedDate },
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
            new Permission { Id = 122, Name = "HR.JobPostings", Description = "Manage company job recruitment", CreatedAt = fixedDate }
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

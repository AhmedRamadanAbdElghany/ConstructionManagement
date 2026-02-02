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
        ICompanyContext companyContext = null)
        : base(options)
    {
        _companyContext = companyContext;
    }

    // ── DbSets ──────────────────────────────────────────────────────────────────
    public DbSet<Company> Companies => Set<Company>();
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
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<ApprovalRequest> ApprovalRequests => Set<ApprovalRequest>();
    public DbSet<ApprovalStep> ApprovalSteps => Set<ApprovalStep>();
    public DbSet<BOQPackage> BOQPackages => Set<BOQPackage>();
    public DbSet<CompanyPackage> CompanyPackages => Set<CompanyPackage>(); // Renamed from ClientPackage
    public DbSet<InvoiceSequence> InvoiceSequences => Set<InvoiceSequence>();

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

        // 3. InvoiceSequence & Constraints
        modelBuilder.Entity<InvoiceSequence>().ToTable("InvoiceSequences").HasKey(s => s.YearPart);
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

        modelBuilder.Entity<CompanySettings>().HasOne(cs => cs.Company).WithOne(c => c.Settings).HasForeignKey<CompanySettings>(cs => cs.CompanyId).OnDelete(DeleteBehavior.Cascade);
        
        // 10. SEEDING
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        var fixedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        const string passwordHash = "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6"; // Hash for "admin"

        // --- Companies ---
        modelBuilder.Entity<Company>().HasData(
            new Company { Id = 1, Name = "BuildIt Solutions", CreatedAt = fixedDate, PackageId = 3 }
        );

        // --- Users ---
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FirstName = "System", LastName = "Admin", Email = "admin@construction.com", Username = "admin", PasswordHash = passwordHash, CreatedAt = fixedDate, CompanyId = 1 },
            new User { Id = 2, FirstName = "Ahmed", LastName = "Ramadan", Email = "ahmed@construction.com", Username = "ahmed", PasswordHash = passwordHash, CreatedAt = fixedDate, CompanyId = 1 },
            new User { Id = 3, FirstName = "Company", LastName = "Admin", Email = "company_admin@construction.com", Username = "company_admin", PasswordHash = passwordHash, CreatedAt = fixedDate, CompanyId = 1 },
            new User { Id = 4, FirstName = "Project", LastName = "Manager", Email = "pm@construction.com", Username = "pm", PasswordHash = passwordHash, CreatedAt = fixedDate, CompanyId = 1 },
            new User { Id = 5, FirstName = "Site", LastName = "Engineer", Email = "engineer@construction.com", Username = "engineer", PasswordHash = passwordHash, CreatedAt = fixedDate, CompanyId = 1 },
            new User { Id = 6, FirstName = "Project", LastName = "Accountant", Email = "accountant@construction.com", Username = "accountant", PasswordHash = passwordHash, CreatedAt = fixedDate, CompanyId = 1 },
            new User { Id = 7, FirstName = "External", LastName = "Consultant", Email = "consultant@construction.com", Username = "consultant", PasswordHash = passwordHash, CreatedAt = fixedDate, CompanyId = 1 }
        );

        // --- Global Roles ---
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "SuperAdmin", CreatedAt = fixedDate },
            new Role { Id = 2, Name = "CompanyAdmin", CreatedAt = fixedDate }, 
            new Role { Id = 3, Name = "User", CreatedAt = fixedDate }
        );

        // --- Global Permissions ---
        // Basic permissions 1-9
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 1, Name = "All", CreatedAt = fixedDate },
            new Permission { Id = 2, Name = "ViewProjects", CreatedAt = fixedDate }
        );

        // Policy-Specific Permissions (Project Level) 10-20
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 10, Name = "Project.Edit", CreatedAt = fixedDate },
            new Permission { Id = 11, Name = "Project.Close", CreatedAt = fixedDate },
            new Permission { Id = 12, Name = "Financials.View", CreatedAt = fixedDate },
            new Permission { Id = 13, Name = "Transaction.Add", CreatedAt = fixedDate },
            new Permission { Id = 14, Name = "Transaction.Review", CreatedAt = fixedDate },
            new Permission { Id = 15, Name = "Media.Review", CreatedAt = fixedDate },
            new Permission { Id = 16, Name = "DailyLog.Close", CreatedAt = fixedDate },
            new Permission { Id = 17, Name = "Settings.Manage", CreatedAt = fixedDate }
        );

        // --- Global Role Permissions ---
        modelBuilder.Entity<RolePermission>().HasData(
            new RolePermission { RoleId = 1, PermissionId = 1 }, // SuperAdmin -> All
            new RolePermission { RoleId = 2, PermissionId = 1 }, // CompanyAdmin -> All (simplified)
            new RolePermission { RoleId = 3, PermissionId = 2 }  // User -> ViewProjects
        );

        // --- User Global Roles Assignments ---
        modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = 1, RoleId = 1 }, // Admin -> SuperAdmin
            new UserRole { UserId = 3, RoleId = 2 }  // CompanyAdmin -> CompanyAdmin
        );

        // --- Packages ---
        modelBuilder.Entity<Package>().HasData(
            new Package { Id = 1, Name = "Free", Description = "Starter plan", Price = 0, MaxTeamMembers = 5, MaxBOQItems = 50, CreatedAt = fixedDate },
            new Package { Id = 2, Name = "Pro", Description = "Professional tracking", Price = 1500, MaxTeamMembers = 20, MaxBOQItems = 200, CreatedAt = fixedDate },
            new Package { Id = 3, Name = "Premium", Description = "Full enterprise features", Price = 5000, MaxTeamMembers = 100, MaxBOQItems = 1000, AllowAIAssistance = true, CreatedAt = fixedDate }
        );

        // --- Projects ---
        modelBuilder.Entity<Project>().HasData(
            new Project { Id = 1, ProjectName = "Al-Massa Tower", CompanyId = 1, AccountingSystem = CalculationMethod.Measured, Status = "InProgress", OwnerUserId = 1, CreatedAt = fixedDate },
            new Project { Id = 2, ProjectName = "Coastal Supervision", CompanyId = 1, AccountingSystem = CalculationMethod.Supervision, Status = "جديد", OwnerUserId = 2, CreatedAt = fixedDate },
            new Project { Id = 3, ProjectName = "Smart Mall Mixed", CompanyId = 1, AccountingSystem = CalculationMethod.Measured, Status = "InProgress", OwnerUserId = 1, CreatedAt = fixedDate } // Mixed removed or mapped to Measured/Supervision appropriately if needed, or Enum updated. Assuming Measured for now or Mixed if Enum has it. Enum has Measured=0, Supervision=1, Package=2. No Mixed. User request was "Method to calculate costs...". I'll assume 0 for now or add Mixed to Enum if intended. Looking at previous code, Enum has Measured, Supervision, Package. I will use Measured for now to fix build, or check if I should add Mixed. The user removed Mixed in favor of explicit methods. I'll use Measured for project 3 or Supervision.
        );

        // --- Project Settings ---
        modelBuilder.Entity<ProjectSettings>().HasData(
            new ProjectSettings { Id = 1, EnableDelayNotification = true, RequirePhotoReview = true, EnableInvoiceReview = true, CreatedAt = fixedDate },
            new ProjectSettings { Id = 2, EnableDelayNotification = true, RequirePhotoReview = false, EnableInvoiceReview = false, CreatedAt = fixedDate },
            new ProjectSettings { Id = 3, EnableDelayNotification = false, RequirePhotoReview = true, EnableInvoiceReview = true, CreatedAt = fixedDate }
        );

        // --- BOQ Items (Parent Items) ---
        modelBuilder.Entity<BOQItem>().HasData(
            // Measured Items
            new BOQItem { Id = 101, ProjectId = 1, ItemCode = "CIV-01", ItemName = "Excavation", AccountingType = CalculationMethod.Measured, Status = "InProgress", CreatedAt = fixedDate },
            new BOQItem { Id = 102, ProjectId = 1, ItemCode = "CIV-02", ItemName = "Concrete Base", AccountingType = CalculationMethod.Measured, Status = "جديد", CreatedAt = fixedDate },
            // Supervision Items
            new BOQItem { Id = 201, ProjectId = 2, ItemCode = "SUP-01", ItemName = "Structural Audit", AccountingType = CalculationMethod.Supervision, Status = "جديد", CreatedAt = fixedDate },
            // Mixed Item - mapped to Measured as per Enum constraints
            new BOQItem { Id = 301, ProjectId = 3, ItemCode = "MIX-01", ItemName = "MEP Installation", AccountingType = CalculationMethod.Measured, Status = "InProgress", CreatedAt = fixedDate }
        );

        // --- 1:1 Dependent Data (BOQMeasured / BOQSupervision) ---
        modelBuilder.Entity<BOQMeasured>().HasData(
            new BOQMeasured { Id = 101, AgreedQuantity = 5000, UnitPrice = 150, ExecutedQuantity = 1200, CreatedAt = fixedDate },
            new BOQMeasured { Id = 102, AgreedQuantity = 800, UnitPrice = 4200, ExecutedQuantity = 0, CreatedAt = fixedDate },
            new BOQMeasured { Id = 301, AgreedQuantity = 1, UnitPrice = 500000, ExecutedQuantity = 0.25m, CreatedAt = fixedDate } // Part of Mixed
        );

        modelBuilder.Entity<BOQSupervision>().HasData(
            new BOQSupervision { Id = 201, SupervisionPercentage = 5.0m, BaseCalculation = "AllProjectInvoices", EstimatedTotalCost = 25000, CreatedAt = fixedDate },
            new BOQSupervision { Id = 301, SupervisionPercentage = 2.5m, BaseCalculation = "ThisItemInvoices", EstimatedTotalCost = 12500, CreatedAt = fixedDate } // Part of Mixed
        );

        // --- Project Roles ---
        modelBuilder.Entity<ProjectRole>().HasData(
            new ProjectRole { Id = 1, ProjectId = 1, Name = "Manager", CreatedAt = fixedDate },
            new ProjectRole { Id = 2, ProjectId = 1, Name = "Engineer", CreatedAt = fixedDate },
            new ProjectRole { Id = 3, ProjectId = 1, Name = "FinancialReviewer", CreatedAt = fixedDate },
            new ProjectRole { Id = 4, ProjectId = 1, Name = "MediaReviewer", CreatedAt = fixedDate }
        );

        // --- Project Role Permissions Assignments ---
        modelBuilder.Entity<ProjectRolePermission>().HasData(
            // Manager: Edit, Close, Settings, DailyLog
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 10 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 11 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 17 },
            new ProjectRolePermission { ProjectRoleId = 1, PermissionId = 16 },
            
            // Engineer: Add Transaction
            new ProjectRolePermission { ProjectRoleId = 2, PermissionId = 13 },

            // FinancialReviewer: View Financials, Review Transaction
            new ProjectRolePermission { ProjectRoleId = 3, PermissionId = 12 },
            new ProjectRolePermission { ProjectRoleId = 3, PermissionId = 14 },

            // MediaReviewer: Review Media
            new ProjectRolePermission { ProjectRoleId = 4, PermissionId = 15 }
        );

        // --- Project Team (Linking Users to Projects) ---
        modelBuilder.Entity<ProjectTeamMember>().HasData(
            new ProjectTeamMember { Id = 1, ProjectId = 1, UserId = 2, CreatedAt = fixedDate }, // Ahmed (Old)
            new ProjectTeamMember { Id = 2, ProjectId = 1, UserId = 4, CreatedAt = fixedDate }, // PM
            new ProjectTeamMember { Id = 3, ProjectId = 1, UserId = 5, CreatedAt = fixedDate }, // Engineer
            new ProjectTeamMember { Id = 4, ProjectId = 1, UserId = 6, CreatedAt = fixedDate }, // Accountant
            new ProjectTeamMember { Id = 5, ProjectId = 1, UserId = 7, CreatedAt = fixedDate }  // Consultant
        );

        // --- Project Team Roles (Assigning Roles to Team Members) ---
        modelBuilder.Entity<ProjectTeamRole>().HasData(
            new ProjectTeamRole { Id = 1, ProjectTeamMemberId = 1, ProjectRoleId = 2, CreatedAt = fixedDate }, // Ahmed -> Engineer
            new ProjectTeamRole { Id = 2, ProjectTeamMemberId = 2, ProjectRoleId = 1, CreatedAt = fixedDate }, // PM -> Manager
            new ProjectTeamRole { Id = 3, ProjectTeamMemberId = 3, ProjectRoleId = 2, CreatedAt = fixedDate }, // Engineer -> Engineer
            new ProjectTeamRole { Id = 4, ProjectTeamMemberId = 4, ProjectRoleId = 3, CreatedAt = fixedDate }, // Accountant -> FinancialReviewer
            new ProjectTeamRole { Id = 5, ProjectTeamMemberId = 5, ProjectRoleId = 4, CreatedAt = fixedDate }  // Consultant -> MediaReviewer
        );

        // --- Approval Rules ---
        modelBuilder.Entity<ProjectApprovalRule>().HasData(
            new ProjectApprovalRule { Id = 1, ProjectId = 1, Source = SourceType.OnlineUpload, UploaderRole = "Engineer", ApproverRole = "Manager", CreatedAt = fixedDate }
        );

        // --- Site Media ---
        modelBuilder.Entity<SiteMedia>().HasData(
            new SiteMedia { Id = 1, ProjectId = 1, BOQItemId = 101, MediaType = "image/jpeg", FilePath = "site1.jpg", UploaderUserId = 2, Status = "Approved", IsApproved = true, CreatedAt = fixedDate }
        );

        // --- Daily Logs ---
        modelBuilder.Entity<ItemDailyLog>().HasData(
            new ItemDailyLog { Id = 1, BOQItemId = 101, LogDate = fixedDate, ProgressNotes = "Testing seed data", IsClosed = true, ClosedByUserId = 1, CreatedByUserId = 1, CreatedAt = fixedDate }
        );

        // --- Invoices ---
        modelBuilder.Entity<ItemInvoice>().HasData(
            new ItemInvoice { Id = 1, ProjectId = 1, BOQItemId = 101, InvoiceNumber = "V-INV-001", InvoiceDate = fixedDate, NetAmount = 1000, SubTotal = 1000, Status = "Approved", CreatedByUserId = 1, CreatedAt = fixedDate }
        );

        // --- Transactions ---
        modelBuilder.Entity<Transaction>().HasData(
            new Transaction { Id = 1, ProjectId = 1, BOQItemId = 101, Amount = 5000, Type = TransactionType.MaterialPurchase, Status = TransactionStatus.Approved, CreatedByUserId = 1, CreatedAt = fixedDate }
        );

        // --- Notifications ---
        modelBuilder.Entity<Notification>().HasData(
            new Notification { Id = 1, UserId = 2, Title = "Welcome", Message = "Welcome to the system", Type = NotificationType.General, IsRead = false, CreatedAt = fixedDate }
        );

        // --- Escalations ---
        modelBuilder.Entity<EscalationLog>().HasData(
            new EscalationLog { Id = 1, ProjectId = 1, EscalationType = "StartDelay", RecipientUserId = 1, Message = "Project delayed", SentAt = fixedDate, CreatedAt = fixedDate }
        );

        // --- Deltas ---
        modelBuilder.Entity<BOQExecutedDelta>().HasData(
            new BOQExecutedDelta { Id = 1, BOQItemId = 101, DeltaQuantity = 100, DeltaDate = fixedDate, ChangeType = "DailyLog", CreatedByUserId = 1, CreatedAt = fixedDate }
        );

        // --- Profitability ---
        modelBuilder.Entity<BOQProfitabilityLog>().HasData(
            new BOQProfitabilityLog { Id = 1, BOQItemId = 101, TotalSpent = 4000, EstimatedBudget = 15000, CurrentProfit = 11000, ProfitPercentage = 73.33m, LogDate = fixedDate, CreatedAt = fixedDate }
        );

        // --- Client Payments ---
        modelBuilder.Entity<ClientPayment>().HasData(
            new ClientPayment { Id = 1, ProjectId = 1, Amount = 50000, PaymentDate = fixedDate, PaymentType = "Advance", IsConfirmed = true, CreatedAt = fixedDate }
        );

        // --- Notes ---
        modelBuilder.Entity<BOQItemNote>().HasData(
            new BOQItemNote { Id = 1, BOQItemId = 101, ProjectId = 1, NoteText = "Initial kickoff", NoteType = "General", CreatorUserId = 1, VisibleToRole = "SiteEngineer", CreatedAt = fixedDate }
        );

        // --- Company Settings ---
        modelBuilder.Entity<CompanySettings>().HasData(
            new CompanySettings { Id = 1, CompanyId = 1, EnableDelayNotification = true, CreatedAt = fixedDate }
        );

        // --- Approval Requests ---
        modelBuilder.Entity<ApprovalRequest>().HasData(
            new ApprovalRequest { Id = 1, ProjectId = 1, BOQItemId = 101, ProjectApprovalRuleId = 1, Source = SourceType.OnlineUpload, SourceId = 1, RequestedByUserId = 2, Status = "Approved", FinalApprovedByUserId = 1, FinalApprovedAt = fixedDate, CreatedAt = fixedDate }
        );

        // --- Approval Steps ---
        modelBuilder.Entity<ApprovalStep>().HasData(
            new ApprovalStep { Id = 1, ApprovalRequestId = 1, StepOrder = 1, ApproverRole = "Manager", ApproverUserId = 1, Status = "Approved", ApprovedAt = fixedDate, CreatedAt = fixedDate }
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
            e.CompanyId == _companyContext.CompanyId);
    }
}

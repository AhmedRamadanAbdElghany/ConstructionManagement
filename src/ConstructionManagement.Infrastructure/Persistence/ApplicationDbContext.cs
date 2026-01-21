using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // ── Core / Identity ─────────────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    // ── Projects & Structure ────────────────────────────────────────────────────
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTeamMember> ProjectTeam => Set<ProjectTeamMember>();
    public DbSet<ProjectTeamRole> ProjectTeamRoles => Set<ProjectTeamRole>();
    public DbSet<ProjectRole> ProjectRoles => Set<ProjectRole>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<ProjectSettings> ProjectSettings => Set<ProjectSettings>();
    public DbSet<ProjectApprovalRule> ProjectApprovalRules => Set<ProjectApprovalRule>();

    // ── BOQ & Progress Tracking ─────────────────────────────────────────────────
    public DbSet<BOQItem> BOQItems => Set<BOQItem>();
    public DbSet<BOQMeasured> BOQMeasured => Set<BOQMeasured>();
    public DbSet<BOQSupervision> BOQSupervision => Set<BOQSupervision>();
    public DbSet<ItemDailyLog> ItemDailyLogs => Set<ItemDailyLog>();

    // ── Financial & Review Flow ─────────────────────────────────────────────────
    public DbSet<ItemInvoice> ItemInvoices => Set<ItemInvoice>();
    public DbSet<ClientPayment> ClientPayments => Set<ClientPayment>();

    // ── Media & Documentation ───────────────────────────────────────────────────
    public DbSet<SiteMedia> SiteMedias => Set<SiteMedia>();
    public DbSet<BOQItemNote> BOQItemNotes => Set<BOQItemNote>();
    public DbSet<BOQProfitabilityLog> BOQProfitabilityLogs => Set<BOQProfitabilityLog>();
    public DbSet<EscalationLog> EscalationLogs => Set<EscalationLog>();

    // ── Notifications ───────────────────────────────────────────────────────────
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ────────────────────────────────────────────────────────────────
        // 1. Project ↔ ProjectSettings (1:1 – shared PK)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectSettings>()
            .HasKey(ps => ps.Id);
        modelBuilder.Entity<ProjectSettings>()
            .HasOne(ps => ps.Project)
            .WithOne(p => p.Settings)
            .HasForeignKey<ProjectSettings>(ps => ps.Id)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 2. Project ↔ BOQItem (1:N)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<BOQItem>()
            .HasOne(bi => bi.Project)
            .WithMany(p => p.BOQItems)
            .HasForeignKey(bi => bi.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 3. BOQItem ↔ BOQMeasured / BOQSupervision (1:1 – shared PK)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<BOQMeasured>()
            .HasKey(m => m.Id);
        modelBuilder.Entity<BOQMeasured>()
            .HasOne(m => m.Item)
            .WithOne(i => i.MeasuredData)
            .HasForeignKey<BOQMeasured>(m => m.Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BOQSupervision>()
            .HasKey(s => s.Id);
        modelBuilder.Entity<BOQSupervision>()
            .HasOne(s => s.Item)
            .WithOne(i => i.SupervisionData)
            .HasForeignKey<BOQSupervision>(s => s.Id)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 4. User ↔ UserRole (many-to-many)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 5. ProjectTeamMember ↔ ProjectTeamRole (many-to-many bridge)
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectTeamRole>()
            .HasKey(ptr => new { ptr.ProjectTeamMemberId, ptr.ProjectRoleId });

        modelBuilder.Entity<ProjectTeamRole>()
            .HasOne(ptr => ptr.ProjectTeamMember)
            .WithMany(ptm => ptm.ProjectTeamRoles)
            .HasForeignKey(ptr => ptr.ProjectTeamMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTeamRole>()
            .HasOne(ptr => ptr.ProjectRole)
            .WithMany(pr => pr.Assignments)
            .HasForeignKey(ptr => ptr.ProjectRoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 6. ProjectTeamMember relationships
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ProjectTeamMember>()
            .HasOne(ptm => ptm.Project)
            .WithMany(p => p.TeamMembers)
            .HasForeignKey(ptm => ptm.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTeamMember>()
            .HasOne(ptm => ptm.User)
            .WithMany(u => u.ProjectMemberships)
            .HasForeignKey(ptm => ptm.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTeamMember>()
            .HasOne(ptm => ptm.ReportsTo)
            .WithMany()
            .HasForeignKey(ptm => ptm.ReportsToUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<ProjectTeamMember>()
            .HasIndex(ptm => new { ptm.ProjectId, ptm.UserId })
            .IsUnique();

        // ────────────────────────────────────────────────────────────────
        // 7. Project children – Restrict for direct relationships to avoid cascade cycles
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ClientPayment>()
            .HasOne(cp => cp.Project)
            .WithMany(p => p.ClientPayments)
            .HasForeignKey(cp => cp.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EscalationLog>()
            .HasOne(el => el.Project)
            .WithMany(p => p.EscalationLogs)
            .HasForeignKey(el => el.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EscalationLog>()
            .HasOne(el => el.BOQItem)
            .WithMany(i => i.EscalationLogs)
            .HasForeignKey(el => el.BOQItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemInvoice>()
            .HasOne(ii => ii.Project)
            .WithMany(p => p.ItemInvoices)
            .HasForeignKey(ii => ii.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemInvoice>()
            .HasOne(ii => ii.BOQItem)
            .WithMany(b => b.Invoices)
            .HasForeignKey(ii => ii.BOQItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Project)
            .WithMany(p => p.SiteMedias)
            .HasForeignKey(sm => sm.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.BOQItem)
            .WithMany(b => b.SiteMedias)
            .HasForeignKey(sm => sm.BOQItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Transactions)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.BOQItem)
            .WithMany()
            .HasForeignKey(t => t.BOQItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // ────────────────────────────────────────────────────────────────
        // 8. BOQItem children
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.BOQItem)
            .WithMany(b => b.DailyLogs)
            .HasForeignKey(dl => dl.BOQItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQItemNote>()
            .HasOne(n => n.BOQItem)
            .WithMany(b => b.Notes)
            .HasForeignKey(n => n.BOQItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BOQProfitabilityLog>()
            .HasOne(pl => pl.BOQItem)
            .WithMany(b => b.ProfitabilityLogs)
            .HasForeignKey(pl => pl.BOQItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 9. User relationships (CreatedBy, ClosedBy, Reviewer, Uploader, etc.)
        // ────────────────────────────────────────────────────────────────

        // ItemDailyLog → CreatedByUser (required)
        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.CreatedByUser)
            .WithMany()
            .HasForeignKey(dl => dl.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        // ItemDailyLog → ClosedByUser (nullable)
        modelBuilder.Entity<ItemDailyLog>()
            .HasOne(dl => dl.ClosedByUser)
            .WithMany()
            .HasForeignKey(dl => dl.ClosedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Project → Owner / GeneralManager / ClosedBy
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Owner)
            .WithMany()
            .HasForeignKey(p => p.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.GeneralManager)
            .WithMany()
            .HasForeignKey(p => p.GeneralManagerUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.ClosedBy)
            .WithMany()
            .HasForeignKey(p => p.ClosedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // SiteMedia → Uploader / Reviewer
        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Uploader)
            .WithMany()
            .HasForeignKey(sm => sm.UploaderUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        modelBuilder.Entity<SiteMedia>()
            .HasOne(sm => sm.Reviewer)
            .WithMany()
            .HasForeignKey(sm => sm.ReviewerUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Transaction → CreatedBy / ReviewedBy
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.CreatedBy)
            .WithMany()
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(true);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.ReviewedBy)
            .WithMany()
            .HasForeignKey(t => t.ReviewedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // ────────────────────────────────────────────────────────────────
        // 10. Notifications
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ────────────────────────────────────────────────────────────────
        // 11. Global decimal precision (18,2) – مرة واحدة فقط
        // ────────────────────────────────────────────────────────────────
        foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        // 3. ضبط أرقام الـ Decimal (المبالغ المالية)
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // ────────────────────────────────────────────────────────────────
        // 12. Useful indexes
        // ────────────────────────────────────────────────────────────────
        modelBuilder.Entity<BOQItem>()
            .HasIndex(b => b.ProjectId);

        modelBuilder.Entity<ItemDailyLog>()
            .HasIndex(d => new { d.BOQItemId, d.LogDate })
            .IsUnique();
    }

    // ── Audit Logic ─────────────────────────────────────────────────────────────
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
        var entries = ChangeTracker.Entries<IAuditableEntity>()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }
            entry.Entity.UpdatedAt = now;
        }
    }
}
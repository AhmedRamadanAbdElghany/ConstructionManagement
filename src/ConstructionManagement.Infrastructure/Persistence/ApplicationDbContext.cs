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
    public DbSet<CompanyUser> CompanyUsers => Set<CompanyUser>();
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
    public DbSet<CompanyDefaultDesignCategory> CompanyDefaultDesignCategories => Set<CompanyDefaultDesignCategory>();
    public DbSet<CompanyDefaultDesign> CompanyDefaultDesigns => Set<CompanyDefaultDesign>();
    
    // ProjectItem entities (renamed from BOQ)
    public DbSet<ProjectItem> ProjectItems => Set<ProjectItem>();
    public DbSet<ProjectItemExecutedDelta> ProjectItemExecutedDeltas => Set<ProjectItemExecutedDelta>();
    public DbSet<ProjectItemNote> ProjectItemNotes => Set<ProjectItemNote>();
    public DbSet<ProjectItemProfitabilityLog> ProjectItemProfitabilityLogs => Set<ProjectItemProfitabilityLog>();

    // ProjectItem Task and Workflow entities
    public DbSet<ProjectItemTask> ProjectItemTasks => Set<ProjectItemTask>();
    public DbSet<ProjectItemTaskAttachment> ProjectItemTaskAttachments => Set<ProjectItemTaskAttachment>();
    public DbSet<ProjectItemTaskHistory> ProjectItemTaskHistories => Set<ProjectItemTaskHistory>();
    public DbSet<ProjectItemTaskReview> ProjectItemTaskReviews => Set<ProjectItemTaskReview>();
    public DbSet<DailyTaskBoard> DailyTaskBoards => Set<DailyTaskBoard>();
    public DbSet<WorkflowConfiguration> WorkflowConfigurations => Set<WorkflowConfiguration>();
    public DbSet<ProjectItemEscalation> ProjectItemEscalations => Set<ProjectItemEscalation>();
    public DbSet<EscalationAction> EscalationActions => Set<EscalationAction>();
    public DbSet<TaskNotification> TaskNotifications => Set<TaskNotification>();
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
            public DbSet<VendorProjectStat> VendorProjectStats => Set<VendorProjectStat>();
            public DbSet<DeliveryCostTier> DeliveryCostTiers => Set<DeliveryCostTier>();
            public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();
            public DbSet<SocialMediaSource> SocialMediaSources => Set<SocialMediaSource>();
            public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
            
            // Product Categories (Marketplace)
            public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
            public DbSet<CategoryRequest> CategoryRequests => Set<CategoryRequest>();

            // Warehouse Join Requests
            public DbSet<WarehouseJoinRequest> WarehouseJoinRequests => Set<WarehouseJoinRequest>();

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
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<MarketplacePayment> MarketplacePayments => Set<MarketplacePayment>();
    
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
    public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<LeaveRequestAttachment> LeaveRequestAttachments => Set<LeaveRequestAttachment>();
    public DbSet<Holiday> Holidays => Set<Holiday>();
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

    // Push Notifications
    public DbSet<PushDeviceToken> PushDeviceTokens => Set<PushDeviceToken>();
    public DbSet<PushNotificationLog> PushNotificationLogs => Set<PushNotificationLog>();
    public DbSet<UserPushNotificationSetting> UserPushNotificationSettings => Set<UserPushNotificationSetting>();

    // Performance Evaluation
    public DbSet<EvaluationCriteria> EvaluationCriteria => Set<EvaluationCriteria>();
    public DbSet<EvaluationPeriod> EvaluationPeriods => Set<EvaluationPeriod>();
    public DbSet<PerformanceEvaluation> PerformanceEvaluations => Set<PerformanceEvaluation>();
    public DbSet<EvaluationCriteriaScore> EvaluationCriteriaScores => Set<EvaluationCriteriaScore>();
    public DbSet<EvaluationGoal> EvaluationGoals => Set<EvaluationGoal>();
    public DbSet<PeerFeedback> PeerFeedbacks => Set<PeerFeedback>();

    // Video/Voice Calls
    public DbSet<CallSession> CallSessions => Set<CallSession>();
    public DbSet<CallParticipant> CallParticipants => Set<CallParticipant>();
    public DbSet<CallSignal> CallSignals => Set<CallSignal>();
    public DbSet<CallRecording> CallRecordings => Set<CallRecording>();

    // Multi-Currency
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<ExchangeRate> ExchangeRates => Set<ExchangeRate>();
    public DbSet<CompanyCurrencySetting> CompanyCurrencySettings => Set<CompanyCurrencySetting>();
    public DbSet<CurrencyConversionLog> CurrencyConversionLogs => Set<CurrencyConversionLog>();
    public DbSet<ProjectCurrencyBudget> ProjectCurrencyBudgets => Set<ProjectCurrencyBudget>();

    // Training Tracking
    public DbSet<TrainingProgram> TrainingPrograms => Set<TrainingProgram>();
    public DbSet<TrainingCategory> TrainingCategories => Set<TrainingCategory>();
    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();
    public DbSet<TrainingEnrollment> TrainingEnrollments => Set<TrainingEnrollment>();
    public DbSet<TrainingProgress> TrainingProgresses => Set<TrainingProgress>();
    public DbSet<TrainingMaterial> TrainingMaterials => Set<TrainingMaterial>();
    public DbSet<TrainingQuiz> TrainingQuizzes => Set<TrainingQuiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizAnswer> QuizAnswers => Set<QuizAnswer>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizResponse> QuizResponses => Set<QuizResponse>();
    public DbSet<TrainingRequirement> TrainingRequirements => Set<TrainingRequirement>();

    // Inspections
    public DbSet<InspectionRequest> InspectionRequests => Set<InspectionRequest>();
    public DbSet<InspectionTimeSlot> InspectionTimeSlots => Set<InspectionTimeSlot>();
    public DbSet<InspectionQuote> InspectionQuotes => Set<InspectionQuote>();
    public DbSet<InspectionSession> InspectionSessions => Set<InspectionSession>();
    public DbSet<InspectionDocument> InspectionDocuments => Set<InspectionDocument>();
    public DbSet<InspectionPayment> InspectionPayments => Set<InspectionPayment>();
    public DbSet<InspectionWorkRequest> InspectionWorkRequests => Set<InspectionWorkRequest>();
    public DbSet<InspectionReview> InspectionReviews => Set<InspectionReview>();
    public DbSet<InspectionCostEstimate> InspectionCostEstimates => Set<InspectionCostEstimate>();
    public DbSet<CostEstimateItem> CostEstimateItems => Set<CostEstimateItem>();
    public DbSet<InspectionRescheduleRequest> InspectionRescheduleRequests => Set<InspectionRescheduleRequest>();
    public DbSet<InspectionChatMessage> InspectionChatMessages => Set<InspectionChatMessage>();
    public DbSet<InspectionChecklistTemplate> InspectionChecklistTemplates => Set<InspectionChecklistTemplate>();
    public DbSet<InspectionChecklistItem> InspectionChecklistItems => Set<InspectionChecklistItem>();
    public DbSet<InspectionChecklistResponse> InspectionChecklistResponses => Set<InspectionChecklistResponse>();
    public DbSet<InspectionCustomField> InspectionCustomFields => Set<InspectionCustomField>();
    public DbSet<InspectionCustomFieldValue> InspectionCustomFieldValues => Set<InspectionCustomFieldValue>();
    public DbSet<InspectionTeamMember> InspectionTeamMembers => Set<InspectionTeamMember>();
    public DbSet<InspectionReport> InspectionReports => Set<InspectionReport>();
    public DbSet<InspectionSignature> InspectionSignatures => Set<InspectionSignature>();
    public DbSet<InspectionAudioNote> InspectionAudioNotes => Set<InspectionAudioNote>();
    public DbSet<RecurringInspectionSchedule> RecurringInspectionSchedules => Set<RecurringInspectionSchedule>();

    // HR Gap Features - Employee Documents
    public DbSet<EmployeeDocumentCategory> EmployeeDocumentCategories => Set<EmployeeDocumentCategory>();
    public DbSet<EmployeeDocument> EmployeeDocuments => Set<EmployeeDocument>();
    public DbSet<EmployeeDocumentVersion> EmployeeDocumentVersions => Set<EmployeeDocumentVersion>();
    public DbSet<DocumentExpiryAlert> DocumentExpiryAlerts => Set<DocumentExpiryAlert>();

    // HR Gap Features - Worker Self-Service
    public DbSet<WorkerProfileUpdateRequest> WorkerProfileUpdateRequests => Set<WorkerProfileUpdateRequest>();
    public DbSet<EmergencyContact> EmergencyContacts => Set<EmergencyContact>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();

    // HR Gap Features - Onboarding
    public DbSet<OnboardingTemplate> OnboardingTemplates => Set<OnboardingTemplate>();
    public DbSet<OnboardingTaskTemplate> OnboardingTaskTemplates => Set<OnboardingTaskTemplate>();
    public DbSet<OnboardingProcess> OnboardingProcesses => Set<OnboardingProcess>();
    public DbSet<OnboardingTask> OnboardingTasks => Set<OnboardingTask>();
    public DbSet<OnboardingTaskDocument> OnboardingTaskDocuments => Set<OnboardingTaskDocument>();

    // HR Gap Features - Disciplinary Actions
    public DbSet<DisciplinaryActionType> DisciplinaryActionTypes => Set<DisciplinaryActionType>();
    public DbSet<DisciplinaryAction> DisciplinaryActions => Set<DisciplinaryAction>();
    public DbSet<DisciplinaryAppeal> DisciplinaryAppeals => Set<DisciplinaryAppeal>();
    public DbSet<EmployeeDisciplinaryRecord> EmployeeDisciplinaryRecords => Set<EmployeeDisciplinaryRecord>();

    // HR Gap Features - Skills Matrix
    public DbSet<SkillCategory> SkillCategories => Set<SkillCategory>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<CompetencyLevel> CompetencyLevels => Set<CompetencyLevel>();
    public DbSet<EmployeeSkill> EmployeeSkills => Set<EmployeeSkill>();
    public DbSet<SkillRequirement> SkillRequirements => Set<SkillRequirement>();
    public DbSet<SkillGapAnalysis> SkillGapAnalyses => Set<SkillGapAnalysis>();


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
        
        // Multi-Currency System configurations
        ConfigureMultiCurrencyEntities(modelBuilder);
        
        // Inspection System configurations
        ConfigureInspectionEntities(modelBuilder);

        // HR Gap Features configurations
        ConfigureHRGapEntities(modelBuilder);

        // Additional configurations to resolve cascade cycles
        ConfigureTrainingEntities(modelBuilder);
        ConfigureProjectItemTaskEntities(modelBuilder);
        ConfigureCallEntities(modelBuilder);
        ConfigurePerformanceEvaluationEntities(modelBuilder);

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
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(c => c.EquipmentROI)
                .WithMany()
                .HasForeignKey(c => c.EquipmentROIId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => c.EquipmentId);
            entity.HasIndex(c => c.Date);
            entity.HasIndex(c => c.CostType);
        });
    }

    private void ConfigureMultiCurrencyEntities(ModelBuilder modelBuilder)
    {
        // Currency configuration
        modelBuilder.Entity<Currency>(entity =>
        {
            entity.HasIndex(c => c.Code).IsUnique();
            entity.HasIndex(c => c.IsActive);
        });

        // ExchangeRate configuration - configure both relationships to Currency
        modelBuilder.Entity<ExchangeRate>(entity =>
        {
            entity.HasOne(e => e.FromCurrency)
                .WithMany(c => c.ExchangeRatesFrom)
                .HasForeignKey(e => e.FromCurrencyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.ToCurrency)
                .WithMany(c => c.ExchangeRatesTo)
                .HasForeignKey(e => e.ToCurrencyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(e => new { e.FromCurrencyId, e.ToCurrencyId, e.EffectiveDate });
            entity.HasIndex(e => e.IsActive);
        });

        // CompanyCurrencySetting configuration
        modelBuilder.Entity<CompanyCurrencySetting>(entity =>
        {
            entity.HasOne(c => c.Company)
                .WithOne()
                .HasForeignKey<CompanyCurrencySetting>(c => c.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.BaseCurrency)
                .WithMany()
                .HasForeignKey(c => c.BaseCurrencyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(c => c.CompanyId).IsUnique();
        });

        // CurrencyConversionLog configuration
        modelBuilder.Entity<CurrencyConversionLog>(entity =>
        {
            entity.HasOne(c => c.Company)
                .WithMany()
                .HasForeignKey(c => c.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(c => c.FromCurrency)
                .WithMany()
                .HasForeignKey(c => c.FromCurrencyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(c => c.ToCurrency)
                .WithMany()
                .HasForeignKey(c => c.ToCurrencyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(c => c.ExchangeRate)
                .WithMany()
                .HasForeignKey(c => c.ExchangeRateId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(c => c.ConvertedByUser)
                .WithMany()
                .HasForeignKey(c => c.ConvertedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(c => c.CompanyId);
            entity.HasIndex(c => c.ConvertedAt);
            entity.HasIndex(c => new { c.EntityType, c.EntityId });
        });

        // ProjectCurrencyBudget configuration
        modelBuilder.Entity<ProjectCurrencyBudget>(entity =>
        {
            entity.HasOne(p => p.Project)
                .WithMany()
                .HasForeignKey(p => p.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Currency)
                .WithMany()
                .HasForeignKey(p => p.CurrencyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(p => new { p.ProjectId, p.CurrencyId }).IsUnique();
        });
    }

    // Inspection System configurations
    private void ConfigureInspectionEntities(ModelBuilder modelBuilder)
    {
        // InspectionRequest configuration
        modelBuilder.Entity<InspectionRequest>(entity =>
        {
            entity.HasOne(r => r.Company)
                .WithMany()
                .HasForeignKey(r => r.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(r => r.ClientUser)
                .WithMany()
                .HasForeignKey(r => r.ClientUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.Status);
            entity.HasIndex(r => r.CompanyId);
            entity.HasIndex(r => r.ClientUserId);
        });

        // InspectionTimeSlot configuration
        modelBuilder.Entity<InspectionTimeSlot>(entity =>
        {
            entity.HasOne(t => t.InspectionRequest)
                .WithMany(t => t.TimeSlots)
                .HasForeignKey(t => t.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(r => r.InspectionRequestId);
        });

        // InspectionQuote configuration
        modelBuilder.Entity<InspectionQuote>(entity =>
        {
            entity.HasOne(q => q.InspectionRequest)
                .WithMany(q => q.Quotes)
                .HasForeignKey(q => q.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(q => q.CompanyUser)
                .WithMany()
                .HasForeignKey(q => q.CompanyUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
            entity.HasIndex(r => r.Status);
        });

        // InspectionSession configuration
        modelBuilder.Entity<InspectionSession>(entity =>
        {
            entity.HasOne(s => s.InspectionRequest)
                .WithOne(s => s.Session)
                .HasForeignKey<InspectionSession>(s => s.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.CompanyUser)
                .WithMany()
                .HasForeignKey(s => s.CompanyUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId).IsUnique();
        });

        // InspectionDocument configuration
        modelBuilder.Entity<InspectionDocument>(entity =>
        {
            entity.HasOne(d => d.InspectionRequest)
                .WithMany(d => d.Documents)
                .HasForeignKey(d => d.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.UploadedByUser)
                .WithMany()
                .HasForeignKey(d => d.UploadedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
        });

        // InspectionPayment configuration
        modelBuilder.Entity<InspectionPayment>(entity =>
        {
            entity.HasOne(p => p.InspectionRequest)
                .WithOne(p => p.Payment)
                .HasForeignKey<InspectionPayment>(p => p.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.PaidByUser)
                .WithMany()
                .HasForeignKey(p => p.PaidByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId).IsUnique();
        });

        // InspectionWorkRequest configuration
        modelBuilder.Entity<InspectionWorkRequest>(entity =>
        {
            entity.HasOne(w => w.InspectionRequest)
                .WithOne(w => w.WorkRequest)
                .HasForeignKey<InspectionWorkRequest>(w => w.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(w => w.ClientUser)
                .WithMany()
                .HasForeignKey(w => w.ClientUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(w => w.ConvertedToProject)
                .WithMany()
                .HasForeignKey(w => w.ConvertedToProjectId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(r => r.InspectionRequestId).IsUnique();
        });

        // InspectionReview configuration
        modelBuilder.Entity<InspectionReview>(entity =>
        {
            entity.HasOne(r => r.InspectionRequest)
                .WithOne(r => r.Review)
                .HasForeignKey<InspectionReview>(r => r.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.ClientUser)
                .WithMany()
                .HasForeignKey(r => r.ClientUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId).IsUnique();
        });

        // InspectionCostEstimate configuration
        modelBuilder.Entity<InspectionCostEstimate>(entity =>
        {
            entity.HasOne(e => e.InspectionRequest)
                .WithOne(e => e.CostEstimate)
                .HasForeignKey<InspectionCostEstimate>(e => e.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId).IsUnique();
        });

        // CostEstimateItem configuration
        modelBuilder.Entity<CostEstimateItem>(entity =>
        {
            entity.HasOne(i => i.CostEstimate)
                .WithMany(i => i.Items)
                .HasForeignKey(i => i.InspectionCostEstimateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(r => r.InspectionCostEstimateId);
        });

        // InspectionRescheduleRequest configuration
        modelBuilder.Entity<InspectionRescheduleRequest>(entity =>
        {
            entity.HasOne(r => r.InspectionRequest)
                .WithMany(r => r.RescheduleRequests)
                .HasForeignKey(r => r.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.RequestedByUser)
                .WithMany()
                .HasForeignKey(r => r.RequestedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
            entity.HasIndex(r => r.Status);
        });

        // InspectionChatMessage configuration
        modelBuilder.Entity<InspectionChatMessage>(entity =>
        {
            entity.HasOne(m => m.InspectionRequest)
                .WithMany(m => m.ChatMessages)
                .HasForeignKey(m => m.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.SenderUser)
                .WithMany()
                .HasForeignKey(m => m.SenderUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
        });

        // InspectionChecklistTemplate configuration
        modelBuilder.Entity<InspectionChecklistTemplate>(entity =>
        {
            entity.HasOne(t => t.Company)
                .WithMany()
                .HasForeignKey(t => t.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(t => t.CreatedByUser)
                .WithMany()
                .HasForeignKey(t => t.CreatedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.CompanyId);
            entity.HasIndex(r => r.IsActive);
        });

        // InspectionChecklistItem configuration
        modelBuilder.Entity<InspectionChecklistItem>(entity =>
        {
            entity.HasOne(i => i.Template)
                .WithMany(i => i.Items)
                .HasForeignKey(i => i.InspectionChecklistTemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(r => r.InspectionChecklistTemplateId);
        });

        // InspectionChecklistResponse configuration
        modelBuilder.Entity<InspectionChecklistResponse>(entity =>
        {
            entity.HasOne(r => r.InspectionRequest)
                .WithMany(r => r.ChecklistResponses)
                .HasForeignKey(r => r.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.ChecklistItem)
                .WithMany()
                .HasForeignKey(r => r.ChecklistItemId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(r => r.RespondedByUser)
                .WithMany()
                .HasForeignKey(r => r.RespondedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
        });

        // InspectionCustomField configuration
        modelBuilder.Entity<InspectionCustomField>(entity =>
        {
            entity.HasOne(f => f.Company)
                .WithMany()
                .HasForeignKey(f => f.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.CompanyId);
            entity.HasIndex(r => r.IsActive);
        });

        // InspectionCustomFieldValue configuration
        modelBuilder.Entity<InspectionCustomFieldValue>(entity =>
        {
            entity.HasOne(v => v.InspectionRequest)
                .WithMany(v => v.CustomFieldValues)
                .HasForeignKey(v => v.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(v => v.CustomField)
                .WithMany()
                .HasForeignKey(v => v.CustomFieldId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
        });

        // InspectionTeamMember configuration
        modelBuilder.Entity<InspectionTeamMember>(entity =>
        {
            entity.HasOne(t => t.InspectionRequest)
                .WithMany(t => t.TeamMembers)
                .HasForeignKey(t => t.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(t => t.AssignedByUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
        });

        // InspectionReport configuration
        modelBuilder.Entity<InspectionReport>(entity =>
        {
            entity.HasOne(r => r.InspectionRequest)
                .WithOne(r => r.Report)
                .HasForeignKey<InspectionReport>(r => r.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.GeneratedByUser)
                .WithMany()
                .HasForeignKey(r => r.GeneratedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId).IsUnique();
        });

        // InspectionSignature configuration
        modelBuilder.Entity<InspectionSignature>(entity =>
        {
            entity.HasOne(s => s.InspectionRequest)
                .WithMany(s => s.Signatures)
                .HasForeignKey(s => s.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
        });

        // InspectionAudioNote configuration
        modelBuilder.Entity<InspectionAudioNote>(entity =>
        {
            entity.HasOne(n => n.InspectionRequest)
                .WithMany(n => n.AudioNotes)
                .HasForeignKey(n => n.InspectionRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(n => n.RecordedByUser)
                .WithMany()
                .HasForeignKey(n => n.RecordedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.InspectionRequestId);
        });

        // RecurringInspectionSchedule configuration
        modelBuilder.Entity<RecurringInspectionSchedule>(entity =>
        {
            entity.HasOne(s => s.Company)
                .WithMany()
                .HasForeignKey(s => s.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(s => s.OriginalInspection)
                .WithMany()
                .HasForeignKey(s => s.OriginalInspectionId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(s => s.CreatedByUser)
                .WithMany()
                .HasForeignKey(s => s.CreatedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(r => r.CompanyId);
            entity.HasIndex(r => r.NextOccurrenceNumber);
        });
    }

    private void ConfigureHRGapEntities(ModelBuilder modelBuilder)
    {
        #region Employee Documents

        // EmployeeDocumentCategory configuration
        modelBuilder.Entity<EmployeeDocumentCategory>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.IsActive);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // EmployeeDocument configuration
        modelBuilder.Entity<EmployeeDocument>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.EmployeeId);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ExpiryDate);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Documents)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.VerifiedByUser)
                .WithMany()
                .HasForeignKey(e => e.VerifiedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.UploadedByUser)
                .WithMany()
                .HasForeignKey(e => e.UploadedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // EmployeeDocumentVersion configuration
        modelBuilder.Entity<EmployeeDocumentVersion>(entity =>
        {
            entity.HasIndex(e => e.EmployeeDocumentId);

            entity.HasOne(e => e.Document)
                .WithMany(d => d.Versions)
                .HasForeignKey(e => e.EmployeeDocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.UploadedByUser)
                .WithMany()
                .HasForeignKey(e => e.UploadedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // DocumentExpiryAlert configuration
        modelBuilder.Entity<DocumentExpiryAlert>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.DocumentId);
            entity.HasIndex(e => e.ExpiryDate);
            entity.HasIndex(e => e.IsSent);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Document)
                .WithMany()
                .HasForeignKey(e => e.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        #endregion

        #region Worker Self-Service

        // WorkerProfileUpdateRequest configuration
        modelBuilder.Entity<WorkerProfileUpdateRequest>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.WorkerId);
            entity.HasIndex(e => e.Status);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Worker)
                .WithMany()
                .HasForeignKey(e => e.WorkerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ReviewedByUser)
                .WithMany()
                .HasForeignKey(e => e.ReviewedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // EmergencyContact configuration
        modelBuilder.Entity<EmergencyContact>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.IsPrimary);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // BankAccount configuration
        modelBuilder.Entity<BankAccount>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.IsActive);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        #endregion

        #region Onboarding

        // OnboardingTemplate configuration
        modelBuilder.Entity<OnboardingTemplate>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.IsActive);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // OnboardingTaskTemplate configuration
        modelBuilder.Entity<OnboardingTaskTemplate>(entity =>
        {
            entity.HasIndex(e => e.OnboardingTemplateId);

            entity.HasOne(e => e.Template)
                .WithMany(t => t.TaskTemplates)
                .HasForeignKey(e => e.OnboardingTemplateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OnboardingProcess configuration
        modelBuilder.Entity<OnboardingProcess>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.EmployeeId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.StartDate);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Template)
                .WithMany()
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.AssignedToUser)
                .WithMany()
                .HasForeignKey(e => e.AssignedToUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // OnboardingTask configuration
        modelBuilder.Entity<OnboardingTask>(entity =>
        {
            entity.HasIndex(e => e.OnboardingProcessId);
            entity.HasIndex(e => e.Status);

            entity.HasOne(e => e.Process)
                .WithMany(p => p.Tasks)
                .HasForeignKey(e => e.OnboardingProcessId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CompletedByUser)
                .WithMany()
                .HasForeignKey(e => e.CompletedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // OnboardingTaskDocument configuration
        modelBuilder.Entity<OnboardingTaskDocument>(entity =>
        {
            entity.HasIndex(e => e.OnboardingTaskId);

            entity.HasOne(e => e.Task)
                .WithMany(t => t.RequiredDocuments)
                .HasForeignKey(e => e.OnboardingTaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        #endregion

        #region Disciplinary Actions

        // DisciplinaryActionType configuration
        modelBuilder.Entity<DisciplinaryActionType>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.SeverityLevel);
            entity.HasIndex(e => e.IsActive);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // DisciplinaryAction configuration
        modelBuilder.Entity<DisciplinaryAction>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.EmployeeId);
            entity.HasIndex(e => e.ActionTypeId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IssueDate);
            entity.HasIndex(e => e.ExpiryDate);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ActionType)
                .WithMany()
                .HasForeignKey(e => e.ActionTypeId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.IssuedByUser)
                .WithMany()
                .HasForeignKey(e => e.IssuedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // DisciplinaryAppeal configuration
        modelBuilder.Entity<DisciplinaryAppeal>(entity =>
        {
            entity.HasIndex(e => e.DisciplinaryActionId);
            entity.HasIndex(e => e.Status);

            entity.HasOne(e => e.Action)
                .WithMany(a => a.Appeals)
                .HasForeignKey(e => e.DisciplinaryActionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ReviewedByUser)
                .WithMany()
                .HasForeignKey(e => e.ReviewedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // EmployeeDisciplinaryRecord configuration
        modelBuilder.Entity<EmployeeDisciplinaryRecord>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.EmployeeId).IsUnique();

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Employee)
                .WithOne()
                .HasForeignKey<EmployeeDisciplinaryRecord>(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        #endregion

        #region Skills Matrix

        // SkillCategory configuration
        modelBuilder.Entity<SkillCategory>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.IsActive);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Skill configuration
        modelBuilder.Entity<Skill>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.IsActive);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Skills)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CompetencyLevel configuration
        modelBuilder.Entity<CompetencyLevel>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Level);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // EmployeeSkill configuration
        modelBuilder.Entity<EmployeeSkill>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.EmployeeId);
            entity.HasIndex(e => e.SkillId);
            entity.HasIndex(e => e.ExpiryDate);
            entity.HasIndex(e => new { e.EmployeeId, e.SkillId }).IsUnique();

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Skill)
                .WithMany(s => s.EmployeeSkills)
                .HasForeignKey(e => e.SkillId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CompetencyLevel)
                .WithMany()
                .HasForeignKey(e => e.CompetencyLevelId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.AssessedByUser)
                .WithMany()
                .HasForeignKey(e => e.AssessedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Certification)
                .WithMany()
                .HasForeignKey(e => e.CertificationId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // SkillRequirement configuration
        modelBuilder.Entity<SkillRequirement>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.SkillId);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Skill)
                .WithMany()
                .HasForeignKey(e => e.SkillId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.MinimumCompetencyLevel)
                .WithMany()
                .HasForeignKey(e => e.MinimumCompetencyLevelId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // SkillGapAnalysis configuration
        modelBuilder.Entity<SkillGapAnalysis>(entity =>
        {
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.EmployeeId);
            entity.HasIndex(e => e.SkillId);
            entity.HasIndex(e => e.Gap);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Skill)
                .WithMany()
                .HasForeignKey(e => e.SkillId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        #endregion
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

            entity.HasOne(e => e.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.NoAction); // Fixed cycle
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
            .HasOne(l => l.ApprovedBy)
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
            new LeaveType { Id = 1, Name = "Annual Leave", Description = "Standard yearly vacation", DefaultDaysPerYear = 21, IsPaid = true, RequiresApproval = true, CreatedAt = fixedDate },
            new LeaveType { Id = 2, Name = "Sick Leave", Description = "Medical leave", DefaultDaysPerYear = 15, IsPaid = true, RequiresApproval = true, CreatedAt = fixedDate },
            new LeaveType { Id = 3, Name = "Unpaid Leave", Description = "Leave without pay", DefaultDaysPerYear = 0, IsPaid = false, RequiresApproval = true, CreatedAt = fixedDate }
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

        // --- Product Categories (Marketplace) ---
        modelBuilder.Entity<ProductCategory>().HasData(
            // Main Categories
            new ProductCategory { Id = 1, Name = "Building Materials", NameAr = "مواد البناء", Icon = "building", IsApproved = true, IsSystemCategory = true, SortOrder = 1, CreatedAt = fixedDate },
            new ProductCategory { Id = 2, Name = "Finishing Materials", NameAr = "مواد التشطيب", Icon = "paint", IsApproved = true, IsSystemCategory = true, SortOrder = 2, CreatedAt = fixedDate },
            new ProductCategory { Id = 3, Name = "Doors & Windows", NameAr = "أبواب وشبابيك", Icon = "door", IsApproved = true, IsSystemCategory = true, SortOrder = 3, CreatedAt = fixedDate },
            new ProductCategory { Id = 4, Name = "Sanitary Ware", NameAr = "أدوات صحية", Icon = "bath", IsApproved = true, IsSystemCategory = true, SortOrder = 4, CreatedAt = fixedDate },
            new ProductCategory { Id = 5, Name = "Electrical", NameAr = "كهربائيات", Icon = "bolt", IsApproved = true, IsSystemCategory = true, SortOrder = 5, CreatedAt = fixedDate },
            new ProductCategory { Id = 6, Name = "Plumbing", NameAr = "سباكة", Icon = "plumbing", IsApproved = true, IsSystemCategory = true, SortOrder = 6, CreatedAt = fixedDate },
            new ProductCategory { Id = 7, Name = "Tools & Equipment", NameAr = "أدوات ومعدات", Icon = "tools", IsApproved = true, IsSystemCategory = true, SortOrder = 7, CreatedAt = fixedDate },
            new ProductCategory { Id = 8, Name = "Safety Equipment", NameAr = "معدات السلامة", Icon = "safety", IsApproved = true, IsSystemCategory = true, SortOrder = 8, CreatedAt = fixedDate },
            
            // Building Materials Sub-categories
            new ProductCategory { Id = 101, Name = "Cement", NameAr = "أسمنت", Icon = "cement", ParentCategoryId = 1, IsApproved = true, IsSystemCategory = true, SortOrder = 1, CreatedAt = fixedDate },
            new ProductCategory { Id = 102, Name = "Sand & Gravel", NameAr = "رمل وزلط", Icon = "sand", ParentCategoryId = 1, IsApproved = true, IsSystemCategory = true, SortOrder = 2, CreatedAt = fixedDate },
            new ProductCategory { Id = 103, Name = "Steel Rebar", NameAr = "حديد تسليح", Icon = "steel", ParentCategoryId = 1, IsApproved = true, IsSystemCategory = true, SortOrder = 3, CreatedAt = fixedDate },
            new ProductCategory { Id = 104, Name = "Bricks & Blocks", NameAr = "طوب وبلوك", Icon = "brick", ParentCategoryId = 1, IsApproved = true, IsSystemCategory = true, SortOrder = 4, CreatedAt = fixedDate },
            new ProductCategory { Id = 105, Name = "Ready-mix Concrete", NameAr = "خرسانة جاهزة", Icon = "concrete", ParentCategoryId = 1, IsApproved = true, IsSystemCategory = true, SortOrder = 5, CreatedAt = fixedDate },
            
            // Finishing Materials Sub-categories
            new ProductCategory { Id = 201, Name = "Ceramics & Tiles", NameAr = "سيراميك وبلاط", Icon = "tile", ParentCategoryId = 2, IsApproved = true, IsSystemCategory = true, SortOrder = 1, CreatedAt = fixedDate },
            new ProductCategory { Id = 202, Name = "Paints & Coatings", NameAr = "دهان وطلاء", Icon = "paint", ParentCategoryId = 2, IsApproved = true, IsSystemCategory = true, SortOrder = 2, CreatedAt = fixedDate },
            new ProductCategory { Id = 203, Name = "Flooring", NameAr = "أرضيات", Icon = "floor", ParentCategoryId = 2, IsApproved = true, IsSystemCategory = true, SortOrder = 3, CreatedAt = fixedDate },
            new ProductCategory { Id = 204, Name = "False Ceilings", NameAr = "أسقف معلقة", Icon = "ceiling", ParentCategoryId = 2, IsApproved = true, IsSystemCategory = true, SortOrder = 4, CreatedAt = fixedDate },
            new ProductCategory { Id = 205, Name = "Wallpaper & Decor", NameAr = "ورق حائط وديكور", Icon = "wallpaper", ParentCategoryId = 2, IsApproved = true, IsSystemCategory = true, SortOrder = 5, CreatedAt = fixedDate },
            
            // Doors & Windows Sub-categories
            new ProductCategory { Id = 301, Name = "Wooden Doors", NameAr = "أبواب خشب", Icon = "door-wood", ParentCategoryId = 3, IsApproved = true, IsSystemCategory = true, SortOrder = 1, CreatedAt = fixedDate },
            new ProductCategory { Id = 302, Name = "Aluminum Doors", NameAr = "أبواب ألومنيوم", Icon = "door-alu", ParentCategoryId = 3, IsApproved = true, IsSystemCategory = true, SortOrder = 2, CreatedAt = fixedDate },
            new ProductCategory { Id = 303, Name = "PVC Windows", NameAr = "شبابيك PVC", Icon = "window-pvc", ParentCategoryId = 3, IsApproved = true, IsSystemCategory = true, SortOrder = 3, CreatedAt = fixedDate },
            new ProductCategory { Id = 304, Name = "Aluminum Windows", NameAr = "شبابيك ألومنيوم", Icon = "window-alu", ParentCategoryId = 3, IsApproved = true, IsSystemCategory = true, SortOrder = 4, CreatedAt = fixedDate },
            new ProductCategory { Id = 305, Name = "Door Hardware", NameAr = "أدوات أبواب", Icon = "hardware", ParentCategoryId = 3, IsApproved = true, IsSystemCategory = true, SortOrder = 5, CreatedAt = fixedDate },
            
            // Sanitary Ware Sub-categories
            new ProductCategory { Id = 401, Name = "Bathroom Fixtures", NameAr = "أدوات حمامات", Icon = "bath", ParentCategoryId = 4, IsApproved = true, IsSystemCategory = true, SortOrder = 1, CreatedAt = fixedDate },
            new ProductCategory { Id = 402, Name = "Kitchen Fixtures", NameAr = "أدوات مطابخ", Icon = "kitchen", ParentCategoryId = 4, IsApproved = true, IsSystemCategory = true, SortOrder = 2, CreatedAt = fixedDate },
            new ProductCategory { Id = 403, Name = "Faucets & Mixers", NameAr = "خلاطات", Icon = "faucet", ParentCategoryId = 4, IsApproved = true, IsSystemCategory = true, SortOrder = 3, CreatedAt = fixedDate },
            
            // Electrical Sub-categories
            new ProductCategory { Id = 501, Name = "Wires & Cables", NameAr = "أسلاك وكابلات", Icon = "cable", ParentCategoryId = 5, IsApproved = true, IsSystemCategory = true, SortOrder = 1, CreatedAt = fixedDate },
            new ProductCategory { Id = 502, Name = "Electrical Panels", NameAr = "لوحات كهربائية", Icon = "panel", ParentCategoryId = 5, IsApproved = true, IsSystemCategory = true, SortOrder = 2, CreatedAt = fixedDate },
            new ProductCategory { Id = 503, Name = "Lighting", NameAr = "إضاءة", Icon = "light", ParentCategoryId = 5, IsApproved = true, IsSystemCategory = true, SortOrder = 3, CreatedAt = fixedDate },
            new ProductCategory { Id = 504, Name = "Switches & Sockets", NameAr = "مفاتيح ومآخذ", Icon = "switch", ParentCategoryId = 5, IsApproved = true, IsSystemCategory = true, SortOrder = 4, CreatedAt = fixedDate },
            
            // Plumbing Sub-categories
            new ProductCategory { Id = 601, Name = "Pipes", NameAr = "مواسير", Icon = "pipe", ParentCategoryId = 6, IsApproved = true, IsSystemCategory = true, SortOrder = 1, CreatedAt = fixedDate },
            new ProductCategory { Id = 602, Name = "Fittings & Valves", NameAr = "وصلات ومحابس", Icon = "valve", ParentCategoryId = 6, IsApproved = true, IsSystemCategory = true, SortOrder = 2, CreatedAt = fixedDate },
            new ProductCategory { Id = 603, Name = "Water Heaters", NameAr = "سخانات مياه", Icon = "heater", ParentCategoryId = 6, IsApproved = true, IsSystemCategory = true, SortOrder = 3, CreatedAt = fixedDate }
        );

    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        
        foreach (var entry in ChangeTracker.Entries<ICompanyEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                // Prioritize the context's CompanyId (from header/JWT) 
                // but fall back to existing value if explicitly set and context is null
                if (_companyContext.CompanyId.HasValue)
                {
                    entry.Entity.CompanyId = _companyContext.CompanyId.Value;
                }
            }
        }
        
        return await base.SaveChangesAsync(cancellationToken);
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
    private void ConfigureTrainingEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TrainingEnrollment>(entity =>
        {
            entity.HasOne(e => e.TrainingProgram)
                .WithMany(p => p.Enrollments)
                .HasForeignKey(e => e.TrainingProgramId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasOne(e => e.Quiz)
                .WithMany(q => q.Attempts)
                .HasForeignKey(e => e.QuizId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Enrollment)
                .WithMany(en => en.QuizAttempts)
                .HasForeignKey(e => e.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<QuizResponse>(entity =>
        {
            entity.HasOne(e => e.Attempt)
                .WithMany(a => a.Responses)
                .HasForeignKey(e => e.AttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Question)
                .WithMany()
                .HasForeignKey(e => e.QuestionId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }

    private void ConfigureProjectItemTaskEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProjectItemTask>(entity =>
        {
            entity.HasOne(e => e.ProjectItem)
                .WithMany(pi => pi.Tasks)
                .HasForeignKey(e => e.ProjectItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AssignedToUser)
                .WithMany()
                .HasForeignKey(e => e.AssignedToUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ProjectItemTaskAttachment>(entity =>
        {
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Attachments)
                .HasForeignKey(e => e.ProjectItemTaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.UploadedByUser)
                .WithMany()
                .HasForeignKey(e => e.UploadedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ProjectItemTaskHistory>(entity =>
        {
            entity.HasOne(e => e.Task)
                .WithMany(t => t.History)
                .HasForeignKey(e => e.ProjectItemTaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ChangedByUser)
                .WithMany()
                .HasForeignKey(e => e.ChangedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ProjectItemTaskReview>(entity =>
        {
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Reviews)
                .HasForeignKey(e => e.ProjectItemTaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ReviewerUser)
                .WithMany()
                .HasForeignKey(e => e.ReviewerUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }

    private void ConfigureCallEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CallParticipant>(entity =>
        {
            entity.HasOne(e => e.CallSession)
                .WithMany(s => s.Participants)
                .HasForeignKey(e => e.CallSessionId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<CallSignal>(entity =>
        {
            entity.HasOne(e => e.CallSession)
                .WithMany(s => s.Signals)
                .HasForeignKey(e => e.CallSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Sender)
                .WithMany()
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<CallRecording>(entity =>
        {
            entity.HasOne(e => e.CallSession)
                .WithMany()
                .HasForeignKey(e => e.CallSessionId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }

    private void ConfigurePerformanceEvaluationEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PerformanceEvaluation>(entity =>
        {
            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Manager)
                .WithMany()
                .HasForeignKey(e => e.ManagerId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<PeerFeedback>(entity =>
        {
            entity.HasOne(e => e.Evaluation)
                .WithMany(ev => ev.PeerFeedbacks)
                .HasForeignKey(e => e.EvaluationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Reviewer)
                .WithMany()
                .HasForeignKey(e => e.ReviewerId)
                .OnDelete(DeleteBehavior.NoAction);
        });
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

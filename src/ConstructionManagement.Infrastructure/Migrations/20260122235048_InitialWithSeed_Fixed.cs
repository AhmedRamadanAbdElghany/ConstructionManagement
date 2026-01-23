using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialWithSeed_Fixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanySettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnableDelayNotification = table.Column<bool>(type: "bit", nullable: false),
                    DelayNotificationIsOneTimeOnly = table.Column<bool>(type: "bit", nullable: false),
                    DelayNotificationIntervalDays = table.Column<int>(type: "int", nullable: false),
                    DelayNotificationSendEmail = table.Column<bool>(type: "bit", nullable: false),
                    DelayGracePeriodDays = table.Column<int>(type: "int", nullable: false),
                    EnablePhotoUpload = table.Column<bool>(type: "bit", nullable: false),
                    RequirePhotoReview = table.Column<bool>(type: "bit", nullable: false),
                    PhotoApproverRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EnableInvoiceReview = table.Column<bool>(type: "bit", nullable: false),
                    EnableInvoiceAggregation = table.Column<bool>(type: "bit", nullable: false),
                    MaxPhotosPerUpload = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanySettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => new { x.RoleId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Link = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OwnerUserId = table.Column<int>(type: "int", nullable: false),
                    GeneralManagerUserId = table.Column<int>(type: "int", nullable: true),
                    ClosedByUserId = table.Column<int>(type: "int", nullable: true),
                    IsClosed = table.Column<bool>(type: "bit", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountingSystem = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalContractValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_Users_ClosedByUserId",
                        column: x => x.ClosedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Projects_Users_GeneralManagerUserId",
                        column: x => x.GeneralManagerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Projects_Users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BOQItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountingType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOQItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BOQItems_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClientPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    PaymentNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    AttachmentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientPayments_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectRoles_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    EnableDelayNotification = table.Column<bool>(type: "bit", nullable: true),
                    DelayNotificationIsOneTimeOnly = table.Column<bool>(type: "bit", nullable: true),
                    DelayNotificationIntervalDays = table.Column<int>(type: "int", nullable: true),
                    DelayNotificationSendEmail = table.Column<bool>(type: "bit", nullable: true),
                    DelayGracePeriodDays = table.Column<int>(type: "int", nullable: true),
                    EnablePhotoUpload = table.Column<bool>(type: "bit", nullable: true),
                    RequirePhotoReview = table.Column<bool>(type: "bit", nullable: true),
                    PhotoApproverRole = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnableInvoiceReview = table.Column<bool>(type: "bit", nullable: true),
                    EnableInvoiceAggregation = table.Column<bool>(type: "bit", nullable: true),
                    MaxPhotosPerUpload = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectSettings_Projects_Id",
                        column: x => x.Id,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTeam",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ReportsToUserId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTeam", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectTeam_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectTeam_Users_ReportsToUserId",
                        column: x => x.ReportsToUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectTeam_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BOQMeasured",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    AgreedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExecutedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOQMeasured", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BOQMeasured_BOQItems_Id",
                        column: x => x.Id,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BOQProfitabilityLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    TotalSpent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EstimatedBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CurrentProfit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LogDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOQProfitabilityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BOQProfitabilityLogs_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BOQSupervision",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    SupervisionPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BaseCalculation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomBaseAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EstimatedTotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOQSupervision", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BOQSupervision_BOQItems_Id",
                        column: x => x.Id,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EscalationLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    BOQItemId = table.Column<int>(type: "int", nullable: true),
                    EscalationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecipientUserId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentByEmail = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EscalationLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EscalationLogs_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EscalationLogs_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EscalationLogs_Users_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemDailyLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    LogDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DailyProgressPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ProgressNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsClosed = table.Column<bool>(type: "bit", nullable: false),
                    ClosingNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    ClosedByUserId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemDailyLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemDailyLogs_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemDailyLogs_Users_ClosedByUserId",
                        column: x => x.ClosedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemDailyLogs_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemInvoices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SupplierVendor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewerUserId = table.Column<int>(type: "int", nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AttachmentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemInvoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemInvoices_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemInvoices_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemInvoices_Users_ReviewerUserId",
                        column: x => x.ReviewerUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectApprovalRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    BOQItemId = table.Column<int>(type: "int", nullable: true),
                    Source = table.Column<int>(type: "int", nullable: false),
                    UploaderRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApproverRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResponseTimeoutHours = table.Column<int>(type: "int", nullable: false),
                    EscalationRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectApprovalRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectApprovalRules_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectApprovalRules_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SiteMedias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    BOQItemId = table.Column<int>(type: "int", nullable: true),
                    UploaderUserId = table.Column<int>(type: "int", nullable: false),
                    ReviewerUserId = table.Column<int>(type: "int", nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MediaType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Source = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteMedias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SiteMedias_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SiteMedias_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SiteMedias_Users_ReviewerUserId",
                        column: x => x.ReviewerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SiteMedias_Users_UploaderUserId",
                        column: x => x.UploaderUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    BOQItemId = table.Column<int>(type: "int", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SupplierName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttachmentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectRolePermissions",
                columns: table => new
                {
                    ProjectRoleId = table.Column<int>(type: "int", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectRolePermissions", x => new { x.ProjectRoleId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_ProjectRolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectRolePermissions_ProjectRoles_ProjectRoleId",
                        column: x => x.ProjectRoleId,
                        principalTable: "ProjectRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTeamRoles",
                columns: table => new
                {
                    ProjectTeamMemberId = table.Column<int>(type: "int", nullable: false),
                    ProjectRoleId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Id = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTeamRoles", x => new { x.ProjectTeamMemberId, x.ProjectRoleId });
                    table.ForeignKey(
                        name: "FK_ProjectTeamRoles_ProjectRoles_ProjectRoleId",
                        column: x => x.ProjectRoleId,
                        principalTable: "ProjectRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectTeamRoles_ProjectTeam_ProjectTeamMemberId",
                        column: x => x.ProjectTeamMemberId,
                        principalTable: "ProjectTeam",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BOQItemNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    NoteText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NoteType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatorUserId = table.Column<int>(type: "int", nullable: false),
                    VisibleToRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RelatedMediaId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOQItemNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BOQItemNotes_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BOQItemNotes_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BOQItemNotes_SiteMedias_RelatedMediaId",
                        column: x => x.RelatedMediaId,
                        principalTable: "SiteMedias",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BOQItemNotes_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "CompanySettings",
                columns: new[] { "Id", "CreatedAt", "DelayGracePeriodDays", "DelayNotificationIntervalDays", "DelayNotificationIsOneTimeOnly", "DelayNotificationSendEmail", "EnableDelayNotification", "EnableInvoiceAggregation", "EnableInvoiceReview", "EnablePhotoUpload", "MaxPhotosPerUpload", "PhotoApproverRole", "RequirePhotoReview", "UpdatedAt" },
                values: new object[] { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, 7, false, true, true, true, true, true, 15, "مراجع فني", true, null });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "CreatedAt", "Description", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "تعديل بيانات المشروع", "Project.Edit", null },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "إغلاق/إنهاء المشروع", "Project.Close", null },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "عرض الملخص المالي", "Financials.View", null },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "إضافة معاملة مالية", "Transaction.Add", null },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مراجعة/اعتماد المعاملات", "Transaction.Review", null },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مراجعة الصور والفيديوهات", "Media.Review", null },
                    { 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "إغلاق السجل اليومي", "DailyLog.Close", null },
                    { 8, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "اعتماد الفواتير", "Invoice.Approve", null },
                    { 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "تعديل إعدادات المشروع", "Settings.Manage", null },
                    { 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "إدارة المستخدمين (عالمي)", "Users.Manage", null }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "Description", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مدير النظام الكلي – كل الصلاحيات", "SuperAdmin", null },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مدير الشركة – إدارة مستخدمين ومشاريع", "CompanyAdmin", null },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مشاهد فقط – لا تعديل", "Viewer", null }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "PasswordHash", "Phone", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "super@company.com", "Super Admin", "hashed_super123", null, null },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@company.com", "Company Admin", "hashed_admin123", null, null },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ahmed.pm1@demo.com", "Ahmed – Project Manager 1", "hashed_pm123", null, null },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "mohamed.engineer@demo.com", "Mohamed – Site Engineer", "hashed_eng123", null, null },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "sara.reviewer@demo.com", "Sara – Financial Reviewer", "hashed_rev123", null, null },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "pm2@demo.com", "Project Manager 2", "hashed_pm223", null, null }
                });

            migrationBuilder.InsertData(
                table: "Notifications",
                columns: new[] { "Id", "CreatedAt", "IsRead", "Link", "Message", "Priority", "ReadAt", "Title", "Type", "UpdatedAt", "UserId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, null, "البند B-02 متأخر", 1, null, "تحذير تأخير", 1, null, 3 },
                    { 2, new DateTime(2026, 1, 20, 14, 30, 0, 0, DateTimeKind.Utc), false, null, "صورة/فيديو جديد يحتاج مراجعة", 1, null, "مراجعة وسائط", 8, null, 5 }
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "AccountingSystem", "ClosedAt", "ClosedByUserId", "CreatedAt", "Description", "EndDate", "GeneralManagerUserId", "IsClosed", "OwnerUserId", "ProjectName", "StartDate", "Status", "TotalContractValue", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Mixed", null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مشروع سكني لاختبار كامل النظام", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), 3, false, 1, "فيلا القاهرة الجديدة – التجريبي", new DateTime(2025, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "جاري", 12000000m, null },
                    { 2, "Measured", null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مشروع تجاري لاختبار تعدد المشاريع", null, 6, false, 2, "مبنى إداري – مدينة نصر", new DateTime(2025, 12, 1, 0, 0, 0, 0, DateTimeKind.Utc), "جديد", 8500000m, null }
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { 3, 1 },
                    { 9, 1 },
                    { 10, 1 },
                    { 3, 2 },
                    { 9, 2 }
                });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "RoleId", "UserId", "AssignedAt" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "BOQItems",
                columns: new[] { "Id", "AccountingType", "CreatedAt", "Description", "EndDate", "ItemCode", "ItemName", "ProjectId", "StartDate", "Status", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Measured", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2026, 1, 16, 0, 0, 0, 0, DateTimeKind.Utc), "A-01", "حفر أساسات", 1, new DateTime(2025, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "جاري", "م³", null },
                    { 2, "Measured", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "B-02", "صب خرسانة أساسات", 1, null, "جديد", "م³", null },
                    { 3, "Supervision", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "C-01", "إشراف عام", 1, null, "جاري", null, null },
                    { 4, "Measured", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "X-01", "بناء هيكل", 2, null, "جاري", "م²", null }
                });

            migrationBuilder.InsertData(
                table: "ClientPayments",
                columns: new[] { "Id", "Amount", "AttachmentPath", "CreatedAt", "Description", "IsConfirmed", "PaymentDate", "PaymentNumber", "PaymentType", "ProjectId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 2000000m, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, 1, null },
                    { 2, 1000000m, null, new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, 2, null }
                });

            migrationBuilder.InsertData(
                table: "ProjectRoles",
                columns: new[] { "Id", "CreatedAt", "Description", "Name", "ProjectId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "كل الصلاحيات", "مدير المشروع", 1, null },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "رفع وسجل يومي", "مهندس ميداني", 1, null },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "مراجعة فقط", "مراجع فني", 1, null },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "كل الصلاحيات", "مدير المشروع 2", 2, null },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "إدارة معاملات وفواتير", "محاسب", 2, null }
                });

            migrationBuilder.InsertData(
                table: "ProjectSettings",
                columns: new[] { "Id", "CreatedAt", "DelayGracePeriodDays", "DelayNotificationIntervalDays", "DelayNotificationIsOneTimeOnly", "DelayNotificationSendEmail", "EnableDelayNotification", "EnableInvoiceAggregation", "EnableInvoiceReview", "EnablePhotoUpload", "MaxPhotosPerUpload", "PhotoApproverRole", "RequirePhotoReview", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 5, null, null, true, null, null, null, 20, "مراجع فني", true, null },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, null, false, null, null, true, null, null, false, null }
                });

            migrationBuilder.InsertData(
                table: "ProjectTeam",
                columns: new[] { "Id", "CreatedAt", "ProjectId", "ReportsToUserId", "UpdatedAt", "UserId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, null, 3 },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 3, null, 4 },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 3, null, 5 },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, null, null, 6 }
                });

            migrationBuilder.InsertData(
                table: "BOQMeasured",
                columns: new[] { "Id", "AgreedQuantity", "CreatedAt", "ExecutedQuantity", "UnitPrice", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1200m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 600m, 450m, null },
                    { 2, 800m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0m, 1850m, null },
                    { 4, 5000m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1200m, 320m, null }
                });

            migrationBuilder.InsertData(
                table: "BOQSupervision",
                columns: new[] { "Id", "BaseCalculation", "CreatedAt", "CustomBaseAmount", "EstimatedTotalCost", "SupervisionPercentage", "UpdatedAt" },
                values: new object[] { 3, "AllProjectInvoices", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 1020000m, 8.5m, null });

            migrationBuilder.InsertData(
                table: "EscalationLogs",
                columns: new[] { "Id", "BOQItemId", "CreatedAt", "EscalationType", "Message", "ProjectId", "RecipientUserId", "SentAt", "SentByEmail", "UpdatedAt" },
                values: new object[] { 1, 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ItemStartDelay", "", 1, 3, new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), false, null });

            migrationBuilder.InsertData(
                table: "ItemInvoices",
                columns: new[] { "Id", "Amount", "AttachmentPath", "BOQItemId", "CreatedAt", "Description", "InvoiceDate", "InvoiceNumber", "ProjectId", "RejectionReason", "ReviewDate", "ReviewerUserId", "Status", "SupplierVendor", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 120000m, null, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, 1, null, null, null, "Pending", null, null },
                    { 2, 300000m, null, 2, new DateTime(2025, 12, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, 1, null, null, 5, "Approved", null, null }
                });

            migrationBuilder.InsertData(
                table: "ProjectRolePermissions",
                columns: new[] { "PermissionId", "ProjectRoleId" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 2, 1 },
                    { 3, 1 },
                    { 4, 1 },
                    { 5, 1 },
                    { 6, 1 },
                    { 7, 1 },
                    { 8, 1 },
                    { 9, 1 },
                    { 4, 2 },
                    { 6, 2 },
                    { 7, 2 },
                    { 5, 3 },
                    { 6, 3 },
                    { 8, 3 },
                    { 1, 4 },
                    { 2, 4 },
                    { 3, 4 },
                    { 4, 4 },
                    { 5, 4 },
                    { 6, 4 },
                    { 7, 4 },
                    { 8, 4 },
                    { 9, 4 },
                    { 3, 5 },
                    { 4, 5 },
                    { 5, 5 },
                    { 8, 5 }
                });

            migrationBuilder.InsertData(
                table: "ProjectTeamRoles",
                columns: new[] { "ProjectRoleId", "ProjectTeamMemberId", "AssignedAt", "CreatedAt", "Id", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null },
                    { 2, 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null },
                    { 3, 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null },
                    { 4, 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null }
                });

            migrationBuilder.InsertData(
                table: "SiteMedias",
                columns: new[] { "Id", "BOQItemId", "CreatedAt", "Description", "FilePath", "IsApproved", "MediaType", "ProjectId", "RejectionReason", "ReviewDate", "ReviewerUserId", "Source", "Status", "UpdatedAt", "UploaderUserId" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "", false, "Photo", 1, null, null, null, 0, "Pending", null, 4 },
                    { 2, 1, new DateTime(2025, 12, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "", false, "Video", 1, null, null, 5, 0, "Approved", null, 4 }
                });

            migrationBuilder.InsertData(
                table: "Transactions",
                columns: new[] { "Id", "Amount", "AttachmentPath", "BOQItemId", "CreatedAt", "CreatedByUserId", "Description", "InvoiceNumber", "ProjectId", "ReviewDate", "ReviewNotes", "ReviewedByUserId", "Status", "SupplierName", "TransactionDate", "Type", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 150000m, null, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, null, null, 1, null, null, null, 1, null, new DateTime(2026, 1, 22, 23, 50, 47, 846, DateTimeKind.Utc).AddTicks(1713), 0, null },
                    { 2, 80000m, null, 1, new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), 4, null, null, 1, null, null, null, 0, null, new DateTime(2026, 1, 22, 23, 50, 47, 846, DateTimeKind.Utc).AddTicks(2273), 0, null },
                    { 3, 400000m, null, 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, null, null, 2, null, null, null, 1, null, new DateTime(2026, 1, 22, 23, 50, 47, 846, DateTimeKind.Utc).AddTicks(2275), 0, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BOQItemNotes_BOQItemId",
                table: "BOQItemNotes",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQItemNotes_CreatorUserId",
                table: "BOQItemNotes",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQItemNotes_ProjectId",
                table: "BOQItemNotes",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQItemNotes_RelatedMediaId",
                table: "BOQItemNotes",
                column: "RelatedMediaId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQItems_ProjectId",
                table: "BOQItems",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQProfitabilityLogs_BOQItemId",
                table: "BOQProfitabilityLogs",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientPayments_ProjectId",
                table: "ClientPayments",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySettings_Id",
                table: "CompanySettings",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EscalationLogs_BOQItemId",
                table: "EscalationLogs",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_EscalationLogs_ProjectId",
                table: "EscalationLogs",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_EscalationLogs_RecipientUserId",
                table: "EscalationLogs",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemDailyLogs_BOQItemId_LogDate",
                table: "ItemDailyLogs",
                columns: new[] { "BOQItemId", "LogDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemDailyLogs_ClosedByUserId",
                table: "ItemDailyLogs",
                column: "ClosedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemDailyLogs_CreatedByUserId",
                table: "ItemDailyLogs",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_BOQItemId",
                table: "ItemInvoices",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_ProjectId",
                table: "ItemInvoices",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_ReviewerUserId",
                table: "ItemInvoices",
                column: "ReviewerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectApprovalRules_BOQItemId",
                table: "ProjectApprovalRules",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectApprovalRules_ProjectId",
                table: "ProjectApprovalRules",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRolePermissions_PermissionId",
                table: "ProjectRolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRoles_ProjectId",
                table: "ProjectRoles",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ClosedByUserId",
                table: "Projects",
                column: "ClosedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_GeneralManagerUserId",
                table: "Projects",
                column: "GeneralManagerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OwnerUserId",
                table: "Projects",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeam_ProjectId_UserId",
                table: "ProjectTeam",
                columns: new[] { "ProjectId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeam_ReportsToUserId",
                table: "ProjectTeam",
                column: "ReportsToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeam_UserId",
                table: "ProjectTeam",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeamRoles_ProjectRoleId",
                table: "ProjectTeamRoles",
                column: "ProjectRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_SiteMedias_BOQItemId",
                table: "SiteMedias",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_SiteMedias_ProjectId",
                table: "SiteMedias",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SiteMedias_ReviewerUserId",
                table: "SiteMedias",
                column: "ReviewerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SiteMedias_UploaderUserId",
                table: "SiteMedias",
                column: "UploaderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_BOQItemId",
                table: "Transactions",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CreatedByUserId",
                table: "Transactions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ProjectId",
                table: "Transactions",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ReviewedByUserId",
                table: "Transactions",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BOQItemNotes");

            migrationBuilder.DropTable(
                name: "BOQMeasured");

            migrationBuilder.DropTable(
                name: "BOQProfitabilityLogs");

            migrationBuilder.DropTable(
                name: "BOQSupervision");

            migrationBuilder.DropTable(
                name: "ClientPayments");

            migrationBuilder.DropTable(
                name: "CompanySettings");

            migrationBuilder.DropTable(
                name: "EscalationLogs");

            migrationBuilder.DropTable(
                name: "ItemDailyLogs");

            migrationBuilder.DropTable(
                name: "ItemInvoices");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ProjectApprovalRules");

            migrationBuilder.DropTable(
                name: "ProjectRolePermissions");

            migrationBuilder.DropTable(
                name: "ProjectSettings");

            migrationBuilder.DropTable(
                name: "ProjectTeamRoles");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "SiteMedias");

            migrationBuilder.DropTable(
                name: "ProjectRoles");

            migrationBuilder.DropTable(
                name: "ProjectTeam");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "BOQItems");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}

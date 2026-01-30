using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                name: "InvoiceSequences",
                columns: table => new
                {
                    YearPart = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NextNumber = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceSequences", x => x.YearPart);
                });

            migrationBuilder.CreateTable(
                name: "Packages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxTeamMembers = table.Column<int>(type: "int", nullable: false),
                    MaxDailyPhotos = table.Column<int>(type: "int", nullable: false),
                    MaxBOQItems = table.Column<int>(type: "int", nullable: false),
                    AllowAdvancedReports = table.Column<bool>(type: "bit", nullable: false),
                    AllowCustomBranding = table.Column<bool>(type: "bit", nullable: false),
                    AllowAIAssistance = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Packages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OwnerUserId = table.Column<int>(type: "int", nullable: false),
                    GeneralManagerUserId = table.Column<int>(type: "int", nullable: true),
                    ClosedByUserId = table.Column<int>(type: "int", nullable: true),
                    PackageId = table.Column<int>(type: "int", nullable: true),
                    IsClosed = table.Column<bool>(type: "bit", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountingSystem = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalContractValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserId1 = table.Column<int>(type: "int", nullable: true),
                    UserId2 = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_Packages_PackageId",
                        column: x => x.PackageId,
                        principalTable: "Packages",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_Users_ClosedByUserId",
                        column: x => x.ClosedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_Users_GeneralManagerUserId",
                        column: x => x.GeneralManagerUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_Users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_Users_UserId2",
                        column: x => x.UserId2,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ClientPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                name: "ProjectTeamMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ReportsToUserId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTeamMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectTeamMembers_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTeamMembers_Users_ReportsToUserId",
                        column: x => x.ReportsToUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectTeamMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BOQExecutedDeltas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    DeltaQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeltaDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangeType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOQExecutedDeltas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BOQExecutedDeltas_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BOQExecutedDeltas_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BOQMeasured",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EscalationLogs_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    LogDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DailyProgressPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ProgressNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsClosed = table.Column<bool>(type: "bit", nullable: false),
                    ClosingNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    ClosedByUserId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserId1 = table.Column<int>(type: "int", nullable: true),
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
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ItemDailyLogs_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ItemDailyLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ItemDailyLogs_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ItemInvoices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RetentionRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RetentionAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SupplierVendor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AttachmentPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReviewerUserId = table.Column<int>(type: "int", nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserId1 = table.Column<int>(type: "int", nullable: true),
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
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemInvoices_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ItemInvoices_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ItemInvoices_Users_ReviewerUserId",
                        column: x => x.ReviewerUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ItemInvoices_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ItemInvoices_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectApprovalRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserId1 = table.Column<int>(type: "int", nullable: true),
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
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SiteMedias_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SiteMedias_Users_ReviewerUserId",
                        column: x => x.ReviewerUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SiteMedias_Users_UploaderUserId",
                        column: x => x.UploaderUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SiteMedias_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SiteMedias_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserId1 = table.Column<int>(type: "int", nullable: true),
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
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Transactions_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Transactions_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Transactions_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Transactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Transactions_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectRolePermissions",
                columns: table => new
                {
                    ProjectRoleId = table.Column<int>(type: "int", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProjectTeamMemberId = table.Column<int>(type: "int", nullable: false),
                    ProjectRoleId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTeamRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectTeamRoles_ProjectRoles_ProjectRoleId",
                        column: x => x.ProjectRoleId,
                        principalTable: "ProjectRoles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectTeamRoles_ProjectTeamMembers_ProjectTeamMemberId",
                        column: x => x.ProjectTeamMemberId,
                        principalTable: "ProjectTeamMembers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ApprovalRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    BOQItemId = table.Column<int>(type: "int", nullable: true),
                    ProjectApprovalRuleId = table.Column<int>(type: "int", nullable: true),
                    Source = table.Column<int>(type: "int", nullable: false),
                    SourceId = table.Column<int>(type: "int", nullable: false),
                    RequestedByUserId = table.Column<int>(type: "int", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FinalApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinalApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalRequests_BOQItems_BOQItemId",
                        column: x => x.BOQItemId,
                        principalTable: "BOQItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ApprovalRequests_ProjectApprovalRules_ProjectApprovalRuleId",
                        column: x => x.ProjectApprovalRuleId,
                        principalTable: "ProjectApprovalRules",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApprovalRequests_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApprovalRequests_Users_FinalApprovedByUserId",
                        column: x => x.FinalApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApprovalRequests_Users_RequestedByUserId",
                        column: x => x.RequestedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BOQItemNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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

            migrationBuilder.CreateTable(
                name: "ApprovalSteps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApprovalRequestId = table.Column<int>(type: "int", nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    ApproverRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApproverUserId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalSteps_ApprovalRequests_ApprovalRequestId",
                        column: x => x.ApprovalRequestId,
                        principalTable: "ApprovalRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovalSteps_Users_ApproverUserId",
                        column: x => x.ApproverUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "CompanySettings",
                columns: new[] { "Id", "CreatedAt", "DelayGracePeriodDays", "DelayNotificationIntervalDays", "DelayNotificationIsOneTimeOnly", "DelayNotificationSendEmail", "EnableDelayNotification", "EnableInvoiceAggregation", "EnableInvoiceReview", "EnablePhotoUpload", "MaxPhotosPerUpload", "PhotoApproverRole", "RequirePhotoReview", "TenantId", "UpdatedAt" },
                values: new object[] { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 7, false, true, true, true, true, true, 10, "MediaReviewer", true, "ConstructionDB", null });

            migrationBuilder.InsertData(
                table: "Packages",
                columns: new[] { "Id", "AllowAIAssistance", "AllowAdvancedReports", "AllowCustomBranding", "CreatedAt", "Description", "MaxBOQItems", "MaxDailyPhotos", "MaxTeamMembers", "Name", "Price", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, false, false, false, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Starter plan", 50, 20, 5, "Free", 0m, null },
                    { 2, false, false, false, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Professional tracking", 200, 20, 20, "Pro", 1500m, null },
                    { 3, true, false, false, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Full enterprise features", 1000, 20, 100, "Premium", 5000m, null }
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "CreatedAt", "Description", "Name", "TenantId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "All", "ConstructionDB", null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "ViewProjects", "ConstructionDB", null },
                    { 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Project.Edit", "ConstructionDB", null },
                    { 11, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Project.Close", "ConstructionDB", null },
                    { 12, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Financials.View", "ConstructionDB", null },
                    { 13, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Transaction.Add", "ConstructionDB", null },
                    { 14, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Transaction.Review", "ConstructionDB", null },
                    { 15, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Media.Review", "ConstructionDB", null },
                    { 16, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "DailyLog.Close", "ConstructionDB", null },
                    { 17, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Settings.Manage", "ConstructionDB", null }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "Description", "Name", "TenantId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "SuperAdmin", "ConstructionDB", null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "CompanyAdmin", "ConstructionDB", null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "User", "ConstructionDB", null }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FirstName", "LastName", "PasswordHash", "Phone", "TenantId", "UpdatedAt", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@construction.com", "System", "Admin", "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6", null, "ConstructionDB", null, "admin" },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ahmed@construction.com", "Ahmed", "Ramadan", "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6", null, "ConstructionDB", null, "ahmed" },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "company_admin@construction.com", "Company", "Admin", "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6", null, "ConstructionDB", null, "company_admin" },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "pm@construction.com", "Project", "Manager", "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6", null, "ConstructionDB", null, "pm" },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "engineer@construction.com", "Site", "Engineer", "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6", null, "ConstructionDB", null, "engineer" },
                    { 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "accountant@construction.com", "Project", "Accountant", "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6", null, "ConstructionDB", null, "accountant" },
                    { 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "consultant@construction.com", "External", "Consultant", "$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6", null, "ConstructionDB", null, "consultant" }
                });

            migrationBuilder.InsertData(
                table: "Notifications",
                columns: new[] { "Id", "CreatedAt", "IsRead", "Link", "Message", "Priority", "ReadAt", "TenantId", "Title", "Type", "UpdatedAt", "UserId" },
                values: new object[] { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, null, "Welcome to the system", 1, null, "ConstructionDB", "Welcome", 0, null, 2 });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "AccountingSystem", "ClosedAt", "ClosedByUserId", "CreatedAt", "Description", "EndDate", "GeneralManagerUserId", "IsClosed", "OwnerUserId", "PackageId", "ProjectName", "StartDate", "Status", "TenantId", "TotalContractValue", "UpdatedAt", "UserId", "UserId1", "UserId2" },
                values: new object[,]
                {
                    { 1, "Measured", null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, false, 1, null, "Al-Massa Tower", null, "InProgress", "ConstructionDB", null, null, null, null, null },
                    { 2, "Supervision", null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, false, 2, null, "Coastal Supervision", null, "جديد", "ConstructionDB", null, null, null, null, null },
                    { 3, "Mixed", null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, false, 1, null, "Smart Mall Mixed", null, "InProgress", "ConstructionDB", null, null, null, null, null }
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "PermissionId", "RoleId", "TenantId" },
                values: new object[,]
                {
                    { 1, 1, "ConstructionDB" },
                    { 1, 2, "ConstructionDB" },
                    { 2, 3, "ConstructionDB" }
                });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "RoleId", "UserId", "AssignedAt", "TenantId" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 1, 30, 18, 38, 20, 107, DateTimeKind.Utc).AddTicks(4591), "ConstructionDB" },
                    { 2, 3, new DateTime(2026, 1, 30, 18, 38, 20, 107, DateTimeKind.Utc).AddTicks(6958), "ConstructionDB" }
                });

            migrationBuilder.InsertData(
                table: "BOQItems",
                columns: new[] { "Id", "AccountingType", "CreatedAt", "Description", "EndDate", "ItemCode", "ItemName", "ProjectId", "StartDate", "Status", "TenantId", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { 101, "Measured", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "CIV-01", "Excavation", 1, null, "InProgress", "ConstructionDB", null, null },
                    { 102, "Measured", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "CIV-02", "Concrete Base", 1, null, "جديد", "ConstructionDB", null, null },
                    { 201, "Supervision", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "SUP-01", "Structural Audit", 2, null, "جديد", "ConstructionDB", null, null },
                    { 301, "Mixed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "MIX-01", "MEP Installation", 3, null, "InProgress", "ConstructionDB", null, null }
                });

            migrationBuilder.InsertData(
                table: "ClientPayments",
                columns: new[] { "Id", "Amount", "AttachmentPath", "CreatedAt", "Description", "IsConfirmed", "PaymentDate", "PaymentNumber", "PaymentType", "ProjectId", "TenantId", "UpdatedAt" },
                values: new object[] { 1, 50000m, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Advance", 1, "ConstructionDB", null });

            migrationBuilder.InsertData(
                table: "EscalationLogs",
                columns: new[] { "Id", "BOQItemId", "CreatedAt", "EscalationType", "Message", "ProjectId", "RecipientUserId", "SentAt", "SentByEmail", "TenantId", "UpdatedAt" },
                values: new object[] { 1, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "StartDelay", "Project delayed", 1, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, "ConstructionDB", null });

            migrationBuilder.InsertData(
                table: "ProjectApprovalRules",
                columns: new[] { "Id", "ApproverRole", "BOQItemId", "CreatedAt", "EscalationRole", "ProjectId", "ResponseTimeoutHours", "Source", "TenantId", "UpdatedAt", "UploaderRole" },
                values: new object[] { 1, "Manager", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "", 1, 0, 0, "ConstructionDB", null, "Engineer" });

            migrationBuilder.InsertData(
                table: "ProjectRoles",
                columns: new[] { "Id", "CreatedAt", "Description", "Name", "ProjectId", "TenantId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Manager", 1, "ConstructionDB", null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Engineer", 1, "ConstructionDB", null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "FinancialReviewer", 1, "ConstructionDB", null },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "MediaReviewer", 1, "ConstructionDB", null }
                });

            migrationBuilder.InsertData(
                table: "ProjectSettings",
                columns: new[] { "Id", "CreatedAt", "DelayGracePeriodDays", "DelayNotificationIntervalDays", "DelayNotificationIsOneTimeOnly", "DelayNotificationSendEmail", "EnableDelayNotification", "EnableInvoiceAggregation", "EnableInvoiceReview", "EnablePhotoUpload", "MaxPhotosPerUpload", "PhotoApproverRole", "RequirePhotoReview", "TenantId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, null, true, null, true, null, null, null, true, "ConstructionDB", null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, null, true, null, false, null, null, null, false, "ConstructionDB", null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, null, false, null, true, null, null, null, true, "ConstructionDB", null }
                });

            migrationBuilder.InsertData(
                table: "ProjectTeamMembers",
                columns: new[] { "Id", "CreatedAt", "ProjectId", "ReportsToUserId", "TenantId", "UpdatedAt", "UserId" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, "ConstructionDB", null, 2 },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, "ConstructionDB", null, 4 },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, "ConstructionDB", null, 5 },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, "ConstructionDB", null, 6 },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, "ConstructionDB", null, 7 }
                });

            migrationBuilder.InsertData(
                table: "ApprovalRequests",
                columns: new[] { "Id", "BOQItemId", "CreatedAt", "FinalApprovedAt", "FinalApprovedByUserId", "ProjectApprovalRuleId", "ProjectId", "RejectionReason", "RequestedAt", "RequestedByUserId", "Source", "SourceId", "Status", "TenantId", "UpdatedAt" },
                values: new object[] { 1, 101, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 1, 1, null, new DateTime(2026, 1, 30, 18, 38, 20, 122, DateTimeKind.Utc).AddTicks(6941), 2, 0, 1, "Approved", "ConstructionDB", null });

            migrationBuilder.InsertData(
                table: "BOQExecutedDeltas",
                columns: new[] { "Id", "BOQItemId", "ChangeType", "CreatedAt", "CreatedByUserId", "DeltaDate", "DeltaQuantity", "ProcessedAt", "ReferenceId", "TenantId", "UpdatedAt" },
                values: new object[] { 1, 101, "DailyLog", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 100m, null, null, "ConstructionDB", null });

            migrationBuilder.InsertData(
                table: "BOQItemNotes",
                columns: new[] { "Id", "BOQItemId", "CreatedAt", "CreatorUserId", "NoteText", "NoteType", "ProjectId", "RelatedMediaId", "TenantId", "UpdatedAt", "VisibleToRole" },
                values: new object[] { 1, 101, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Initial kickoff", "General", 1, null, "ConstructionDB", null, "SiteEngineer" });

            migrationBuilder.InsertData(
                table: "BOQMeasured",
                columns: new[] { "Id", "AgreedQuantity", "CreatedAt", "ExecutedQuantity", "TenantId", "UnitPrice", "UpdatedAt" },
                values: new object[,]
                {
                    { 101, 5000m, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1200m, "ConstructionDB", 150m, null },
                    { 102, 800m, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0m, "ConstructionDB", 4200m, null },
                    { 301, 1m, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0.25m, "ConstructionDB", 500000m, null }
                });

            migrationBuilder.InsertData(
                table: "BOQProfitabilityLogs",
                columns: new[] { "Id", "BOQItemId", "CreatedAt", "CurrentProfit", "EstimatedBudget", "LogDate", "ProfitPercentage", "TenantId", "TotalSpent", "UpdatedAt" },
                values: new object[] { 1, 101, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 11000m, 15000m, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 73.33m, "ConstructionDB", 4000m, null });

            migrationBuilder.InsertData(
                table: "BOQSupervision",
                columns: new[] { "Id", "BaseCalculation", "CreatedAt", "CustomBaseAmount", "EstimatedTotalCost", "SupervisionPercentage", "TenantId", "UpdatedAt" },
                values: new object[,]
                {
                    { 201, "AllProjectInvoices", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 25000m, 5.0m, "ConstructionDB", null },
                    { 301, "ThisItemInvoices", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 12500m, 2.5m, "ConstructionDB", null }
                });

            migrationBuilder.InsertData(
                table: "ItemDailyLogs",
                columns: new[] { "Id", "BOQItemId", "ClosedAt", "ClosedByUserId", "ClosingNotes", "CreatedAt", "CreatedByUserId", "DailyProgressPercentage", "IsClosed", "LogDate", "ProgressNotes", "TenantId", "UpdatedAt", "UserId", "UserId1" },
                values: new object[] { 1, 101, null, 1, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, true, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Testing seed data", "ConstructionDB", null, null, null });

            migrationBuilder.InsertData(
                table: "ItemInvoices",
                columns: new[] { "Id", "AttachmentPath", "BOQItemId", "CreatedAt", "CreatedByUserId", "Currency", "Description", "DueDate", "InvoiceDate", "InvoiceNumber", "NetAmount", "ProjectId", "RejectionReason", "RetentionAmount", "RetentionRate", "ReviewDate", "ReviewerUserId", "Status", "SubTotal", "SupplierVendor", "TaxAmount", "TaxRate", "TenantId", "UpdatedAt", "UserId", "UserId1" },
                values: new object[] { 1, null, 101, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "EGP", null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "V-INV-001", 1000m, 1, null, null, null, null, null, "Approved", 1000m, null, null, null, "ConstructionDB", null, null, null });

            migrationBuilder.InsertData(
                table: "ProjectRolePermissions",
                columns: new[] { "PermissionId", "ProjectRoleId", "TenantId" },
                values: new object[,]
                {
                    { 10, 1, "ConstructionDB" },
                    { 11, 1, "ConstructionDB" },
                    { 16, 1, "ConstructionDB" },
                    { 17, 1, "ConstructionDB" },
                    { 13, 2, "ConstructionDB" },
                    { 12, 3, "ConstructionDB" },
                    { 14, 3, "ConstructionDB" },
                    { 15, 4, "ConstructionDB" }
                });

            migrationBuilder.InsertData(
                table: "ProjectTeamRoles",
                columns: new[] { "Id", "AssignedAt", "CreatedAt", "ProjectRoleId", "ProjectTeamMemberId", "TenantId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 30, 18, 38, 20, 114, DateTimeKind.Utc).AddTicks(9305), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, 1, "ConstructionDB", null },
                    { 2, new DateTime(2026, 1, 30, 18, 38, 20, 115, DateTimeKind.Utc).AddTicks(1144), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 2, "ConstructionDB", null },
                    { 3, new DateTime(2026, 1, 30, 18, 38, 20, 115, DateTimeKind.Utc).AddTicks(1149), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, 3, "ConstructionDB", null },
                    { 4, new DateTime(2026, 1, 30, 18, 38, 20, 115, DateTimeKind.Utc).AddTicks(1152), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 4, "ConstructionDB", null },
                    { 5, new DateTime(2026, 1, 30, 18, 38, 20, 115, DateTimeKind.Utc).AddTicks(1154), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, 5, "ConstructionDB", null }
                });

            migrationBuilder.InsertData(
                table: "SiteMedias",
                columns: new[] { "Id", "BOQItemId", "CreatedAt", "Description", "FilePath", "IsApproved", "MediaType", "ProjectId", "RejectionReason", "ReviewDate", "ReviewerUserId", "Source", "Status", "TenantId", "UpdatedAt", "UploaderUserId", "UserId", "UserId1" },
                values: new object[] { 1, 101, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "site1.jpg", true, "image/jpeg", 1, null, null, null, 0, "Approved", "ConstructionDB", null, 2, null, null });

            migrationBuilder.InsertData(
                table: "Transactions",
                columns: new[] { "Id", "Amount", "AttachmentPath", "BOQItemId", "CreatedAt", "CreatedByUserId", "Description", "InvoiceNumber", "ProjectId", "ReviewDate", "ReviewNotes", "ReviewedByUserId", "Status", "SupplierName", "TenantId", "TransactionDate", "Type", "UpdatedAt", "UserId", "UserId1" },
                values: new object[] { 1, 5000m, null, 101, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, null, 1, null, null, null, 1, null, "ConstructionDB", new DateTime(2026, 1, 30, 18, 38, 20, 118, DateTimeKind.Utc).AddTicks(4652), 0, null, null, null });

            migrationBuilder.InsertData(
                table: "ApprovalSteps",
                columns: new[] { "Id", "ApprovalRequestId", "ApprovedAt", "ApproverRole", "ApproverUserId", "CreatedAt", "IsActive", "Notes", "Status", "StepOrder", "TenantId", "UpdatedAt" },
                values: new object[] { 1, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Manager", 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, null, "Approved", 1, "ConstructionDB", null });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalRequests_BOQItemId",
                table: "ApprovalRequests",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalRequests_FinalApprovedByUserId",
                table: "ApprovalRequests",
                column: "FinalApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalRequests_ProjectApprovalRuleId",
                table: "ApprovalRequests",
                column: "ProjectApprovalRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalRequests_ProjectId",
                table: "ApprovalRequests",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalRequests_RequestedByUserId",
                table: "ApprovalRequests",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalSteps_ApprovalRequestId",
                table: "ApprovalSteps",
                column: "ApprovalRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalSteps_ApproverUserId",
                table: "ApprovalSteps",
                column: "ApproverUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQExecutedDeltas_BOQItemId",
                table: "BOQExecutedDeltas",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQExecutedDeltas_CreatedByUserId",
                table: "BOQExecutedDeltas",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQExecutedDeltas_ProcessedAt",
                table: "BOQExecutedDeltas",
                column: "ProcessedAt");

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
                name: "IX_ItemDailyLogs_UserId",
                table: "ItemDailyLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemDailyLogs_UserId1",
                table: "ItemDailyLogs",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoice_InvoiceNumber_Unique",
                table: "ItemInvoices",
                column: "InvoiceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_BOQItemId",
                table: "ItemInvoices",
                column: "BOQItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_CreatedByUserId",
                table: "ItemInvoices",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_ProjectId",
                table: "ItemInvoices",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_ReviewerUserId",
                table: "ItemInvoices",
                column: "ReviewerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_UserId",
                table: "ItemInvoices",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemInvoices_UserId1",
                table: "ItemInvoices",
                column: "UserId1");

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
                name: "IX_Projects_PackageId",
                table: "Projects",
                column: "PackageId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserId",
                table: "Projects",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserId1",
                table: "Projects",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserId2",
                table: "Projects",
                column: "UserId2");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeamMembers_ProjectId_UserId",
                table: "ProjectTeamMembers",
                columns: new[] { "ProjectId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeamMembers_ReportsToUserId",
                table: "ProjectTeamMembers",
                column: "ReportsToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeamMembers_UserId",
                table: "ProjectTeamMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeamRoles_ProjectRoleId",
                table: "ProjectTeamRoles",
                column: "ProjectRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTeamRoles_ProjectTeamMemberId",
                table: "ProjectTeamRoles",
                column: "ProjectTeamMemberId");

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
                name: "IX_SiteMedias_UserId",
                table: "SiteMedias",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SiteMedias_UserId1",
                table: "SiteMedias",
                column: "UserId1");

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
                name: "IX_Transactions_UserId",
                table: "Transactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserId1",
                table: "Transactions",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            // --- ADDED STORED PROCEDURE ---
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_generateInvoiceNumber
                    @YearPart INT
                AS
                BEGIN
                    SET NOCOUNT ON;
                    DECLARE @NewNumber INT;

                    BEGIN TRANSACTION;
                        IF EXISTS (SELECT 1 FROM InvoiceSequences WITH (UPDLOCK, SERIALIZABLE) WHERE YearPart = @YearPart)
                        BEGIN
                            UPDATE InvoiceSequences
                            SET @NewNumber = NextNumber, NextNumber = NextNumber + 1
                            WHERE YearPart = @YearPart;
                        END
                        ELSE
                        BEGIN
                            SET @NewNumber = 1;
                            INSERT INTO InvoiceSequences (YearPart, NextNumber) VALUES (@YearPart, 2);
                        END
                    COMMIT TRANSACTION;

                    SELECT @NewNumber AS GeneratedNumber;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // --- DROP STORED PROCEDURE ---
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_generateInvoiceNumber");

            migrationBuilder.DropTable(
                name: "ApprovalSteps");

            migrationBuilder.DropTable(
                name: "BOQExecutedDeltas");

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
                name: "InvoiceSequences");

            migrationBuilder.DropTable(
                name: "ItemDailyLogs");

            migrationBuilder.DropTable(
                name: "ItemInvoices");

            migrationBuilder.DropTable(
                name: "Notifications");

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
                name: "ApprovalRequests");

            migrationBuilder.DropTable(
                name: "SiteMedias");

            migrationBuilder.DropTable(
                name: "ProjectRoles");

            migrationBuilder.DropTable(
                name: "ProjectTeamMembers");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "ProjectApprovalRules");

            migrationBuilder.DropTable(
                name: "BOQItems");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Packages");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}

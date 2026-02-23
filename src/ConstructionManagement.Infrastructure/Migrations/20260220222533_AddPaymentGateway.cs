using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentGateway : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalRequests_BOQItems_BOQItemId",
                table: "ApprovalRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_EscalationLogs_BOQItems_BOQItemId",
                table: "EscalationLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemDailyLogs_BOQItems_BOQItemId",
                table: "ItemDailyLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemInvoice_BOQItems_BOQItemId",
                table: "ItemInvoice");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialConsumptions_BOQItems_BOQItemId",
                table: "MaterialConsumptions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectApprovalRules_BOQItems_BOQItemId",
                table: "ProjectApprovalRules");

            migrationBuilder.DropForeignKey(
                name: "FK_SiteMedias_BOQItems_BOQItemId",
                table: "SiteMedias");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_BOQItems_BOQItemId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "BOQExecutedDeltas");

            migrationBuilder.DropTable(
                name: "BOQItemNotes");

            migrationBuilder.DropTable(
                name: "BOQMeasured");

            migrationBuilder.DropTable(
                name: "BOQPackages");

            migrationBuilder.DropTable(
                name: "BOQProfitabilityLogs");

            migrationBuilder.DropTable(
                name: "BOQSupervision");

            migrationBuilder.DropTable(
                name: "BOQItems");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "IsConfirmed",
                table: "ClientPayments");

            migrationBuilder.RenameColumn(
                name: "BOQItemId",
                table: "Transactions",
                newName: "ProjectItemId");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_BOQItemId",
                table: "Transactions",
                newName: "IX_Transactions_ProjectItemId");

            migrationBuilder.RenameColumn(
                name: "BOQItemId",
                table: "SiteMedias",
                newName: "ProjectItemId");

            migrationBuilder.RenameIndex(
                name: "IX_SiteMedias_BOQItemId",
                table: "SiteMedias",
                newName: "IX_SiteMedias_ProjectItemId");

            migrationBuilder.RenameColumn(
                name: "ClientCanSeeBOQ",
                table: "ProjectSettings",
                newName: "ClientCanSeeProjectItems");

            migrationBuilder.RenameColumn(
                name: "BOQItemId",
                table: "ProjectApprovalRules",
                newName: "ProjectItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ProjectApprovalRules_BOQItemId",
                table: "ProjectApprovalRules",
                newName: "IX_ProjectApprovalRules_ProjectItemId");

            migrationBuilder.RenameColumn(
                name: "BOQItemId",
                table: "MaterialConsumptions",
                newName: "ProjectItemId");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialConsumptions_BOQItemId",
                table: "MaterialConsumptions",
                newName: "IX_MaterialConsumptions_ProjectItemId");

            migrationBuilder.RenameColumn(
                name: "BOQItemId",
                table: "ItemInvoice",
                newName: "ProjectItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ItemInvoice_BOQItemId",
                table: "ItemInvoice",
                newName: "IX_ItemInvoice_ProjectItemId");

            migrationBuilder.RenameColumn(
                name: "BOQItemId",
                table: "ItemDailyLogs",
                newName: "ProjectItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ItemDailyLogs_BOQItemId_LogDate",
                table: "ItemDailyLogs",
                newName: "IX_ItemDailyLogs_ProjectItemId_LogDate");

            migrationBuilder.RenameColumn(
                name: "BOQItemId",
                table: "EscalationLogs",
                newName: "ProjectItemId");

            migrationBuilder.RenameIndex(
                name: "IX_EscalationLogs_BOQItemId",
                table: "EscalationLogs",
                newName: "IX_EscalationLogs_ProjectItemId");

            migrationBuilder.RenameColumn(
                name: "EnableBOQManagement",
                table: "CompanySettings",
                newName: "RequirePaymentApproval");

            migrationBuilder.RenameColumn(
                name: "ClientCanSeeBOQ",
                table: "CompanySettings",
                newName: "EnableStripe");

            migrationBuilder.RenameColumn(
                name: "EnableBOQManagement",
                table: "Companies",
                newName: "EnableProjectItemsManagement");

            migrationBuilder.RenameColumn(
                name: "BOQItemId",
                table: "ApprovalRequests",
                newName: "ProjectItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ApprovalRequests_BOQItemId",
                table: "ApprovalRequests",
                newName: "IX_ApprovalRequests_ProjectItemId");

            migrationBuilder.AddColumn<decimal>(
                name: "BaseSalary",
                table: "Users",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceType",
                table: "ItemInvoice",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "FuelCost",
                table: "EquipmentAssignments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "HoursWorked",
                table: "EquipmentAssignments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OperatorCost",
                table: "EquipmentAssignments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WorkValue",
                table: "EquipmentAssignments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ClientCanSeeProjectItems",
                table: "CompanySettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "CompanySettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "EnableBankTransfer",
                table: "CompanySettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EnableOnlinePayments",
                table: "CompanySettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EnablePayPal",
                table: "CompanySettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EnableProjectItemsManagement",
                table: "CompanySettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "MinimumPaymentAmount",
                table: "CompanySettings",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PayPalClientId",
                table: "CompanySettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PayPalClientSecret",
                table: "CompanySettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripePublicKey",
                table: "CompanySettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSecretKey",
                table: "CompanySettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PaymentType",
                table: "ClientPayments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PaymentNumber",
                table: "ClientPayments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "ClientPayments",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "AttachmentPath",
                table: "ClientPayments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "ClientPayments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckDueDate",
                table: "ClientPayments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CheckNumber",
                table: "ClientPayments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmedAt",
                table: "ClientPayments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ConfirmedByUserId",
                table: "ClientPayments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "ClientPayments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "ClientPayments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "ClientPayments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProgressInvoiceId",
                table: "ClientPayments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptNumber",
                table: "ClientPayments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ClientPayments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "EquipmentROIs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    EquipmentId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    PeriodStart = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PeriodEnd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FuelCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaintenanceCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OperatorCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DepreciationCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InsuranceCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OtherCosts = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WorkValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RentalIncome = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HoursWorked = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProjectsCount = table.Column<int>(type: "int", nullable: false),
                    CostPerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RevenuePerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProfitPerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ROI_Percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UtilizationRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PerformanceRating = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquipmentROIs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquipmentROIs_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EquipmentROIs_Equipment_EquipmentId",
                        column: x => x.EquipmentId,
                        principalTable: "Equipment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EquipmentROIs_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GeofenceZones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ZoneType = table.Column<int>(type: "int", nullable: false),
                    CenterLatitude = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CenterLongitude = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RadiusMeters = table.Column<int>(type: "int", nullable: true),
                    PolygonGeoJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    AlertOnEntry = table.Column<bool>(type: "bit", nullable: false),
                    AlertOnExit = table.Column<bool>(type: "bit", nullable: false),
                    AllowedExitDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeofenceZones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GeofenceZones_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GeofenceZones_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceImage",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemInvoiceId = table.Column<int>(type: "int", nullable: false),
                    ImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceImage", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceImage_ItemInvoice_ItemInvoiceId",
                        column: x => x.ItemInvoiceId,
                        principalTable: "ItemInvoice",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OvertimeRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Multiplier = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApplicableDay = table.Column<int>(type: "int", nullable: true),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OvertimeRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OvertimeRules_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    ItemInvoiceId = table.Column<int>(type: "int", nullable: true),
                    ClientPaymentId = table.Column<int>(type: "int", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransactionReference = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GatewayResponse = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RecordedBy = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReceiptUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecorderId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_ClientPayments_ClientPaymentId",
                        column: x => x.ClientPaymentId,
                        principalTable: "ClientPayments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_ItemInvoice_ItemInvoiceId",
                        column: x => x.ItemInvoiceId,
                        principalTable: "ItemInvoice",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Users_RecorderId",
                        column: x => x.RecorderId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProgressInvoice",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PeriodFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PeriodTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InvoiceSequence = table.Column<int>(type: "int", nullable: false),
                    TotalWorkValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PreviousInvoicesTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CurrentWorkValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RetentionPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RetentionAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RetentionPeriodMonths = table.Column<int>(type: "int", nullable: false),
                    RetentionReleaseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RetentionReleased = table.Column<bool>(type: "bit", nullable: false),
                    PreviousRetention = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalRetention = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvanceDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OtherDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgressInvoice", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgressInvoice_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProgressInvoice_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProgressInvoice_Users_ApprovedByUserId",
                        column: x => x.ApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProgressInvoice_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ItemCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    PhaseId = table.Column<int>(type: "int", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AgreedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ExecutedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EstimatedTotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SupervisionPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalPackageValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PaymentTerms = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompletionPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BudgetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BudgetUsed = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EnforceBudget = table.Column<bool>(type: "bit", nullable: false),
                    BudgetWarningThreshold = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProjectId1 = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectItems_Phases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phases",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectItems_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectItems_Projects_ProjectId1",
                        column: x => x.ProjectId1,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EquipmentCostBreakdowns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentId = table.Column<int>(type: "int", nullable: false),
                    EquipmentROIId = table.Column<int>(type: "int", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CostType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    SourceId = table.Column<int>(type: "int", nullable: true),
                    SourceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquipmentCostBreakdowns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquipmentCostBreakdowns_EquipmentROIs_EquipmentROIId",
                        column: x => x.EquipmentROIId,
                        principalTable: "EquipmentROIs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EquipmentCostBreakdowns_Equipment_EquipmentId",
                        column: x => x.EquipmentId,
                        principalTable: "Equipment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GeofenceEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ZoneId = table.Column<int>(type: "int", nullable: false),
                    LocationId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    EventTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    IsAlerted = table.Column<bool>(type: "bit", nullable: false),
                    AlertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeofenceEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GeofenceEvents_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GeofenceEvents_GeofenceZones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "GeofenceZones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GeofenceEvents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GeofenceEvents_WorkerLocations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "WorkerLocations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WorkerGeofenceAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ZoneId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssignedBy = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkerGeofenceAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkerGeofenceAssignments_GeofenceZones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "GeofenceZones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkerGeofenceAssignments_Users_AssignedBy",
                        column: x => x.AssignedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkerGeofenceAssignments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OvertimeRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    Hours = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OvertimeRuleId = table.Column<int>(type: "int", nullable: true),
                    Multiplier = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HourlyRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CalculatedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PayrollId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OvertimeRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OvertimeRecords_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OvertimeRecords_OvertimeRules_OvertimeRuleId",
                        column: x => x.OvertimeRuleId,
                        principalTable: "OvertimeRules",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OvertimeRecords_Payrolls_PayrollId",
                        column: x => x.PayrollId,
                        principalTable: "Payrolls",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OvertimeRecords_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OvertimeRecords_Users_ApprovedByUserId",
                        column: x => x.ApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OvertimeRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RetentionSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    ProgressInvoiceId = table.Column<int>(type: "int", nullable: false),
                    RetentionAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    RetentionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReleaseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActualReleaseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RetentionPeriodMonths = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ReleasedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReleasedByUserId = table.Column<int>(type: "int", nullable: true),
                    ReminderCount = table.Column<int>(type: "int", nullable: false),
                    LastReminderDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetentionSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetentionSchedules_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RetentionSchedules_ProgressInvoice_ProgressInvoiceId",
                        column: x => x.ProgressInvoiceId,
                        principalTable: "ProgressInvoice",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RetentionSchedules_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RetentionSchedules_Users_ReleasedByUserId",
                        column: x => x.ReleasedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectItemExecutedDeltas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProjectItemId = table.Column<int>(type: "int", nullable: false),
                    DeltaQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeltaDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangeType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectItemExecutedDeltas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectItemExecutedDeltas_ProjectItems_ProjectItemId",
                        column: x => x.ProjectItemId,
                        principalTable: "ProjectItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectItemExecutedDeltas_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectItemNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProjectItemId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    NoteText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NoteType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatorUserId = table.Column<int>(type: "int", nullable: false),
                    VisibleToRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RelatedMediaId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectItemNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectItemNotes_ProjectItems_ProjectItemId",
                        column: x => x.ProjectItemId,
                        principalTable: "ProjectItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectItemNotes_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectItemNotes_SiteMedias_RelatedMediaId",
                        column: x => x.RelatedMediaId,
                        principalTable: "SiteMedias",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectItemNotes_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectItemProfitabilityLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProjectItemId = table.Column<int>(type: "int", nullable: false),
                    TotalSpent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EstimatedBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CurrentProfit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LogDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectItemProfitabilityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectItemProfitabilityLogs_ProjectItems_ProjectItemId",
                        column: x => x.ProjectItemId,
                        principalTable: "ProjectItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 64,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Update project items quantities and rates", "Finance.ManageProjectItems" });

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 20, 22, 25, 26, 239, DateTimeKind.Utc).AddTicks(5618));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "BaseSalary",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_ClientPayments_CompanyId",
                table: "ClientPayments",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientPayments_ConfirmedByUserId",
                table: "ClientPayments",
                column: "ConfirmedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientPayments_CreatedByUserId",
                table: "ClientPayments",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientPayments_ProgressInvoiceId",
                table: "ClientPayments",
                column: "ProgressInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentCostBreakdowns_CostType",
                table: "EquipmentCostBreakdowns",
                column: "CostType");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentCostBreakdowns_Date",
                table: "EquipmentCostBreakdowns",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentCostBreakdowns_EquipmentId",
                table: "EquipmentCostBreakdowns",
                column: "EquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentCostBreakdowns_EquipmentROIId",
                table: "EquipmentCostBreakdowns",
                column: "EquipmentROIId");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentROIs_CompanyId",
                table: "EquipmentROIs",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentROIs_EquipmentId",
                table: "EquipmentROIs",
                column: "EquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentROIs_PerformanceRating",
                table: "EquipmentROIs",
                column: "PerformanceRating");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentROIs_PeriodStart_PeriodEnd",
                table: "EquipmentROIs",
                columns: new[] { "PeriodStart", "PeriodEnd" });

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentROIs_ProjectId",
                table: "EquipmentROIs",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceEvents_CompanyId",
                table: "GeofenceEvents",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceEvents_EventTime",
                table: "GeofenceEvents",
                column: "EventTime");

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceEvents_LocationId",
                table: "GeofenceEvents",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceEvents_UserId",
                table: "GeofenceEvents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceEvents_UserId_ZoneId_EventTime",
                table: "GeofenceEvents",
                columns: new[] { "UserId", "ZoneId", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceEvents_ZoneId",
                table: "GeofenceEvents",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceZones_CompanyId",
                table: "GeofenceZones",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceZones_IsActive",
                table: "GeofenceZones",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_GeofenceZones_ProjectId",
                table: "GeofenceZones",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceImage_ItemInvoiceId",
                table: "InvoiceImage",
                column: "ItemInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRecords_ApprovedByUserId",
                table: "OvertimeRecords",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRecords_CompanyId",
                table: "OvertimeRecords",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRecords_Date",
                table: "OvertimeRecords",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRecords_OvertimeRuleId",
                table: "OvertimeRecords",
                column: "OvertimeRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRecords_PayrollId",
                table: "OvertimeRecords",
                column: "PayrollId");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRecords_ProjectId",
                table: "OvertimeRecords",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRecords_Status",
                table: "OvertimeRecords",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRecords_UserId",
                table: "OvertimeRecords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRules_CompanyId",
                table: "OvertimeRules",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRules_IsActive",
                table: "OvertimeRules",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_ClientPaymentId",
                table: "PaymentTransactions",
                column: "ClientPaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_CompanyId",
                table: "PaymentTransactions",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_ItemInvoiceId",
                table: "PaymentTransactions",
                column: "ItemInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_ProjectId",
                table: "PaymentTransactions",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_RecorderId",
                table: "PaymentTransactions",
                column: "RecorderId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressInvoice_ApprovedByUserId",
                table: "ProgressInvoice",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressInvoice_CompanyId",
                table: "ProgressInvoice",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressInvoice_CreatedByUserId",
                table: "ProgressInvoice",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressInvoice_ProjectId",
                table: "ProgressInvoice",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItemExecutedDeltas_CreatedByUserId",
                table: "ProjectItemExecutedDeltas",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItemExecutedDeltas_ProcessedAt",
                table: "ProjectItemExecutedDeltas",
                column: "ProcessedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItemExecutedDeltas_ProjectItemId",
                table: "ProjectItemExecutedDeltas",
                column: "ProjectItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItemNotes_CreatorUserId",
                table: "ProjectItemNotes",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItemNotes_ProjectId",
                table: "ProjectItemNotes",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItemNotes_ProjectItemId",
                table: "ProjectItemNotes",
                column: "ProjectItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItemNotes_RelatedMediaId",
                table: "ProjectItemNotes",
                column: "RelatedMediaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItemProfitabilityLogs_ProjectItemId",
                table: "ProjectItemProfitabilityLogs",
                column: "ProjectItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItems_PhaseId",
                table: "ProjectItems",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItems_ProjectId",
                table: "ProjectItems",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectItems_ProjectId1",
                table: "ProjectItems",
                column: "ProjectId1");

            migrationBuilder.CreateIndex(
                name: "IX_RetentionSchedules_CompanyId",
                table: "RetentionSchedules",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_RetentionSchedules_ProgressInvoiceId",
                table: "RetentionSchedules",
                column: "ProgressInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_RetentionSchedules_ProjectId",
                table: "RetentionSchedules",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_RetentionSchedules_ReleaseDate",
                table: "RetentionSchedules",
                column: "ReleaseDate");

            migrationBuilder.CreateIndex(
                name: "IX_RetentionSchedules_ReleasedByUserId",
                table: "RetentionSchedules",
                column: "ReleasedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RetentionSchedules_Status",
                table: "RetentionSchedules",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerGeofenceAssignments_AssignedBy",
                table: "WorkerGeofenceAssignments",
                column: "AssignedBy");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerGeofenceAssignments_IsActive",
                table: "WorkerGeofenceAssignments",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerGeofenceAssignments_UserId",
                table: "WorkerGeofenceAssignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerGeofenceAssignments_ZoneId",
                table: "WorkerGeofenceAssignments",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerGeofenceAssignments_ZoneId_UserId_IsActive",
                table: "WorkerGeofenceAssignments",
                columns: new[] { "ZoneId", "UserId", "IsActive" });

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalRequests_ProjectItems_ProjectItemId",
                table: "ApprovalRequests",
                column: "ProjectItemId",
                principalTable: "ProjectItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ClientPayments_Companies_CompanyId",
                table: "ClientPayments",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClientPayments_ProgressInvoice_ProgressInvoiceId",
                table: "ClientPayments",
                column: "ProgressInvoiceId",
                principalTable: "ProgressInvoice",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClientPayments_Users_ConfirmedByUserId",
                table: "ClientPayments",
                column: "ConfirmedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClientPayments_Users_CreatedByUserId",
                table: "ClientPayments",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EscalationLogs_ProjectItems_ProjectItemId",
                table: "EscalationLogs",
                column: "ProjectItemId",
                principalTable: "ProjectItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemDailyLogs_ProjectItems_ProjectItemId",
                table: "ItemDailyLogs",
                column: "ProjectItemId",
                principalTable: "ProjectItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItemInvoice_ProjectItems_ProjectItemId",
                table: "ItemInvoice",
                column: "ProjectItemId",
                principalTable: "ProjectItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialConsumptions_ProjectItems_ProjectItemId",
                table: "MaterialConsumptions",
                column: "ProjectItemId",
                principalTable: "ProjectItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectApprovalRules_ProjectItems_ProjectItemId",
                table: "ProjectApprovalRules",
                column: "ProjectItemId",
                principalTable: "ProjectItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SiteMedias_ProjectItems_ProjectItemId",
                table: "SiteMedias",
                column: "ProjectItemId",
                principalTable: "ProjectItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_ProjectItems_ProjectItemId",
                table: "Transactions",
                column: "ProjectItemId",
                principalTable: "ProjectItems",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalRequests_ProjectItems_ProjectItemId",
                table: "ApprovalRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ClientPayments_Companies_CompanyId",
                table: "ClientPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_ClientPayments_ProgressInvoice_ProgressInvoiceId",
                table: "ClientPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_ClientPayments_Users_ConfirmedByUserId",
                table: "ClientPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_ClientPayments_Users_CreatedByUserId",
                table: "ClientPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_EscalationLogs_ProjectItems_ProjectItemId",
                table: "EscalationLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemDailyLogs_ProjectItems_ProjectItemId",
                table: "ItemDailyLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemInvoice_ProjectItems_ProjectItemId",
                table: "ItemInvoice");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialConsumptions_ProjectItems_ProjectItemId",
                table: "MaterialConsumptions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectApprovalRules_ProjectItems_ProjectItemId",
                table: "ProjectApprovalRules");

            migrationBuilder.DropForeignKey(
                name: "FK_SiteMedias_ProjectItems_ProjectItemId",
                table: "SiteMedias");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_ProjectItems_ProjectItemId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "EquipmentCostBreakdowns");

            migrationBuilder.DropTable(
                name: "GeofenceEvents");

            migrationBuilder.DropTable(
                name: "InvoiceImage");

            migrationBuilder.DropTable(
                name: "OvertimeRecords");

            migrationBuilder.DropTable(
                name: "PaymentTransactions");

            migrationBuilder.DropTable(
                name: "ProjectItemExecutedDeltas");

            migrationBuilder.DropTable(
                name: "ProjectItemNotes");

            migrationBuilder.DropTable(
                name: "ProjectItemProfitabilityLogs");

            migrationBuilder.DropTable(
                name: "RetentionSchedules");

            migrationBuilder.DropTable(
                name: "WorkerGeofenceAssignments");

            migrationBuilder.DropTable(
                name: "EquipmentROIs");

            migrationBuilder.DropTable(
                name: "OvertimeRules");

            migrationBuilder.DropTable(
                name: "ProjectItems");

            migrationBuilder.DropTable(
                name: "ProgressInvoice");

            migrationBuilder.DropTable(
                name: "GeofenceZones");

            migrationBuilder.DropIndex(
                name: "IX_ClientPayments_CompanyId",
                table: "ClientPayments");

            migrationBuilder.DropIndex(
                name: "IX_ClientPayments_ConfirmedByUserId",
                table: "ClientPayments");

            migrationBuilder.DropIndex(
                name: "IX_ClientPayments_CreatedByUserId",
                table: "ClientPayments");

            migrationBuilder.DropIndex(
                name: "IX_ClientPayments_ProgressInvoiceId",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "BaseSalary",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "InvoiceType",
                table: "ItemInvoice");

            migrationBuilder.DropColumn(
                name: "FuelCost",
                table: "EquipmentAssignments");

            migrationBuilder.DropColumn(
                name: "HoursWorked",
                table: "EquipmentAssignments");

            migrationBuilder.DropColumn(
                name: "OperatorCost",
                table: "EquipmentAssignments");

            migrationBuilder.DropColumn(
                name: "WorkValue",
                table: "EquipmentAssignments");

            migrationBuilder.DropColumn(
                name: "ClientCanSeeProjectItems",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "EnableBankTransfer",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "EnableOnlinePayments",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "EnablePayPal",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "EnableProjectItemsManagement",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "MinimumPaymentAmount",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "PayPalClientId",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "PayPalClientSecret",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "StripePublicKey",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "StripeSecretKey",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "CheckDueDate",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "CheckNumber",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "ConfirmedAt",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "ConfirmedByUserId",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "ProgressInvoiceId",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "ReceiptNumber",
                table: "ClientPayments");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ClientPayments");

            migrationBuilder.RenameColumn(
                name: "ProjectItemId",
                table: "Transactions",
                newName: "BOQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_ProjectItemId",
                table: "Transactions",
                newName: "IX_Transactions_BOQItemId");

            migrationBuilder.RenameColumn(
                name: "ProjectItemId",
                table: "SiteMedias",
                newName: "BOQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_SiteMedias_ProjectItemId",
                table: "SiteMedias",
                newName: "IX_SiteMedias_BOQItemId");

            migrationBuilder.RenameColumn(
                name: "ClientCanSeeProjectItems",
                table: "ProjectSettings",
                newName: "ClientCanSeeBOQ");

            migrationBuilder.RenameColumn(
                name: "ProjectItemId",
                table: "ProjectApprovalRules",
                newName: "BOQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ProjectApprovalRules_ProjectItemId",
                table: "ProjectApprovalRules",
                newName: "IX_ProjectApprovalRules_BOQItemId");

            migrationBuilder.RenameColumn(
                name: "ProjectItemId",
                table: "MaterialConsumptions",
                newName: "BOQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_MaterialConsumptions_ProjectItemId",
                table: "MaterialConsumptions",
                newName: "IX_MaterialConsumptions_BOQItemId");

            migrationBuilder.RenameColumn(
                name: "ProjectItemId",
                table: "ItemInvoice",
                newName: "BOQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ItemInvoice_ProjectItemId",
                table: "ItemInvoice",
                newName: "IX_ItemInvoice_BOQItemId");

            migrationBuilder.RenameColumn(
                name: "ProjectItemId",
                table: "ItemDailyLogs",
                newName: "BOQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ItemDailyLogs_ProjectItemId_LogDate",
                table: "ItemDailyLogs",
                newName: "IX_ItemDailyLogs_BOQItemId_LogDate");

            migrationBuilder.RenameColumn(
                name: "ProjectItemId",
                table: "EscalationLogs",
                newName: "BOQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_EscalationLogs_ProjectItemId",
                table: "EscalationLogs",
                newName: "IX_EscalationLogs_BOQItemId");

            migrationBuilder.RenameColumn(
                name: "RequirePaymentApproval",
                table: "CompanySettings",
                newName: "EnableBOQManagement");

            migrationBuilder.RenameColumn(
                name: "EnableStripe",
                table: "CompanySettings",
                newName: "ClientCanSeeBOQ");

            migrationBuilder.RenameColumn(
                name: "EnableProjectItemsManagement",
                table: "Companies",
                newName: "EnableBOQManagement");

            migrationBuilder.RenameColumn(
                name: "ProjectItemId",
                table: "ApprovalRequests",
                newName: "BOQItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ApprovalRequests_ProjectItemId",
                table: "ApprovalRequests",
                newName: "IX_ApprovalRequests_BOQItemId");

            migrationBuilder.AlterColumn<string>(
                name: "PaymentType",
                table: "ClientPayments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "PaymentNumber",
                table: "ClientPayments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "ClientPayments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<string>(
                name: "AttachmentPath",
                table: "ClientPayments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ClientPayments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsConfirmed",
                table: "ClientPayments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "BOQItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhaseId = table.Column<int>(type: "int", nullable: true),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    AccountingType = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOQItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BOQItems_Phases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phases",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BOQItems_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BOQExecutedDeltas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    ChangeType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeltaDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeltaQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
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
                name: "BOQItemNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BOQItemId = table.Column<int>(type: "int", nullable: false),
                    CreatorUserId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    RelatedMediaId = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    NoteText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NoteType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VisibleToRole = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                name: "BOQMeasured",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    AgreedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExecutedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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
                name: "BOQPackages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CompletionPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    PaymentTerms = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalPackageValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BOQPackages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BOQPackages_BOQItems_Id",
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
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentProfit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LogDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalSpent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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
                    BaseCalculation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomBaseAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedTotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    SupervisionPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 64,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Update BOQ quantities and rates", "Finance.ManageBOQ" });

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 19, 19, 22, 31, 674, DateTimeKind.Utc).AddTicks(2328));

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
                name: "IX_BOQItems_PhaseId",
                table: "BOQItems",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQItems_ProjectId",
                table: "BOQItems",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_BOQProfitabilityLogs_BOQItemId",
                table: "BOQProfitabilityLogs",
                column: "BOQItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalRequests_BOQItems_BOQItemId",
                table: "ApprovalRequests",
                column: "BOQItemId",
                principalTable: "BOQItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_EscalationLogs_BOQItems_BOQItemId",
                table: "EscalationLogs",
                column: "BOQItemId",
                principalTable: "BOQItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemDailyLogs_BOQItems_BOQItemId",
                table: "ItemDailyLogs",
                column: "BOQItemId",
                principalTable: "BOQItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItemInvoice_BOQItems_BOQItemId",
                table: "ItemInvoice",
                column: "BOQItemId",
                principalTable: "BOQItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialConsumptions_BOQItems_BOQItemId",
                table: "MaterialConsumptions",
                column: "BOQItemId",
                principalTable: "BOQItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectApprovalRules_BOQItems_BOQItemId",
                table: "ProjectApprovalRules",
                column: "BOQItemId",
                principalTable: "BOQItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SiteMedias_BOQItems_BOQItemId",
                table: "SiteMedias",
                column: "BOQItemId",
                principalTable: "BOQItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_BOQItems_BOQItemId",
                table: "Transactions",
                column: "BOQItemId",
                principalTable: "BOQItems",
                principalColumn: "Id");
        }
    }
}

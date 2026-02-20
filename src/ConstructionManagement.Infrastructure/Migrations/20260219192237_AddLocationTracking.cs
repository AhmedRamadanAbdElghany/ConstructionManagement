using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanyLocationSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    IsLocationTrackingEnabled = table.Column<bool>(type: "bit", nullable: false),
                    TrackingMode = table.Column<int>(type: "int", nullable: false),
                    WorkingHoursStart = table.Column<TimeSpan>(type: "time", nullable: false),
                    WorkingHoursEnd = table.Column<TimeSpan>(type: "time", nullable: false),
                    RandomCheckCount = table.Column<int>(type: "int", nullable: false),
                    WorkingDays = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RequirePhoto = table.Column<bool>(type: "bit", nullable: false),
                    RequestExpirationMinutes = table.Column<int>(type: "int", nullable: false),
                    SendReminders = table.Column<bool>(type: "bit", nullable: false),
                    ReminderDelayMinutes = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyLocationSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyLocationSettings_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LocationRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    RequestedByUserId = table.Column<int>(type: "int", nullable: false),
                    RequestType = table.Column<int>(type: "int", nullable: false),
                    ScheduledFor = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FulfilledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LocationRequests_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LocationRequests_Users_RequestedByUserId",
                        column: x => x.RequestedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WorkerLocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Accuracy = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LocationType = table.Column<int>(type: "int", nullable: false),
                    RequestId = table.Column<int>(type: "int", nullable: true),
                    PhotoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DeviceInfo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkerLocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkerLocations_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkerLocations_LocationRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "LocationRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_WorkerLocations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LocationRequestTargets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    LocationId = table.Column<int>(type: "int", nullable: true),
                    FulfilledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NotifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReminderSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationRequestTargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LocationRequestTargets_LocationRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "LocationRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LocationRequestTargets_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LocationRequestTargets_WorkerLocations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "WorkerLocations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 19, 19, 22, 31, 674, DateTimeKind.Utc).AddTicks(2328));

            migrationBuilder.CreateIndex(
                name: "IX_CompanyLocationSettings_CompanyId",
                table: "CompanyLocationSettings",
                column: "CompanyId",
                unique: true,
                filter: "[CompanyId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequests_CompanyId",
                table: "LocationRequests",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequests_ExpiresAt",
                table: "LocationRequests",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequests_RequestedByUserId",
                table: "LocationRequests",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequests_ScheduledFor",
                table: "LocationRequests",
                column: "ScheduledFor");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequests_Status",
                table: "LocationRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequestTargets_LocationId",
                table: "LocationRequestTargets",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequestTargets_RequestId",
                table: "LocationRequestTargets",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequestTargets_RequestId_UserId",
                table: "LocationRequestTargets",
                columns: new[] { "RequestId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequestTargets_Status",
                table: "LocationRequestTargets",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_LocationRequestTargets_UserId",
                table: "LocationRequestTargets",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerLocations_CompanyId",
                table: "WorkerLocations",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerLocations_RecordedAt",
                table: "WorkerLocations",
                column: "RecordedAt");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerLocations_RequestId",
                table: "WorkerLocations",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerLocations_UserId",
                table: "WorkerLocations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerLocations_UserId_RecordedAt",
                table: "WorkerLocations",
                columns: new[] { "UserId", "RecordedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyLocationSettings");

            migrationBuilder.DropTable(
                name: "LocationRequestTargets");

            migrationBuilder.DropTable(
                name: "WorkerLocations");

            migrationBuilder.DropTable(
                name: "LocationRequests");

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 19, 18, 38, 9, 813, DateTimeKind.Utc).AddTicks(1843));
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CodeFirst52Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 99,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Create and manage geofence zones", "Geofence.Manage" });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "CompanyId", "CreatedAt", "DeletedAt", "Description", "IsDeleted", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 100, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "View location tracking reports and worker status", false, "Location.View", null },
                    { 101, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Manage location settings and requests", false, "Location.Manage", null }
                });

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 27, 15, 5, 8, 761, DateTimeKind.Utc).AddTicks(9595));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 100);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 101);

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 99,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Manage geofence zones and monitor employees", "Location.Manage" });

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 27, 14, 30, 13, 467, DateTimeKind.Utc).AddTicks(2827));
        }
    }
}

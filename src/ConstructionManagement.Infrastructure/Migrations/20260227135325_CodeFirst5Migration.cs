using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CodeFirst5Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "CompanyId", "CreatedAt", "DeletedAt", "Description", "IsDeleted", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 98, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Submit location check-in/check-out", false, "Location.Submit", null },
                    { 99, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Manage geofence zones and monitor employees", false, "Location.Manage", null }
                });

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 27, 13, 53, 20, 580, DateTimeKind.Utc).AddTicks(3330));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 98);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 99);

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 27, 3, 4, 24, 360, DateTimeKind.Utc).AddTicks(2497));
        }
    }
}

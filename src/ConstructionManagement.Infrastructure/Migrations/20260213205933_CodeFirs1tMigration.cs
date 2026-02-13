using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CodeFirs1tMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 13, 20, 59, 29, 89, DateTimeKind.Utc).AddTicks(976));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 13, 19, 27, 41, 382, DateTimeKind.Utc).AddTicks(6685));
        }
    }
}

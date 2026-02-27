using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CodeFirst51Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 27, 14, 30, 13, 467, DateTimeKind.Utc).AddTicks(2827));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 27, 13, 53, 20, 580, DateTimeKind.Utc).AddTicks(3330));
        }
    }
}

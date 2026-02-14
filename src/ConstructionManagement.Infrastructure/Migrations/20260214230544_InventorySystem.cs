using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InventorySystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "LowStockThreshold",
                table: "VendorProducts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PurchasePrice",
                table: "VendorProducts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantityInStock",
                table: "VendorProducts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 14, 23, 5, 40, 463, DateTimeKind.Utc).AddTicks(4886));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LowStockThreshold",
                table: "VendorProducts");

            migrationBuilder.DropColumn(
                name: "PurchasePrice",
                table: "VendorProducts");

            migrationBuilder.DropColumn(
                name: "QuantityInStock",
                table: "VendorProducts");

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 14, 22, 33, 58, 738, DateTimeKind.Utc).AddTicks(1427));
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CodeFirst3Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "WarehouseOrderItem",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "StockDiscountTiers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "OrderStatusHistory",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "InventoryOrderItems",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 16, 2, 0, 57, 603, DateTimeKind.Utc).AddTicks(8843));

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseOrderItem_CompanyId",
                table: "WarehouseOrderItem",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_StockDiscountTiers_CompanyId",
                table: "StockDiscountTiers",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderStatusHistory_CompanyId",
                table: "OrderStatusHistory",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryOrderItems_CompanyId",
                table: "InventoryOrderItems",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryOrderItems_Companies_CompanyId",
                table: "InventoryOrderItems",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderStatusHistory_Companies_CompanyId",
                table: "OrderStatusHistory",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockDiscountTiers_Companies_CompanyId",
                table: "StockDiscountTiers",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseOrderItem_Companies_CompanyId",
                table: "WarehouseOrderItem",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryOrderItems_Companies_CompanyId",
                table: "InventoryOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderStatusHistory_Companies_CompanyId",
                table: "OrderStatusHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_StockDiscountTiers_Companies_CompanyId",
                table: "StockDiscountTiers");

            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseOrderItem_Companies_CompanyId",
                table: "WarehouseOrderItem");

            migrationBuilder.DropIndex(
                name: "IX_WarehouseOrderItem_CompanyId",
                table: "WarehouseOrderItem");

            migrationBuilder.DropIndex(
                name: "IX_StockDiscountTiers_CompanyId",
                table: "StockDiscountTiers");

            migrationBuilder.DropIndex(
                name: "IX_OrderStatusHistory_CompanyId",
                table: "OrderStatusHistory");

            migrationBuilder.DropIndex(
                name: "IX_InventoryOrderItems_CompanyId",
                table: "InventoryOrderItems");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "WarehouseOrderItem");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "StockDiscountTiers");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "OrderStatusHistory");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "InventoryOrderItems");

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 16, 1, 55, 27, 994, DateTimeKind.Utc).AddTicks(6087));
        }
    }
}

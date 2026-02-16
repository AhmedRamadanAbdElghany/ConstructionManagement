using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CodeFirst2Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "WarehouseOrderRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "RecurringOrderItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "InventoryStocks",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 16, 1, 55, 27, 994, DateTimeKind.Utc).AddTicks(6087));

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseOrderRequests_CompanyId",
                table: "WarehouseOrderRequests",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringOrderItems_CompanyId",
                table: "RecurringOrderItems",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryStocks_CompanyId",
                table: "InventoryStocks",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryStocks_Companies_CompanyId",
                table: "InventoryStocks",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringOrderItems_Companies_CompanyId",
                table: "RecurringOrderItems",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseOrderRequests_Companies_CompanyId",
                table: "WarehouseOrderRequests",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryStocks_Companies_CompanyId",
                table: "InventoryStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_RecurringOrderItems_Companies_CompanyId",
                table: "RecurringOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseOrderRequests_Companies_CompanyId",
                table: "WarehouseOrderRequests");

            migrationBuilder.DropIndex(
                name: "IX_WarehouseOrderRequests_CompanyId",
                table: "WarehouseOrderRequests");

            migrationBuilder.DropIndex(
                name: "IX_RecurringOrderItems_CompanyId",
                table: "RecurringOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_InventoryStocks_CompanyId",
                table: "InventoryStocks");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "WarehouseOrderRequests");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "RecurringOrderItems");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "InventoryStocks");

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 16, 1, 49, 52, 661, DateTimeKind.Utc).AddTicks(1045));
        }
    }
}

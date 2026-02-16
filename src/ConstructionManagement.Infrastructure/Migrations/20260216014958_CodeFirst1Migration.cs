using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CodeFirst1Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "VendorReviews",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "UserTypeHistories",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "SpecialPromotions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "SafetyCompliances",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "RecurringOrders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "ProjectWorkerContacts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "MaterialRequestItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "CustomerTierDiscounts",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 16, 1, 49, 52, 661, DateTimeKind.Utc).AddTicks(1045));

            migrationBuilder.CreateIndex(
                name: "IX_VendorReviews_CompanyId",
                table: "VendorReviews",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTypeHistories_CompanyId",
                table: "UserTypeHistories",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_SpecialPromotions_CompanyId",
                table: "SpecialPromotions",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_SafetyCompliances_CompanyId",
                table: "SafetyCompliances",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringOrders_CompanyId",
                table: "RecurringOrders",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectWorkerContacts_CompanyId",
                table: "ProjectWorkerContacts",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequestItems_CompanyId",
                table: "MaterialRequestItems",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTierDiscounts_CompanyId",
                table: "CustomerTierDiscounts",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerTierDiscounts_Companies_CompanyId",
                table: "CustomerTierDiscounts",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequestItems_Companies_CompanyId",
                table: "MaterialRequestItems",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectWorkerContacts_Companies_CompanyId",
                table: "ProjectWorkerContacts",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringOrders_Companies_CompanyId",
                table: "RecurringOrders",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SafetyCompliances_Companies_CompanyId",
                table: "SafetyCompliances",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SpecialPromotions_Companies_CompanyId",
                table: "SpecialPromotions",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserTypeHistories_Companies_CompanyId",
                table: "UserTypeHistories",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_VendorReviews_Companies_CompanyId",
                table: "VendorReviews",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerTierDiscounts_Companies_CompanyId",
                table: "CustomerTierDiscounts");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequestItems_Companies_CompanyId",
                table: "MaterialRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectWorkerContacts_Companies_CompanyId",
                table: "ProjectWorkerContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_RecurringOrders_Companies_CompanyId",
                table: "RecurringOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_SafetyCompliances_Companies_CompanyId",
                table: "SafetyCompliances");

            migrationBuilder.DropForeignKey(
                name: "FK_SpecialPromotions_Companies_CompanyId",
                table: "SpecialPromotions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTypeHistories_Companies_CompanyId",
                table: "UserTypeHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_VendorReviews_Companies_CompanyId",
                table: "VendorReviews");

            migrationBuilder.DropIndex(
                name: "IX_VendorReviews_CompanyId",
                table: "VendorReviews");

            migrationBuilder.DropIndex(
                name: "IX_UserTypeHistories_CompanyId",
                table: "UserTypeHistories");

            migrationBuilder.DropIndex(
                name: "IX_SpecialPromotions_CompanyId",
                table: "SpecialPromotions");

            migrationBuilder.DropIndex(
                name: "IX_SafetyCompliances_CompanyId",
                table: "SafetyCompliances");

            migrationBuilder.DropIndex(
                name: "IX_RecurringOrders_CompanyId",
                table: "RecurringOrders");

            migrationBuilder.DropIndex(
                name: "IX_ProjectWorkerContacts_CompanyId",
                table: "ProjectWorkerContacts");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequestItems_CompanyId",
                table: "MaterialRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_CustomerTierDiscounts_CompanyId",
                table: "CustomerTierDiscounts");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "VendorReviews");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "UserTypeHistories");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "SpecialPromotions");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "SafetyCompliances");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "RecurringOrders");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "ProjectWorkerContacts");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "MaterialRequestItems");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "CustomerTierDiscounts");

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 16, 1, 13, 55, 407, DateTimeKind.Utc).AddTicks(9073));
        }
    }
}

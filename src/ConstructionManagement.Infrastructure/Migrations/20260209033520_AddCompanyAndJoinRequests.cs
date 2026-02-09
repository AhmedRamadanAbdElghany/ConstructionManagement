using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyAndJoinRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailVerificationToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEmailVerified",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiry",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CompanyRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BusinessId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyRequests_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JoinRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JoinRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JoinRequests_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JoinRequests_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JoinRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "ApprovalRequests",
                keyColumn: "Id",
                keyValue: 1,
                column: "RequestedAt",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 642, DateTimeKind.Utc).AddTicks(2069));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 635, DateTimeKind.Utc).AddTicks(9333));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 636, DateTimeKind.Utc).AddTicks(77));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 636, DateTimeKind.Utc).AddTicks(79));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 4,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 636, DateTimeKind.Utc).AddTicks(80));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 5,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 636, DateTimeKind.Utc).AddTicks(82));

            migrationBuilder.UpdateData(
                table: "Transactions",
                keyColumn: "Id",
                keyValue: 1,
                column: "TransactionDate",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 637, DateTimeKind.Utc).AddTicks(8938));

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 629, DateTimeKind.Utc).AddTicks(7144));

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 2, 3 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 3, 35, 15, 632, DateTimeKind.Utc).AddTicks(451));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EmailVerificationToken", "IsEmailVerified", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { null, false, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "EmailVerificationToken", "IsEmailVerified", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { null, false, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "EmailVerificationToken", "IsEmailVerified", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { null, false, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "EmailVerificationToken", "IsEmailVerified", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { null, false, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "EmailVerificationToken", "IsEmailVerified", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { null, false, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "EmailVerificationToken", "IsEmailVerified", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { null, false, null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "EmailVerificationToken", "IsEmailVerified", "PasswordResetToken", "PasswordResetTokenExpiry" },
                values: new object[] { null, false, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyRequests_ReviewedByUserId",
                table: "CompanyRequests",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyRequests_UserId",
                table: "CompanyRequests",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_JoinRequests_CompanyId",
                table: "JoinRequests",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_JoinRequests_ReviewedByUserId",
                table: "JoinRequests",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JoinRequests_UserId",
                table: "JoinRequests",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyRequests");

            migrationBuilder.DropTable(
                name: "JoinRequests");

            migrationBuilder.DropColumn(
                name: "EmailVerificationToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsEmailVerified",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiry",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "ApprovalRequests",
                keyColumn: "Id",
                keyValue: 1,
                column: "RequestedAt",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 490, DateTimeKind.Utc).AddTicks(9420));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 476, DateTimeKind.Utc).AddTicks(4642));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 476, DateTimeKind.Utc).AddTicks(5902));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 476, DateTimeKind.Utc).AddTicks(5906));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 4,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 476, DateTimeKind.Utc).AddTicks(5908));

            migrationBuilder.UpdateData(
                table: "ProjectTeamRoles",
                keyColumn: "Id",
                keyValue: 5,
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 476, DateTimeKind.Utc).AddTicks(5910));

            migrationBuilder.UpdateData(
                table: "Transactions",
                keyColumn: "Id",
                keyValue: 1,
                column: "TransactionDate",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 479, DateTimeKind.Utc).AddTicks(8267));

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 468, DateTimeKind.Utc).AddTicks(8032));

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 2, 3 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 9, 1, 1, 40, 468, DateTimeKind.Utc).AddTicks(9813));
        }
    }
}

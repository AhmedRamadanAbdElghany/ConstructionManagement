using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMessagingSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserMessagingBlocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BlockedByUserId = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BlockedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UnblockedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMessagingBlocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserMessagingBlocks_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserMessagingBlocks_Users_BlockedByUserId",
                        column: x => x.BlockedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserMessagingBlocks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CompanyConversations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    InitiatorUserId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    BlockedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BlockReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastMessageAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastMessageId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyConversations_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyConversations_Users_ApprovedByUserId",
                        column: x => x.ApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyConversations_Users_InitiatorUserId",
                        column: x => x.InitiatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CompanyMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ConversationId = table.Column<int>(type: "int", nullable: false),
                    SenderUserId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsFromCompany = table.Column<bool>(type: "bit", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyMessages_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyMessages_CompanyConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "CompanyConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompanyMessages_Users_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MessageFileAttachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    MessageId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageFileAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageFileAttachments_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MessageFileAttachments_CompanyMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "CompanyMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 19, 18, 12, 48, 637, DateTimeKind.Utc).AddTicks(6816));

            migrationBuilder.CreateIndex(
                name: "IX_CompanyConversations_ApprovedByUserId",
                table: "CompanyConversations",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyConversations_CompanyId",
                table: "CompanyConversations",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyConversations_InitiatorUserId",
                table: "CompanyConversations",
                column: "InitiatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyConversations_LastMessageId",
                table: "CompanyConversations",
                column: "LastMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyConversations_Status",
                table: "CompanyConversations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyMessages_CompanyId",
                table: "CompanyMessages",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyMessages_ConversationId",
                table: "CompanyMessages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyMessages_CreatedAt",
                table: "CompanyMessages",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyMessages_SenderUserId",
                table: "CompanyMessages",
                column: "SenderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageFileAttachments_CompanyId",
                table: "MessageFileAttachments",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageFileAttachments_MessageId",
                table: "MessageFileAttachments",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_UserMessagingBlocks_BlockedByUserId",
                table: "UserMessagingBlocks",
                column: "BlockedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserMessagingBlocks_CompanyId_UserId",
                table: "UserMessagingBlocks",
                columns: new[] { "CompanyId", "UserId" },
                unique: true,
                filter: "[CompanyId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserMessagingBlocks_UserId",
                table: "UserMessagingBlocks",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CompanyConversations_CompanyMessages_LastMessageId",
                table: "CompanyConversations",
                column: "LastMessageId",
                principalTable: "CompanyMessages",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CompanyConversations_CompanyMessages_LastMessageId",
                table: "CompanyConversations");

            migrationBuilder.DropTable(
                name: "MessageFileAttachments");

            migrationBuilder.DropTable(
                name: "UserMessagingBlocks");

            migrationBuilder.DropTable(
                name: "CompanyMessages");

            migrationBuilder.DropTable(
                name: "CompanyConversations");

            migrationBuilder.UpdateData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, 1 },
                column: "AssignedAt",
                value: new DateTime(2026, 2, 19, 16, 39, 31, 777, DateTimeKind.Utc).AddTicks(6312));
        }
    }
}

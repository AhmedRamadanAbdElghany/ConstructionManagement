using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConstructionManagement.Infrastructure.Migrations
{
    public partial class Add_sp_generateInvoiceNumber : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE OR ALTER PROCEDURE [dbo].[sp_generateInvoiceNumber]
                    @Year INT,
                    @InvoiceNumber NVARCHAR(20) OUTPUT
                AS
                BEGIN
                    SET NOCOUNT ON;

                    DECLARE @NextNum INT;

                    BEGIN TRY
                        BEGIN TRANSACTION;

                        -- Create or lock the row for the year
                        IF NOT EXISTS (SELECT 1 FROM InvoiceSequence WHERE YearPart = @Year)
                        BEGIN
                            INSERT INTO InvoiceSequence (YearPart, NextNumber) 
                            VALUES (@Year, 1);
                        END

                        SELECT @NextNum = NextNumber
                        FROM InvoiceSequence WITH (UPDLOCK, ROWLOCK)
                        WHERE YearPart = @Year;

                        UPDATE InvoiceSequence
                        SET NextNumber = NextNumber + 1
                        WHERE YearPart = @Year;

                        COMMIT TRANSACTION;

                        -- Format: INV-YYYY-NNNN (padded to 4 digits)
                        SET @InvoiceNumber = N'INV-' + CAST(@Year AS NVARCHAR(4)) + N'-' + 
                                             RIGHT('0000' + CAST(@NextNum AS NVARCHAR(4)), 4);
                    END TRY
                    BEGIN CATCH
                        IF @@TRANCOUNT > 0 
                            ROLLBACK TRANSACTION;
                        THROW;
                    END CATCH
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS [dbo].[sp_generateInvoiceNumber]");
        }
    }
}
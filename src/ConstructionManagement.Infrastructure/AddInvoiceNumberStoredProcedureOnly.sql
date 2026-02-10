-- Migration script for AddInvoiceNumberStoredProcedureOnly
-- Generated from migration: AddInvoiceNumberStoredProcedureOnly

-- Create the stored procedure
CREATE PROCEDURE sp_generateInvoiceNumber
    @Year INT,
    @InvoiceNumber NVARCHAR(20) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the year exists in the sequence table
    IF NOT EXISTS (SELECT 1 FROM InvoiceSequences WHERE YearPart = @Year)
    BEGIN
        -- Insert new year with starting number 1
        INSERT INTO InvoiceSequences (YearPart, NextNumber)
        VALUES (@Year, 1);
    END
    ELSE
    BEGIN
        -- Increment the next number for existing year
        UPDATE InvoiceSequences
        SET NextNumber = NextNumber + 1
        WHERE YearPart = @Year;
    END

    -- Get the current invoice number for the year
    DECLARE @CurrentNumber INT;
    SELECT @CurrentNumber = NextNumber - 1 FROM InvoiceSequences WHERE YearPart = @Year;

    -- Format the invoice number as YYYY-NNNN (e.g., 2026-0001)
    SET @InvoiceNumber = CONCAT(@Year, '-', RIGHT('000' + CAST(@CurrentNumber AS NVARCHAR(4)), 4));
END

-- Drop the stored procedure (Down migration)
IF OBJECT_ID('sp_generateInvoiceNumber', 'P') IS NOT NULL
DROP PROCEDURE sp_generateInvoiceNumber;
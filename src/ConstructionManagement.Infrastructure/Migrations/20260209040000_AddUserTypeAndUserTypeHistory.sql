-- Migration: Add UserType and UserTypeHistory
-- Date: 2026-02-09

-- 1. Add UserType column to Users table
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Users')
    AND name = 'UserType'
)
BEGIN
    ALTER TABLE Users ADD UserType INT NOT NULL DEFAULT 0;
    PRINT 'Added UserType column to Users table';
END

-- 2. Add OriginalUserType column to Notifications table
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Notifications')
    AND name = 'OriginalUserType'
)
BEGIN
    ALTER TABLE Notifications ADD OriginalUserType INT NULL;
    PRINT 'Added OriginalUserType column to Notifications table';
END

-- 3. Create UserTypeHistories table
IF NOT EXISTS (
    SELECT * FROM sys.tables
    WHERE name = 'UserTypeHistories'
)
BEGIN
    CREATE TABLE UserTypeHistories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        PreviousType INT NOT NULL,
        NewType INT NOT NULL,
        ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ChangedBy NVARCHAR(MAX) NULL,
        Reason NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CompanyId INT NULL,

        CONSTRAINT FK_UserTypeHistories_Users FOREIGN KEY (UserId)
            REFERENCES Users(Id) ON DELETE CASCADE
    );

    PRINT 'Created UserTypeHistories table';

    -- Create index for faster queries
    CREATE INDEX IX_UserTypeHistories_UserId ON UserTypeHistories(UserId);
    CREATE INDEX IX_UserTypeHistories_ChangedAt ON UserTypeHistories(ChangedAt);
END

PRINT 'Migration completed successfully';
GO

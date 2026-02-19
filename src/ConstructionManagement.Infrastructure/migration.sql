BEGIN TRANSACTION;
ALTER TABLE [Users] ADD [ReportsToId] int NULL;

ALTER TABLE [Users] ADD [RequiresPasswordChange] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Users] ADD [Salary] decimal(18,2) NOT NULL DEFAULT 0.0;

CREATE TABLE [Attendances] (
    [Id] int NOT NULL IDENTITY,
    [CompanyId] int NULL,
    [UserId] int NOT NULL,
    [Date] datetime2 NOT NULL,
    [CheckIn] time NULL,
    [CheckOut] time NULL,
    [Location] nvarchar(max) NULL,
    [Latitude] float NULL,
    [Longitude] float NULL,
    [Status] int NOT NULL,
    [Note] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    CONSTRAINT [PK_Attendances] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Attendances_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
);

CREATE TABLE [Certifications] (
    [Id] int NOT NULL IDENTITY,
    [CompanyId] int NULL,
    [UserId] int NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [IssuingAuthority] nvarchar(max) NULL,
    [IssueDate] datetime2 NULL,
    [ExpiryDate] datetime2 NULL,
    [CertificateNumber] nvarchar(max) NULL,
    [DocumentUrl] nvarchar(max) NULL,
    [IsVerified] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    CONSTRAINT [PK_Certifications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Certifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
);

CREATE TABLE [LeaveTypes] (
    [Id] int NOT NULL IDENTITY,
    [CompanyId] int NULL,
    [Name] nvarchar(450) NOT NULL,
    [Description] nvarchar(max) NULL,
    [DefaultDays] int NOT NULL,
    [IsPaid] bit NOT NULL,
    [RequiresApproval] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    CONSTRAINT [PK_LeaveTypes] PRIMARY KEY ([Id])
);

CREATE TABLE [Payrolls] (
    [Id] int NOT NULL IDENTITY,
    [CompanyId] int NULL,
    [UserId] int NOT NULL,
    [Month] int NOT NULL,
    [Year] int NOT NULL,
    [BaseSalary] decimal(18,2) NOT NULL,
    [Bonuses] decimal(18,2) NOT NULL,
    [Deductions] decimal(18,2) NOT NULL,
    [NetSalary] decimal(18,2) NOT NULL,
    [IsPaid] bit NOT NULL,
    [PaymentDate] datetime2 NULL,
    [Note] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    CONSTRAINT [PK_Payrolls] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Payrolls_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [LeaveRequests] (
    [Id] int NOT NULL IDENTITY,
    [CompanyId] int NULL,
    [UserId] int NOT NULL,
    [LeaveTypeId] int NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [Reason] nvarchar(max) NULL,
    [Status] int NOT NULL,
    [ApprovedByUserId] int NULL,
    [ActionDate] datetime2 NULL,
    [RejectionReason] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    CONSTRAINT [PK_LeaveRequests] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LeaveRequests_LeaveTypes_LeaveTypeId] FOREIGN KEY ([LeaveTypeId]) REFERENCES [LeaveTypes] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_LeaveRequests_Users_ApprovedByUserId] FOREIGN KEY ([ApprovedByUserId]) REFERENCES [Users] ([Id]),
    CONSTRAINT [FK_LeaveRequests_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CompanyId', N'CreatedAt', N'DefaultDays', N'DeletedAt', N'Description', N'IsDeleted', N'IsPaid', N'Name', N'RequiresApproval', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[LeaveTypes]'))
    SET IDENTITY_INSERT [LeaveTypes] ON;
INSERT INTO [LeaveTypes] ([Id], [CompanyId], [CreatedAt], [DefaultDays], [DeletedAt], [Description], [IsDeleted], [IsPaid], [Name], [RequiresApproval], [UpdatedAt])
VALUES (1, NULL, '2025-01-01T00:00:00.0000000Z', 21, NULL, N'Standard yearly vacation', CAST(0 AS bit), CAST(1 AS bit), N'Annual Leave', CAST(1 AS bit), NULL),
(2, NULL, '2025-01-01T00:00:00.0000000Z', 15, NULL, N'Medical leave', CAST(0 AS bit), CAST(1 AS bit), N'Sick Leave', CAST(1 AS bit), NULL),
(3, NULL, '2025-01-01T00:00:00.0000000Z', 0, NULL, N'Leave without pay', CAST(0 AS bit), CAST(0 AS bit), N'Unpaid Leave', CAST(1 AS bit), NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CompanyId', N'CreatedAt', N'DefaultDays', N'DeletedAt', N'Description', N'IsDeleted', N'IsPaid', N'Name', N'RequiresApproval', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[LeaveTypes]'))
    SET IDENTITY_INSERT [LeaveTypes] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CompanyId', N'CreatedAt', N'DeletedAt', N'Description', N'IsDeleted', N'Name', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Permissions]'))
    SET IDENTITY_INSERT [Permissions] ON;
INSERT INTO [Permissions] ([Id], [CompanyId], [CreatedAt], [DeletedAt], [Description], [IsDeleted], [Name], [UpdatedAt])
VALUES (123, NULL, '2025-01-01T00:00:00.0000000Z', NULL, N'Manage employee attendance', CAST(0 AS bit), N'HR.Attendance', NULL),
(124, NULL, '2025-01-01T00:00:00.0000000Z', NULL, N'Manage employee leave requests', CAST(0 AS bit), N'HR.LeaveManagement', NULL),
(125, NULL, '2025-01-01T00:00:00.0000000Z', NULL, N'Manage employee certifications', CAST(0 AS bit), N'HR.Certifications', NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CompanyId', N'CreatedAt', N'DeletedAt', N'Description', N'IsDeleted', N'Name', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Permissions]'))
    SET IDENTITY_INSERT [Permissions] OFF;

UPDATE [UserRoles] SET [AssignedAt] = '2026-02-19T14:42:26.5563311Z'
WHERE [RoleId] = 1 AND [UserId] = 1;
SELECT @@ROWCOUNT;


UPDATE [Users] SET [ReportsToId] = NULL, [RequiresPasswordChange] = CAST(0 AS bit), [Salary] = 0.0
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


CREATE INDEX [IX_Users_ReportsToId] ON [Users] ([ReportsToId]);

CREATE INDEX [IX_Attendances_Date] ON [Attendances] ([Date]);

CREATE INDEX [IX_Attendances_Status] ON [Attendances] ([Status]);

CREATE INDEX [IX_Attendances_UserId] ON [Attendances] ([UserId]);

CREATE INDEX [IX_Attendances_UserId_Date] ON [Attendances] ([UserId], [Date]);

CREATE INDEX [IX_Certifications_ExpiryDate] ON [Certifications] ([ExpiryDate]);

CREATE INDEX [IX_Certifications_UserId] ON [Certifications] ([UserId]);

CREATE INDEX [IX_LeaveRequests_ApprovedByUserId] ON [LeaveRequests] ([ApprovedByUserId]);

CREATE INDEX [IX_LeaveRequests_EndDate] ON [LeaveRequests] ([EndDate]);

CREATE INDEX [IX_LeaveRequests_LeaveTypeId] ON [LeaveRequests] ([LeaveTypeId]);

CREATE INDEX [IX_LeaveRequests_StartDate] ON [LeaveRequests] ([StartDate]);

CREATE INDEX [IX_LeaveRequests_Status] ON [LeaveRequests] ([Status]);

CREATE INDEX [IX_LeaveRequests_UserId] ON [LeaveRequests] ([UserId]);

CREATE INDEX [IX_LeaveTypes_Name] ON [LeaveTypes] ([Name]);

CREATE UNIQUE INDEX [IX_Payrolls_UserId_Year_Month] ON [Payrolls] ([UserId], [Year], [Month]);

ALTER TABLE [Users] ADD CONSTRAINT [FK_Users_Users_ReportsToId] FOREIGN KEY ([ReportsToId]) REFERENCES [Users] ([Id]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260219144234_CodeFirst11Migration', N'9.0.1');

COMMIT;
GO


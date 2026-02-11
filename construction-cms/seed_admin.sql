-- Seed script for admin user
-- Run this in SQL Server Management Studio or via sqlcmd

USE ConstructionDB;

-- Insert Admin User with BCrypt hash for password "admin"
INSERT INTO Users (FirstName, LastName, Email, Username, PasswordHash, CreatedAt, CompanyId, IsEmailVerified, EmailVerificationToken, UserType)
VALUES (
    'System', 
    'Admin', 
    'admin@construction.com', 
    'admin', 
    '$2a$11$2V/xg8YvJCLO6hdSdHbmg.UIB1zjy0Y/lG0I2XXKlPUSXqMB0eYw6',  -- BCrypt hash for "admin"
    GETUTCDATE(), 
    NULL, 
    1, 
    NULL, 
    0
);

-- Add SuperAdmin role to the user
INSERT INTO UserRoles (UserId, RoleId, CreatedAt)
VALUES (1, 1, GETUTCDATE());

PRINT 'Admin user created successfully!';
PRINT 'Email: admin@construction.com';
PRINT 'Password: admin';

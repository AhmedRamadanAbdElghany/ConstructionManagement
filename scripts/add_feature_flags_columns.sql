-- Script to add new feature flag columns to CompanySettings table
-- Run this script to add the new columns for feature flags

-- Add new columns to CompanySettings table (if they don't exist)
-- Default values updated to false for security (opt-in model)
-- EXCEPT: EnableFinancialManagement and EnableAnalytics default to true for backward compatibility
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableInspections')
BEGIN
    ALTER TABLE CompanySettings ADD EnableInspections bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableInspections'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableLeaveManagement')
BEGIN
    ALTER TABLE CompanySettings ADD EnableLeaveManagement bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableLeaveManagement'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnablePerformanceEvaluation')
BEGIN
    ALTER TABLE CompanySettings ADD EnablePerformanceEvaluation bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnablePerformanceEvaluation'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableTrainingTracking')
BEGIN
    ALTER TABLE CompanySettings ADD EnableTrainingTracking bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableTrainingTracking'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableTasks')
BEGIN
    ALTER TABLE CompanySettings ADD EnableTasks bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableTasks'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableEscalations')
BEGIN
    ALTER TABLE CompanySettings ADD EnableEscalations bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableEscalations'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableMessaging')
BEGIN
    ALTER TABLE CompanySettings ADD EnableMessaging bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableMessaging'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableSocialWall')
BEGIN
    ALTER TABLE CompanySettings ADD EnableSocialWall bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableSocialWall'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableCurrencies')
BEGIN
    ALTER TABLE CompanySettings ADD EnableCurrencies bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableCurrencies'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnablePaymentGateway')
BEGIN
    ALTER TABLE CompanySettings ADD EnablePaymentGateway bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnablePaymentGateway'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableMarketplace')
BEGIN
    ALTER TABLE CompanySettings ADD EnableMarketplace bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableMarketplace'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableInventoryOwner')
BEGIN
    ALTER TABLE CompanySettings ADD EnableInventoryOwner bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableInventoryOwner'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableVideoCalls')
BEGIN
    ALTER TABLE CompanySettings ADD EnableVideoCalls bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableVideoCalls'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableLocationTracking')
BEGIN
    ALTER TABLE CompanySettings ADD EnableLocationTracking bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableLocationTracking'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableGeofenceManagement')
BEGIN
    ALTER TABLE CompanySettings ADD EnableGeofenceManagement bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableGeofenceManagement'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CompanySettings') AND name = 'EnableLocationSubmit')
BEGIN
    ALTER TABLE CompanySettings ADD EnableLocationSubmit bit NOT NULL DEFAULT(0)
    PRINT 'Added column: EnableLocationSubmit'
END

PRINT 'Feature flags migration completed'
GO

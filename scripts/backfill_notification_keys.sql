-- Backfill localization keys for existing notifications
-- This script updates existing notifications to have localization keys for dynamic translation
-- Run this script in SQL Server Management Studio or via dotnet ef database update

-- Update CompanyApproved notifications
-- Arabic pattern: "تمت الموافقة على طلب تسجيل شركتك: {companyName}"
-- English pattern: "Your company registration request was approved: {companyName}"
UPDATE Notifications
SET MessageKey = 'CompanyApproved',
    TitleKey = 'NotificationTitle.ApprovalGranted',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX(': ', Message) + 2, LEN(Message))) + '"]'
WHERE (Message LIKE 'تمت الموافقة على طلب تسجيل شركتك:%' OR Message LIKE 'Your company registration request was approved:%')
  AND MessageKey IS NULL;

-- Update CompanyRejected notifications
-- Arabic pattern: "تم رفض طلب تسجيل شركتك. السبب: {reason}"
-- English pattern: "Your company registration request was rejected. Reason: {reason}"
UPDATE Notifications
SET MessageKey = 'CompanyRejected',
    TitleKey = 'NotificationTitle.ApprovalRejected',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX('السبب: ', Message) + 7, LEN(Message))) + '"]'
WHERE Message LIKE 'تم رفض طلب تسجيل شركتك.%' AND MessageKey IS NULL;

UPDATE Notifications
SET MessageKey = 'CompanyRejected',
    TitleKey = 'NotificationTitle.ApprovalRejected',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX('Reason: ', Message) + 8, LEN(Message))) + '"]'
WHERE Message LIKE 'Your company registration request was rejected.%' AND MessageKey IS NULL;

-- Update JoinApproved notifications
-- Arabic pattern: "تمت الموافقة على طلب انضمامك إلى: {companyName}"
-- English pattern: "Your join request was approved for: {companyName}"
UPDATE Notifications
SET MessageKey = 'JoinApproved',
    TitleKey = 'NotificationTitle.ApprovalGranted',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX(': ', Message) + 2, LEN(Message))) + '"]'
WHERE (Message LIKE 'تمت الموافقة على طلب انضمامك إلى:%' OR Message LIKE 'Your join request was approved for:%')
  AND MessageKey IS NULL;

-- Update JoinRejected notifications
-- Arabic pattern: "تم رفض طلب انضمامك. السبب: {reason}"
-- English pattern: "Your join request was rejected. Reason: {reason}"
UPDATE Notifications
SET MessageKey = 'JoinRejected',
    TitleKey = 'NotificationTitle.ApprovalRejected',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX('السبب: ', Message) + 7, LEN(Message))) + '"]'
WHERE Message LIKE 'تم رفض طلب انضمامك.%' AND MessageKey IS NULL;

UPDATE Notifications
SET MessageKey = 'JoinRejected',
    TitleKey = 'NotificationTitle.ApprovalRejected',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX('Reason: ', Message) + 8, LEN(Message))) + '"]'
WHERE Message LIKE 'Your join request was rejected.%' AND MessageKey IS NULL;

-- Update NewCompanyRequest notifications (for admins)
-- Arabic pattern: "طلب تسجيل شركة جديد: {companyName}"
-- English pattern: "New company registration request: {companyName}"
UPDATE Notifications
SET MessageKey = 'NewCompanyRequest',
    TitleKey = 'NotificationTitle.Escalation',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX(': ', Message) + 2, LEN(Message))) + '"]'
WHERE (Message LIKE 'طلب تسجيل شركة جديد:%' OR Message LIKE 'New company registration request:%')
  AND MessageKey IS NULL;

-- Update NewJoinRequest notifications (for company admins)
-- Arabic pattern: "طلب انضمام جديد من: {userName}"
-- English pattern: "New join request from: {userName}" OR "{userName} wants to join your company"
UPDATE Notifications
SET MessageKey = 'NewJoinRequest',
    TitleKey = 'NotificationTitle.Escalation',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX(': ', Message) + 2, LEN(Message))) + '"]'
WHERE Message LIKE 'طلب انضمام جديد من:%' AND MessageKey IS NULL;

UPDATE Notifications
SET MessageKey = 'NewJoinRequest',
    TitleKey = 'NotificationTitle.Escalation',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX(': ', Message) + 2, LEN(Message))) + '"]'
WHERE Message LIKE 'New join request from:%' AND MessageKey IS NULL;

-- For "{userName} wants to join your company" pattern
UPDATE Notifications
SET MessageKey = 'NewJoinRequest',
    TitleKey = 'NotificationTitle.Escalation',
    MessageArgs = '["' + LEFT(Message, CHARINDEX(' wants to join your company', Message) - 1) + '"]'
WHERE Message LIKE '% wants to join your company' AND MessageKey IS NULL;

-- Update RegistrationPending notifications
-- Arabic pattern: "تم تقديم طلب التسجيل بنجاح. في انتظار مراجعة الإدارة."
-- English pattern: "Your registration request has been submitted successfully. Pending admin review."
UPDATE Notifications
SET MessageKey = 'RegistrationPending',
    TitleKey = 'NotificationTitle.General'
WHERE (Message LIKE 'تم تقديم طلب التسجيل بنجاح%' OR Message LIKE 'Your registration request has been submitted successfully%')
  AND MessageKey IS NULL;

-- Update BudgetWarning notifications
-- Arabic pattern: "تحذير: تجاوز الميزانية للمشروع..."
-- English pattern: "Warning: Budget exceeded for project..."
UPDATE Notifications
SET MessageKey = 'BudgetWarning',
    TitleKey = 'NotificationTitle.Escalation'
WHERE (Message LIKE 'تحذير: تجاوز الميزانية%' OR Message LIKE 'Warning: Budget exceeded%')
  AND MessageKey IS NULL;

-- Update ProjectDelay notifications
-- Arabic pattern: "تأخر المشروع: {projectName}"
-- English pattern: "Project delay: {projectName}"
UPDATE Notifications
SET MessageKey = 'ProjectDelay',
    TitleKey = 'NotificationTitle.Escalation'
WHERE (Message LIKE 'تأخر المشروع:%' OR Message LIKE 'Project delay:%')
  AND MessageKey IS NULL;

-- View the updated notifications
SELECT Id, UserId, Title, Message, MessageKey, TitleKey, MessageArgs, CreatedAt
FROM Notifications
WHERE MessageKey IS NOT NULL
ORDER BY CreatedAt DESC;

-- View count of notifications updated
SELECT 
    COUNT(*) AS TotalNotifications,
    SUM(CASE WHEN MessageKey IS NOT NULL THEN 1 ELSE 0 END) AS NotificationsWithKeys,
    SUM(CASE WHEN MessageKey IS NULL THEN 1 ELSE 0 END) AS NotificationsWithoutKeys
FROM Notifications;

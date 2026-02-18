-- Backfill remaining notifications that don't have MessageKey

-- Update NewCompanyRequest notifications (IDs 1, 3)
UPDATE Notifications
SET MessageKey = 'NewCompanyRequest',
    TitleKey = 'NotificationTitle.Escalation',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX(': ', Message) + 2, LEN(Message))) + '"]'
WHERE Id IN (1, 3) AND MessageKey IS NULL;

-- Update RegistrationPending notifications (IDs 2, 4)
UPDATE Notifications
SET MessageKey = 'RegistrationPending',
    TitleKey = 'NotificationTitle.RegistrationPending'
WHERE Id IN (2, 4) AND MessageKey IS NULL;

-- Update CompanyApproved notifications (IDs 5, 6)
UPDATE Notifications
SET MessageKey = 'CompanyApproved',
    TitleKey = 'NotificationTitle.ApprovalGranted',
    MessageArgs = '["' + LTRIM(SUBSTRING(Message, CHARINDEX(': ', Message) + 2, LEN(Message))) + '"]'
WHERE Id IN (5, 6) AND MessageKey IS NULL;

-- View all notifications
SELECT Id, UserId, Title, Message, MessageKey, TitleKey, MessageArgs, CreatedAt
FROM Notifications
ORDER BY Id;

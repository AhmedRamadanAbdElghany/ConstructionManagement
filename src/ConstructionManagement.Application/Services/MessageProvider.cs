using ConstructionManagement.Application.Constants;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Services;

/// <summary>
/// Provides bilingual (Arabic/English) messages for the application.
/// Arabic is the primary language as per application requirements.
/// </summary>
public static class MessageProvider
{
    private static readonly Dictionary<string, LocalizedMessage> _messages = new()
    {
        // ==================== General Messages ====================
        [MessageKeys.Success] = new LocalizedMessage("Success", "Success"),
        [MessageKeys.Failed] = new LocalizedMessage("Failed", "Failed"),
        [MessageKeys.InvalidRequest] = new LocalizedMessage("Invalid request data", "Invalid request data"),
        [MessageKeys.NotFound] = new LocalizedMessage("Not found", "Not found"),
        [MessageKeys.Unauthorized] = new LocalizedMessage("Unauthorized access", "Unauthorized access"),
        [MessageKeys.Forbidden] = new LocalizedMessage("Access denied", "Access denied"),
        [MessageKeys.InternalError] = new LocalizedMessage("Internal server error", "Internal server error"),
        [MessageKeys.InvalidId] = new LocalizedMessage("Invalid ID provided", "Invalid ID provided"),

        // ==================== Authentication Messages ====================
        [MessageKeys.AuthLoginSuccess] = new LocalizedMessage("Login successful", "Login successful"),
        [MessageKeys.AuthLoginFailed] = new LocalizedMessage("Login failed", "Login failed"),
        [MessageKeys.AuthInvalidCredentials] = new LocalizedMessage("Invalid email or password", "Invalid email or password"),
        [MessageKeys.AuthUserNotFound] = new LocalizedMessage("User not found", "User not found"),
        [MessageKeys.AuthUserAlreadyExists] = new LocalizedMessage("User already exists", "User already exists"),
        [MessageKeys.AuthEmailNotConfirmed] = new LocalizedMessage("Email not confirmed", "Email not confirmed"),
        [MessageKeys.AuthAccountLocked] = new LocalizedMessage("Account is locked", "Account is locked"),
        [MessageKeys.AuthPasswordResetSent] = new LocalizedMessage("Password reset email sent", "Password reset email sent"),
        [MessageKeys.AuthPasswordResetFailed] = new LocalizedMessage("Password reset failed", "Password reset failed"),
        [MessageKeys.AuthPasswordChanged] = new LocalizedMessage("Password changed successfully", "Password changed successfully"),
        [MessageKeys.AuthInvalidToken] = new LocalizedMessage("Invalid token", "Invalid token"),
        [MessageKeys.AuthTokenExpired] = new LocalizedMessage("Token has expired", "Token has expired"),
        [MessageKeys.AuthRegisterSuccess] = new LocalizedMessage("Registration successful", "Registration successful"),
        [MessageKeys.AuthRegisterFailed] = new LocalizedMessage("Registration failed", "Registration failed"),
        [MessageKeys.AuthLogoutSuccess] = new LocalizedMessage("Logout successful", "Logout successful"),
        [MessageKeys.AuthPasswordIncorrect] = new LocalizedMessage("Current password is incorrect", "Current password is incorrect"),
        [MessageKeys.AuthResetLinkSent] = new LocalizedMessage("If the email exists, a reset link has been sent", "If the email exists, a reset link has been sent"),
        [MessageKeys.AuthPasswordSet] = new LocalizedMessage("Password set successfully", "Password set successfully"),

        // ==================== User Messages ====================
        [MessageKeys.UserCreated] = new LocalizedMessage("User created successfully", "User created successfully"),
        [MessageKeys.UserUpdated] = new LocalizedMessage("User updated successfully", "User updated successfully"),
        [MessageKeys.UserDeleted] = new LocalizedMessage("User deleted successfully", "User deleted successfully"),
        [MessageKeys.UserNotFound] = new LocalizedMessage("User not found", "User not found"),
        [MessageKeys.UserAlreadyExists] = new LocalizedMessage("User already exists", "User already exists"),
        [MessageKeys.UserEmailTaken] = new LocalizedMessage("Email is already taken", "Email is already taken"),
        [MessageKeys.UserPhoneTaken] = new LocalizedMessage("Phone number is already taken", "Phone number is already taken"),
        [MessageKeys.UserProfileUpdated] = new LocalizedMessage("Profile updated successfully", "Profile updated successfully"),
        [MessageKeys.UserPasswordChanged] = new LocalizedMessage("Password changed successfully", "Password changed successfully"),
        [MessageKeys.UserInvalidPassword] = new LocalizedMessage("Invalid password", "Invalid password"),

        // ==================== Client Portal Messages ====================
        [MessageKeys.ClientNotFound] = new LocalizedMessage("Client user not found", "Client user not found"),
        [MessageKeys.ClientCreated] = new LocalizedMessage("Client created successfully", "Client created successfully"),
        [MessageKeys.ClientUpdated] = new LocalizedMessage("Client updated successfully", "Client updated successfully"),
        [MessageKeys.ClientDeleted] = new LocalizedMessage("Client deleted successfully", "Client deleted successfully"),
        [MessageKeys.ClientAlreadyExists] = new LocalizedMessage("Client already exists", "Client already exists"),
        [MessageKeys.ClientProjectNotFound] = new LocalizedMessage("Project not found for this client", "Project not found for this client"),
        [MessageKeys.ClientReportGenerated] = new LocalizedMessage("Report generated successfully", "Report generated successfully"),
        [MessageKeys.ClientReportFailed] = new LocalizedMessage("Failed to generate report", "Failed to generate report"),
        [MessageKeys.ClientJoinRequestSent] = new LocalizedMessage("Join request sent successfully", "Join request sent successfully"),
        [MessageKeys.ClientJoinRequestFailed] = new LocalizedMessage("Failed to send join request", "Failed to send join request"),
        [MessageKeys.ClientJoinRequestAlreadyExists] = new LocalizedMessage("Join request already exists", "Join request already exists"),
        [MessageKeys.ClientCreateFailed] = new LocalizedMessage("Failed to create client", "Failed to create client"),
        [MessageKeys.ClientAccessGranted] = new LocalizedMessage("Project access granted successfully", "Project access granted successfully"),

        // ==================== Project Messages ====================
        [MessageKeys.ProjectCreated] = new LocalizedMessage("Project created successfully", "Project created successfully"),
        [MessageKeys.ProjectUpdated] = new LocalizedMessage("Project updated successfully", "Project updated successfully"),
        [MessageKeys.ProjectDeleted] = new LocalizedMessage("Project deleted successfully", "Project deleted successfully"),
        [MessageKeys.ProjectNotFound] = new LocalizedMessage("Project not found", "Project not found"),
        [MessageKeys.ProjectAlreadyExists] = new LocalizedMessage("Project already exists", "Project already exists"),
        [MessageKeys.ProjectStatusUpdated] = new LocalizedMessage("Project status updated successfully", "Project status updated successfully"),
        [MessageKeys.ProjectProgressUpdated] = new LocalizedMessage("Project progress updated successfully", "Project progress updated successfully"),
        [MessageKeys.ProjectArchived] = new LocalizedMessage("Project archived successfully", "Project archived successfully"),
        [MessageKeys.ProjectRestored] = new LocalizedMessage("Project restored successfully", "Project restored successfully"),
        [MessageKeys.ProjectCannotBeDeleted] = new LocalizedMessage("Project cannot be deleted", "Project cannot be deleted"),

        // ==================== Company Messages ====================
        [MessageKeys.CompanyCreated] = new LocalizedMessage("Company created successfully", "Company created successfully"),
        [MessageKeys.CompanyUpdated] = new LocalizedMessage("Company updated successfully", "Company updated successfully"),
        [MessageKeys.CompanyDeleted] = new LocalizedMessage("Company deleted successfully", "Company deleted successfully"),
        [MessageKeys.CompanyNotFound] = new LocalizedMessage("Company not found", "Company not found"),
        [MessageKeys.CompanyAlreadyExists] = new LocalizedMessage("Company already exists", "Company already exists"),
        [MessageKeys.CompanyRequestSubmitted] = new LocalizedMessage("Company request submitted successfully", "Company request submitted successfully"),
        [MessageKeys.CompanyRequestApproved] = new LocalizedMessage("Company request approved", "Company request approved"),
        [MessageKeys.CompanyRequestRejected] = new LocalizedMessage("Company request rejected", "Company request rejected"),
        [MessageKeys.CompanyRequestNotFound] = new LocalizedMessage("Company request not found", "Company request not found"),

        // ==================== Material Messages ====================
        [MessageKeys.MaterialCreated] = new LocalizedMessage("Material created successfully", "Material created successfully"),
        [MessageKeys.MaterialUpdated] = new LocalizedMessage("Material updated successfully", "Material updated successfully"),
        [MessageKeys.MaterialDeleted] = new LocalizedMessage("Material deleted successfully", "Material deleted successfully"),
        [MessageKeys.MaterialNotFound] = new LocalizedMessage("Material not found", "Material not found"),
        [MessageKeys.MaterialAlreadyExists] = new LocalizedMessage("Material already exists", "Material already exists"),
        [MessageKeys.MaterialLowStock] = new LocalizedMessage("Material is low in stock", "Material is low in stock"),
        [MessageKeys.MaterialOutOfStock] = new LocalizedMessage("Material is out of stock", "Material is out of stock"),
        [MessageKeys.MaterialRequestCreated] = new LocalizedMessage("Material request created successfully", "Material request created successfully"),
        [MessageKeys.MaterialRequestUpdated] = new LocalizedMessage("Material request updated successfully", "Material request updated successfully"),
        [MessageKeys.MaterialRequestApproved] = new LocalizedMessage("Material request approved", "Material request approved"),
        [MessageKeys.MaterialRequestRejected] = new LocalizedMessage("Material request rejected", "Material request rejected"),
        [MessageKeys.MaterialRequestNotFound] = new LocalizedMessage("Material request not found", "Material request not found"),
        [MessageKeys.MaterialRequestCannotBeModified] = new LocalizedMessage("Material request cannot be modified", "Material request cannot be modified"),

        // ==================== Equipment Messages ====================
        [MessageKeys.EquipmentCreated] = new LocalizedMessage("Equipment created successfully", "Equipment created successfully"),
        [MessageKeys.EquipmentUpdated] = new LocalizedMessage("Equipment updated successfully", "Equipment updated successfully"),
        [MessageKeys.EquipmentDeleted] = new LocalizedMessage("Equipment deleted successfully", "Equipment deleted successfully"),
        [MessageKeys.EquipmentNotFound] = new LocalizedMessage("Equipment not found", "Equipment not found"),
        [MessageKeys.EquipmentAlreadyExists] = new LocalizedMessage("Equipment already exists", "Equipment already exists"),
        [MessageKeys.EquipmentAssigned] = new LocalizedMessage("Equipment assigned successfully", "Equipment assigned successfully"),
        [MessageKeys.EquipmentUnassigned] = new LocalizedMessage("Equipment unassigned successfully", "Equipment unassigned successfully"),
        [MessageKeys.EquipmentNotAvailable] = new LocalizedMessage("Equipment is not available", "Equipment is not available"),
        [MessageKeys.EquipmentUnderMaintenance] = new LocalizedMessage("Equipment is under maintenance", "Equipment is under maintenance"),
        [MessageKeys.EquipmentMaintenanceScheduled] = new LocalizedMessage("Equipment maintenance scheduled", "Equipment maintenance scheduled"),
        [MessageKeys.EquipmentMaintenanceCompleted] = new LocalizedMessage("Equipment maintenance completed", "Equipment maintenance completed"),

        // ==================== Inventory Messages ====================
        [MessageKeys.InventoryUpdated] = new LocalizedMessage("Inventory updated successfully", "Inventory updated successfully"),
        [MessageKeys.InventoryNotFound] = new LocalizedMessage("Inventory not found", "Inventory not found"),
        [MessageKeys.InventoryInsufficientStock] = new LocalizedMessage("Insufficient stock available", "Insufficient stock available"),
        [MessageKeys.InventoryOrderCreated] = new LocalizedMessage("Inventory order created successfully", "Inventory order created successfully"),
        [MessageKeys.InventoryOrderUpdated] = new LocalizedMessage("Inventory order updated successfully", "Inventory order updated successfully"),
        [MessageKeys.InventoryOrderCompleted] = new LocalizedMessage("Inventory order completed", "Inventory order completed"),
        [MessageKeys.InventoryOrderCancelled] = new LocalizedMessage("Inventory order cancelled", "Inventory order cancelled"),
        [MessageKeys.InventoryOrderNotFound] = new LocalizedMessage("Inventory order not found", "Inventory order not found"),

        // ==================== Warehouse Messages ====================
        [MessageKeys.WarehouseCreated] = new LocalizedMessage("Warehouse created successfully", "Warehouse created successfully"),
        [MessageKeys.WarehouseUpdated] = new LocalizedMessage("Warehouse updated successfully", "Warehouse updated successfully"),
        [MessageKeys.WarehouseDeleted] = new LocalizedMessage("Warehouse deleted successfully", "Warehouse deleted successfully"),
        [MessageKeys.WarehouseNotFound] = new LocalizedMessage("Warehouse not found", "Warehouse not found"),
        [MessageKeys.WarehouseOrderCreated] = new LocalizedMessage("Warehouse order created successfully", "Warehouse order created successfully"),
        [MessageKeys.WarehouseOrderApproved] = new LocalizedMessage("Warehouse order approved", "Warehouse order approved"),
        [MessageKeys.WarehouseOrderRejected] = new LocalizedMessage("Warehouse order rejected", "Warehouse order rejected"),
        [MessageKeys.WarehouseOrderNotFound] = new LocalizedMessage("Warehouse order not found", "Warehouse order not found"),

        // ==================== Task Messages ====================
        [MessageKeys.TaskCreated] = new LocalizedMessage("Task created successfully", "Task created successfully"),
        [MessageKeys.TaskUpdated] = new LocalizedMessage("Task updated successfully", "Task updated successfully"),
        [MessageKeys.TaskDeleted] = new LocalizedMessage("Task deleted successfully", "Task deleted successfully"),
        [MessageKeys.TaskNotFound] = new LocalizedMessage("Task not found", "Task not found"),
        [MessageKeys.TaskAssigned] = new LocalizedMessage("Task assigned successfully", "Task assigned successfully"),
        [MessageKeys.TaskUnassigned] = new LocalizedMessage("Task unassigned successfully", "Task unassigned successfully"),
        [MessageKeys.TaskStatusUpdated] = new LocalizedMessage("Task status updated successfully", "Task status updated successfully"),
        [MessageKeys.TaskProgressUpdated] = new LocalizedMessage("Task progress updated successfully", "Task progress updated successfully"),
        [MessageKeys.TaskCompleted] = new LocalizedMessage("Task completed successfully", "Task completed successfully"),
        [MessageKeys.TaskCannotBeDeleted] = new LocalizedMessage("Task cannot be deleted", "Task cannot be deleted"),

        // ==================== Daily Report Messages ====================
        [MessageKeys.DailyReportCreated] = new LocalizedMessage("Daily report created successfully", "Daily report created successfully"),
        [MessageKeys.DailyReportUpdated] = new LocalizedMessage("Daily report updated successfully", "Daily report updated successfully"),
        [MessageKeys.DailyReportDeleted] = new LocalizedMessage("Daily report deleted successfully", "Daily report deleted successfully"),
        [MessageKeys.DailyReportNotFound] = new LocalizedMessage("Daily report not found", "Daily report not found"),
        [MessageKeys.DailyReportSubmitted] = new LocalizedMessage("Daily report submitted successfully", "Daily report submitted successfully"),
        [MessageKeys.DailyReportApproved] = new LocalizedMessage("Daily report approved", "Daily report approved"),
        [MessageKeys.DailyReportRejected] = new LocalizedMessage("Daily report rejected", "Daily report rejected"),

        // ==================== Notification Messages ====================
        [MessageKeys.NotificationSent] = new LocalizedMessage("Notification sent successfully", "Notification sent successfully"),
        [MessageKeys.NotificationNotFound] = new LocalizedMessage("Notification not found", "Notification not found"),
        [MessageKeys.NotificationMarkedAsRead] = new LocalizedMessage("Notification marked as read", "Notification marked as read"),
        [MessageKeys.NotificationAllMarkedAsRead] = new LocalizedMessage("All notifications marked as read", "All notifications marked as read"),

        // ==================== File Messages ====================
        [MessageKeys.FileUploaded] = new LocalizedMessage("File uploaded successfully", "File uploaded successfully"),
        [MessageKeys.FileUploadFailed] = new LocalizedMessage("File upload failed", "File upload failed"),
        [MessageKeys.FileNotFound] = new LocalizedMessage("File not found", "File not found"),
        [MessageKeys.FileDeleted] = new LocalizedMessage("File deleted successfully", "File deleted successfully"),
        [MessageKeys.FileTooLarge] = new LocalizedMessage("File is too large", "File is too large"),
        [MessageKeys.FileInvalidType] = new LocalizedMessage("Invalid file type", "Invalid file type"),

        // ==================== Validation Messages ====================
        [MessageKeys.ValidationRequired] = new LocalizedMessage("This field is required", "This field is required"),
        [MessageKeys.ValidationMinLength] = new LocalizedMessage("Minimum length not met", "Minimum length not met"),
        [MessageKeys.ValidationMaxLength] = new LocalizedMessage("Maximum length exceeded", "Maximum length exceeded"),
        [MessageKeys.ValidationInvalidEmail] = new LocalizedMessage("Invalid email format", "Invalid email format"),
        [MessageKeys.ValidationInvalidPhone] = new LocalizedMessage("Invalid phone number format", "Invalid phone number format"),
        [MessageKeys.ValidationInvalidDate] = new LocalizedMessage("Invalid date format", "Invalid date format"),
        [MessageKeys.ValidationInvalidNumber] = new LocalizedMessage("Invalid number format", "Invalid number format"),
        [MessageKeys.ValidationInvalidRange] = new LocalizedMessage("Value is out of range", "Value is out of range"),
        [MessageKeys.ValidationPasswordMismatch] = new LocalizedMessage("Passwords do not match", "Passwords do not match"),
        [MessageKeys.ValidationPasswordTooWeak] = new LocalizedMessage("Password is too weak", "Password is too weak"),

        // ==================== Permission Messages ====================
        [MessageKeys.PermissionDenied] = new LocalizedMessage("Permission denied", "Permission denied"),
        [MessageKeys.PermissionInsufficient] = new LocalizedMessage("Insufficient permissions", "Insufficient permissions"),
        [MessageKeys.PermissionRoleNotFound] = new LocalizedMessage("Role not found", "Role not found"),
        [MessageKeys.PermissionRoleAssigned] = new LocalizedMessage("Role assigned successfully", "Role assigned successfully"),
        [MessageKeys.PermissionRoleRemoved] = new LocalizedMessage("Role removed successfully", "Role removed successfully"),

        // ==================== Join Request Messages ====================
        [MessageKeys.JoinRequestCreated] = new LocalizedMessage("Join request created successfully", "Join request created successfully"),
        [MessageKeys.JoinRequestNotFound] = new LocalizedMessage("Join request not found", "Join request not found"),
        [MessageKeys.JoinRequestAlreadyProcessed] = new LocalizedMessage("Join request already processed", "Join request already processed"),
        [MessageKeys.JoinRequestApproved] = new LocalizedMessage("Join request approved", "Join request approved"),
        [MessageKeys.JoinRequestRejected] = new LocalizedMessage("Join request rejected", "Join request rejected"),
        [MessageKeys.JoinRequestAlreadyExists] = new LocalizedMessage("Join request already exists", "Join request already exists"),

        // ==================== Attendance Messages ====================
        [MessageKeys.AttendanceCheckedIn] = new LocalizedMessage("Checked in successfully", "Checked in successfully"),
        [MessageKeys.AttendanceCheckedOut] = new LocalizedMessage("Checked out successfully", "Checked out successfully"),
        [MessageKeys.AttendanceAlreadyCheckedIn] = new LocalizedMessage("Already checked in", "Already checked in"),
        [MessageKeys.AttendanceNotCheckedIn] = new LocalizedMessage("Not checked in yet", "Not checked in yet"),
        [MessageKeys.AttendanceNotFound] = new LocalizedMessage("Attendance record not found", "Attendance record not found"),

        // ==================== Progress Messages ====================
        [MessageKeys.ProgressUpdated] = new LocalizedMessage("Progress updated successfully", "Progress updated successfully"),
        [MessageKeys.ProgressNotFound] = new LocalizedMessage("Progress record not found", "Progress record not found"),
        [MessageKeys.ProgressCannotExceed100] = new LocalizedMessage("Progress cannot exceed 100%", "Progress cannot exceed 100%")
    };

    /// <summary>
    /// Gets a bilingual message by its key.
    /// Returns a default message if the key is not found.
    /// </summary>
    /// <param name="key">The message key</param>
    /// <returns>The localized message</returns>
    public static LocalizedMessage GetMessage(string key)
    {
        return _messages.TryGetValue(key, out var message)
            ? message
            : new LocalizedMessage(key, key); // Fallback to key itself
    }

    /// <summary>
    /// Gets a bilingual message by its key with parameter substitution.
    /// </summary>
    /// <param name="key">The message key</param>
    /// <param name="parameters">Parameters to substitute in the message</param>
    /// <returns>The localized message with parameters substituted</returns>
    public static LocalizedMessage GetMessage(string key, params (string name, string value)[] parameters)
    {
        var message = GetMessage(key);
        var ar = message.Ar;
        var en = message.En;

        foreach (var (name, value) in parameters)
        {
            ar = ar.Replace($"{{{name}}}", value);
            en = en.Replace($"{{{name}}}", value);
        }

        return new LocalizedMessage(ar, en);
    }

    /// <summary>
    /// Gets a bilingual message for a specific entity name.
    /// Useful for messages like "Project 'X' not found".
    /// </summary>
    /// <param name="key">The message key</param>
    /// <param name="entityName">The name of the entity</param>
    /// <returns>The localized message with entity name</returns>
    public static LocalizedMessage GetMessageForEntity(string key, string entityName)
    {
        return GetMessage(key, ("entity", entityName));
    }

    /// <summary>
    /// Checks if a message key exists.
    /// </summary>
    /// <param name="key">The message key</param>
    /// <returns>True if the key exists</returns>
    public static bool HasKey(string key) => _messages.ContainsKey(key);

    /// <summary>
    /// Gets all message keys.
    /// </summary>
    /// <returns>All message keys</returns>
    public static IEnumerable<string> GetAllKeys() => _messages.Keys;
}
namespace ConstructionManagement.Application.Constants;

/// <summary>
/// Centralized constants for all message keys used in the application.
/// These keys are used to retrieve bilingual messages from the MessageProvider.
/// </summary>
public static class MessageKeys
{
    // ==================== General Messages ====================
    public const string Success = "General.Success";
    public const string Failed = "General.Failed";
    public const string InvalidRequest = "General.InvalidRequest";
    public const string NotFound = "General.NotFound";
    public const string Unauthorized = "General.Unauthorized";
    public const string Forbidden = "General.Forbidden";
    public const string InternalError = "General.InternalError";
    public const string InvalidId = "General.InvalidId";

    // ==================== Authentication Messages ====================
    public const string AuthLoginSuccess = "Auth.Login.Success";
    public const string AuthLoginFailed = "Auth.Login.Failed";
    public const string AuthInvalidCredentials = "Auth.InvalidCredentials";
    public const string AuthUserNotFound = "Auth.UserNotFound";
    public const string AuthUserAlreadyExists = "Auth.UserAlreadyExists";
    public const string AuthEmailNotConfirmed = "Auth.EmailNotConfirmed";
    public const string AuthAccountLocked = "Auth.AccountLocked";
    public const string AuthPasswordResetSent = "Auth.PasswordResetSent";
    public const string AuthPasswordResetFailed = "Auth.PasswordResetFailed";
    public const string AuthPasswordChanged = "Auth.PasswordChanged";
    public const string AuthInvalidToken = "Auth.InvalidToken";
    public const string AuthTokenExpired = "Auth.TokenExpired";
    public const string AuthRegisterSuccess = "Auth.Register.Success";
    public const string AuthRegisterFailed = "Auth.Register.Failed";
    public const string AuthLogoutSuccess = "Auth.Logout.Success";
    public const string AuthPasswordIncorrect = "Auth.PasswordIncorrect";
    public const string AuthResetLinkSent = "Auth.ResetLinkSent";
    public const string AuthPasswordSet = "Auth.PasswordSet";

    // ==================== User Messages ====================
    public const string UserCreated = "User.Created";
    public const string UserUpdated = "User.Updated";
    public const string UserDeleted = "User.Deleted";
    public const string UserNotFound = "User.NotFound";
    public const string UserAlreadyExists = "User.AlreadyExists";
    public const string UserEmailTaken = "User.EmailTaken";
    public const string UserPhoneTaken = "User.PhoneTaken";
    public const string UserProfileUpdated = "User.ProfileUpdated";
    public const string UserPasswordChanged = "User.PasswordChanged";
    public const string UserInvalidPassword = "User.InvalidPassword";

    // ==================== Client Portal Messages ====================
    public const string ClientNotFound = "Client.NotFound";
    public const string ClientCreated = "Client.Created";
    public const string ClientUpdated = "Client.Updated";
    public const string ClientDeleted = "Client.Deleted";
    public const string ClientAlreadyExists = "Client.AlreadyExists";
    public const string ClientProjectNotFound = "Client.ProjectNotFound";
    public const string ClientReportGenerated = "Client.ReportGenerated";
    public const string ClientReportFailed = "Client.ReportFailed";
    public const string ClientJoinRequestSent = "Client.JoinRequestSent";
    public const string ClientJoinRequestFailed = "Client.JoinRequestFailed";
    public const string ClientJoinRequestAlreadyExists = "Client.JoinRequestAlreadyExists";
    public const string ClientCreateFailed = "Client.CreateFailed";
    public const string ClientAccessGranted = "Client.AccessGranted";

    // ==================== Project Messages ====================
    public const string ProjectCreated = "Project.Created";
    public const string ProjectUpdated = "Project.Updated";
    public const string ProjectDeleted = "Project.Deleted";
    public const string ProjectNotFound = "Project.NotFound";
    public const string ProjectAlreadyExists = "Project.AlreadyExists";
    public const string ProjectStatusUpdated = "Project.StatusUpdated";
    public const string ProjectProgressUpdated = "Project.ProgressUpdated";
    public const string ProjectArchived = "Project.Archived";
    public const string ProjectRestored = "Project.Restored";
    public const string ProjectCannotBeDeleted = "Project.CannotBeDeleted";

    // ==================== Company Messages ====================
    public const string CompanyCreated = "Company.Created";
    public const string CompanyUpdated = "Company.Updated";
    public const string CompanyDeleted = "Company.Deleted";
    public const string CompanyNotFound = "Company.NotFound";
    public const string CompanyAlreadyExists = "Company.AlreadyExists";
    public const string CompanyRequestSubmitted = "Company.RequestSubmitted";
    public const string CompanyRequestApproved = "Company.RequestApproved";
    public const string CompanyRequestRejected = "Company.RequestRejected";
    public const string CompanyRequestNotFound = "Company.RequestNotFound";

    // ==================== Material Messages ====================
    public const string MaterialCreated = "Material.Created";
    public const string MaterialUpdated = "Material.Updated";
    public const string MaterialDeleted = "Material.Deleted";
    public const string MaterialNotFound = "Material.NotFound";
    public const string MaterialAlreadyExists = "Material.AlreadyExists";
    public const string MaterialLowStock = "Material.LowStock";
    public const string MaterialOutOfStock = "Material.OutOfStock";
    public const string MaterialRequestCreated = "Material.RequestCreated";
    public const string MaterialRequestUpdated = "Material.RequestUpdated";
    public const string MaterialRequestApproved = "Material.RequestApproved";
    public const string MaterialRequestRejected = "Material.RequestRejected";
    public const string MaterialRequestNotFound = "Material.RequestNotFound";
    public const string MaterialRequestCannotBeModified = "Material.RequestCannotBeModified";

    // ==================== Equipment Messages ====================
    public const string EquipmentCreated = "Equipment.Created";
    public const string EquipmentUpdated = "Equipment.Updated";
    public const string EquipmentDeleted = "Equipment.Deleted";
    public const string EquipmentNotFound = "Equipment.NotFound";
    public const string EquipmentAlreadyExists = "Equipment.AlreadyExists";
    public const string EquipmentAssigned = "Equipment.Assigned";
    public const string EquipmentUnassigned = "Equipment.Unassigned";
    public const string EquipmentNotAvailable = "Equipment.NotAvailable";
    public const string EquipmentUnderMaintenance = "Equipment.UnderMaintenance";
    public const string EquipmentMaintenanceScheduled = "Equipment.MaintenanceScheduled";
    public const string EquipmentMaintenanceCompleted = "Equipment.MaintenanceCompleted";

    // ==================== Inventory Messages ====================
    public const string InventoryUpdated = "Inventory.Updated";
    public const string InventoryNotFound = "Inventory.NotFound";
    public const string InventoryInsufficientStock = "Inventory.InsufficientStock";
    public const string InventoryOrderCreated = "Inventory.OrderCreated";
    public const string InventoryOrderUpdated = "Inventory.OrderUpdated";
    public const string InventoryOrderCompleted = "Inventory.OrderCompleted";
    public const string InventoryOrderCancelled = "Inventory.OrderCancelled";
    public const string InventoryOrderNotFound = "Inventory.OrderNotFound";

    // ==================== Warehouse Messages ====================
    public const string WarehouseCreated = "Warehouse.Created";
    public const string WarehouseUpdated = "Warehouse.Updated";
    public const string WarehouseDeleted = "Warehouse.Deleted";
    public const string WarehouseNotFound = "Warehouse.NotFound";
    public const string WarehouseOrderCreated = "Warehouse.OrderCreated";
    public const string WarehouseOrderApproved = "Warehouse.OrderApproved";
    public const string WarehouseOrderRejected = "Warehouse.OrderRejected";
    public const string WarehouseOrderNotFound = "Warehouse.OrderNotFound";

    // ==================== Task Messages ====================
    public const string TaskCreated = "Task.Created";
    public const string TaskUpdated = "Task.Updated";
    public const string TaskDeleted = "Task.Deleted";
    public const string TaskNotFound = "Task.NotFound";
    public const string TaskAssigned = "Task.Assigned";
    public const string TaskUnassigned = "Task.Unassigned";
    public const string TaskStatusUpdated = "Task.StatusUpdated";
    public const string TaskProgressUpdated = "Task.ProgressUpdated";
    public const string TaskCompleted = "Task.Completed";
    public const string TaskCannotBeDeleted = "Task.CannotBeDeleted";

    // ==================== Daily Report Messages ====================
    public const string DailyReportCreated = "DailyReport.Created";
    public const string DailyReportUpdated = "DailyReport.Updated";
    public const string DailyReportDeleted = "DailyReport.Deleted";
    public const string DailyReportNotFound = "DailyReport.NotFound";
    public const string DailyReportSubmitted = "DailyReport.Submitted";
    public const string DailyReportApproved = "DailyReport.Approved";
    public const string DailyReportRejected = "DailyReport.Rejected";

    // ==================== Notification Messages ====================
    public const string NotificationSent = "Notification.Sent";
    public const string NotificationNotFound = "Notification.NotFound";
    public const string NotificationMarkedAsRead = "Notification.MarkedAsRead";
    public const string NotificationAllMarkedAsRead = "Notification.AllMarkedAsRead";

    // ==================== File Messages ====================
    public const string FileUploaded = "File.Uploaded";
    public const string FileUploadFailed = "File.UploadFailed";
    public const string FileNotFound = "File.NotFound";
    public const string FileDeleted = "File.Deleted";
    public const string FileTooLarge = "File.TooLarge";
    public const string FileInvalidType = "File.InvalidType";

    // ==================== Validation Messages ====================
    public const string ValidationRequired = "Validation.Required";
    public const string ValidationMinLength = "Validation.MinLength";
    public const string ValidationMaxLength = "Validation.MaxLength";
    public const string ValidationInvalidEmail = "Validation.InvalidEmail";
    public const string ValidationInvalidPhone = "Validation.InvalidPhone";
    public const string ValidationInvalidDate = "Validation.InvalidDate";
    public const string ValidationInvalidNumber = "Validation.InvalidNumber";
    public const string ValidationInvalidRange = "Validation.InvalidRange";
    public const string ValidationPasswordMismatch = "Validation.PasswordMismatch";
    public const string ValidationPasswordTooWeak = "Validation.PasswordTooWeak";

    // ==================== Permission Messages ====================
    public const string PermissionDenied = "Permission.Denied";
    public const string PermissionInsufficient = "Permission.Insufficient";
    public const string PermissionRoleNotFound = "Permission.RoleNotFound";
    public const string PermissionRoleAssigned = "Permission.RoleAssigned";
    public const string PermissionRoleRemoved = "Permission.RoleRemoved";

    // ==================== Join Request Messages ====================
    public const string JoinRequestCreated = "JoinRequest.Created";
    public const string JoinRequestNotFound = "JoinRequest.NotFound";
    public const string JoinRequestAlreadyProcessed = "JoinRequest.AlreadyProcessed";
    public const string JoinRequestApproved = "JoinRequest.Approved";
    public const string JoinRequestRejected = "JoinRequest.Rejected";
    public const string JoinRequestAlreadyExists = "JoinRequest.AlreadyExists";

    // ==================== Attendance Messages ====================
    public const string AttendanceCheckedIn = "Attendance.CheckedIn";
    public const string AttendanceCheckedOut = "Attendance.CheckedOut";
    public const string AttendanceAlreadyCheckedIn = "Attendance.AlreadyCheckedIn";
    public const string AttendanceNotCheckedIn = "Attendance.NotCheckedIn";
    public const string AttendanceNotFound = "Attendance.NotFound";

    // ==================== Progress Messages ====================
    public const string ProgressUpdated = "Progress.Updated";
    public const string ProgressNotFound = "Progress.NotFound";
    public const string ProgressCannotExceed100 = "Progress.CannotExceed100";
}

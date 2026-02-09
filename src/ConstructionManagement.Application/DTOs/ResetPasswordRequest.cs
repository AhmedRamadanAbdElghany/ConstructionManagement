namespace ConstructionManagement.Application.DTOs;

public record ResetPasswordRequest(string Token, string NewPassword, string ConfirmPassword);

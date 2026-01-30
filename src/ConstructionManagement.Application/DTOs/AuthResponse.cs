namespace ConstructionManagement.Application.DTOs;

public record AuthResponse(
    bool Success,
    string? Message,
    string? Token,
    UserDto? User);

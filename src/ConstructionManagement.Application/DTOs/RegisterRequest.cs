using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserType UserType { get; set; }

    public RegisterRequest() { }

    public RegisterRequest(string fullName, string email, string password, string? phone, UserType userType)
    {
        FullName = fullName;
        Email = email;
        Password = password;
        Phone = phone;
        UserType = userType;
    }
}

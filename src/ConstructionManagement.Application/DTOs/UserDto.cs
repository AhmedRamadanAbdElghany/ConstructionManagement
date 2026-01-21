// Application/DTOs/UserDto.cs
namespace ConstructionManagement.Application.DTOs
{
    public record UserDto(int UserID, string FullName, string Email, List<string> Roles, DateTime CreatedAt);
}
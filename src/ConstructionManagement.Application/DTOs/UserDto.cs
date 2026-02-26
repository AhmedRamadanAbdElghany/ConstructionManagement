// Application/DTOs/UserDto.cs
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs
{
    public record UserDto(
        int UserID, 
        string FullName, 
        string Email, 
        List<string> Roles, 
        DateTime CreatedAt,
        UserType CurrentUserType,
        int? CompanyId = null,
        bool RequiresPasswordChange = false,
        List<CompanyAssociationDto>? Companies = null
    );
}

using ConstructionManagement.Application.DTOs.CompanyRequest;

namespace ConstructionManagement.Application.Interfaces;

public interface ICompanyRequestService
{
    Task<CompanyRequestDto> CreateRequestAsync(int? userId, CreateCompanyRequestDto dto);
    Task<CompanyRequestDto?> GetByIdAsync(int id);
    Task<IEnumerable<CompanyRequestDto>> GetAllRequestsAsync();
    Task<IEnumerable<CompanyRequestDto>> GetPendingRequestsAsync();
    Task<CompanyRequestDto?> GetMyRequestAsync(int? userId);
    Task<CompanyRequestDto> ApproveRequestAsync(int id, int? reviewedByUserId, ApproveCompanyRequestDto? dto = null);
    Task<CompanyRequestDto> RejectRequestAsync(int id, RejectCompanyRequestDto dto);
    Task<bool> DeleteRequestAsync(int id);
    Task<int> GetPendingCountAsync();
}

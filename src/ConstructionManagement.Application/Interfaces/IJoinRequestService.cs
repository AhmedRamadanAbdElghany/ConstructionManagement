using ConstructionManagement.Application.DTOs.JoinRequest;

namespace ConstructionManagement.Application.Interfaces;

public interface IJoinRequestService
{
    Task<JoinRequestDto> CreateRequestAsync(int? userId, CreateJoinRequestDto dto);
    Task<JoinRequestDto?> GetByIdAsync(int id);
    Task<IEnumerable<JoinRequestDto>> GetAllRequestsAsync();
    Task<IEnumerable<JoinRequestDto>> GetPendingRequestsForCompanyAsync(int companyId);
    Task<IEnumerable<JoinRequestDto>> GetMyRequestsAsync(int? userId);
    Task<JoinRequestDto> ApproveRequestAsync(int id, int? reviewedByUserId);
    Task<JoinRequestDto> RejectRequestAsync(int id, RejectJoinRequestDto dto);
    Task<bool> DeleteRequestAsync(int id);
    Task<int> GetPendingCountForCompanyAsync(int companyId);
}

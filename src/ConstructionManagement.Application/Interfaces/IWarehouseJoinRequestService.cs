using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IWarehouseJoinRequestService
{
    /// <summary>
    /// Create a new join request
    /// </summary>
    Task<WarehouseJoinRequestDto> CreateRequestAsync(int userId, CreateWarehouseJoinRequestDto dto);

    /// <summary>
    /// Get all pending join requests for a company
    /// </summary>
    Task<IEnumerable<WarehouseJoinRequestDto>> GetPendingRequestsAsync(int companyId, int requesterUserId);

    /// <summary>
    /// Get all join requests for a company (all statuses)
    /// </summary>
    Task<IEnumerable<WarehouseJoinRequestDto>> GetAllRequestsAsync(int companyId, int requesterUserId);

    /// <summary>
    /// Get user's own join requests
    /// </summary>
    Task<IEnumerable<WarehouseJoinRequestDto>> GetMyRequestsAsync(int userId);

    /// <summary>
    /// Approve or reject a join request
    /// </summary>
    Task<WarehouseJoinRequestDto> ReviewRequestAsync(int requestId, int reviewerUserId, ReviewWarehouseJoinRequestDto dto);

    /// <summary>
    /// Get a specific join request by ID
    /// </summary>
    Task<WarehouseJoinRequestDto?> GetByIdAsync(int requestId);

    /// <summary>
    /// Cancel a pending join request
    /// </summary>
    Task<bool> CancelRequestAsync(int requestId, int userId);
}

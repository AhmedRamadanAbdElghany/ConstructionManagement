using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.Transaction;

namespace ConstructionManagement.Application.Interfaces;


public interface IProjectTransactionService
{
    /// <summary>
    /// Create a new financial transaction (expense) linked to a project or specific BOQ item
    /// </summary>
    Task<int> CreateTransactionAsync(int projectId, CreateTransactionRequest request, int userId);

    /// <summary>
    /// Get a single transaction by ID
    /// </summary>
    Task<TransactionDto?> GetTransactionByIdAsync(int transactionId);

    /// <summary>
    /// Get all transactions for a project (optionally filtered by BOQ item)
    /// </summary>
    Task<List<TransactionDto>> GetTransactionsForProjectAsync(int projectId, int? boqItemId = null);

    /// <summary>
    /// Approve or reject a pending transaction (review step)
    /// </summary>
    Task<bool> ReviewTransactionAsync(int transactionId, ReviewTransactionRequest request, int reviewerUserId);
    Task<ProjectProfitabilityDto> GetProjectProfitabilityAsync(int projectId);
    Task<ItemProfitabilityDto?> GetItemProfitabilityAsync(int projectId, int boqItemId);
}
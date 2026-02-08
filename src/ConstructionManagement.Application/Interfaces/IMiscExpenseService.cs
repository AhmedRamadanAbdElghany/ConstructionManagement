using ConstructionManagement.Application.DTOs.MiscExpense;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IMiscExpenseService
    {
        Task<IEnumerable<MiscExpenseDto>> GetExpensesAsync();
        Task<MiscExpenseDto?> GetExpenseByIdAsync(int id);
        Task<MiscExpenseDto> CreateExpenseAsync(CreateMiscExpenseRequest request);
        Task<MiscExpenseDto> ReviewExpenseAsync(int expenseId, ReviewMiscExpenseRequest request, int reviewerUserId);
        Task<IEnumerable<MiscExpenseDto>> GetPendingExpensesAsync();
        Task<MiscExpenseSummary> GetSummaryAsync();
        Task<Dictionary<string, decimal>> GetExpensesByCategoryAsync();
    }
}

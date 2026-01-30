namespace ConstructionManagement.Application.DTOs
{
    public record ProjectProfitabilityDto(
        int ProjectID,
        decimal TotalEstimatedBudget,
        decimal TotalSpent,
        decimal TotalProfit,
        decimal ProfitPercentage,
        int ItemsCount
    );
    // NOTE: Add tests for rounding/percentage correctness.
}

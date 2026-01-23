namespace ConstructionManagement.Application.DTOs
{
    public record ItemProfitabilityDto(
        int BOQItemID,
        string ItemName,
        decimal EstimatedBudget,
        decimal TotalSpent,
        decimal CurrentProfit,
        decimal ProfitPercentage);
}

namespace ConstructionManagement.Domain.Exceptions;

/// <summary>
/// Exception thrown when an invoice would exceed the budget for a project item.
/// </summary>
public class BudgetExceededException : InvalidOperationException
{
    /// <summary>
    /// The budget amount allocated for the item.
    /// </summary>
    public decimal BudgetAmount { get; }
    
    /// <summary>
    /// The amount already used from the budget.
    /// </summary>
    public decimal UsedAmount { get; }
    
    /// <summary>
    /// The amount requested in the current invoice.
    /// </summary>
    public decimal RequestedAmount { get; }
    
    /// <summary>
    /// The amount that would exceed the budget.
    /// </summary>
    public decimal ExceededAmount { get; }
    
    /// <summary>
    /// The ID of the project item.
    /// </summary>
    public int ProjectItemId { get; }
    
    /// <summary>
    /// The name of the project item.
    /// </summary>
    public string? ItemName { get; }

    public BudgetExceededException(
        int projectItemId,
        string? itemName,
        decimal budgetAmount,
        decimal usedAmount,
        decimal requestedAmount)
        : base(BuildMessage(itemName, budgetAmount, usedAmount, requestedAmount))
    {
        ProjectItemId = projectItemId;
        ItemName = itemName;
        BudgetAmount = budgetAmount;
        UsedAmount = usedAmount;
        RequestedAmount = requestedAmount;
        ExceededAmount = (usedAmount + requestedAmount) - budgetAmount;
    }

    private static string BuildMessage(string? itemName, decimal budget, decimal used, decimal requested)
    {
        var total = used + requested;
        var exceeded = total - budget;
        
        return itemName != null
            ? $"المبلغ يتجاوز ميزانية البند '{itemName}'. الميزانية: {budget:N2}, المستخدم: {used:N2}, المطلوب: {requested:N2}, المتجاوز: {exceeded:N2}"
            : $"المبلغ يتجاوز ميزانية البند. الميزانية: {budget:N2}, المستخدم: {used:N2}, المطلوب: {requested:N2}, المتجاوز: {exceeded:N2}";
    }
}

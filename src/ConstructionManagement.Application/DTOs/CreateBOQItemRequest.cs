public record CreateBOQItemRequest(
    string? ItemCode,
    string ItemName,
    string? Description,
    string? Unit,
    DateTime? StartDate,
    DateTime? EndDate,
    string AccountingType,               // "Measured" or "Supervision"

    // Measured fields (optional)
    decimal? AgreedQuantity,
    decimal? UnitPrice,

    // Supervision fields (optional)
    decimal? SupervisionPercentage,
    string? BaseCalculation,             // AllProjectInvoices, ThisItemInvoices, CustomAmount
    decimal? CustomBaseAmount,
    decimal? EstimatedTotalCost);

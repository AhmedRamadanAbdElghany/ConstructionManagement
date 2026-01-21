using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

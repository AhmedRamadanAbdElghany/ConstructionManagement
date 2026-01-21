using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.DTOs
{
    public record ProjectProfitabilityDto(
        int ProjectID,
        decimal TotalEstimatedBudget,
        decimal TotalSpent,
        decimal TotalProfit,
        decimal ProfitPercentage,
        int ItemsCount);
}

using ConstructionManagement.Application.DTOs.ProjectApprovalRule;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces;

public interface IProjectApprovalRuleService
{
    Task<int> CreateRuleAsync(int projectId, CreateApprovalRuleRequest request);

    Task<ProjectApprovalRuleDto?> GetRuleByIdAsync(int projectId, int ruleId);

    Task<List<ProjectApprovalRuleDto>> GetRulesForProjectAsync(int projectId);

    Task<ProjectApprovalRule?> GetApplicableRuleAsync(int projectId, int? boqItemId, SourceType sourceType);
}

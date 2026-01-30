using ConstructionManagement.Application.DTOs.ProjectApprovalRule;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class ProjectApprovalRuleService : IProjectApprovalRuleService
{
    private readonly IRepository<ProjectApprovalRule> _ruleRepository;
    private readonly IRepository<Project> _projectRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectApprovalRuleService(
        IRepository<ProjectApprovalRule> ruleRepository,
        IRepository<Project> projectRepository,
        IUnitOfWork unitOfWork)
    {
        _ruleRepository = ruleRepository;
        _projectRepository = projectRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> CreateRuleAsync(int projectId, CreateApprovalRuleRequest request)
    {
        var projectExists = await _projectRepository.AsQueryable()
            .AnyAsync(p => p.Id == projectId);

        if (!projectExists)
            throw new InvalidOperationException("المشروع غير موجود");

        if (string.IsNullOrWhiteSpace(request.UploaderRole) || string.IsNullOrWhiteSpace(request.ApproverRole))
            throw new ArgumentException("الرولات مطلوبة");

        var rule = new ProjectApprovalRule
        {
            ProjectId = projectId,
            BOQItemId = request.BOQItemId,
            Source = request.Source,
            UploaderRole = request.UploaderRole,
            ApproverRole = request.ApproverRole,
            ResponseTimeoutHours = request.ResponseTimeoutHours,
            EscalationRole = request.EscalationRole,
            CreatedAt = DateTime.UtcNow
        };

        await _ruleRepository.AddAsync(rule);
        await _unitOfWork.SaveChangesAsync();

        return rule.Id;
    }

    public async Task<ProjectApprovalRuleDto?> GetRuleByIdAsync(int projectId, int ruleId)
    {
        var rule = await _ruleRepository.AsQueryable()
            .FirstOrDefaultAsync(r => r.Id == ruleId && r.ProjectId == projectId); // تصحيح: استخدام ProjectID

        if (rule == null) return null;

        return MapToDto(rule);
    }

    public async Task<List<ProjectApprovalRuleDto>> GetRulesForProjectAsync(int projectId)
    {
        var rules = await _ruleRepository.AsQueryable()
            .Where(r => r.ProjectId == projectId) // تصحيح: استخدام ProjectID
            .ToListAsync();

        return rules.Select(MapToDto).ToList();
    }

    public async Task<ProjectApprovalRule?> GetApplicableRuleAsync(int projectId, int? boqItemId, SourceType sourceType)
    {
        // 1. البحث عن قاعدة مخصصة للبند (Specific Rule)
        if (boqItemId.HasValue)
        {
            var specific = await _ruleRepository.AsQueryable()
                .FirstOrDefaultAsync(r => r.ProjectId == projectId && // تصحيح: استخدام ProjectID
                                         r.BOQItemId == boqItemId &&
                                         r.Source == sourceType);
            if (specific != null) return specific;
        }

        // 2. إذا لم توجد، البحث عن القاعدة العامة للمشروع (Default Rule)
        return await _ruleRepository.AsQueryable()
            .FirstOrDefaultAsync(r => r.ProjectId == projectId && // تصحيح: استخدام ProjectID
                                     r.BOQItemId == null &&
                                     r.Source == sourceType);
    }

    private static ProjectApprovalRuleDto MapToDto(ProjectApprovalRule rule)
    {
        return new ProjectApprovalRuleDto(
            rule.Id,
            rule.ProjectId, // تصحيح الـ Mapping للـ DTO ليظهر ProjectID الفعلي
            rule.BOQItemId,
            rule.Source,
            rule.UploaderRole,
            rule.ApproverRole,
            rule.ResponseTimeoutHours,
            rule.EscalationRole,
            rule.CreatedAt);
    }
}

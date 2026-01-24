using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.BackgroundJobs;

public class ApprovalEscalationJob
{
    private readonly IRepository<ApprovalStep> _stepRepo;
    private readonly IRepository<ApprovalRequest> _requestRepo;
    private readonly IRepository<ProjectApprovalRule> _ruleRepo;
    private readonly IRepository<ProjectTeamRole> _teamRoleRepo;
    private readonly IRepository<EscalationLog> _escalationLogRepo;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork; // ← Added
    private readonly ILogger<ApprovalEscalationJob> _logger;

    public ApprovalEscalationJob(
        IRepository<ApprovalStep> stepRepo,
        IRepository<ApprovalRequest> requestRepo,
        IRepository<ProjectApprovalRule> ruleRepo,
        IRepository<ProjectTeamRole> teamRoleRepo,
        IRepository<EscalationLog> escalationLogRepo,
        INotificationService notificationService,
        IUnitOfWork unitOfWork, // ← Added
        ILogger<ApprovalEscalationJob> logger)
    {
        _stepRepo = stepRepo;
        _requestRepo = requestRepo;
        _ruleRepo = ruleRepo;
        _teamRoleRepo = teamRoleRepo;
        _escalationLogRepo = escalationLogRepo;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork; // ← Added
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3)]
    [DisableConcurrentExecution(timeoutInSeconds: 300)] // prevent overlapping runs
    public async Task CheckAndEscalateDelayedApprovalsAsync()
    {
        _logger.LogInformation("Starting approval escalation check at {Time}", DateTime.UtcNow);

        var now = DateTime.UtcNow;

        // Find all active steps that are overdue
        var overdueSteps = await _stepRepo.AsQueryable()
            .Include(s => s.Request)
                .ThenInclude(r => r.ApprovalRule)
            .Include(s => s.Request)
                .ThenInclude(r => r.Project)
            .Where(s =>
                s.IsActive &&
                s.ApprovedAt == null &&
                s.Request.ApprovalRule != null &&
                s.CreatedAt.AddHours(s.Request.ApprovalRule.ResponseTimeoutHours) < now)
            .ToListAsync();

        if (!overdueSteps.Any())
        {
            _logger.LogInformation("No overdue approval steps found.");
            return;
        }

        foreach (var step in overdueSteps)
        {
            var request = step.Request;
            var rule = request.ApprovalRule!;
            var project = request.Project;

            _logger.LogWarning("Escalating step {StepId} of request {RequestId} - overdue since {ExpectedBy}",
                step.Id, request.Id, step.CreatedAt.AddHours(rule.ResponseTimeoutHours));

            // Create escalation step
            var escalationStep = new ApprovalStep
            {
                ApprovalRequestId = request.Id,
                StepOrder = step.StepOrder + 1,
                ApproverRole = rule.EscalationRole,
                IsActive = true,
                Status = "Pending",
                Notes = $"Auto-escalated due to timeout ({rule.ResponseTimeoutHours} hours). Previous step: {step.StepOrder}"
            };

            await _stepRepo.AddAsync(escalationStep);

            // Optional: deactivate old step or keep it active for audit
            step.IsActive = false;
            step.Notes += " | Auto-escalated due to timeout";
            await _stepRepo.UpdateAsync(step);

            // Update request status
            request.Status = "Escalated";
            await _requestRepo.UpdateAsync(request);

            // Log escalation (optional but very useful)
            await _escalationLogRepo.AddAsync(new EscalationLog
            {
                ProjectId = project.Id,
                BOQItemId = request.BOQItemId,
                EscalationType = "ApprovalTimeout",
                RecipientUserId = 0, // will update later after finding users
                Message = $"Approval step {step.StepOrder} timed out for {request.Source} {request.SourceId}. Escalated to {rule.EscalationRole}",
                SentByEmail = false,
                SentAt = now,
                CreatedAt = now
            });

            // Notify users with escalation role in this project
            await NotifyEscalationUsersAsync(project.Id, rule.EscalationRole, request, escalationStep);
        }

        // Commit all changes in one transaction
        await _unitOfWork.SaveChangesAsync(); // ← Fixed: now exists

        _logger.LogInformation("Approval escalation check completed. Escalated {Count} steps.", overdueSteps.Count);
    }

    private async Task NotifyEscalationUsersAsync(int projectId, string escalationRole, ApprovalRequest request, ApprovalStep step)
    {
        var recipients = await _teamRoleRepo.AsQueryable()
            .Include(ptr => ptr.ProjectTeamMember)
            .Where(ptr =>
                ptr.ProjectTeamMember.ProjectId == projectId &&
                ptr.ProjectRole.Name == escalationRole)
            .Select(ptr => ptr.ProjectTeamMember.UserId)
            .Distinct()
            .ToListAsync();

        if (!recipients.Any()) return;

        string title = "تصعيد طلب موافقة";
        string message = $"تم تصعيد طلب موافقة {request.Source} (رقم {request.Id}) إلى دور {escalationRole} " +
                         $"بسبب التأخير في الخطوة السابقة.";

        string? link = $"/projects/{projectId}/approvals/{request.Id}";

        foreach (var userId in recipients)
        {
            await _notificationService.CreateAndSendAsync(
                userId: userId,
                title: title,
                message: message,
                link: link,
                type: NotificationType.Escalation
            );
        }

        _logger.LogInformation("Escalation notifications sent to {Count} users for request {RequestId}", recipients.Count, request.Id);
    }
}
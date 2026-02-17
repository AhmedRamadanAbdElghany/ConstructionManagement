using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Services;

public class ProjectDelayEscalationService : IProjectDelayEscalationService
{
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<EscalationLog> _escalationLogRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly IRepository<ProjectTeamRole> _projectTeamRoleRepository;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Notification> _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProjectDelayEscalationService> _logger;
    private readonly ILocalizationService _localizationService;

    public ProjectDelayEscalationService(
        IRepository<Project> projectRepository,
        IRepository<EscalationLog> escalationLogRepository,
        IRepository<User> userRepository,
        IEmailService emailService,
        INotificationService notificationService,
        IRepository<ProjectTeamRole> projectTeamRoleRepository,
        IRepository<Transaction> transactionRepository,
        IRepository<Notification> notificationRepository,
        IUnitOfWork unitOfWork,
        ILogger<ProjectDelayEscalationService> logger,
        ILocalizationService localizationService)
    {
        _projectRepository = projectRepository;
        _escalationLogRepository = escalationLogRepository;
        _userRepository = userRepository;
        _emailService = emailService;
        _notificationService = notificationService;
        _projectTeamRoleRepository = projectTeamRoleRepository;
        _transactionRepository = transactionRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _localizationService = localizationService;
    }

    public async Task CheckProjectAndItemDelaysAsync()
    {
        var today = DateTime.UtcNow.Date;

        var projects = await _projectRepository.AsQueryable()
            .Where(p => !p.IsClosed)
            .Include(p => p.Settings)
            .Include(p => p.BOQItems)
                .ThenInclude(i => i.MeasuredData)
            .Include(p => p.BOQItems)
                .ThenInclude(i => i.SupervisionData)
            .AsNoTracking()
            .ToListAsync();

        foreach (var project in projects)
        {
            var settings = project.Settings;
            if (settings == null || !(settings.EnableDelayNotification ?? false))
                continue;

            if (project.StartDate.HasValue &&
                today > project.StartDate.Value.AddDays(settings.DelayGracePeriodDays ?? 0) &&
                project.Status == "جديد")
            {
                var startDateStr = project.StartDate.Value.ToString("yyyy-MM-dd");
                await SendEscalationAsync(project, null, "StartDelay", project.OwnerUserId,
                    _localizationService.GetString("NotificationMessage.Project.StartDelay", project.ProjectName, startDateStr),
                    messageKey: "Project.StartDelay",
                    messageArgs: new object[] { project.ProjectName, startDateStr });
            }

            foreach (var item in project.BOQItems)
            {
                // تأخير بداية البند
                if (item.StartDate.HasValue && today > item.StartDate.Value && item.Status == "جديد")
                {
                    var engineerId = await GetResponsibleUserIdForItemAsync(project.Id, "SiteEngineer");
                    if (engineerId > 0)
                    {
                        await SendEscalationAsync(project, item.Id, "ItemStartDelay", engineerId,
                            _localizationService.GetString("NotificationMessage.Project.ItemStartDelay", item.ItemName, project.ProjectName),
                            messageKey: "Project.ItemStartDelay",
                            messageArgs: new object[] { item.ItemName, project.ProjectName });
                    }
                }

                // تأخير نهاية البند
                if (item.EndDate.HasValue && today > item.EndDate.Value.Date && item.Status != "منتهي")
                {
                    var managerId = await GetResponsibleUserIdForItemAsync(project.Id, "ProjectManager");
                    if (managerId > 0)
                    {
                        var endDateStr = item.EndDate.Value.ToString("yyyy-MM-dd");
                        await SendEscalationAsync(project, item.Id, "ItemEndDelay", managerId,
                            _localizationService.GetString("NotificationMessage.Project.ItemEndDelay", item.ItemName, endDateStr),
                            messageKey: "Project.ItemEndDelay",
                            messageArgs: new object[] { item.ItemName, endDateStr });
                    }
                }

                // تحذير الميزانية
                if (settings.EnableInvoiceReview ?? false)
                {
                    await CheckBudgetWarningAsync(project, item);
                }
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    private async Task CheckBudgetWarningAsync(Project project, BOQItem item)
    {
        decimal estimatedBudget = item.EstimatedBudget;
        if (estimatedBudget <= 0) return;

        var totalSpent = await _transactionRepository.AsQueryable()
            .Where(t => t.BOQItemId == item.Id && t.Status == TransactionStatus.Approved)
            .SumAsync(t => t.Amount);

        decimal warningThreshold = estimatedBudget * 0.90m;

        if (totalSpent >= warningThreshold)
        {
            var recentAlert = await _notificationRepository.AsQueryable()
                .AnyAsync(n => n.UserId == project.OwnerUserId &&
                               n.Type == NotificationType.BudgetWarning &&
                               n.CreatedAt >= DateTime.UtcNow.AddHours(-24));

            if (!recentAlert)
            {
                var percentage = (totalSpent / estimatedBudget * 100).ToString("F1");
                await _notificationService.CreateAndSendAsync(
                    project.OwnerUserId,
                    _localizationService["Project.BudgetWarning.Title"],
                    _localizationService.GetString("NotificationMessage.Project.BudgetWarning.Message", item.ItemName, percentage),
                    $"/projects/{project.Id}/items/{item.Id}",
                    NotificationType.BudgetWarning,
                    titleKey: "Project.BudgetWarning.Title",
                    messageKey: "Project.BudgetWarning.Message",
                    messageArgs: new object[] { item.ItemName, percentage }
                );
            }
        }
    }

    private async Task SendEscalationAsync(Project project, int? itemId, string type, int recipientUserId, string message, string? messageKey = null, object[]? messageArgs = null)
    {
        var settings = project.Settings;
        if (settings == null) return;

        var alreadySent = await _escalationLogRepository.AsQueryable()
            .AnyAsync(l => l.ProjectId == project.Id &&
                           l.BOQItemId == itemId &&
                           l.EscalationType == type &&
                           (!(settings.DelayNotificationIsOneTimeOnly ?? false) || l.SentAt.Date == DateTime.UtcNow.Date));

        if (alreadySent) return;

        await _notificationService.CreateAndSendAsync(
            recipientUserId,
            _localizationService["Project.Escalation.Title"],
            message,
            $"/projects/{project.Id}/items/{itemId ?? 0}",
            NotificationType.ProjectDelay,
            titleKey: "Project.Escalation.Title",
            messageKey: messageKey,
            messageArgs: messageArgs
        );

        if (settings.DelayNotificationSendEmail ?? false)
        {
            var user = await _userRepository.GetByIdAsync(recipientUserId);
            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                await _emailService.SendAsync(user.Email, _localizationService["Project.Email.Subject"], message);
            }
        }

        await _escalationLogRepository.AddAsync(new EscalationLog
        {
            ProjectId = project.Id,
            BOQItemId = itemId,
            EscalationType = type,
            RecipientUserId = recipientUserId,
            Message = message,
            SentByEmail = settings.DelayNotificationSendEmail ?? false,
            SentAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        });
    }

    private async Task<int> GetResponsibleUserIdForItemAsync(int projectId, string roleName)
    {
        return await _projectTeamRoleRepository.AsQueryable()
            .Where(ptr => ptr.ProjectTeamMember.ProjectId == projectId &&
                          ptr.ProjectRole.Name == roleName)
            .Select(ptr => ptr.ProjectTeamMember.UserId)
            .FirstOrDefaultAsync();
    }
}

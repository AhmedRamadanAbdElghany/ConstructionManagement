using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Services;

public class EscalationService : IEscalationService
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

    public EscalationService(
        IRepository<Project> projectRepository,
        IRepository<EscalationLog> escalationLogRepository,
        IRepository<User> userRepository,
        IEmailService emailService,
        IRepository<Transaction> transactionRepository,
        IRepository<Notification> notificationRepository,
        INotificationService notificationService,
        IRepository<ProjectTeamRole> projectTeamRoleRepository,
        IUnitOfWork unitOfWork)
    {
        _projectRepository = projectRepository;
        _escalationLogRepository = escalationLogRepository;
        _userRepository = userRepository;
        _emailService = emailService;
        _transactionRepository = transactionRepository;
        _notificationRepository = notificationRepository;
        _notificationService = notificationService;
        _projectTeamRoleRepository = projectTeamRoleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task CheckAndSendDelayEscalationsAsync()
    {
        var today = DateTime.UtcNow.Date;

        var projects = await _projectRepository.AsQueryable()
            .Where(p => !p.IsClosed)
            .Include(p => p.Settings)
            .Include(p => p.BOQItems)
                .ThenInclude(i => i.MeasuredData)
            .Include(p => p.BOQItems)
                .ThenInclude(i => i.SupervisionData)
            .ToListAsync();

        foreach (var project in projects)
        {
            var settings = project.Settings;
            if (settings == null || !settings.EnableDelayNotification) continue;

            if (project.StartDate.HasValue &&
                today > project.StartDate.Value.AddDays(settings.DelayGracePeriodDays) &&
                project.Status == "جديد")
            {
                await SendEscalationAsync(project, null, "StartDelay", project.OwnerUserId,
                    $"تأخير بداية المشروع {project.ProjectName} (الموعد: {project.StartDate.Value:yyyy-MM-dd})");
            }

            foreach (var item in project.BOQItems)
            {
                if (item.StartDate.HasValue && today > item.StartDate.Value && item.Status == "جديد")
                {
                    var engineerId = await GetResponsibleUserIdForItemAsync(project.Id, "SiteEngineer");
                    if (engineerId > 0)
                    {
                        await SendEscalationAsync(project, item.Id, "ItemStartDelay", engineerId,
                            $"تأخير بداية البند {item.ItemName} في مشروع {project.ProjectName}");
                    }
                }

                if (item.EndDate.HasValue && today > item.EndDate.Value && item.Status != "منتهي")
                {
                    var managerId = await GetResponsibleUserIdForItemAsync(project.Id, "ProjectManager");
                    if (managerId > 0)
                    {
                        await SendEscalationAsync(project, item.Id, "ItemEndDelay", managerId,
                            $"تأخير تسليم البند {item.ItemName}");
                    }
                }

                if (settings.EnableInvoiceReview)
                {
                    await CheckBudgetWarningAsync(project, item);
                }
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    private async Task CheckBudgetWarningAsync(Project project, BOQItem item)
    {
        decimal budget = item.EstimatedBudget;
        if (budget <= 0) return;

        var totalSpent = await _transactionRepository.AsQueryable()
            .Where(t => t.BOQItemId == item.Id && t.Status == TransactionStatus.Approved)
            .SumAsync(t => t.Amount);

        decimal warningThreshold = budget * 0.90m;

        if (totalSpent >= warningThreshold)
        {
            var recentAlert = await _notificationRepository.AsQueryable()
                .AnyAsync(n => n.UserId == project.OwnerUserId &&
                               n.Type == NotificationType.BudgetWarning &&
                               n.CreatedAt >= DateTime.UtcNow.AddHours(-24));

            if (!recentAlert)
            {
                await _notificationService.CreateAndSendAsync(
                    project.OwnerUserId,
                    "تحذير ميزانية",
                    $"البند {item.ItemName} استهلك {(totalSpent / budget * 100):F1}%",
                    $"/projects/{project.Id}/items/{item.Id}",
                    NotificationType.BudgetWarning
                );
            }
        }
    }

    private async Task SendEscalationAsync(Project project, int? itemId, string type, int recipientUserId, string message)
    {
        var settings = project.Settings;
        if (settings == null) return;

        // تصحيح: المقارنة بـ ProjectID و ItemID وليس Id
        var alreadySent = await _escalationLogRepository.AsQueryable()
            .AnyAsync(l => l.ProjectId == project.Id &&
                           l.BOQItemId == itemId &&
                           l.EscalationType == type &&
                           (settings.DelayNotificationIsOneTimeOnly || l.SentAt.Date == DateTime.UtcNow.Date));

        if (alreadySent) return;

        await _notificationService.CreateAndSendAsync(recipientUserId, "إشعار تأخير", message,
            $"/projects/{project.Id}", NotificationType.ProjectDelay);

        if (settings.DelayNotificationSendEmail)
        {
            var user = await _userRepository.GetByIdAsync(recipientUserId);
            if (!string.IsNullOrEmpty(user?.Email))
                await _emailService.SendAsync(user.Email, "تنبيه نظام إدارة الإنشاءات", message);
        }

        await _escalationLogRepository.AddAsync(new EscalationLog
        {
            ProjectId = project.Id,
            BOQItemId = itemId,
            EscalationType = type,
            RecipientUserId = recipientUserId,
            Message = message,
            SentByEmail = settings.DelayNotificationSendEmail,
            SentAt = DateTime.UtcNow
        });
    }

    private async Task<int> GetResponsibleUserIdForItemAsync(int projectId, string roleName)
    {
        return await _projectTeamRoleRepository.AsQueryable()
            // تصحيح: استخدام ProjectID للربط الصحيح
            .Where(ptr => ptr.ProjectTeamMember.ProjectId == projectId && ptr.ProjectRole.Name == roleName)
            .Select(ptr => ptr.ProjectTeamMember.UserId)
            .FirstOrDefaultAsync();
    }
}
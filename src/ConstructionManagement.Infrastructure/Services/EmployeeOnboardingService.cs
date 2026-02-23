using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    public class EmployeeOnboardingService : IEmployeeOnboardingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EmployeeOnboardingService> _logger;

        public EmployeeOnboardingService(
            ApplicationDbContext context,
            ILogger<EmployeeOnboardingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Templates

        public async Task<List<OnboardingTemplateDto>> GetTemplatesAsync(int? companyId, bool? isActive = null)
        {
            var query = _context.OnboardingTemplates
                .Include(t => t.TaskTemplates)
                .Where(t => t.CompanyId == companyId);

            if (isActive.HasValue)
                query = query.Where(t => t.IsActive == isActive);

            var templates = await query.OrderBy(t => t.Name).ToListAsync();

            return templates.Select(t => new OnboardingTemplateDto
            {
                Id = t.Id,
                CompanyId = t.CompanyId,
                Name = t.Name,
                Description = t.Description,
                DepartmentId = t.DepartmentId,
                RoleId = t.RoleId,
                EstimatedDays = t.EstimatedDays,
                IsActive = t.IsActive,
                TaskCount = t.TaskTemplates.Count,
                CreatedByName = t.CreatedByUser?.FullName ?? "",
                CreatedAt = t.CreatedAt
            }).ToList();
        }

        public async Task<OnboardingTemplateDto> GetTemplateByIdAsync(int id)
        {
            var template = await _context.OnboardingTemplates
                .Include(t => t.TaskTemplates)
                .Include(t => t.CreatedByUser)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (template == null) return null!;

            return new OnboardingTemplateDto
            {
                Id = template.Id,
                CompanyId = template.CompanyId,
                Name = template.Name,
                Description = template.Description,
                DepartmentId = template.DepartmentId,
                RoleId = template.RoleId,
                EstimatedDays = template.EstimatedDays,
                IsActive = template.IsActive,
                TaskCount = template.TaskTemplates.Count,
                CreatedByName = template.CreatedByUser?.FullName ?? "",
                CreatedAt = template.CreatedAt
            };
        }

        public async Task<OnboardingTemplateDto> CreateTemplateAsync(CreateOnboardingTemplateRequest request, int? companyId, int userId)
        {
            var template = new OnboardingTemplate
            {
                CompanyId = companyId,
                Name = request.Name,
                Description = request.Description,
                DepartmentId = request.DepartmentId,
                RoleId = request.RoleId,
                EstimatedDays = request.EstimatedDays,
                IsActive = true,
                CreatedByUserId = userId
            };

            _context.OnboardingTemplates.Add(template);
            await _context.SaveChangesAsync();

            // Add task templates
            foreach (var taskRequest in request.Tasks)
            {
                var taskTemplate = new OnboardingTaskTemplate
                {
                    OnboardingTemplateId = template.Id,
                    Title = taskRequest.Title,
                    Description = taskRequest.Description,
                    Category = taskRequest.Category,
                    Order = taskRequest.Order,
                    EstimatedDays = taskRequest.EstimatedDays,
                    IsRequired = taskRequest.IsRequired,
                    AssignedToRole = taskRequest.AssignedToRole
                };
                _context.OnboardingTaskTemplates.Add(taskTemplate);
            }

            await _context.SaveChangesAsync();

            return await GetTemplateByIdAsync(template.Id);
        }

        public async Task<OnboardingTemplateDto> UpdateTemplateAsync(int id, UpdateOnboardingTemplateRequest request)
        {
            var template = await _context.OnboardingTemplates.FindAsync(id);
            if (template == null) return null!;

            template.Name = request.Name;
            template.Description = request.Description;
            template.DepartmentId = request.DepartmentId;
            template.RoleId = request.RoleId;
            template.EstimatedDays = request.EstimatedDays;
            template.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return await GetTemplateByIdAsync(id);
        }

        public async Task DeleteTemplateAsync(int id)
        {
            var template = await _context.OnboardingTemplates.FindAsync(id);
            if (template == null) return;

            _context.OnboardingTemplates.Remove(template);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Task Templates

        public async Task<List<OnboardingTaskTemplateDto>> GetTaskTemplatesAsync(int templateId)
        {
            var tasks = await _context.OnboardingTaskTemplates
                .Where(t => t.OnboardingTemplateId == templateId)
                .OrderBy(t => t.Order)
                .ToListAsync();

            return tasks.Select(t => new OnboardingTaskTemplateDto
            {
                Id = t.Id,
                OnboardingTemplateId = t.OnboardingTemplateId,
                Title = t.Title,
                Description = t.Description,
                Category = t.Category,
                Order = t.Order,
                EstimatedDays = t.EstimatedDays,
                IsRequired = t.IsRequired,
                AssignedToRole = t.AssignedToRole
            }).ToList();
        }

        public async Task<OnboardingTaskTemplateDto> AddTaskTemplateAsync(int templateId, CreateTaskTemplateRequest request)
        {
            var taskTemplate = new OnboardingTaskTemplate
            {
                OnboardingTemplateId = templateId,
                Title = request.Title,
                Description = request.Description,
                Category = request.Category,
                Order = request.Order,
                EstimatedDays = request.EstimatedDays,
                IsRequired = request.IsRequired,
                AssignedToRole = request.AssignedToRole
            };

            _context.OnboardingTaskTemplates.Add(taskTemplate);
            await _context.SaveChangesAsync();

            return new OnboardingTaskTemplateDto
            {
                Id = taskTemplate.Id,
                OnboardingTemplateId = taskTemplate.OnboardingTemplateId,
                Title = taskTemplate.Title,
                Description = taskTemplate.Description,
                Category = taskTemplate.Category,
                Order = taskTemplate.Order,
                EstimatedDays = taskTemplate.EstimatedDays,
                IsRequired = taskTemplate.IsRequired,
                AssignedToRole = taskTemplate.AssignedToRole
            };
        }

        public async Task<OnboardingTaskTemplateDto> UpdateTaskTemplateAsync(int id, CreateTaskTemplateRequest request)
        {
            var taskTemplate = await _context.OnboardingTaskTemplates.FindAsync(id);
            if (taskTemplate == null) return null!;

            taskTemplate.Title = request.Title;
            taskTemplate.Description = request.Description;
            taskTemplate.Category = request.Category;
            taskTemplate.Order = request.Order;
            taskTemplate.EstimatedDays = request.EstimatedDays;
            taskTemplate.IsRequired = request.IsRequired;
            taskTemplate.AssignedToRole = request.AssignedToRole;

            await _context.SaveChangesAsync();

            return new OnboardingTaskTemplateDto
            {
                Id = taskTemplate.Id,
                OnboardingTemplateId = taskTemplate.OnboardingTemplateId,
                Title = taskTemplate.Title,
                Description = taskTemplate.Description,
                Category = taskTemplate.Category,
                Order = taskTemplate.Order,
                EstimatedDays = taskTemplate.EstimatedDays,
                IsRequired = taskTemplate.IsRequired,
                AssignedToRole = taskTemplate.AssignedToRole
            };
        }

        public async Task DeleteTaskTemplateAsync(int id)
        {
            var taskTemplate = await _context.OnboardingTaskTemplates.FindAsync(id);
            if (taskTemplate == null) return;

            _context.OnboardingTaskTemplates.Remove(taskTemplate);
            await _context.SaveChangesAsync();
        }

        public async Task ReorderTaskTemplatesAsync(int templateId, List<int> taskIds)
        {
            var tasks = await _context.OnboardingTaskTemplates
                .Where(t => t.OnboardingTemplateId == templateId)
                .ToListAsync();

            for (int i = 0; i < taskIds.Count; i++)
            {
                var task = tasks.FirstOrDefault(t => t.Id == taskIds[i]);
                if (task != null)
                {
                    task.Order = i + 1;
                }
            }

            await _context.SaveChangesAsync();
        }

        #endregion

        #region Processes

        public async Task<List<OnboardingProcessDto>> GetProcessesAsync(int? companyId, string? status = null, int? employeeId = null)
        {
            var query = _context.OnboardingProcesses
                .Include(p => p.Employee)
                .Include(p => p.Template)
                .Include(p => p.AssignedToUser)
                .Include(p => p.Tasks)
                .Where(p => p.CompanyId == companyId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(p => p.Status == status);

            if (employeeId.HasValue)
                query = query.Where(p => p.EmployeeId == employeeId);

            var processes = await query.OrderByDescending(p => p.StartDate).ToListAsync();

            return processes.Select(p => MapProcessToDto(p)).ToList();
        }

        public async Task<OnboardingProcessDto> GetProcessByIdAsync(int id)
        {
            var process = await _context.OnboardingProcesses
                .Include(p => p.Employee)
                .Include(p => p.Template)
                .Include(p => p.AssignedToUser)
                .Include(p => p.Tasks)
                    .ThenInclude(t => t.RequiredDocuments)
                .Include(p => p.Tasks)
                    .ThenInclude(t => t.CompletedByUser)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (process == null) return null!;

            return MapProcessToDto(process);
        }

        public async Task<OnboardingProcessDto> StartOnboardingAsync(CreateOnboardingProcessRequest request, int? companyId)
        {
            var template = await _context.OnboardingTemplates
                .Include(t => t.TaskTemplates)
                .FirstOrDefaultAsync(t => t.Id == request.TemplateId);

            if (template == null) return null!;

            var process = new OnboardingProcess
            {
                CompanyId = companyId,
                EmployeeId = request.EmployeeId,
                TemplateId = request.TemplateId,
                StartDate = request.StartDate,
                TargetCompletionDate = request.StartDate.AddDays(template.EstimatedDays),
                Status = "InProgress",
                Progress = 0,
                AssignedToUserId = request.AssignedToUserId
            };

            _context.OnboardingProcesses.Add(process);
            await _context.SaveChangesAsync();

            // Create tasks from template
            foreach (var taskTemplate in template.TaskTemplates.OrderBy(t => t.Order))
            {
                var task = new OnboardingTask
                {
                    OnboardingProcessId = process.Id,
                    Title = taskTemplate.Title,
                    Description = taskTemplate.Description,
                    Category = taskTemplate.Category,
                    Order = taskTemplate.Order,
                    Status = "Pending",
                    DueDate = request.StartDate.AddDays(taskTemplate.EstimatedDays)
                };

                _context.OnboardingTasks.Add(task);
            }

            await _context.SaveChangesAsync();

            return await GetProcessByIdAsync(process.Id);
        }

        public async Task<OnboardingProcessDto> UpdateProcessProgressAsync(int id)
        {
            var process = await _context.OnboardingProcesses
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (process == null) return null!;

            var totalTasks = process.Tasks.Count;
            var completedTasks = process.Tasks.Count(t => t.Status == "Completed");

            process.Progress = totalTasks > 0 ? (int)((double)completedTasks / totalTasks * 100) : 0;

            // Update status based on progress
            if (process.Progress == 100)
            {
                process.Status = "Completed";
                process.CompletedAt = DateTime.UtcNow;
            }
            else if (process.TargetCompletionDate.HasValue && process.TargetCompletionDate < DateTime.UtcNow)
            {
                process.Status = "Overdue";
            }

            await _context.SaveChangesAsync();

            return await GetProcessByIdAsync(id);
        }

        public async Task CompleteOnboardingAsync(int id)
        {
            var process = await _context.OnboardingProcesses.FindAsync(id);
            if (process == null) return;

            process.Status = "Completed";
            process.Progress = 100;
            process.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        #endregion

        #region Tasks

        public async Task<List<OnboardingTaskDto>> GetProcessTasksAsync(int processId)
        {
            var tasks = await _context.OnboardingTasks
                .Include(t => t.RequiredDocuments)
                .Include(t => t.CompletedByUser)
                .Where(t => t.OnboardingProcessId == processId)
                .OrderBy(t => t.Order)
                .ToListAsync();

            return tasks.Select(t => MapTaskToDto(t)).ToList();
        }

        public async Task<OnboardingTaskDto> UpdateTaskStatusAsync(int taskId, UpdateOnboardingTaskRequest request, int? userId)
        {
            var task = await _context.OnboardingTasks
                .Include(t => t.RequiredDocuments)
                .Include(t => t.CompletedByUser)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null) return null!;

            task.Status = request.Status;
            task.Notes = request.Notes;

            if (request.Status == "Completed")
            {
                task.CompletedAt = DateTime.UtcNow;
                task.CompletedByUserId = userId;
            }

            await _context.SaveChangesAsync();

            // Update process progress
            await UpdateProcessProgressAsync(task.OnboardingProcessId);

            return MapTaskToDto(task);
        }

        public async Task<OnboardingTaskDto> UploadTaskDocumentAsync(int taskId, string documentName, string filePath)
        {
            var task = await _context.OnboardingTasks
                .Include(t => t.RequiredDocuments)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null) return null!;

            var document = new OnboardingTaskDocument
            {
                OnboardingTaskId = taskId,
                DocumentName = documentName,
                IsRequired = true,
                IsUploaded = true,
                FilePath = filePath,
                UploadedAt = DateTime.UtcNow
            };

            _context.OnboardingTaskDocuments.Add(document);
            await _context.SaveChangesAsync();

            return MapTaskToDto(task);
        }

        #endregion

        #region Dashboard

        public async Task<OnboardingDashboardDto> GetDashboardAsync(int? companyId)
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var processes = await _context.OnboardingProcesses
                .Include(p => p.Employee)
                .Include(p => p.Template)
                .Where(p => p.CompanyId == companyId)
                .ToListAsync();

            var completedThisMonth = processes.Count(p => p.CompletedAt.HasValue && p.CompletedAt >= startOfMonth);

            var completedProcesses = processes.Where(p => p.CompletedAt.HasValue).ToList();
            var avgCompletionDays = completedProcesses.Any()
                ? completedProcesses.Average(p => (p.CompletedAt!.Value - p.StartDate).TotalDays)
                : 0;

            var recentProcesses = await _context.OnboardingProcesses
                .Include(p => p.Employee)
                .Include(p => p.Template)
                .Include(p => p.AssignedToUser)
                .Include(p => p.Tasks)
                .Where(p => p.CompanyId == companyId)
                .OrderByDescending(p => p.StartDate)
                .Take(10)
                .ToListAsync();

            return new OnboardingDashboardDto
            {
                TotalInProgress = processes.Count(p => p.Status == "InProgress"),
                CompletedThisMonth = completedThisMonth,
                Overdue = processes.Count(p => p.Status == "Overdue"),
                AverageCompletionDays = Math.Round(avgCompletionDays, 1),
                RecentProcesses = recentProcesses.Select(p => MapProcessToDto(p)).ToList()
            };
        }

        #endregion

        #region Helpers

        private OnboardingProcessDto MapProcessToDto(OnboardingProcess p)
        {
            return new OnboardingProcessDto
            {
                Id = p.Id,
                CompanyId = p.CompanyId,
                EmployeeId = p.EmployeeId,
                EmployeeName = p.Employee?.FullName ?? "",
                TemplateId = p.TemplateId,
                TemplateName = p.Template?.Name ?? "",
                StartDate = p.StartDate,
                TargetCompletionDate = p.TargetCompletionDate,
                CompletedAt = p.CompletedAt,
                Status = p.Status,
                Progress = p.Progress,
                AssignedToUserId = p.AssignedToUserId,
                AssignedToName = p.AssignedToUser?.FullName ?? "",
                Tasks = p.Tasks?.Select(t => MapTaskToDto(t)).ToList() ?? new List<OnboardingTaskDto>()
            };
        }

        private OnboardingTaskDto MapTaskToDto(OnboardingTask t)
        {
            return new OnboardingTaskDto
            {
                Id = t.Id,
                OnboardingProcessId = t.OnboardingProcessId,
                Title = t.Title,
                Description = t.Description,
                Category = t.Category,
                Order = t.Order,
                Status = t.Status,
                DueDate = t.DueDate,
                CompletedAt = t.CompletedAt,
                CompletedByUserId = t.CompletedByUserId,
                CompletedByName = t.CompletedByUser?.FullName,
                Notes = t.Notes,
                RequiredDocuments = t.RequiredDocuments?.Select(d => new OnboardingTaskDocumentDto
                {
                    Id = d.Id,
                    DocumentName = d.DocumentName,
                    IsRequired = d.IsRequired,
                    IsUploaded = d.IsUploaded,
                    FilePath = d.FilePath,
                    UploadedAt = d.UploadedAt
                }).ToList() ?? new List<OnboardingTaskDocumentDto>()
            };
        }

        #endregion
    }
}

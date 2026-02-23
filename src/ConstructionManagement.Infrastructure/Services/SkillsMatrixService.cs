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
    public class SkillsMatrixService : ISkillsMatrixService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SkillsMatrixService> _logger;

        public SkillsMatrixService(
            ApplicationDbContext context,
            ILogger<SkillsMatrixService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Categories

        public async Task<List<SkillCategoryDto>> GetCategoriesAsync(int? companyId, bool? isActive = null)
        {
            var query = _context.SkillCategories
                .Include(c => c.Skills)
                .Where(c => c.CompanyId == companyId);

            if (isActive.HasValue)
                query = query.Where(c => c.IsActive == isActive);

            var categories = await query.OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name).ToListAsync();

            return categories.Select(c => new SkillCategoryDto
            {
                Id = c.Id,
                CompanyId = c.CompanyId,
                Name = c.Name,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                SkillCount = c.Skills.Count
            }).ToList();
        }

        public async Task<SkillCategoryDto> GetCategoryByIdAsync(int id)
        {
            var category = await _context.SkillCategories
                .Include(c => c.Skills)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null) return null!;

            return new SkillCategoryDto
            {
                Id = category.Id,
                CompanyId = category.CompanyId,
                Name = category.Name,
                Description = category.Description,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                SkillCount = category.Skills.Count
            };
        }

        public async Task<SkillCategoryDto> CreateCategoryAsync(CreateSkillCategoryRequest request, int? companyId)
        {
            var category = new SkillCategory
            {
                CompanyId = companyId,
                Name = request.Name,
                Description = request.Description,
                DisplayOrder = request.DisplayOrder,
                IsActive = true
            };

            _context.SkillCategories.Add(category);
            await _context.SaveChangesAsync();

            return await GetCategoryByIdAsync(category.Id);
        }

        public async Task<SkillCategoryDto> UpdateCategoryAsync(int id, UpdateSkillCategoryRequest request)
        {
            var category = await _context.SkillCategories.FindAsync(id);
            if (category == null) return null!;

            category.Name = request.Name;
            category.Description = request.Description;
            category.DisplayOrder = request.DisplayOrder;
            category.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return await GetCategoryByIdAsync(id);
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await _context.SkillCategories.FindAsync(id);
            if (category == null) return;

            _context.SkillCategories.Remove(category);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Skills

        public async Task<List<SkillDto>> GetSkillsAsync(int? companyId, int? categoryId = null, bool? isActive = null)
        {
            var query = _context.Skills
                .Include(s => s.Category)
                .Include(s => s.EmployeeSkills)
                .Where(s => s.CompanyId == companyId);

            if (categoryId.HasValue)
                query = query.Where(s => s.CategoryId == categoryId);

            if (isActive.HasValue)
                query = query.Where(s => s.IsActive == isActive);

            var skills = await query.OrderBy(s => s.Category.Name).ThenBy(s => s.Name).ToListAsync();

            return skills.Select(s => new SkillDto
            {
                Id = s.Id,
                CompanyId = s.CompanyId,
                CategoryId = s.CategoryId,
                CategoryName = s.Category?.Name ?? "",
                Name = s.Name,
                Description = s.Description,
                MeasurementCriteria = s.MeasurementCriteria,
                IsActive = s.IsActive,
                EmployeeCount = s.EmployeeSkills.Count
            }).ToList();
        }

        public async Task<SkillDto> GetSkillByIdAsync(int id)
        {
            var skill = await _context.Skills
                .Include(s => s.Category)
                .Include(s => s.EmployeeSkills)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (skill == null) return null!;

            return new SkillDto
            {
                Id = skill.Id,
                CompanyId = skill.CompanyId,
                CategoryId = skill.CategoryId,
                CategoryName = skill.Category?.Name ?? "",
                Name = skill.Name,
                Description = skill.Description,
                MeasurementCriteria = skill.MeasurementCriteria,
                IsActive = skill.IsActive,
                EmployeeCount = skill.EmployeeSkills.Count
            };
        }

        public async Task<SkillDto> CreateSkillAsync(CreateSkillRequest request, int? companyId)
        {
            var skill = new Skill
            {
                CompanyId = companyId,
                CategoryId = request.CategoryId,
                Name = request.Name,
                Description = request.Description,
                MeasurementCriteria = request.MeasurementCriteria,
                IsActive = true
            };

            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();

            return await GetSkillByIdAsync(skill.Id);
        }

        public async Task<SkillDto> UpdateSkillAsync(int id, UpdateSkillRequest request)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null) return null!;

            skill.CategoryId = request.CategoryId;
            skill.Name = request.Name;
            skill.Description = request.Description;
            skill.MeasurementCriteria = request.MeasurementCriteria;
            skill.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return await GetSkillByIdAsync(id);
        }

        public async Task DeleteSkillAsync(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null) return;

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Competency Levels

        public async Task<List<CompetencyLevelDto>> GetCompetencyLevelsAsync(int? companyId)
        {
            var levels = await _context.CompetencyLevels
                .Where(l => l.CompanyId == companyId)
                .OrderBy(l => l.Level)
                .ToListAsync();

            return levels.Select(l => new CompetencyLevelDto
            {
                Id = l.Id,
                CompanyId = l.CompanyId,
                Name = l.Name,
                Level = l.Level,
                Description = l.Description,
                Points = l.Points
            }).ToList();
        }

        public async Task<CompetencyLevelDto> CreateCompetencyLevelAsync(CreateCompetencyLevelRequest request, int? companyId)
        {
            var level = new CompetencyLevel
            {
                CompanyId = companyId,
                Name = request.Name,
                Level = request.Level,
                Description = request.Description,
                Points = request.Points
            };

            _context.CompetencyLevels.Add(level);
            await _context.SaveChangesAsync();

            return new CompetencyLevelDto
            {
                Id = level.Id,
                CompanyId = level.CompanyId,
                Name = level.Name,
                Level = level.Level,
                Description = level.Description,
                Points = level.Points
            };
        }

        public async Task<CompetencyLevelDto> UpdateCompetencyLevelAsync(int id, UpdateCompetencyLevelRequest request)
        {
            var level = await _context.CompetencyLevels.FindAsync(id);
            if (level == null) return null!;

            level.Name = request.Name;
            level.Level = request.Level;
            level.Description = request.Description;
            level.Points = request.Points;

            await _context.SaveChangesAsync();

            return new CompetencyLevelDto
            {
                Id = level.Id,
                CompanyId = level.CompanyId,
                Name = level.Name,
                Level = level.Level,
                Description = level.Description,
                Points = level.Points
            };
        }

        public async Task DeleteCompetencyLevelAsync(int id)
        {
            var level = await _context.CompetencyLevels.FindAsync(id);
            if (level == null) return;

            _context.CompetencyLevels.Remove(level);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Employee Skills

        public async Task<List<EmployeeSkillDto>> GetEmployeeSkillsAsync(int employeeId)
        {
            var skills = await _context.EmployeeSkills
                .Include(e => e.Skill)
                    .ThenInclude(s => s.Category)
                .Include(e => e.CompetencyLevel)
                .Include(e => e.Employee)
                .Include(e => e.AssessedByUser)
                .Include(e => e.Certification)
                .Where(e => e.EmployeeId == employeeId)
                .OrderBy(e => e.Skill.Category.Name)
                .ThenBy(e => e.Skill.Name)
                .ToListAsync();

            return skills.Select(e => MapEmployeeSkillToDto(e)).ToList();
        }

        public async Task<EmployeeSkillDto> GetEmployeeSkillByIdAsync(int id)
        {
            var skill = await _context.EmployeeSkills
                .Include(e => e.Skill)
                    .ThenInclude(s => s.Category)
                .Include(e => e.CompetencyLevel)
                .Include(e => e.Employee)
                .Include(e => e.AssessedByUser)
                .Include(e => e.Certification)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (skill == null) return null!;

            return MapEmployeeSkillToDto(skill);
        }

        public async Task<EmployeeSkillDto> AssessEmployeeSkillAsync(CreateEmployeeSkillRequest request, int? companyId, int assessedByUserId)
        {
            // Check if employee already has this skill
            var existing = await _context.EmployeeSkills
                .FirstOrDefaultAsync(e => e.EmployeeId == request.EmployeeId && e.SkillId == request.SkillId);

            if (existing != null)
            {
                // Update existing
                existing.CompetencyLevelId = request.CompetencyLevelId;
                existing.AssessedAt = DateTime.UtcNow;
                existing.AssessedByUserId = assessedByUserId;
                existing.ExpiryDate = request.ExpiryDate;
                existing.Notes = request.Notes;
                existing.CertificationId = request.CertificationId;

                await _context.SaveChangesAsync();
                return await GetEmployeeSkillByIdAsync(existing.Id);
            }

            var employeeSkill = new EmployeeSkill
            {
                CompanyId = companyId,
                EmployeeId = request.EmployeeId,
                SkillId = request.SkillId,
                CompetencyLevelId = request.CompetencyLevelId,
                AssessedAt = DateTime.UtcNow,
                AssessedByUserId = assessedByUserId,
                ExpiryDate = request.ExpiryDate,
                Notes = request.Notes,
                CertificationId = request.CertificationId
            };

            _context.EmployeeSkills.Add(employeeSkill);
            await _context.SaveChangesAsync();

            return await GetEmployeeSkillByIdAsync(employeeSkill.Id);
        }

        public async Task<EmployeeSkillDto> UpdateEmployeeSkillAsync(int id, UpdateEmployeeSkillRequest request)
        {
            var skill = await _context.EmployeeSkills.FindAsync(id);
            if (skill == null) return null!;

            skill.CompetencyLevelId = request.CompetencyLevelId;
            skill.ExpiryDate = request.ExpiryDate;
            skill.Notes = request.Notes;
            skill.CertificationId = request.CertificationId;

            await _context.SaveChangesAsync();

            return await GetEmployeeSkillByIdAsync(id);
        }

        public async Task DeleteEmployeeSkillAsync(int id)
        {
            var skill = await _context.EmployeeSkills.FindAsync(id);
            if (skill == null) return;

            _context.EmployeeSkills.Remove(skill);
            await _context.SaveChangesAsync();
        }

        public async Task<EmployeeSkillsProfileDto> GetEmployeeSkillsProfileAsync(int employeeId)
        {
            var employee = await _context.Users.FindAsync(employeeId);
            if (employee == null) return null!;

            var skills = await GetEmployeeSkillsAsync(employeeId);
            var gaps = await GetSkillGapsAsync(null, employeeId);

            return new EmployeeSkillsProfileDto
            {
                EmployeeId = employeeId,
                EmployeeName = employee.FullName,
                TotalSkills = skills.Count,
                AverageLevel = skills.Any() ? (int)Math.Round(skills.Average(s => s.CompetencyLevel)) : 0,
                Skills = skills,
                Gaps = gaps
            };
        }

        #endregion

        #region Skill Requirements

        public async Task<List<SkillRequirementDto>> GetSkillRequirementsAsync(string entityType, int entityId)
        {
            var requirements = await _context.SkillRequirements
                .Include(r => r.Skill)
                .Include(r => r.MinimumCompetencyLevel)
                .Where(r => r.EntityType == entityType && r.EntityId == entityId)
                .ToListAsync();

            return requirements.Select(r => new SkillRequirementDto
            {
                Id = r.Id,
                CompanyId = r.CompanyId,
                EntityType = r.EntityType,
                EntityId = r.EntityId,
                SkillId = r.SkillId,
                SkillName = r.Skill?.Name ?? "",
                MinimumCompetencyLevelId = r.MinimumCompetencyLevelId,
                MinimumCompetencyLevelName = r.MinimumCompetencyLevel?.Name ?? "",
                MinimumLevel = r.MinimumCompetencyLevel?.Level ?? 0,
                IsRequired = r.IsRequired,
                NumberOfPeople = r.NumberOfPeople
            }).ToList();
        }

        public async Task<SkillRequirementDto> AddSkillRequirementAsync(CreateSkillRequirementRequest request, int? companyId)
        {
            var requirement = new SkillRequirement
            {
                CompanyId = companyId,
                EntityType = request.EntityType,
                EntityId = request.EntityId,
                SkillId = request.SkillId,
                MinimumCompetencyLevelId = request.MinimumCompetencyLevelId,
                IsRequired = request.IsRequired,
                NumberOfPeople = request.NumberOfPeople
            };

            _context.SkillRequirements.Add(requirement);
            await _context.SaveChangesAsync();

            var requirements = await GetSkillRequirementsAsync(request.EntityType, request.EntityId);
            return requirements.FirstOrDefault(r => r.Id == requirement.Id) ?? null!;
        }

        public async Task DeleteSkillRequirementAsync(int id)
        {
            var requirement = await _context.SkillRequirements.FindAsync(id);
            if (requirement == null) return;

            _context.SkillRequirements.Remove(requirement);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Gap Analysis

        public async Task<List<SkillGapAnalysisDto>> GetSkillGapsAsync(int? companyId, int? employeeId = null)
        {
            var query = _context.SkillGapAnalyses
                .Include(g => g.Employee)
                .Include(g => g.Skill)
                .AsQueryable();

            if (companyId.HasValue)
                query = query.Where(g => g.CompanyId == companyId);

            if (employeeId.HasValue)
                query = query.Where(g => g.EmployeeId == employeeId);

            var gaps = await query.OrderByDescending(g => g.Gap).ThenBy(g => g.Employee.FullName).ToListAsync();

            return gaps.Select(g => new SkillGapAnalysisDto
            {
                Id = g.Id,
                CompanyId = g.CompanyId,
                EmployeeId = g.EmployeeId,
                EmployeeName = g.Employee?.FullName ?? "",
                SkillId = g.SkillId,
                SkillName = g.Skill?.Name ?? "",
                CurrentLevel = g.CurrentLevel,
                RequiredLevel = g.RequiredLevel,
                Gap = g.Gap,
                RecommendedTraining = g.RecommendedTraining,
                AnalyzedAt = g.AnalyzedAt
            }).ToList();
        }

        public async Task<List<SkillGapAnalysisDto>> AnalyzeEmployeeGapsAsync(int employeeId)
        {
            var employee = await _context.Users.FindAsync(employeeId);
            if (employee == null) return new List<SkillGapAnalysisDto>();

            // Get employee's current skills
            var employeeSkills = await _context.EmployeeSkills
                .Include(e => e.CompetencyLevel)
                .Where(e => e.EmployeeId == employeeId)
                .ToDictionaryAsync(e => e.SkillId, e => e.CompetencyLevel.Level);

            // Get required skills for employee's role/projects
            var requirements = await _context.SkillRequirements
                .Include(r => r.Skill)
                .Include(r => r.MinimumCompetencyLevel)
                .Where(r => r.CompanyId == employee.CompanyId)
                .ToListAsync();

            var gaps = new List<SkillGapAnalysis>();

            foreach (var req in requirements)
            {
                var currentLevel = employeeSkills.GetValueOrDefault(req.SkillId, 0);
                var requiredLevel = req.MinimumCompetencyLevel?.Level ?? 0;

                if (currentLevel < requiredLevel)
                {
                    var gap = new SkillGapAnalysis
                    {
                        CompanyId = employee.CompanyId,
                        EmployeeId = employeeId,
                        SkillId = req.SkillId,
                        CurrentLevel = currentLevel,
                        RequiredLevel = requiredLevel,
                        Gap = requiredLevel - currentLevel,
                        RecommendedTraining = $"Training recommended for {req.Skill?.Name}",
                        AnalyzedAt = DateTime.UtcNow
                    };

                    gaps.Add(gap);
                }
            }

            // Clear old gaps and add new ones
            var existingGaps = await _context.SkillGapAnalyses
                .Where(g => g.EmployeeId == employeeId)
                .ToListAsync();

            _context.SkillGapAnalyses.RemoveRange(existingGaps);
            _context.SkillGapAnalyses.AddRange(gaps);
            await _context.SaveChangesAsync();

            return await GetSkillGapsAsync(employee.CompanyId, employeeId);
        }

        public async Task<List<SkillGapAnalysisDto>> AnalyzeProjectGapsAsync(int projectId)
        {
            // Get project requirements
            var requirements = await _context.SkillRequirements
                .Include(r => r.Skill)
                .Include(r => r.MinimumCompetencyLevel)
                .Where(r => r.EntityType == "Project" && r.EntityId == projectId)
                .ToListAsync();

            if (!requirements.Any()) return new List<SkillGapAnalysisDto>();

            var companyId = requirements.First().CompanyId;

            // Get project team members
            var teamMembers = await _context.ProjectTeamMembers
                .Include(t => t.User)
                    .ThenInclude(u => u.EmployeeSkills)
                        .ThenInclude(es => es.CompetencyLevel)
                .Where(t => t.ProjectId == projectId)
                .Select(t => t.User)
                .ToListAsync();

            var allGaps = new List<SkillGapAnalysis>();

            foreach (var member in teamMembers)
            {
                var employeeSkills = member.EmployeeSkills?
                    .ToDictionary(e => e.SkillId, e => e.CompetencyLevel?.Level ?? 0) ?? new Dictionary<int, int>();

                foreach (var req in requirements)
                {
                    var currentLevel = employeeSkills.GetValueOrDefault(req.SkillId, 0);
                    var requiredLevel = req.MinimumCompetencyLevel?.Level ?? 0;

                    if (currentLevel < requiredLevel)
                    {
                        allGaps.Add(new SkillGapAnalysis
                        {
                            CompanyId = companyId,
                            EmployeeId = member.Id,
                            SkillId = req.SkillId,
                            CurrentLevel = currentLevel,
                            RequiredLevel = requiredLevel,
                            Gap = requiredLevel - currentLevel,
                            RecommendedTraining = $"Training recommended for {req.Skill?.Name}",
                            AnalyzedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            return allGaps.Select(g => new SkillGapAnalysisDto
            {
                CompanyId = g.CompanyId,
                EmployeeId = g.EmployeeId,
                EmployeeName = teamMembers.FirstOrDefault(m => m.Id == g.EmployeeId)?.FullName ?? "",
                SkillId = g.SkillId,
                SkillName = requirements.FirstOrDefault(r => r.SkillId == g.SkillId)?.Skill?.Name ?? "",
                CurrentLevel = g.CurrentLevel,
                RequiredLevel = g.RequiredLevel,
                Gap = g.Gap,
                RecommendedTraining = g.RecommendedTraining,
                AnalyzedAt = g.AnalyzedAt
            }).ToList();
        }

        public async Task<SkillsMatrixDashboardDto> GetDashboardAsync(int? companyId)
        {
            var categories = await GetCategoriesAsync(companyId, true);
            var skills = await _context.Skills.CountAsync(s => s.CompanyId == companyId && s.IsActive);
            var assessments = await _context.EmployeeSkills.CountAsync(e => e.CompanyId == companyId);
            var employeesWithSkills = await _context.EmployeeSkills
                .Where(e => e.CompanyId == companyId)
                .Select(e => e.EmployeeId)
                .Distinct()
                .CountAsync();

            var gaps = await _context.SkillGapAnalyses
                .Include(g => g.Skill)
                .Include(g => g.Employee)
                .Where(g => g.CompanyId == companyId)
                .OrderByDescending(g => g.Gap)
                .Take(10)
                .Select(g => new SkillGapAnalysisDto
                {
                    Id = g.Id,
                    CompanyId = g.CompanyId,
                    EmployeeId = g.EmployeeId,
                    EmployeeName = g.Employee.FullName,
                    SkillId = g.SkillId,
                    SkillName = g.Skill.Name,
                    CurrentLevel = g.CurrentLevel,
                    RequiredLevel = g.RequiredLevel,
                    Gap = g.Gap,
                    RecommendedTraining = g.RecommendedTraining,
                    AnalyzedAt = g.AnalyzedAt
                })
                .ToListAsync();

            return new SkillsMatrixDashboardDto
            {
                TotalSkills = skills,
                TotalCategories = categories.Count,
                TotalAssessments = assessments,
                EmployeesWithSkills = employeesWithSkills,
                IdentifiedGaps = await _context.SkillGapAnalyses.CountAsync(g => g.CompanyId == companyId),
                Categories = categories,
                TopGaps = gaps
            };
        }

        #endregion

        #region Bulk Operations

        public async Task BulkAssessSkillsAsync(int employeeId, List<CreateEmployeeSkillRequest> requests, int? companyId, int assessedByUserId)
        {
            foreach (var request in requests)
            {
                await AssessEmployeeSkillAsync(request, companyId, assessedByUserId);
            }
        }

        public async Task<List<EmployeeSkillDto>> FindEmployeesWithSkillAsync(int skillId, int minimumLevel)
        {
            var skills = await _context.EmployeeSkills
                .Include(e => e.Skill)
                    .ThenInclude(s => s.Category)
                .Include(e => e.CompetencyLevel)
                .Include(e => e.Employee)
                .Include(e => e.AssessedByUser)
                .Where(e => e.SkillId == skillId && e.CompetencyLevel.Level >= minimumLevel)
                .OrderByDescending(e => e.CompetencyLevel.Level)
                .ToListAsync();

            return skills.Select(e => MapEmployeeSkillToDto(e)).ToList();
        }

        #endregion

        #region Helpers

        private EmployeeSkillDto MapEmployeeSkillToDto(EmployeeSkill e)
        {
            return new EmployeeSkillDto
            {
                Id = e.Id,
                CompanyId = e.CompanyId,
                EmployeeId = e.EmployeeId,
                EmployeeName = e.Employee?.FullName ?? "",
                SkillId = e.SkillId,
                SkillName = e.Skill?.Name ?? "",
                CategoryName = e.Skill?.Category?.Name ?? "",
                CompetencyLevelId = e.CompetencyLevelId,
                CompetencyLevelName = e.CompetencyLevel?.Name ?? "",
                CompetencyLevel = e.CompetencyLevel?.Level ?? 0,
                AssessedAt = e.AssessedAt,
                AssessedByName = e.AssessedByUser?.FullName ?? "",
                ExpiryDate = e.ExpiryDate,
                Notes = e.Notes,
                CertificationId = e.CertificationId,
                CertificationName = e.Certification?.Name
            };
        }

        #endregion
    }
}

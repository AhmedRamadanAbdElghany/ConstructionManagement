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
    public class PerformanceEvaluationService : IPerformanceEvaluationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PerformanceEvaluationService> _logger;

        public PerformanceEvaluationService(
            ApplicationDbContext context,
            ILogger<PerformanceEvaluationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Evaluation Criteria

        public async Task<List<EvaluationCriteriaDto>> GetEvaluationCriteriaAsync(int? companyId = null)
        {
            var criteria = await _context.EvaluationCriteria
                .Where(c => c.IsActive && (c.CompanyId == null || c.CompanyId == companyId))
                .OrderBy(c => c.Category)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return criteria.Select(MapToDto).ToList();
        }

        public async Task<EvaluationCriteriaDto> CreateEvaluationCriteriaAsync(CreateEvaluationCriteriaRequest request, int? companyId = null)
        {
            var criteria = new EvaluationCriteria
            {
                Name = request.Name,
                Description = request.Description,
                Category = request.Category,
                MaxScore = request.MaxScore,
                Weight = request.Weight,
                IsActive = true,
                CompanyId = companyId
            };

            _context.EvaluationCriteria.Add(criteria);
            await _context.SaveChangesAsync();

            return MapToDto(criteria);
        }

        public async Task<EvaluationCriteriaDto> UpdateEvaluationCriteriaAsync(int id, UpdateEvaluationCriteriaRequest request)
        {
            var criteria = await _context.EvaluationCriteria.FindAsync(id);
            if (criteria == null)
                throw new InvalidOperationException($"Criteria with ID {id} not found");

            criteria.Name = request.Name;
            criteria.Description = request.Description;
            criteria.Category = request.Category;
            criteria.MaxScore = request.MaxScore;
            criteria.Weight = request.Weight;
            criteria.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return MapToDto(criteria);
        }

        public async Task DeleteEvaluationCriteriaAsync(int id)
        {
            var criteria = await _context.EvaluationCriteria.FindAsync(id);
            if (criteria == null)
                throw new InvalidOperationException($"Criteria with ID {id} not found");

            criteria.IsActive = false;
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Evaluation Periods

        public async Task<List<EvaluationPeriodDto>> GetEvaluationPeriodsAsync(int? companyId = null)
        {
            var periods = await _context.EvaluationPeriods
                .Include(p => p.Evaluations)
                .Where(p => p.CompanyId == null || p.CompanyId == companyId)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            return periods.Select(p => new EvaluationPeriodDto
            {
                Id = p.Id,
                Name = p.Name,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Type = p.Type.ToString(),
                SelfAssessmentDue = p.SelfAssessmentDue,
                ManagerAssessmentDue = p.ManagerAssessmentDue,
                Status = p.Status.ToString(),
                CompanyId = p.CompanyId,
                EvaluationCount = p.Evaluations.Count,
                CompletedCount = p.Evaluations.Count(e => e.Status == EvaluationStatus.Completed || e.Status == EvaluationStatus.Acknowledged)
            }).ToList();
        }

        public async Task<EvaluationPeriodDto> GetEvaluationPeriodAsync(int id)
        {
            var period = await _context.EvaluationPeriods
                .Include(p => p.Evaluations)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (period == null)
                throw new InvalidOperationException($"Period with ID {id} not found");

            return new EvaluationPeriodDto
            {
                Id = period.Id,
                Name = period.Name,
                StartDate = period.StartDate,
                EndDate = period.EndDate,
                Type = period.Type.ToString(),
                SelfAssessmentDue = period.SelfAssessmentDue,
                ManagerAssessmentDue = period.ManagerAssessmentDue,
                Status = period.Status.ToString(),
                CompanyId = period.CompanyId,
                EvaluationCount = period.Evaluations.Count,
                CompletedCount = period.Evaluations.Count(e => e.Status == EvaluationStatus.Completed || e.Status == EvaluationStatus.Acknowledged)
            };
        }

        public async Task<EvaluationPeriodDto> CreateEvaluationPeriodAsync(CreateEvaluationPeriodRequest request, int? companyId = null)
        {
            var period = new EvaluationPeriod
            {
                Name = request.Name,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Type = Enum.Parse<EvaluationPeriodType>(request.Type),
                SelfAssessmentDue = request.SelfAssessmentDue ?? request.EndDate.AddDays(-7),
                ManagerAssessmentDue = request.ManagerAssessmentDue ?? request.EndDate,
                Status = EvaluationPeriodStatus.Draft,
                CompanyId = companyId
            };

            _context.EvaluationPeriods.Add(period);
            await _context.SaveChangesAsync();

            return await GetEvaluationPeriodAsync(period.Id);
        }

        public async Task<EvaluationPeriodDto> UpdateEvaluationPeriodAsync(int id, UpdateEvaluationPeriodRequest request)
        {
            var period = await _context.EvaluationPeriods.FindAsync(id);
            if (period == null)
                throw new InvalidOperationException($"Period with ID {id} not found");

            period.Name = request.Name;
            period.StartDate = request.StartDate;
            period.EndDate = request.EndDate;
            period.Type = Enum.Parse<EvaluationPeriodType>(request.Type);
            period.SelfAssessmentDue = request.SelfAssessmentDue;
            period.ManagerAssessmentDue = request.ManagerAssessmentDue;
            period.Status = Enum.Parse<EvaluationPeriodStatus>(request.Status);

            await _context.SaveChangesAsync();
            return await GetEvaluationPeriodAsync(id);
        }

        public async Task ActivateEvaluationPeriodAsync(int id)
        {
            var period = await _context.EvaluationPeriods.FindAsync(id);
            if (period == null)
                throw new InvalidOperationException($"Period with ID {id} not found");

            period.Status = EvaluationPeriodStatus.Active;
            await _context.SaveChangesAsync();
        }

        public async Task CloseEvaluationPeriodAsync(int id)
        {
            var period = await _context.EvaluationPeriods.FindAsync(id);
            if (period == null)
                throw new InvalidOperationException($"Period with ID {id} not found");

            period.Status = EvaluationPeriodStatus.Closed;
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Performance Evaluations

        public async Task<List<PerformanceEvaluationDto>> GetEvaluationsAsync(int? periodId, int? employeeId, int? managerId, string? status)
        {
            var query = _context.PerformanceEvaluations
                .Include(e => e.Period)
                .Include(e => e.Employee)
                .Include(e => e.Manager)
                .Include(e => e.CriteriaScores).ThenInclude(cs => cs.Criteria)
                .Include(e => e.Goals)
                .Include(e => e.PeerFeedbacks)
                .AsQueryable();

            if (periodId.HasValue)
                query = query.Where(e => e.PeriodId == periodId.Value);

            if (employeeId.HasValue)
                query = query.Where(e => e.EmployeeId == employeeId.Value);

            if (managerId.HasValue)
                query = query.Where(e => e.ManagerId == managerId.Value);

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<EvaluationStatus>(status, out var evalStatus))
                query = query.Where(e => e.Status == evalStatus);

            var evaluations = await query.OrderByDescending(e => e.CreatedAt).ToListAsync();
            return evaluations.Select(MapToDto).ToList();
        }

        public async Task<PerformanceEvaluationDto> GetEvaluationAsync(int id)
        {
            var evaluation = await _context.PerformanceEvaluations
                .Include(e => e.Period)
                .Include(e => e.Employee)
                .Include(e => e.Manager)
                .Include(e => e.CriteriaScores).ThenInclude(cs => cs.Criteria)
                .Include(e => e.Goals)
                .Include(e => e.PeerFeedbacks).ThenInclude(pf => pf.Reviewer)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evaluation == null)
                throw new InvalidOperationException($"Evaluation with ID {id} not found");

            return MapToDto(evaluation);
        }

        public async Task<PerformanceEvaluationDto> CreateEvaluationAsync(CreatePerformanceEvaluationRequest request)
        {
            // Check if evaluation already exists
            var existing = await _context.PerformanceEvaluations
                .AnyAsync(e => e.PeriodId == request.PeriodId && e.EmployeeId == request.EmployeeId);

            if (existing)
                throw new InvalidOperationException("Evaluation already exists for this employee in this period");

            var evaluation = new PerformanceEvaluation
            {
                PeriodId = request.PeriodId,
                EmployeeId = request.EmployeeId,
                ManagerId = request.ManagerId,
                ProjectId = request.ProjectId,
                Status = EvaluationStatus.Pending
            };

            _context.PerformanceEvaluations.Add(evaluation);
            await _context.SaveChangesAsync();

            // Add default criteria scores
            var criteria = await _context.EvaluationCriteria
                .Where(c => c.IsActive)
                .ToListAsync();

            foreach (var c in criteria)
            {
                evaluation.CriteriaScores.Add(new EvaluationCriteriaScore
                {
                    EvaluationId = evaluation.Id,
                    CriteriaId = c.Id
                });
            }

            await _context.SaveChangesAsync();
            return await GetEvaluationAsync(evaluation.Id);
        }

        public async Task<PerformanceEvaluationDto> StartSelfAssessmentAsync(int evaluationId, int employeeId)
        {
            var evaluation = await _context.PerformanceEvaluations.FindAsync(evaluationId);
            if (evaluation == null)
                throw new InvalidOperationException($"Evaluation with ID {evaluationId} not found");

            if (evaluation.EmployeeId != employeeId)
                throw new UnauthorizedAccessException("Only the employee can start self-assessment");

            evaluation.Status = EvaluationStatus.SelfAssessment;
            await _context.SaveChangesAsync();

            return await GetEvaluationAsync(evaluationId);
        }

        public async Task<PerformanceEvaluationDto> SubmitSelfAssessmentAsync(int evaluationId, int employeeId, SelfAssessmentRequest request)
        {
            var evaluation = await _context.PerformanceEvaluations
                .Include(e => e.CriteriaScores)
                .FirstOrDefaultAsync(e => e.Id == evaluationId);

            if (evaluation == null)
                throw new InvalidOperationException($"Evaluation with ID {evaluationId} not found");

            if (evaluation.EmployeeId != employeeId)
                throw new UnauthorizedAccessException("Only the employee can submit self-assessment");

            evaluation.SelfAssessmentScore = request.OverallScore;
            evaluation.SelfAssessmentComments = request.Comments;
            evaluation.GoalsAchieved = request.GoalsAchieved;
            evaluation.GoalsForNextPeriod = request.GoalsForNextPeriod;
            evaluation.AreasForImprovement = request.AreasForImprovement;
            evaluation.Status = EvaluationStatus.ManagerReview;

            // Update criteria scores
            foreach (var scoreRequest in request.CriteriaScores)
            {
                var criteriaScore = evaluation.CriteriaScores.FirstOrDefault(cs => cs.CriteriaId == scoreRequest.CriteriaId);
                if (criteriaScore != null)
                {
                    criteriaScore.SelfScore = scoreRequest.Score;
                    criteriaScore.SelfComments = scoreRequest.Comments;
                }
            }

            await _context.SaveChangesAsync();
            return await GetEvaluationAsync(evaluationId);
        }

        public async Task<PerformanceEvaluationDto> SubmitManagerAssessmentAsync(int evaluationId, int managerId, ManagerAssessmentRequest request)
        {
            var evaluation = await _context.PerformanceEvaluations
                .Include(e => e.CriteriaScores)
                .FirstOrDefaultAsync(e => e.Id == evaluationId);

            if (evaluation == null)
                throw new InvalidOperationException($"Evaluation with ID {evaluationId} not found");

            if (evaluation.ManagerId != managerId)
                throw new UnauthorizedAccessException("Only the assigned manager can submit assessment");

            evaluation.OverallScore = request.OverallScore;
            evaluation.ManagerComments = request.Comments;
            evaluation.TrainingRecommendations = request.TrainingRecommendations;
            evaluation.Status = EvaluationStatus.Completed;
            evaluation.CompletedAt = DateTime.UtcNow;

            // Update criteria scores
            foreach (var scoreRequest in request.CriteriaScores)
            {
                var criteriaScore = evaluation.CriteriaScores.FirstOrDefault(cs => cs.CriteriaId == scoreRequest.CriteriaId);
                if (criteriaScore != null)
                {
                    criteriaScore.ManagerScore = scoreRequest.Score;
                    criteriaScore.ManagerComments = scoreRequest.Comments;
                }
            }

            await _context.SaveChangesAsync();
            return await GetEvaluationAsync(evaluationId);
        }

        public async Task<PerformanceEvaluationDto> AcknowledgeEvaluationAsync(int evaluationId, int employeeId, AcknowledgmentRequest request)
        {
            var evaluation = await _context.PerformanceEvaluations.FindAsync(evaluationId);
            if (evaluation == null)
                throw new InvalidOperationException($"Evaluation with ID {evaluationId} not found");

            if (evaluation.EmployeeId != employeeId)
                throw new UnauthorizedAccessException("Only the employee can acknowledge evaluation");

            evaluation.Status = EvaluationStatus.Acknowledged;
            evaluation.AcknowledgedAt = DateTime.UtcNow;
            evaluation.AcknowledgmentComments = request.Comments;

            await _context.SaveChangesAsync();
            return await GetEvaluationAsync(evaluationId);
        }

        public async Task DeleteEvaluationAsync(int id)
        {
            var evaluation = await _context.PerformanceEvaluations.FindAsync(id);
            if (evaluation == null)
                throw new InvalidOperationException($"Evaluation with ID {id} not found");

            _context.PerformanceEvaluations.Remove(evaluation);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Goals

        public async Task<EvaluationGoalDto> AddGoalAsync(CreateGoalRequest request)
        {
            var goal = new EvaluationGoal
            {
                EvaluationId = request.EvaluationId,
                Description = request.Description,
                TargetDate = request.TargetDate,
                IsCarryOver = request.IsCarryOver,
                Status = GoalStatus.NotStarted
            };

            _context.EvaluationGoals.Add(goal);
            await _context.SaveChangesAsync();

            return MapToDto(goal);
        }

        public async Task<EvaluationGoalDto> UpdateGoalAsync(int goalId, UpdateGoalRequest request)
        {
            var goal = await _context.EvaluationGoals.FindAsync(goalId);
            if (goal == null)
                throw new InvalidOperationException($"Goal with ID {goalId} not found");

            goal.Description = request.Description;
            goal.TargetDate = request.TargetDate;
            goal.Status = Enum.Parse<GoalStatus>(request.Status);
            goal.Progress = request.Progress;
            goal.Comments = request.Comments;

            await _context.SaveChangesAsync();
            return MapToDto(goal);
        }

        public async Task DeleteGoalAsync(int goalId)
        {
            var goal = await _context.EvaluationGoals.FindAsync(goalId);
            if (goal == null)
                throw new InvalidOperationException($"Goal with ID {goalId} not found");

            _context.EvaluationGoals.Remove(goal);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Peer Feedback

        public async Task<List<PeerFeedbackDto>> GetPeerFeedbackAsync(int evaluationId)
        {
            var feedbacks = await _context.PeerFeedbacks
                .Include(pf => pf.Reviewer)
                .Where(pf => pf.EvaluationId == evaluationId)
                .OrderByDescending(pf => pf.SubmittedAt)
                .ToListAsync();

            return feedbacks.Select(pf => new PeerFeedbackDto
            {
                Id = pf.Id,
                EvaluationId = pf.EvaluationId,
                ReviewerId = pf.IsAnonymous ? null : pf.ReviewerId,
                ReviewerName = pf.IsAnonymous ? null : (pf.Reviewer?.FullName ?? pf.Reviewer?.Email),
                OverallRating = pf.OverallRating,
                Strengths = pf.Strengths,
                AreasForImprovement = pf.AreasForImprovement,
                Comments = pf.Comments,
                IsAnonymous = pf.IsAnonymous,
                SubmittedAt = pf.SubmittedAt
            }).ToList();
        }

        public async Task<PeerFeedbackDto> SubmitPeerFeedbackAsync(int evaluationId, int reviewerId, CreatePeerFeedbackRequest request)
        {
            var feedback = new PeerFeedback
            {
                EvaluationId = evaluationId,
                ReviewerId = reviewerId,
                OverallRating = request.OverallRating,
                Strengths = request.Strengths,
                AreasForImprovement = request.AreasForImprovement,
                Comments = request.Comments,
                IsAnonymous = request.IsAnonymous,
                SubmittedAt = DateTime.UtcNow
            };

            _context.PeerFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return (await GetPeerFeedbackAsync(evaluationId)).First(f => f.Id == feedback.Id);
        }

        #endregion

        #region Reports

        public async Task<PerformanceReportDto> GetPerformanceReportAsync(int periodId)
        {
            var period = await _context.EvaluationPeriods
                .Include(p => p.Evaluations).ThenInclude(e => e.Employee)
                .Include(p => p.Evaluations).ThenInclude(e => e.CriteriaScores).ThenInclude(cs => cs.Criteria)
                .FirstOrDefaultAsync(p => p.Id == periodId);

            if (period == null)
                throw new InvalidOperationException($"Period with ID {periodId} not found");

            var evaluations = period.Evaluations.Where(e => e.Status == EvaluationStatus.Completed || e.Status == EvaluationStatus.Acknowledged).ToList();

            var report = new PerformanceReportDto
            {
                PeriodName = period.Name,
                TotalEmployees = period.Evaluations.Count,
                CompletedEvaluations = evaluations.Count,
                PendingEvaluations = period.Evaluations.Count - evaluations.Count,
                AverageScore = evaluations.Any() ? evaluations.Average(e => e.OverallScore) : 0
            };

            // Score distribution
            var ranges = new[] { (0m, 2m, "0-2"), (2m, 4m, "2-4"), (4m, 6m, "4-6"), (6m, 8m, "6-8"), (8m, 10m, "8-10") };
            foreach (var (min, max, label) in ranges)
            {
                var count = evaluations.Count(e => e.OverallScore >= min && e.OverallScore < max);
                report.ScoreDistribution.Add(new PerformanceDistributionDto
                {
                    Range = label,
                    Count = count,
                    Percentage = evaluations.Any() ? (decimal)count / evaluations.Count * 100 : 0
                });
            }

            // Top performers
            report.TopPerformers = evaluations
                .OrderByDescending(e => e.OverallScore)
                .Take(10)
                .Select(e => new TopPerformerDto
                {
                    EmployeeId = e.EmployeeId,
                    EmployeeName = e.Employee?.FullName ?? e.Employee?.Email ?? "Unknown",
                    Position = e.Employee?.Specialization,
                    Score = e.OverallScore
                }).ToList();

            // Category averages
            var allCriteriaScores = evaluations.SelectMany(e => e.CriteriaScores).ToList();
            var categoryGroups = allCriteriaScores.GroupBy(cs => cs.Criteria?.Category ?? "General");

            foreach (var group in categoryGroups)
            {
                var avgScore = group.Where(cs => cs.ManagerScore.HasValue).Average(cs => cs.ManagerScore!.Value);
                var maxScore = group.Max(cs => cs.Criteria?.MaxScore ?? 10);

                report.CategoryAverages.Add(new CategoryAverageDto
                {
                    Category = group.Key,
                    AverageScore = (decimal)avgScore,
                    MaxPossibleScore = maxScore
                });
            }

            return report;
        }

        public async Task<EmployeePerformanceHistoryDto> GetEmployeePerformanceHistoryAsync(int employeeId, int? count = null)
        {
            var employee = await _context.Users.FindAsync(employeeId);
            if (employee == null)
                throw new InvalidOperationException($"Employee with ID {employeeId} not found");

            var query = _context.PerformanceEvaluations
                .Include(e => e.Period)
                .Where(e => e.EmployeeId == employeeId && (e.Status == EvaluationStatus.Completed || e.Status == EvaluationStatus.Acknowledged))
                .OrderByDescending(e => e.Period.StartDate);

            var evaluations = count.HasValue ? await query.Take(count.Value).ToListAsync() : await query.ToListAsync();

            return new EmployeePerformanceHistoryDto
            {
                EmployeeId = employeeId,
                EmployeeName = employee.FullName ?? employee.Email ?? "Unknown",
                History = evaluations.Select(e => new PerformanceHistoryItemDto
                {
                    PeriodName = e.Period.Name,
                    PeriodStart = e.Period.StartDate,
                    PeriodEnd = e.Period.EndDate,
                    Score = e.OverallScore,
                    ManagerComments = e.ManagerComments
                }).ToList()
            };
        }

        public async Task<List<TopPerformerDto>> GetTopPerformersAsync(int periodId, int count = 10)
        {
            var evaluations = await _context.PerformanceEvaluations
                .Include(e => e.Employee)
                .Where(e => e.PeriodId == periodId && (e.Status == EvaluationStatus.Completed || e.Status == EvaluationStatus.Acknowledged))
                .OrderByDescending(e => e.OverallScore)
                .Take(count)
                .ToListAsync();

            return evaluations.Select(e => new TopPerformerDto
            {
                EmployeeId = e.EmployeeId,
                EmployeeName = e.Employee?.FullName ?? e.Employee?.Email ?? "Unknown",
                Position = e.Employee?.Specialization,
                Score = e.OverallScore
            }).ToList();
        }

        #endregion

        #region Private Helpers

        private static EvaluationCriteriaDto MapToDto(EvaluationCriteria c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Category = c.Category,
            MaxScore = c.MaxScore,
            Weight = c.Weight,
            IsActive = c.IsActive,
            CompanyId = c.CompanyId
        };

        private static EvaluationGoalDto MapToDto(EvaluationGoal g) => new()
        {
            Id = g.Id,
            Description = g.Description,
            TargetDate = g.TargetDate,
            Status = g.Status.ToString(),
            Progress = g.Progress,
            Comments = g.Comments,
            IsCarryOver = g.IsCarryOver
        };

        private static PerformanceEvaluationDto MapToDto(PerformanceEvaluation e) => new()
        {
            Id = e.Id,
            PeriodId = e.PeriodId,
            PeriodName = e.Period?.Name ?? string.Empty,
            EmployeeId = e.EmployeeId,
            EmployeeName = e.Employee?.FullName ?? e.Employee?.Email ?? "Unknown",
            EmployeeAvatar = e.Employee?.ProfileImageUrl,
            EmployeePosition = e.Employee?.Specialization,
            ManagerId = e.ManagerId,
            ManagerName = e.Manager?.FullName ?? e.Manager?.Email ?? "Unknown",
            ProjectId = e.ProjectId,
            OverallScore = e.OverallScore,
            SelfAssessmentScore = e.SelfAssessmentScore,
            Status = e.Status.ToString(),
            SelfAssessmentComments = e.SelfAssessmentComments,
            ManagerComments = e.ManagerComments,
            GoalsAchieved = e.GoalsAchieved,
            GoalsForNextPeriod = e.GoalsForNextPeriod,
            AreasForImprovement = e.AreasForImprovement,
            TrainingRecommendations = e.TrainingRecommendations,
            AcknowledgedAt = e.AcknowledgedAt,
            AcknowledgmentComments = e.AcknowledgmentComments,
            CompletedAt = e.CompletedAt,
            CreatedAt = e.CreatedAt,
            CriteriaScores = e.CriteriaScores?.Select(cs => new EvaluationCriteriaScoreDto
            {
                Id = cs.Id,
                CriteriaId = cs.CriteriaId,
                CriteriaName = cs.Criteria?.Name ?? string.Empty,
                Category = cs.Criteria?.Category ?? string.Empty,
                MaxScore = cs.Criteria?.MaxScore ?? 10,
                Weight = cs.Criteria?.Weight ?? 1,
                ManagerScore = cs.ManagerScore,
                SelfScore = cs.SelfScore,
                ManagerComments = cs.ManagerComments,
                SelfComments = cs.SelfComments
            }).ToList() ?? new List<EvaluationCriteriaScoreDto>(),
            Goals = e.Goals?.Select(MapToDto).ToList() ?? new List<EvaluationGoalDto>(),
            PeerFeedbacks = e.PeerFeedbacks?.Select(pf => new PeerFeedbackDto
            {
                Id = pf.Id,
                EvaluationId = pf.EvaluationId,
                ReviewerId = pf.IsAnonymous ? null : pf.ReviewerId,
                ReviewerName = pf.IsAnonymous ? null : (pf.Reviewer?.FullName ?? pf.Reviewer?.Email),
                OverallRating = pf.OverallRating,
                Strengths = pf.Strengths,
                AreasForImprovement = pf.AreasForImprovement,
                Comments = pf.Comments,
                IsAnonymous = pf.IsAnonymous,
                SubmittedAt = pf.SubmittedAt
            }).ToList() ?? new List<PeerFeedbackDto>()
        };

        #endregion
    }
}

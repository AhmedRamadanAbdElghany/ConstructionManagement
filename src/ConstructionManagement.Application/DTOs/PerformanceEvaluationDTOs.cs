using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    #region Evaluation Criteria DTOs

    public class EvaluationCriteriaDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int MaxScore { get; set; }
        public decimal Weight { get; set; }
        public bool IsActive { get; set; }
        public int? CompanyId { get; set; }
    }

    public class CreateEvaluationCriteriaRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int MaxScore { get; set; } = 10;
        public decimal Weight { get; set; } = 1.0m;
    }

    public class UpdateEvaluationCriteriaRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int MaxScore { get; set; }
        public decimal Weight { get; set; }
        public bool IsActive { get; set; }
    }

    #endregion

    #region Evaluation Period DTOs

    public class EvaluationPeriodDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Type { get; set; } = string.Empty;
        public DateTime SelfAssessmentDue { get; set; }
        public DateTime ManagerAssessmentDue { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? CompanyId { get; set; }
        public int EvaluationCount { get; set; }
        public int CompletedCount { get; set; }
    }

    public class CreateEvaluationPeriodRequest
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Type { get; set; } = "Quarterly";
        public DateTime? SelfAssessmentDue { get; set; }
        public DateTime? ManagerAssessmentDue { get; set; }
    }

    public class UpdateEvaluationPeriodRequest
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Type { get; set; }
        public DateTime SelfAssessmentDue { get; set; }
        public DateTime ManagerAssessmentDue { get; set; }
        public string Status { get; set; }
    }

    #endregion

    #region Performance Evaluation DTOs

    public class PerformanceEvaluationDto
    {
        public int Id { get; set; }
        public int PeriodId { get; set; }
        public string PeriodName { get; set; } = string.Empty;
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string? EmployeeAvatar { get; set; }
        public string? EmployeePosition { get; set; }
        public int ManagerId { get; set; }
        public string ManagerName { get; set; } = string.Empty;
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public decimal OverallScore { get; set; }
        public decimal? SelfAssessmentScore { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? SelfAssessmentComments { get; set; }
        public string? ManagerComments { get; set; }
        public string? GoalsAchieved { get; set; }
        public string? GoalsForNextPeriod { get; set; }
        public string? AreasForImprovement { get; set; }
        public string? TrainingRecommendations { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
        public string? AcknowledgmentComments { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<EvaluationCriteriaScoreDto> CriteriaScores { get; set; } = new();
        public List<EvaluationGoalDto> Goals { get; set; } = new();
        public List<PeerFeedbackDto> PeerFeedbacks { get; set; } = new();
    }

    public class EvaluationCriteriaScoreDto
    {
        public int Id { get; set; }
        public int CriteriaId { get; set; }
        public string CriteriaName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int MaxScore { get; set; }
        public decimal Weight { get; set; }
        public int? ManagerScore { get; set; }
        public int? SelfScore { get; set; }
        public string? ManagerComments { get; set; }
        public string? SelfComments { get; set; }
    }

    public class EvaluationGoalDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TargetDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Progress { get; set; }
        public string? Comments { get; set; }
        public bool IsCarryOver { get; set; }
    }

    public class CreatePerformanceEvaluationRequest
    {
        public int PeriodId { get; set; }
        public int EmployeeId { get; set; }
        public int ManagerId { get; set; }
        public int? ProjectId { get; set; }
    }

    public class SelfAssessmentRequest
    {
        public decimal? OverallScore { get; set; }
        public string? Comments { get; set; }
        public string? GoalsAchieved { get; set; }
        public string? GoalsForNextPeriod { get; set; }
        public string? AreasForImprovement { get; set; }
        public List<CriteriaScoreRequest> CriteriaScores { get; set; } = new();
    }

    public class ManagerAssessmentRequest
    {
        public decimal OverallScore { get; set; }
        public string? Comments { get; set; }
        public string? TrainingRecommendations { get; set; }
        public List<CriteriaScoreRequest> CriteriaScores { get; set; } = new();
    }

    public class CriteriaScoreRequest
    {
        public int CriteriaId { get; set; }
        public int Score { get; set; }
        public string? Comments { get; set; }
    }

    public class AcknowledgmentRequest
    {
        public string? Comments { get; set; }
    }

    #endregion

    #region Peer Feedback DTOs

    public class PeerFeedbackDto
    {
        public int Id { get; set; }
        public int EvaluationId { get; set; }
        public int? ReviewerId { get; set; }
        public string? ReviewerName { get; set; }
        public int OverallRating { get; set; }
        public string? Strengths { get; set; }
        public string? AreasForImprovement { get; set; }
        public string? Comments { get; set; }
        public bool IsAnonymous { get; set; }
        public DateTime SubmittedAt { get; set; }
    }

    public class CreatePeerFeedbackRequest
    {
        public int EvaluationId { get; set; }
        public int OverallRating { get; set; }
        public string? Strengths { get; set; }
        public string? AreasForImprovement { get; set; }
        public string? Comments { get; set; }
        public bool IsAnonymous { get; set; } = true;
    }

    #endregion

    #region Goal DTOs

    public class CreateGoalRequest
    {
        public int EvaluationId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TargetDate { get; set; }
        public bool IsCarryOver { get; set; }
    }

    public class UpdateGoalRequest
    {
        public string Description { get; set; } = string.Empty;
        public DateTime TargetDate { get; set; }
        public string Status { get; set; }
        public int Progress { get; set; }
        public string? Comments { get; set; }
    }

    #endregion

    #region Reports

    public class PerformanceReportDto
    {
        public string PeriodName { get; set; } = string.Empty;
        public int TotalEmployees { get; set; }
        public int CompletedEvaluations { get; set; }
        public int PendingEvaluations { get; set; }
        public decimal AverageScore { get; set; }
        public List<PerformanceDistributionDto> ScoreDistribution { get; set; } = new();
        public List<TopPerformerDto> TopPerformers { get; set; } = new();
        public List<CategoryAverageDto> CategoryAverages { get; set; } = new();
    }

    public class PerformanceDistributionDto
    {
        public string Range { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class TopPerformerDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string? Position { get; set; }
        public decimal Score { get; set; }
    }

    public class CategoryAverageDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal AverageScore { get; set; }
        public decimal MaxPossibleScore { get; set; }
    }

    public class EmployeePerformanceHistoryDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public List<PerformanceHistoryItemDto> History { get; set; } = new();
    }

    public class PerformanceHistoryItemDto
    {
        public string PeriodName { get; set; } = string.Empty;
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public decimal Score { get; set; }
        public string? ManagerComments { get; set; }
    }

    #endregion
}

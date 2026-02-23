using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Performance evaluation criteria/template
    /// </summary>
    public class EvaluationCriteria : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        /// <summary>
        /// Category: Quality, Productivity, Teamwork, Safety, Leadership, etc.
        /// </summary>
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;
        
        /// <summary>
        /// Maximum score for this criteria
        /// </summary>
        public int MaxScore { get; set; } = 10;
        
        /// <summary>
        /// Weight of this criteria in overall evaluation (percentage)
        /// </summary>
        public decimal Weight { get; set; } = 1.0m;
        
        /// <summary>
        /// Whether this criteria is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Company ID for multi-tenancy (null = system default)
        /// </summary>
        public int? CompanyId { get; set; }
    }
    
    /// <summary>
    /// Performance evaluation period (quarterly, annual, etc.)
    /// </summary>
    public class EvaluationPeriod : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        /// <summary>
        /// Type: Monthly, Quarterly, SemiAnnual, Annual, Project
        /// </summary>
        public EvaluationPeriodType Type { get; set; }
        
        /// <summary>
        /// Due date for self-assessment
        /// </summary>
        public DateTime SelfAssessmentDue { get; set; }
        
        /// <summary>
        /// Due date for manager assessment
        /// </summary>
        public DateTime ManagerAssessmentDue { get; set; }
        
        /// <summary>
        /// Status: Draft, Active, Closed
        /// </summary>
        public EvaluationPeriodStatus Status { get; set; } = EvaluationPeriodStatus.Draft;
        
        public int? CompanyId { get; set; }
        
        public ICollection<PerformanceEvaluation> Evaluations { get; set; } = new List<PerformanceEvaluation>();
    }
    
    /// <summary>
    /// Performance evaluation for an employee
    /// </summary>
    public class PerformanceEvaluation : BaseEntity
    {
        public int PeriodId { get; set; }
        public EvaluationPeriod Period { get; set; } = null!;
        
        /// <summary>
        /// Employee being evaluated
        /// </summary>
        public int EmployeeId { get; set; }
        public User Employee { get; set; } = null!;
        
        /// <summary>
        /// Manager conducting the evaluation
        /// </summary>
        public int ManagerId { get; set; }
        public User Manager { get; set; } = null!;
        
        /// <summary>
        /// Project ID if this is a project-based evaluation
        /// </summary>
        public int? ProjectId { get; set; }
        
        /// <summary>
        /// Overall score (calculated from criteria scores)
        /// </summary>
        public decimal OverallScore { get; set; }
        
        /// <summary>
        /// Self-assessment overall score
        /// </summary>
        public decimal? SelfAssessmentScore { get; set; }
        
        /// <summary>
        /// Status: Pending, SelfAssessment, ManagerReview, Completed, Acknowledged
        /// </summary>
        public EvaluationStatus Status { get; set; } = EvaluationStatus.Pending;
        
        /// <summary>
        /// Employee's self-assessment comments
        /// </summary>
        [MaxLength(2000)]
        public string? SelfAssessmentComments { get; set; }
        
        /// <summary>
        /// Manager's overall comments
        /// </summary>
        [MaxLength(2000)]
        public string? ManagerComments { get; set; }
        
        /// <summary>
        /// Goals achieved during the period
        /// </summary>
        [MaxLength(2000)]
        public string? GoalsAchieved { get; set; }
        
        /// <summary>
        /// Goals for next period
        /// </summary>
        [MaxLength(2000)]
        public string? GoalsForNextPeriod { get; set; }
        
        /// <summary>
        /// Areas for improvement
        /// </summary>
        [MaxLength(2000)]
        public string? AreasForImprovement { get; set; }
        
        /// <summary>
        /// Training recommendations
        /// </summary>
        [MaxLength(1000)]
        public string? TrainingRecommendations { get; set; }
        
        /// <summary>
        /// When employee acknowledged the evaluation
        /// </summary>
        public DateTime? AcknowledgedAt { get; set; }
        
        /// <summary>
        /// Employee's acknowledgment comments
        /// </summary>
        [MaxLength(1000)]
        public string? AcknowledgmentComments { get; set; }
        
        /// <summary>
        /// When the evaluation was completed
        /// </summary>
        public DateTime? CompletedAt { get; set; }
        
        public ICollection<EvaluationCriteriaScore> CriteriaScores { get; set; } = new List<EvaluationCriteriaScore>();
        public ICollection<EvaluationGoal> Goals { get; set; } = new List<EvaluationGoal>();
        public ICollection<PeerFeedback> PeerFeedbacks { get; set; } = new List<PeerFeedback>();
    }
    
    /// <summary>
    /// Score for each evaluation criteria
    /// </summary>
    public class EvaluationCriteriaScore : BaseEntity
    {
        public int EvaluationId { get; set; }
        public PerformanceEvaluation Evaluation { get; set; } = null!;
        
        public int CriteriaId { get; set; }
        public EvaluationCriteria Criteria { get; set; } = null!;
        
        /// <summary>
        /// Score given by manager
        /// </summary>
        public int? ManagerScore { get; set; }
        
        /// <summary>
        /// Score given by employee in self-assessment
        /// </summary>
        public int? SelfScore { get; set; }
        
        /// <summary>
        /// Manager's comments for this criteria
        /// </summary>
        [MaxLength(500)]
        public string? ManagerComments { get; set; }
        
        /// <summary>
        /// Employee's comments for this criteria
        /// </summary>
        [MaxLength(500)]
        public string? SelfComments { get; set; }
    }
    
    /// <summary>
    /// Goals set during evaluation
    /// </summary>
    public class EvaluationGoal : BaseEntity
    {
        public int EvaluationId { get; set; }
        public PerformanceEvaluation Evaluation { get; set; } = null!;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Target date for goal completion
        /// </summary>
        public DateTime TargetDate { get; set; }
        
        /// <summary>
        /// Status: NotStarted, InProgress, Completed, Cancelled
        /// </summary>
        public GoalStatus Status { get; set; } = GoalStatus.NotStarted;
        
        /// <summary>
        /// Progress percentage (0-100)
        /// </summary>
        public int Progress { get; set; }
        
        /// <summary>
        /// Comments on goal progress
        /// </summary>
        [MaxLength(500)]
        public string? Comments { get; set; }
        
        /// <summary>
        /// Whether this is a carry-over from previous period
        /// </summary>
        public bool IsCarryOver { get; set; }
    }
    
    /// <summary>
    /// 360-degree feedback from peers
    /// </summary>
    public class PeerFeedback : BaseEntity
    {
        public int EvaluationId { get; set; }
        public PerformanceEvaluation Evaluation { get; set; } = null!;
        
        /// <summary>
        /// User providing feedback
        /// </summary>
        public int ReviewerId { get; set; }
        public User Reviewer { get; set; } = null!;
        
        /// <summary>
        /// Overall rating (1-5)
        /// </summary>
        public int OverallRating { get; set; }
        
        /// <summary>
        /// Strengths observed
        /// </summary>
        [MaxLength(1000)]
        public string? Strengths { get; set; }
        
        /// <summary>
        /// Areas for improvement
        /// </summary>
        [MaxLength(1000)]
        public string? AreasForImprovement { get; set; }
        
        /// <summary>
        /// Additional comments
        /// </summary>
        [MaxLength(500)]
        public string? Comments { get; set; }
        
        /// <summary>
        /// Whether feedback is anonymous
        /// </summary>
        public bool IsAnonymous { get; set; } = true;
        
        public DateTime SubmittedAt { get; set; }
    }
    
    public enum EvaluationPeriodType
    {
        Monthly = 0,
        Quarterly = 1,
        SemiAnnual = 2,
        Annual = 3,
        Project = 4
    }
    
    public enum EvaluationPeriodStatus
    {
        Draft = 0,
        Active = 1,
        Closed = 2
    }
    
    public enum EvaluationStatus
    {
        Pending = 0,
        SelfAssessment = 1,
        ManagerReview = 2,
        Completed = 3,
        Acknowledged = 4
    }
    
    public enum GoalStatus
    {
        NotStarted = 0,
        InProgress = 1,
        Completed = 2,
        Cancelled = 3
    }
}

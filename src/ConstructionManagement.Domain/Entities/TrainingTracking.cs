using System;
using System.Collections.Generic;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Training program/course
    /// </summary>
    public class TrainingProgram : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Code { get; set; } // Internal code like "SAF-001"
        public int CategoryId { get; set; }
        public TrainingCategory Category { get; set; } = null!;

        public TrainingType Type { get; set; }
        public TrainingDeliveryMethod DeliveryMethod { get; set; }

        public int? DurationHours { get; set; }
        public int? DurationMinutes { get; set; }
        public string? ContentUrl { get; set; } // For online courses
        public string? Provider { get; set; } // External provider name
        public string? Instructor { get; set; }

        public bool IsMandatory { get; set; }
        public bool IsCertification { get; set; }
        public int? CertificationValidityMonths { get; set; }
        public int? PassingScore { get; set; }
        public int MaxAttempts { get; set; } = 3;

        public decimal? Cost { get; set; }
        public int? CurrencyId { get; set; }

        public bool IsActive { get; set; } = true;
        public int? CompanyId { get; set; } // null for system-wide trainings
        public Company? Company { get; set; }

        // Navigation
        public ICollection<TrainingEnrollment> Enrollments { get; set; } = new List<TrainingEnrollment>();
        public ICollection<TrainingMaterial> Materials { get; set; } = new List<TrainingMaterial>();
        public ICollection<TrainingQuiz> Quizzes { get; set; } = new List<TrainingQuiz>();
        public ICollection<TrainingSession> Sessions { get; set; } = new List<TrainingSession>();
    }

    /// <summary>
    /// Training category
    /// </summary>
    public class TrainingCategory : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public int? ParentCategoryId { get; set; }
        public TrainingCategory? ParentCategory { get; set; }
        public ICollection<TrainingCategory> SubCategories { get; set; } = new List<TrainingCategory>();
        public ICollection<TrainingProgram> Programs { get; set; } = new List<TrainingProgram>();
        public int? CompanyId { get; set; }
        public Company? Company { get; set; }
    }

    /// <summary>
    /// Training session (for instructor-led training)
    /// </summary>
    public class TrainingSession : BaseEntity
    {
        public int TrainingProgramId { get; set; }
        public TrainingProgram TrainingProgram { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Location { get; set; }
        public string? VirtualMeetingUrl { get; set; }
        public int MaxParticipants { get; set; }
        public int CurrentParticipants { get; set; }
        public string? Instructor { get; set; }
        public SessionStatus Status { get; set; }
        public string? Notes { get; set; }

        public ICollection<TrainingEnrollment> Enrollments { get; set; } = new List<TrainingEnrollment>();
    }

    /// <summary>
    /// User enrollment in a training program
    /// </summary>
    public class TrainingEnrollment : BaseEntity
    {
        public int TrainingProgramId { get; set; }
        public TrainingProgram TrainingProgram { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int? SessionId { get; set; }
        public TrainingSession? Session { get; set; }

        public EnrollmentStatus Status { get; set; }
        public DateTime EnrolledAt { get; set; }
        public int? EnrolledByUserId { get; set; }
        public User? EnrolledByUser { get; set; }

        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? DueDate { get; set; }

        public int? Score { get; set; }
        public bool Passed { get; set; }
        public int Attempts { get; set; }

        public decimal? TimeSpentMinutes { get; set; }
        public string? Notes { get; set; }

        // Certificate
        public string? CertificateNumber { get; set; }
        public DateTime? CertificateIssuedAt { get; set; }
        public DateTime? CertificateExpiresAt { get; set; }
        public string? CertificateUrl { get; set; }

        // Navigation
        public ICollection<TrainingProgress> ProgressRecords { get; set; } = new List<TrainingProgress>();
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
    }

    /// <summary>
    /// Progress tracking for training modules
    /// </summary>
    public class TrainingProgress : BaseEntity
    {
        public int EnrollmentId { get; set; }
        public TrainingEnrollment Enrollment { get; set; } = null!;

        public int? MaterialId { get; set; }
        public TrainingMaterial? Material { get; set; }

        public string ModuleName { get; set; } = string.Empty;
        public int ModuleOrder { get; set; }
        public decimal ProgressPercentage { get; set; }
        public TimeSpan? TimeSpent { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Training material/document
    /// </summary>
    public class TrainingMaterial : BaseEntity
    {
        public int TrainingProgramId { get; set; }
        public TrainingProgram TrainingProgram { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public MaterialType Type { get; set; }
        public string? FilePath { get; set; }
        public string? ContentUrl { get; set; }
        public int? DurationMinutes { get; set; }
        public int Order { get; set; }
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// Quiz for training assessment
    /// </summary>
    public class TrainingQuiz : BaseEntity
    {
        public int TrainingProgramId { get; set; }
        public TrainingProgram TrainingProgram { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PassingScore { get; set; } = 70;
        public int TimeLimitMinutes { get; set; }
        public int MaxAttempts { get; set; } = 3;
        public bool ShuffleQuestions { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
        public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
    }

    /// <summary>
    /// Quiz question
    /// </summary>
    public class QuizQuestion : BaseEntity
    {
        public int QuizId { get; set; }
        public TrainingQuiz Quiz { get; set; } = null!;

        public string QuestionText { get; set; } = string.Empty;
        public QuestionType QuestionType { get; set; }
        public string? Explanation { get; set; }
        public int Points { get; set; } = 1;
        public int Order { get; set; }

        public ICollection<QuizAnswer> Answers { get; set; } = new List<QuizAnswer>();
    }

    /// <summary>
    /// Quiz answer option
    /// </summary>
    public class QuizAnswer : BaseEntity
    {
        public int QuestionId { get; set; }
        public QuizQuestion Question { get; set; } = null!;

        public string AnswerText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int Order { get; set; }
    }

    /// <summary>
    /// User's quiz attempt
    /// </summary>
    public class QuizAttempt : BaseEntity
    {
        public int QuizId { get; set; }
        public TrainingQuiz Quiz { get; set; } = null!;

        public int EnrollmentId { get; set; }
        public TrainingEnrollment Enrollment { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public DateTime StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public int? Score { get; set; }
        public bool Passed { get; set; }
        public int AttemptNumber { get; set; }
        public TimeSpan? TimeTaken { get; set; }

        public ICollection<QuizResponse> Responses { get; set; } = new List<QuizResponse>();
    }

    /// <summary>
    /// User's response to a quiz question
    /// </summary>
    public class QuizResponse : BaseEntity
    {
        public int AttemptId { get; set; }
        public QuizAttempt Attempt { get; set; } = null!;

        public int QuestionId { get; set; }
        public QuizQuestion Question { get; set; } = null!;

        public int? SelectedAnswerId { get; set; }
        public QuizAnswer? SelectedAnswer { get; set; }

        public string? TextResponse { get; set; }
        public bool IsCorrect { get; set; }
        public int PointsEarned { get; set; }
    }

    /// <summary>
    /// Training requirement for a role
    /// </summary>
    public class TrainingRequirement : BaseEntity
    {
        public int? RoleId { get; set; }
        public Role? Role { get; set; }

        public int TrainingProgramId { get; set; }
        public TrainingProgram TrainingProgram { get; set; } = null!;

        public bool IsMandatory { get; set; }
        public int? DueWithinDays { get; set; }
        public int? RenewalPeriodMonths { get; set; }
        public int? CompanyId { get; set; }
        public Company? Company { get; set; }
    }

    #region Enums

    public enum TrainingType
    {
        Safety = 1,
        Technical = 2,
        Compliance = 3,
        SoftSkills = 4,
        Onboarding = 5,
        Equipment = 6,
        Other = 99
    }

    public enum TrainingDeliveryMethod
    {
        Online = 1,
        InPerson = 2,
        Blended = 3,
        SelfPaced = 4
    }

    public enum SessionStatus
    {
        Scheduled = 1,
        InProgress = 2,
        Completed = 3,
        Cancelled = 4
    }

    public enum EnrollmentStatus
    {
        Enrolled = 1,
        InProgress = 2,
        Completed = 3,
        Failed = 4,
        Expired = 5,
        Cancelled = 6
    }

    public enum MaterialType
    {
        Video = 1,
        Document = 2,
        Presentation = 3,
        Link = 4,
        Quiz = 5,
        SCORM = 6
    }

    public enum QuestionType
    {
        SingleChoice = 1,
        MultipleChoice = 2,
        TrueFalse = 3,
        ShortAnswer = 4
    }

    #endregion
}

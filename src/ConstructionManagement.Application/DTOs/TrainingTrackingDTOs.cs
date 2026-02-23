using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    #region Training Program DTOs

    public class TrainingProgramDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Code { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string DeliveryMethod { get; set; } = string.Empty;
        public int? DurationHours { get; set; }
        public int? DurationMinutes { get; set; }
        public string? ContentUrl { get; set; }
        public string? Provider { get; set; }
        public string? Instructor { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsCertification { get; set; }
        public int? CertificationValidityMonths { get; set; }
        public int? PassingScore { get; set; }
        public int MaxAttempts { get; set; }
        public decimal? Cost { get; set; }
        public bool IsActive { get; set; }
        public int? CompanyId { get; set; }
        public int EnrollmentCount { get; set; }
        public int CompletionCount { get; set; }
        public List<TrainingMaterialDto> Materials { get; set; } = new();
        public List<TrainingSessionDto> UpcomingSessions { get; set; } = new();
    }

    public class CreateTrainingProgramRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Code { get; set; }
        public int CategoryId { get; set; }
        public string Type { get; set; } = "Other";
        public string DeliveryMethod { get; set; } = "SelfPaced";
        public int? DurationHours { get; set; }
        public int? DurationMinutes { get; set; }
        public string? ContentUrl { get; set; }
        public string? Provider { get; set; }
        public string? Instructor { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsCertification { get; set; }
        public int? CertificationValidityMonths { get; set; }
        public int? PassingScore { get; set; }
        public int MaxAttempts { get; set; } = 3;
        public decimal? Cost { get; set; }
    }

    public class UpdateTrainingProgramRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Code { get; set; }
        public int CategoryId { get; set; }
        public string Type { get; set; } = "Other";
        public string DeliveryMethod { get; set; } = "SelfPaced";
        public int? DurationHours { get; set; }
        public int? DurationMinutes { get; set; }
        public string? ContentUrl { get; set; }
        public string? Provider { get; set; }
        public string? Instructor { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsCertification { get; set; }
        public int? CertificationValidityMonths { get; set; }
        public int? PassingScore { get; set; }
        public int MaxAttempts { get; set; }
        public decimal? Cost { get; set; }
        public bool IsActive { get; set; }
    }

    #endregion

    #region Training Category DTOs

    public class TrainingCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public int? ParentCategoryId { get; set; }
        public string? ParentCategoryName { get; set; }
        public int ProgramCount { get; set; }
        public List<TrainingCategoryDto> SubCategories { get; set; } = new();
    }

    public class CreateTrainingCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public int? ParentCategoryId { get; set; }
    }

    public class UpdateTrainingCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public int? ParentCategoryId { get; set; }
    }

    #endregion

    #region Training Session DTOs

    public class TrainingSessionDto
    {
        public int Id { get; set; }
        public int TrainingProgramId { get; set; }
        public string TrainingTitle { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Location { get; set; }
        public string? VirtualMeetingUrl { get; set; }
        public int MaxParticipants { get; set; }
        public int CurrentParticipants { get; set; }
        public int AvailableSpots { get; set; }
        public string? Instructor { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsUserEnrolled { get; set; }
    }

    public class CreateTrainingSessionRequest
    {
        public int TrainingProgramId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Location { get; set; }
        public string? VirtualMeetingUrl { get; set; }
        public int MaxParticipants { get; set; }
        public string? Instructor { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateTrainingSessionRequest
    {
        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Location { get; set; }
        public string? VirtualMeetingUrl { get; set; }
        public int MaxParticipants { get; set; }
        public string? Instructor { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? Notes { get; set; }
    }

    #endregion

    #region Training Enrollment DTOs

    public class TrainingEnrollmentDto
    {
        public int Id { get; set; }
        public int TrainingProgramId { get; set; }
        public string TrainingTitle { get; set; } = string.Empty;
        public string TrainingCode { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }
        public int? SessionId { get; set; }
        public string? SessionTitle { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public int? Score { get; set; }
        public bool Passed { get; set; }
        public int Attempts { get; set; }
        public decimal? TimeSpentMinutes { get; set; }
        public string? Notes { get; set; }
        public string? CertificateNumber { get; set; }
        public DateTime? CertificateIssuedAt { get; set; }
        public DateTime? CertificateExpiresAt { get; set; }
        public string? CertificateUrl { get; set; }
        public decimal ProgressPercentage { get; set; }
    }

    public class EnrollUserRequest
    {
        public int TrainingProgramId { get; set; }
        public int UserId { get; set; }
        public int? SessionId { get; set; }
        public DateTime? DueDate { get; set; }
        public string? Notes { get; set; }
    }

    public class BulkEnrollRequest
    {
        public int TrainingProgramId { get; set; }
        public List<int> UserIds { get; set; } = new();
        public int? SessionId { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateEnrollmentRequest
    {
        public DateTime? DueDate { get; set; }
        public string? Notes { get; set; }
    }

    public class RecordProgressRequest
    {
        public int EnrollmentId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public int ModuleOrder { get; set; }
        public decimal ProgressPercentage { get; set; }
        public int? TimeSpentMinutes { get; set; }
    }

    public class CompleteTrainingEnrollmentRequest
    {
        public int EnrollmentId { get; set; }
        public int? Score { get; set; }
        public bool Passed { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Training Material DTOs

    public class TrainingMaterialDto
    {
        public int Id { get; set; }
        public int TrainingProgramId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? FilePath { get; set; }
        public string? ContentUrl { get; set; }
        public int? DurationMinutes { get; set; }
        public int Order { get; set; }
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateTrainingMaterialRequest
    {
        public int TrainingProgramId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = "Document";
        public string? FilePath { get; set; }
        public string? ContentUrl { get; set; }
        public int? DurationMinutes { get; set; }
        public int Order { get; set; }
        public bool IsRequired { get; set; }
    }

    #endregion

    #region Quiz DTOs

    public class TrainingQuizDto
    {
        public int Id { get; set; }
        public int TrainingProgramId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PassingScore { get; set; }
        public int TimeLimitMinutes { get; set; }
        public int MaxAttempts { get; set; }
        public bool ShuffleQuestions { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public bool IsActive { get; set; }
        public int QuestionCount { get; set; }
        public List<QuizQuestionDto> Questions { get; set; } = new();
    }

    public class QuizQuestionDto
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public int Points { get; set; }
        public int Order { get; set; }
        public List<QuizAnswerDto> Answers { get; set; } = new();
    }

    public class QuizAnswerDto
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int Order { get; set; }
    }

    public class CreateQuizRequest
    {
        public int TrainingProgramId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PassingScore { get; set; } = 70;
        public int TimeLimitMinutes { get; set; } = 30;
        public int MaxAttempts { get; set; } = 3;
        public bool ShuffleQuestions { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public List<CreateQuizQuestionRequest> Questions { get; set; } = new();
    }

    public class CreateQuizQuestionRequest
    {
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = "SingleChoice";
        public string? Explanation { get; set; }
        public int Points { get; set; } = 1;
        public int Order { get; set; }
        public List<CreateQuizAnswerRequest> Answers { get; set; } = new();
    }

    public class CreateQuizAnswerRequest
    {
        public string AnswerText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int Order { get; set; }
    }

    public class SubmitQuizRequest
    {
        public int EnrollmentId { get; set; }
        public int QuizId { get; set; }
        public List<QuizResponseRequest> Responses { get; set; } = new();
    }

    public class QuizResponseRequest
    {
        public int QuestionId { get; set; }
        public int? SelectedAnswerId { get; set; }
        public string? TextResponse { get; set; }
    }

    public class QuizAttemptResultDto
    {
        public int AttemptId { get; set; }
        public int Score { get; set; }
        public bool Passed { get; set; }
        public int AttemptNumber { get; set; }
        public int RemainingAttempts { get; set; }
        public List<QuestionResultDto> QuestionResults { get; set; } = new();
    }

    public class QuestionResultDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int? SelectedAnswerId { get; set; }
        public string? SelectedAnswerText { get; set; }
        public int CorrectAnswerId { get; set; }
        public string CorrectAnswerText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int PointsEarned { get; set; }
        public int PointsPossible { get; set; }
        public string? Explanation { get; set; }
    }

    #endregion

    #region Training Reports

    public class TrainingDashboardDto
    {
        public int TotalPrograms { get; set; }
        public int ActiveEnrollments { get; set; }
        public int CompletedThisMonth { get; set; }
        public int OverdueTrainings { get; set; }
        public int UpcomingSessions { get; set; }
        public decimal AverageCompletionRate { get; set; }
        public List<TrainingProgramDto> MandatoryTrainings { get; set; } = new();
        public List<TrainingSessionDto> UpcomingSessionList { get; set; } = new();
        public List<CategoryStatsDto> CategoryStats { get; set; } = new();
    }

    public class CategoryStatsDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public int ProgramCount { get; set; }
        public int EnrollmentCount { get; set; }
        public int CompletionCount { get; set; }
        public decimal CompletionRate { get; set; }
    }

    public class UserTrainingSummaryDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int TotalEnrollments { get; set; }
        public int CompletedCount { get; set; }
        public int InProgressCount { get; set; }
        public int OverdueCount { get; set; }
        public decimal CompletionRate { get; set; }
        public List<TrainingEnrollmentDto> ActiveEnrollments { get; set; } = new();
        public List<CertificationDto> Certifications { get; set; } = new();
    }

    public class CertificationDto
    {
        public int Id { get; set; }
        public string TrainingTitle { get; set; } = string.Empty;
        public string CertificateNumber { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsValid { get; set; }
        public string? CertificateUrl { get; set; }
    }

    public class TrainingComplianceReportDto
    {
        public int TotalRequired { get; set; }
        public int Completed { get; set; }
        public int Pending { get; set; }
        public int Overdue { get; set; }
        public decimal ComplianceRate { get; set; }
        public List<UserComplianceDto> UserCompliance { get; set; } = new();
    }

    public class UserComplianceDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? Department { get; set; }
        public int RequiredTrainings { get; set; }
        public int CompletedTrainings { get; set; }
        public int OverdueTrainings { get; set; }
        public decimal ComplianceRate { get; set; }
        public List<TrainingEnrollmentDto> OverdueDetails { get; set; } = new();
    }

    #endregion
}

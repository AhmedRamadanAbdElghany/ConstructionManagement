using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface ITrainingService
    {
        #region Training Programs

        Task<List<TrainingProgramDto>> GetProgramsAsync(int? categoryId = null, bool? mandatory = null, int? companyId = null);
        Task<TrainingProgramDto> GetProgramAsync(int id);
        Task<TrainingProgramDto> CreateProgramAsync(CreateTrainingProgramRequest request, int? companyId = null);
        Task<TrainingProgramDto> UpdateProgramAsync(int id, UpdateTrainingProgramRequest request);
        Task DeleteProgramAsync(int id);

        #endregion

        #region Training Categories

        Task<List<TrainingCategoryDto>> GetCategoriesAsync(int? companyId = null);
        Task<TrainingCategoryDto> GetCategoryAsync(int id);
        Task<TrainingCategoryDto> CreateCategoryAsync(CreateTrainingCategoryRequest request, int? companyId = null);
        Task<TrainingCategoryDto> UpdateCategoryAsync(int id, UpdateTrainingCategoryRequest request);
        Task DeleteCategoryAsync(int id);

        #endregion

        #region Training Sessions

        Task<List<TrainingSessionDto>> GetSessionsAsync(int? programId = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<TrainingSessionDto> GetSessionAsync(int id);
        Task<TrainingSessionDto> CreateSessionAsync(CreateTrainingSessionRequest request);
        Task<TrainingSessionDto> UpdateSessionAsync(int id, UpdateTrainingSessionRequest request);
        Task DeleteSessionAsync(int id);
        Task<TrainingSessionDto> EnrollInSessionAsync(int sessionId, int userId);

        #endregion

        #region Enrollments

        Task<List<TrainingEnrollmentDto>> GetEnrollmentsAsync(int? userId = null, int? programId = null, string? status = null);
        Task<TrainingEnrollmentDto> GetEnrollmentAsync(int id);
        Task<TrainingEnrollmentDto> EnrollUserAsync(EnrollUserRequest request, int enrolledByUserId);
        Task<List<TrainingEnrollmentDto>> BulkEnrollAsync(BulkEnrollRequest request, int enrolledByUserId);
        Task<TrainingEnrollmentDto> UpdateEnrollmentAsync(int id, UpdateEnrollmentRequest request);
        Task CancelEnrollmentAsync(int id);
        Task<TrainingEnrollmentDto> StartTrainingAsync(int enrollmentId);
        Task<TrainingEnrollmentDto> RecordProgressAsync(RecordProgressRequest request);
        Task<TrainingEnrollmentDto> CompleteTrainingAsync(CompleteTrainingEnrollmentRequest request);
        Task<List<TrainingEnrollmentDto>> GetUserEnrollmentsAsync(int userId);

        #endregion

        #region Materials

        Task<List<TrainingMaterialDto>> GetMaterialsAsync(int programId);
        Task<TrainingMaterialDto> CreateMaterialAsync(CreateTrainingMaterialRequest request);
        Task DeleteMaterialAsync(int id);

        #endregion

        #region Quizzes

        Task<TrainingQuizDto> GetQuizAsync(int quizId);
        Task<TrainingQuizDto> CreateQuizAsync(CreateQuizRequest request);
        Task<QuizAttemptResultDto> SubmitQuizAsync(int userId, SubmitQuizRequest request);
        Task<List<QuizAttemptResultDto>> GetQuizAttemptsAsync(int enrollmentId, int quizId);

        #endregion

        #region Certificates

        Task<string> GenerateCertificateAsync(int enrollmentId);
        Task<bool> ValidateCertificateAsync(string certificateNumber);
        Task<List<TrainingCertificationDto>> GetUserCertificationsAsync(int userId);

        #endregion

        #region Reports

        Task<TrainingDashboardDto> GetDashboardAsync(int? companyId = null);
        Task<UserTrainingSummaryDto> GetUserSummaryAsync(int userId);
        Task<TrainingComplianceReportDto> GetComplianceReportAsync(int? companyId = null, int? roleId = null);
        Task<List<UserComplianceDto>> GetOverdueUsersAsync(int? companyId = null);

        #endregion
    }
}

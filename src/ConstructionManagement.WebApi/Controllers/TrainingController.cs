using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TrainingController : ControllerBase
    {
        private readonly ITrainingService _service;

        public TrainingController(ITrainingService service)
        {
            _service = service;
        }

        #region Training Programs

        [HttpGet("programs")]
        public async Task<ActionResult<List<TrainingProgramDto>>> GetPrograms(
            [FromQuery] int? categoryId,
            [FromQuery] bool? mandatory,
            [FromQuery] int? companyId)
        {
            var programs = await _service.GetProgramsAsync(categoryId, mandatory, companyId);
            return Ok(programs);
        }

        [HttpGet("programs/{id}")]
        public async Task<ActionResult<TrainingProgramDto>> GetProgram(int id)
        {
            var program = await _service.GetProgramAsync(id);
            return Ok(program);
        }

        [HttpPost("programs")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingProgramDto>> CreateProgram([FromBody] CreateTrainingProgramRequest request, [FromQuery] int? companyId)
        {
            var program = await _service.CreateProgramAsync(request, companyId);
            return CreatedAtAction(nameof(GetProgram), new { id = program.Id }, program);
        }

        [HttpPut("programs/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingProgramDto>> UpdateProgram(int id, [FromBody] UpdateTrainingProgramRequest request)
        {
            var program = await _service.UpdateProgramAsync(id, request);
            return Ok(program);
        }

        [HttpDelete("programs/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteProgram(int id)
        {
            await _service.DeleteProgramAsync(id);
            return NoContent();
        }

        #endregion

        #region Training Categories

        [HttpGet("categories")]
        public async Task<ActionResult<List<TrainingCategoryDto>>> GetCategories([FromQuery] int? companyId)
        {
            var categories = await _service.GetCategoriesAsync(companyId);
            return Ok(categories);
        }

        [HttpGet("categories/{id}")]
        public async Task<ActionResult<TrainingCategoryDto>> GetCategory(int id)
        {
            var category = await _service.GetCategoryAsync(id);
            return Ok(category);
        }

        [HttpPost("categories")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingCategoryDto>> CreateCategory([FromBody] CreateTrainingCategoryRequest request, [FromQuery] int? companyId)
        {
            var category = await _service.CreateCategoryAsync(request, companyId);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [HttpPut("categories/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingCategoryDto>> UpdateCategory(int id, [FromBody] UpdateTrainingCategoryRequest request)
        {
            var category = await _service.UpdateCategoryAsync(id, request);
            return Ok(category);
        }

        [HttpDelete("categories/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            await _service.DeleteCategoryAsync(id);
            return NoContent();
        }

        #endregion

        #region Training Sessions

        [HttpGet("sessions")]
        public async Task<ActionResult<List<TrainingSessionDto>>> GetSessions(
            [FromQuery] int? programId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var sessions = await _service.GetSessionsAsync(programId, fromDate, toDate);
            return Ok(sessions);
        }

        [HttpGet("sessions/{id}")]
        public async Task<ActionResult<TrainingSessionDto>> GetSession(int id)
        {
            var session = await _service.GetSessionAsync(id);
            return Ok(session);
        }

        [HttpPost("sessions")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingSessionDto>> CreateSession([FromBody] CreateTrainingSessionRequest request)
        {
            var session = await _service.CreateSessionAsync(request);
            return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
        }

        [HttpPut("sessions/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingSessionDto>> UpdateSession(int id, [FromBody] UpdateTrainingSessionRequest request)
        {
            var session = await _service.UpdateSessionAsync(id, request);
            return Ok(session);
        }

        [HttpDelete("sessions/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteSession(int id)
        {
            await _service.DeleteSessionAsync(id);
            return NoContent();
        }

        [HttpPost("sessions/{id}/enroll")]
        public async Task<ActionResult<TrainingSessionDto>> EnrollInSession(int id)
        {
            var userId = GetCurrentUserId();
            var session = await _service.EnrollInSessionAsync(id, userId);
            return Ok(session);
        }

        #endregion

        #region Enrollments

        [HttpGet("enrollments")]
        public async Task<ActionResult<List<TrainingEnrollmentDto>>> GetEnrollments(
            [FromQuery] int? userId,
            [FromQuery] int? programId,
            [FromQuery] string? status)
        {
            var enrollments = await _service.GetEnrollmentsAsync(userId, programId, status);
            return Ok(enrollments);
        }

        [HttpGet("enrollments/{id}")]
        public async Task<ActionResult<TrainingEnrollmentDto>> GetEnrollment(int id)
        {
            var enrollment = await _service.GetEnrollmentAsync(id);
            return Ok(enrollment);
        }

        [HttpGet("my-enrollments")]
        public async Task<ActionResult<List<TrainingEnrollmentDto>>> GetMyEnrollments()
        {
            var userId = GetCurrentUserId();
            var enrollments = await _service.GetUserEnrollmentsAsync(userId);
            return Ok(enrollments);
        }

        [HttpPost("enroll")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingEnrollmentDto>> EnrollUser([FromBody] EnrollUserRequest request)
        {
            var userId = GetCurrentUserId();
            var enrollment = await _service.EnrollUserAsync(request, userId);
            return Ok(enrollment);
        }

        [HttpPost("enroll/bulk")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<TrainingEnrollmentDto>>> BulkEnroll([FromBody] BulkEnrollRequest request)
        {
            var userId = GetCurrentUserId();
            var enrollments = await _service.BulkEnrollAsync(request, userId);
            return Ok(enrollments);
        }

        [HttpPut("enrollments/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingEnrollmentDto>> UpdateEnrollment(int id, [FromBody] UpdateEnrollmentRequest request)
        {
            var enrollment = await _service.UpdateEnrollmentAsync(id, request);
            return Ok(enrollment);
        }

        [HttpPost("enrollments/{id}/cancel")]
        public async Task<ActionResult> CancelEnrollment(int id)
        {
            await _service.CancelEnrollmentAsync(id);
            return Ok();
        }

        [HttpPost("enrollments/{id}/start")]
        public async Task<ActionResult<TrainingEnrollmentDto>> StartTraining(int id)
        {
            var enrollment = await _service.StartTrainingAsync(id);
            return Ok(enrollment);
        }

        [HttpPost("enrollments/progress")]
        public async Task<ActionResult<TrainingEnrollmentDto>> RecordProgress([FromBody] RecordProgressRequest request)
        {
            var enrollment = await _service.RecordProgressAsync(request);
            return Ok(enrollment);
        }

        [HttpPost("enrollments/complete")]
        public async Task<ActionResult<TrainingEnrollmentDto>> CompleteTraining([FromBody] CompleteTrainingEnrollmentRequest request)
        {
            var enrollment = await _service.CompleteTrainingAsync(request);
            return Ok(enrollment);
        }

        #endregion

        #region Materials

        [HttpGet("programs/{programId}/materials")]
        public async Task<ActionResult<List<TrainingMaterialDto>>> GetMaterials(int programId)
        {
            var materials = await _service.GetMaterialsAsync(programId);
            return Ok(materials);
        }

        [HttpPost("materials")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingMaterialDto>> CreateMaterial([FromBody] CreateTrainingMaterialRequest request)
        {
            var material = await _service.CreateMaterialAsync(request);
            return Ok(material);
        }

        [HttpDelete("materials/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteMaterial(int id)
        {
            await _service.DeleteMaterialAsync(id);
            return NoContent();
        }

        #endregion

        #region Quizzes

        [HttpGet("quizzes/{quizId}")]
        public async Task<ActionResult<TrainingQuizDto>> GetQuiz(int quizId)
        {
            var quiz = await _service.GetQuizAsync(quizId);
            return Ok(quiz);
        }

        [HttpPost("quizzes")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingQuizDto>> CreateQuiz([FromBody] CreateQuizRequest request)
        {
            var quiz = await _service.CreateQuizAsync(request);
            return Ok(quiz);
        }

        [HttpPost("quizzes/submit")]
        public async Task<ActionResult<QuizAttemptResultDto>> SubmitQuiz([FromBody] SubmitQuizRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _service.SubmitQuizAsync(userId, request);
            return Ok(result);
        }

        [HttpGet("enrollments/{enrollmentId}/quizzes/{quizId}/attempts")]
        public async Task<ActionResult<List<QuizAttemptResultDto>>> GetQuizAttempts(int enrollmentId, int quizId)
        {
            var attempts = await _service.GetQuizAttemptsAsync(enrollmentId, quizId);
            return Ok(attempts);
        }

        #endregion

        #region Certificates

        [HttpPost("enrollments/{enrollmentId}/certificate")]
        public async Task<ActionResult<string>> GenerateCertificate(int enrollmentId)
        {
            var url = await _service.GenerateCertificateAsync(enrollmentId);
            return Ok(new { certificateUrl = url });
        }

        [HttpGet("certificates/validate/{certificateNumber}")]
        [AllowAnonymous]
        public async Task<ActionResult<bool>> ValidateCertificate(string certificateNumber)
        {
            var isValid = await _service.ValidateCertificateAsync(certificateNumber);
            return Ok(new { isValid });
        }

        [HttpGet("my-certifications")]
        public async Task<ActionResult<List<CertificationDto>>> GetMyCertifications()
        {
            var userId = GetCurrentUserId();
            var certifications = await _service.GetUserCertificationsAsync(userId);
            return Ok(certifications);
        }

        #endregion

        #region Reports

        [HttpGet("dashboard")]
        public async Task<ActionResult<TrainingDashboardDto>> GetDashboard([FromQuery] int? companyId)
        {
            var dashboard = await _service.GetDashboardAsync(companyId);
            return Ok(dashboard);
        }

        [HttpGet("users/{userId}/summary")]
        public async Task<ActionResult<UserTrainingSummaryDto>> GetUserSummary(int userId)
        {
            var summary = await _service.GetUserSummaryAsync(userId);
            return Ok(summary);
        }

        [HttpGet("compliance")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<TrainingComplianceReportDto>> GetComplianceReport([FromQuery] int? companyId, [FromQuery] int? roleId)
        {
            var report = await _service.GetComplianceReportAsync(companyId, roleId);
            return Ok(report);
        }

        [HttpGet("overdue")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<UserComplianceDto>>> GetOverdueUsers([FromQuery] int? companyId)
        {
            var users = await _service.GetOverdueUsersAsync(companyId);
            return Ok(users);
        }

        #endregion

        #region Private Helpers

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }
            return userId;
        }

        #endregion
    }
}

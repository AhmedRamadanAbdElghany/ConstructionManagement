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
    public class PerformanceEvaluationsController : ControllerBase
    {
        private readonly IPerformanceEvaluationService _service;

        public PerformanceEvaluationsController(IPerformanceEvaluationService service)
        {
            _service = service;
        }

        #region Evaluation Criteria

        [HttpGet("criteria")]
        public async Task<ActionResult<List<EvaluationCriteriaDto>>> GetCriteria([FromQuery] int? companyId)
        {
            // Company isolation: use user's company if not SuperAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SuperAdmin") && userCompanyId.HasValue)
            {
                companyId = userCompanyId.Value;
            }
            
            var criteria = await _service.GetEvaluationCriteriaAsync(companyId);
            return Ok(criteria);
        }

        [HttpPost("criteria")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EvaluationCriteriaDto>> CreateCriteria([FromBody] CreateEvaluationCriteriaRequest request, [FromQuery] int? companyId)
        {
            // Company isolation: use user's company if not SuperAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SuperAdmin"))
            {
                if (!userCompanyId.HasValue)
                {
                    return BadRequest("Company context not found");
                }
                companyId = userCompanyId.Value;
            }
            
            var criteria = await _service.CreateEvaluationCriteriaAsync(request, companyId);
            return CreatedAtAction(nameof(GetCriteria), new { id = criteria.Id }, criteria);
        }

        [HttpPut("criteria/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EvaluationCriteriaDto>> UpdateCriteria(int id, [FromBody] UpdateEvaluationCriteriaRequest request)
        {
            var criteria = await _service.UpdateEvaluationCriteriaAsync(id, request);
            return Ok(criteria);
        }

        [HttpDelete("criteria/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteCriteria(int id)
        {
            await _service.DeleteEvaluationCriteriaAsync(id);
            return NoContent();
        }

        #endregion

        #region Evaluation Periods

        [HttpGet("periods")]
        public async Task<ActionResult<List<EvaluationPeriodDto>>> GetPeriods([FromQuery] int? companyId)
        {
            // Company isolation: use user's company if not SuperAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SuperAdmin") && userCompanyId.HasValue)
            {
                companyId = userCompanyId.Value;
            }
            
            var periods = await _service.GetEvaluationPeriodsAsync(companyId);
            return Ok(periods);
        }

        [HttpGet("periods/{id}")]
        public async Task<ActionResult<EvaluationPeriodDto>> GetPeriod(int id)
        {
            var period = await _service.GetEvaluationPeriodAsync(id);
            return Ok(period);
        }

        [HttpPost("periods")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EvaluationPeriodDto>> CreatePeriod([FromBody] CreateEvaluationPeriodRequest request, [FromQuery] int? companyId)
        {
            // Company isolation: use user's company if not SuperAdmin
            var userCompanyId = GetCompanyId();
            if (!User.IsInRole("SuperAdmin"))
            {
                if (!userCompanyId.HasValue)
                {
                    return BadRequest("Company context not found");
                }
                companyId = userCompanyId.Value;
            }
            
            var period = await _service.CreateEvaluationPeriodAsync(request, companyId);
            return CreatedAtAction(nameof(GetPeriod), new { id = period.Id }, period);
        }

        [HttpPut("periods/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EvaluationPeriodDto>> UpdatePeriod(int id, [FromBody] UpdateEvaluationPeriodRequest request)
        {
            var period = await _service.UpdateEvaluationPeriodAsync(id, request);
            return Ok(period);
        }

        [HttpPost("periods/{id}/activate")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> ActivatePeriod(int id)
        {
            await _service.ActivateEvaluationPeriodAsync(id);
            return Ok();
        }

        [HttpPost("periods/{id}/close")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> ClosePeriod(int id)
        {
            await _service.CloseEvaluationPeriodAsync(id);
            return Ok();
        }

        #endregion

        #region Evaluations

        [HttpGet]
        public async Task<ActionResult<List<PerformanceEvaluationDto>>> GetEvaluations(
            [FromQuery] int? periodId,
            [FromQuery] int? employeeId,
            [FromQuery] int? managerId,
            [FromQuery] string? status)
        {
            var evaluations = await _service.GetEvaluationsAsync(periodId, employeeId, managerId, status);
            return Ok(evaluations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PerformanceEvaluationDto>> GetEvaluation(int id)
        {
            var evaluation = await _service.GetEvaluationAsync(id);
            return Ok(evaluation);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PerformanceEvaluationDto>> CreateEvaluation([FromBody] CreatePerformanceEvaluationRequest request)
        {
            var evaluation = await _service.CreateEvaluationAsync(request);
            return CreatedAtAction(nameof(GetEvaluation), new { id = evaluation.Id }, evaluation);
        }

        [HttpPost("{id}/start-self-assessment")]
        public async Task<ActionResult<PerformanceEvaluationDto>> StartSelfAssessment(int id)
        {
            var userId = GetCurrentUserId();
            var evaluation = await _service.StartSelfAssessmentAsync(id, userId);
            return Ok(evaluation);
        }

        [HttpPost("{id}/submit-self-assessment")]
        public async Task<ActionResult<PerformanceEvaluationDto>> SubmitSelfAssessment(int id, [FromBody] SelfAssessmentRequest request)
        {
            var userId = GetCurrentUserId();
            var evaluation = await _service.SubmitSelfAssessmentAsync(id, userId, request);
            return Ok(evaluation);
        }

        [HttpPost("{id}/submit-manager-assessment")]
        public async Task<ActionResult<PerformanceEvaluationDto>> SubmitManagerAssessment(int id, [FromBody] ManagerAssessmentRequest request)
        {
            var userId = GetCurrentUserId();
            var evaluation = await _service.SubmitManagerAssessmentAsync(id, userId, request);
            return Ok(evaluation);
        }

        [HttpPost("{id}/acknowledge")]
        public async Task<ActionResult<PerformanceEvaluationDto>> AcknowledgeEvaluation(int id, [FromBody] AcknowledgmentRequest request)
        {
            var userId = GetCurrentUserId();
            var evaluation = await _service.AcknowledgeEvaluationAsync(id, userId, request);
            return Ok(evaluation);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteEvaluation(int id)
        {
            await _service.DeleteEvaluationAsync(id);
            return NoContent();
        }

        #endregion

        #region Goals

        [HttpPost("goals")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EvaluationGoalDto>> AddGoal([FromBody] CreateGoalRequest request)
        {
            var goal = await _service.AddGoalAsync(request);
            return Ok(goal);
        }

        [HttpPut("goals/{goalId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EvaluationGoalDto>> UpdateGoal(int goalId, [FromBody] UpdateGoalRequest request)
        {
            var goal = await _service.UpdateGoalAsync(goalId, request);
            return Ok(goal);
        }

        [HttpDelete("goals/{goalId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult> DeleteGoal(int goalId)
        {
            await _service.DeleteGoalAsync(goalId);
            return NoContent();
        }

        #endregion

        #region Peer Feedback

        [HttpGet("{evaluationId}/peer-feedback")]
        public async Task<ActionResult<List<PeerFeedbackDto>>> GetPeerFeedback(int evaluationId)
        {
            var feedback = await _service.GetPeerFeedbackAsync(evaluationId);
            return Ok(feedback);
        }

        [HttpPost("{evaluationId}/peer-feedback")]
        public async Task<ActionResult<PeerFeedbackDto>> SubmitPeerFeedback(int evaluationId, [FromBody] CreatePeerFeedbackRequest request)
        {
            var userId = GetCurrentUserId();
            var feedback = await _service.SubmitPeerFeedbackAsync(evaluationId, userId, request);
            return Ok(feedback);
        }

        #endregion

        #region Reports

        [HttpGet("reports/{periodId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PerformanceReportDto>> GetReport(int periodId)
        {
            var report = await _service.GetPerformanceReportAsync(periodId);
            return Ok(report);
        }

        [HttpGet("history/{employeeId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EmployeePerformanceHistoryDto>> GetEmployeeHistory(int employeeId, [FromQuery] int? count)
        {
            var history = await _service.GetEmployeePerformanceHistoryAsync(employeeId, count);
            return Ok(history);
        }

        [HttpGet("top-performers/{periodId}")]
        public async Task<ActionResult<List<TopPerformerDto>>> GetTopPerformers(int periodId, [FromQuery] int count = 10)
        {
            var performers = await _service.GetTopPerformersAsync(periodId, count);
            return Ok(performers);
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

        private int? GetCompanyId()
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
            {
                return null;
            }
            return companyId;
        }

        #endregion
    }
}

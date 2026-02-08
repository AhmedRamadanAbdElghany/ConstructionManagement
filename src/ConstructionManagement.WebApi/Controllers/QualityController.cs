using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QualityController : ControllerBase
    {
        private readonly IQualityService _qualityService;
        private readonly ILogger<QualityController> _logger;

        public QualityController(IQualityService qualityService, ILogger<QualityController> logger)
        {
            _qualityService = qualityService;
            _logger = logger;
        }

        #region Quality Standards

        [HttpGet("standards")]
        public async Task<IActionResult> GetQualityStandards([FromQuery] int companyId)
        {
            try
            {
                var standards = await _qualityService.GetQualityStandardsAsync(companyId);
                return Ok(standards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quality standards");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("standards/{id}")]
        public async Task<IActionResult> GetQualityStandardById(int id, [FromQuery] int companyId)
        {
            try
            {
                var standard = await _qualityService.GetQualityStandardByIdAsync(id, companyId);
                if (standard == null)
                    return NotFound(new { message = "Quality standard not found" });

                return Ok(standard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quality standard {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("standards")]
        public async Task<IActionResult> CreateQualityStandard([FromBody] CreateQualityStandardRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var standard = await _qualityService.CreateQualityStandardAsync(request, companyId, userId);
                return CreatedAtAction(nameof(GetQualityStandardById), new { id = standard.Id, companyId }, standard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quality standard");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("standards")]
        public async Task<IActionResult> UpdateQualityStandard([FromBody] UpdateQualityStandardRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var standard = await _qualityService.UpdateQualityStandardAsync(request, companyId, userId);
                return Ok(standard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating quality standard {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("standards/{id}")]
        public async Task<IActionResult> DeleteQualityStandard(int id, [FromQuery] int companyId)
        {
            try
            {
                var result = await _qualityService.DeleteQualityStandardAsync(id, companyId);
                if (!result)
                    return NotFound(new { message = "Quality standard not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting quality standard {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("standards/category/{category}")]
        public async Task<IActionResult> GetQualityStandardsByCategory(string category, [FromQuery] int companyId)
        {
            try
            {
                var standards = await _qualityService.GetActiveQualityStandardsByCategoryAsync(companyId, category);
                return Ok(standards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quality standards by category {Category}", category);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        #endregion

        #region Quality Inspections

        [HttpGet("inspections")]
        public async Task<IActionResult> GetInspections([FromQuery] int companyId, [FromQuery] int? projectId = null, [FromQuery] int? phaseId = null, [FromQuery] string? status = null)
        {
            try
            {
                var inspections = await _qualityService.GetInspectionsAsync(companyId, projectId, phaseId, status);
                return Ok(inspections);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspections");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("inspections/{id}")]
        public async Task<IActionResult> GetInspectionById(int id, [FromQuery] int companyId)
        {
            try
            {
                var inspection = await _qualityService.GetInspectionByIdAsync(id, companyId);
                if (inspection == null)
                    return NotFound(new { message = "Inspection not found" });

                return Ok(inspection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspection {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("inspections")]
        public async Task<IActionResult> CreateInspection([FromBody] CreateQualityInspectionRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var inspection = await _qualityService.CreateInspectionAsync(request, companyId, userId);
                return CreatedAtAction(nameof(GetInspectionById), new { id = inspection.Id, companyId }, inspection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inspection");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("inspections")]
        public async Task<IActionResult> UpdateInspection([FromBody] UpdateQualityInspectionRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var inspection = await _qualityService.UpdateInspectionAsync(request, companyId, userId);
                return Ok(inspection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inspection {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("inspections/{id}")]
        public async Task<IActionResult> DeleteInspection(int id, [FromQuery] int companyId)
        {
            try
            {
                var result = await _qualityService.DeleteInspectionAsync(id, companyId);
                if (!result)
                    return NotFound(new { message = "Inspection not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting inspection {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("inspections/{id}/start")]
        public async Task<IActionResult> StartInspection(int id, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var inspection = await _qualityService.StartInspectionAsync(id, companyId, userId);
                return Ok(inspection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting inspection {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("inspections/complete")]
        public async Task<IActionResult> CompleteInspection([FromBody] CompleteInspectionRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var inspection = await _qualityService.CompleteInspectionAsync(request, companyId, userId);
                return Ok(inspection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing inspection {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("inspections/items/result")]
        public async Task<IActionResult> UpdateInspectionItemResult([FromBody] UpdateInspectionItemResultRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var item = await _qualityService.UpdateInspectionItemResultAsync(request, companyId, userId);
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inspection item result {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("inspections/upcoming")]
        public async Task<IActionResult> GetUpcomingInspections([FromQuery] int companyId, [FromQuery] int days = 7)
        {
            try
            {
                var inspections = await _qualityService.GetUpcomingInspectionsAsync(companyId, days);
                return Ok(inspections);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming inspections");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("inspections/recent")]
        public async Task<IActionResult> GetRecentInspections([FromQuery] int companyId, [FromQuery] int count = 10)
        {
            try
            {
                var inspections = await _qualityService.GetRecentInspectionsAsync(companyId, count);
                return Ok(inspections);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent inspections");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        #endregion

        #region Defects

        [HttpGet("defects")]
        public async Task<IActionResult> GetDefects([FromQuery] int companyId, [FromQuery] int? projectId = null, [FromQuery] int? phaseId = null, [FromQuery] string? status = null, [FromQuery] string? severity = null)
        {
            try
            {
                var defects = await _qualityService.GetDefectsAsync(companyId, projectId, phaseId, status, severity);
                return Ok(defects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting defects");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("defects/{id}")]
        public async Task<IActionResult> GetDefectById(int id, [FromQuery] int companyId)
        {
            try
            {
                var defect = await _qualityService.GetDefectByIdAsync(id, companyId);
                if (defect == null)
                    return NotFound(new { message = "Defect not found" });

                return Ok(defect);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting defect {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("defects")]
        public async Task<IActionResult> CreateDefect([FromBody] CreateDefectRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var reporterId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var defect = await _qualityService.CreateDefectAsync(request, companyId, userId, reporterId);
                return CreatedAtAction(nameof(GetDefectById), new { id = defect.Id, companyId }, defect);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating defect");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("defects")]
        public async Task<IActionResult> UpdateDefect([FromBody] UpdateDefectRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var defect = await _qualityService.UpdateDefectAsync(request, companyId, userId);
                return Ok(defect);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating defect {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("defects/{id}")]
        public async Task<IActionResult> DeleteDefect(int id, [FromQuery] int companyId)
        {
            try
            {
                var result = await _qualityService.DeleteDefectAsync(id, companyId);
                if (!result)
                    return NotFound(new { message = "Defect not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting defect {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("defects/assign")]
        public async Task<IActionResult> AssignDefect([FromBody] AssignDefectRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var defect = await _qualityService.AssignDefectAsync(request, companyId, userId);
                return Ok(defect);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning defect {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("defects/resolve")]
        public async Task<IActionResult> ResolveDefect([FromBody] ResolveDefectRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var defect = await _qualityService.ResolveDefectAsync(request, companyId, userId);
                return Ok(defect);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving defect {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("defects/{id}/close")]
        public async Task<IActionResult> CloseDefect(int id, [FromQuery] int companyId, [FromQuery] string closureNotes)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var defect = await _qualityService.CloseDefectAsync(id, companyId, userId, closureNotes);
                return Ok(defect);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error closing defect {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("defects/{id}/reopen")]
        public async Task<IActionResult> ReopenDefect(int id, [FromQuery] int companyId, [FromQuery] string reason)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var defect = await _qualityService.ReopenDefectAsync(id, companyId, userId, reason);
                return Ok(defect);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reopening defect {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("defects/open")]
        public async Task<IActionResult> GetOpenDefects([FromQuery] int companyId, [FromQuery] int? projectId = null)
        {
            try
            {
                var defects = await _qualityService.GetOpenDefectsAsync(companyId, projectId);
                return Ok(defects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting open defects");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("defects/overdue")]
        public async Task<IActionResult> GetOverdueDefects([FromQuery] int companyId)
        {
            try
            {
                var defects = await _qualityService.GetOverdueDefectsAsync(companyId);
                return Ok(defects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting overdue defects");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("defects/critical")]
        public async Task<IActionResult> GetCriticalDefects([FromQuery] int companyId)
        {
            try
            {
                var defects = await _qualityService.GetCriticalDefectsAsync(companyId);
                return Ok(defects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting critical defects");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("defects/safety")]
        public async Task<IActionResult> GetSafetyRelatedDefects([FromQuery] int companyId)
        {
            try
            {
                var defects = await _qualityService.GetSafetyRelatedDefectsAsync(companyId);
                return Ok(defects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting safety related defects");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        #endregion

        #region Punch List Items

        [HttpGet("punchlist")]
        public async Task<IActionResult> GetPunchListItems([FromQuery] int companyId, [FromQuery] int? projectId = null, [FromQuery] int? phaseId = null, [FromQuery] string? status = null)
        {
            try
            {
                var items = await _qualityService.GetPunchListItemsAsync(companyId, projectId, phaseId, status);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting punch list items");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("punchlist/{id}")]
        public async Task<IActionResult> GetPunchListItemById(int id, [FromQuery] int companyId)
        {
            try
            {
                var item = await _qualityService.GetPunchListItemByIdAsync(id, companyId);
                if (item == null)
                    return NotFound(new { message = "Punch list item not found" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting punch list item {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("punchlist")]
        public async Task<IActionResult> CreatePunchListItem([FromBody] CreatePunchListItemRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var item = await _qualityService.CreatePunchListItemAsync(request, companyId, userId);
                return CreatedAtAction(nameof(GetPunchListItemById), new { id = item.Id, companyId }, item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating punch list item");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("punchlist")]
        public async Task<IActionResult> UpdatePunchListItem([FromBody] UpdatePunchListItemRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var item = await _qualityService.UpdatePunchListItemAsync(request, companyId, userId);
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating punch list item {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("punchlist/{id}")]
        public async Task<IActionResult> DeletePunchListItem(int id, [FromQuery] int companyId)
        {
            try
            {
                var result = await _qualityService.DeletePunchListItemAsync(id, companyId);
                if (!result)
                    return NotFound(new { message = "Punch list item not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting punch list item {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("punchlist/complete")]
        public async Task<IActionResult> CompletePunchListItem([FromBody] CompletePunchListItemRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var item = await _qualityService.CompletePunchListItemAsync(request, companyId, userId);
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing punch list item {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("punchlist/verify")]
        public async Task<IActionResult> VerifyPunchListItem([FromBody] VerifyPunchListItemRequest request, [FromQuery] int companyId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var item = await _qualityService.VerifyPunchListItemAsync(request, companyId, userId);
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying punch list item {Id}", request.Id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("punchlist/{id}/accept")]
        public async Task<IActionResult> AcceptPunchListItem(int id, [FromQuery] int companyId, [FromQuery] string? notes)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var item = await _qualityService.AcceptPunchListItemAsync(id, companyId, userId, notes);
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting punch list item {Id}", id);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("punchlist/pending")]
        public async Task<IActionResult> GetPendingPunchListItems([FromQuery] int companyId, [FromQuery] int? projectId = null)
        {
            try
            {
                var items = await _qualityService.GetPendingPunchListItemsAsync(companyId, projectId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending punch list items");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("defects/{defectId}/punchlist")]
        public async Task<IActionResult> GetPunchListItemsByDefect(int defectId, [FromQuery] int companyId)
        {
            try
            {
                var items = await _qualityService.GetPunchListItemsByDefectAsync(defectId, companyId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting punch list items for defect {DefectId}", defectId);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        #endregion

        #region Defect Resolutions

        [HttpGet("defects/{defectId}/resolutions")]
        public async Task<IActionResult> GetDefectResolutions(int defectId, [FromQuery] int companyId)
        {
            try
            {
                var resolutions = await _qualityService.GetDefectResolutionsAsync(defectId, companyId);
                return Ok(resolutions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting defect resolutions for defect {DefectId}", defectId);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("defects/{defectId}/resolutions")]
        public async Task<IActionResult> AddDefectResolution(int defectId, [FromBody] AddDefectResolutionRequest request, [FromQuery] int companyId)
        {
            try
            {
                request.DefectId = defectId;
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? "system";
                var resolution = await _qualityService.AddDefectResolutionAsync(request, companyId, userId);
                return CreatedAtAction(nameof(GetDefectResolutions), new { defectId, companyId }, resolution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding defect resolution for defect {DefectId}", defectId);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        #endregion

        #region Statistics

        [HttpGet("statistics")]
        public async Task<IActionResult> GetQualityStatistics([FromQuery] int companyId, [FromQuery] int? projectId = null)
        {
            try
            {
                var statistics = await _qualityService.GetQualityStatisticsAsync(companyId, projectId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quality statistics");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("statistics/project/{projectId}")]
        public async Task<IActionResult> GetProjectQualityStatistics(int projectId, [FromQuery] int companyId)
        {
            try
            {
                var statistics = await _qualityService.GetProjectQualityStatisticsAsync(companyId, projectId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project quality statistics for project {ProjectId}", projectId);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("statistics/inspections-by-type")]
        public async Task<IActionResult> GetInspectionsByType([FromQuery] int companyId, [FromQuery] int? projectId = null)
        {
            try
            {
                var summary = await _qualityService.GetInspectionsByTypeAsync(companyId, projectId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspections by type");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("statistics/defects-by-category")]
        public async Task<IActionResult> GetDefectsByCategory([FromQuery] int companyId, [FromQuery] int? projectId = null)
        {
            try
            {
                var summary = await _qualityService.GetDefectsByCategoryAsync(companyId, projectId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting defects by category");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("statistics/monthly-trends")]
        public async Task<IActionResult> GetMonthlyQualityTrends([FromQuery] int companyId, [FromQuery] int months = 12)
        {
            try
            {
                var trends = await _qualityService.GetMonthlyQualityTrendsAsync(companyId, months);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting monthly quality trends");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        #endregion
    }
}

using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SafetyController : ControllerBase
    {
        private readonly ISafetyChecklistService _checklistService;
        private readonly ISafetyInspectionService _inspectionService;
        private readonly ISafetyIncidentService _incidentService;
        private readonly ISafetyTrainingService _trainingService;
        private readonly ISafetyComplianceService _complianceService;
        private readonly ILogger<SafetyController> _logger;

        public SafetyController(
            ISafetyChecklistService checklistService,
            ISafetyInspectionService inspectionService,
            ISafetyIncidentService incidentService,
            ISafetyTrainingService trainingService,
            ISafetyComplianceService complianceService,
            ILogger<SafetyController> logger)
        {
            _checklistService = checklistService;
            _inspectionService = inspectionService;
            _incidentService = incidentService;
            _trainingService = trainingService;
            _complianceService = complianceService;
            _logger = logger;
        }

        #region Safety Checklists

        [HttpGet("checklists")]
        public async Task<IActionResult> GetChecklists()
        {
            var checklists = await _checklistService.GetChecklistsAsync();
            return Ok(checklists);
        }

        [HttpGet("checklists/{id}")]
        public async Task<IActionResult> GetChecklist(int id)
        {
            var checklist = await _checklistService.GetChecklistByIdAsync(id);
            if (checklist == null) return NotFound();
            return Ok(checklist);
        }

        [HttpPost("checklists")]
        public async Task<IActionResult> CreateChecklist([FromBody] CreateSafetyChecklistRequest request)
        {
            var checklist = await _checklistService.CreateChecklistAsync(request);
            return CreatedAtAction(nameof(GetChecklist), new { id = checklist.Id }, checklist);
        }

        [HttpPut("checklists/{id}")]
        public async Task<IActionResult> UpdateChecklist(int id, [FromBody] UpdateSafetyChecklistRequest request)
        {
            var checklist = await _checklistService.UpdateChecklistAsync(id, request);
            return Ok(checklist);
        }

        [HttpDelete("checklists/{id}")]
        public async Task<IActionResult> DeleteChecklist(int id)
        {
            await _checklistService.DeleteChecklistAsync(id);
            return NoContent();
        }

        [HttpGet("checklists/{id}/items")]
        public async Task<IActionResult> GetChecklistItems(int id)
        {
            var items = await _checklistService.GetChecklistItemsAsync(id);
            return Ok(items);
        }

        [HttpPost("checklists/items")]
        public async Task<IActionResult> AddChecklistItem([FromBody] CreateSafetyChecklistItemRequest request)
        {
            var item = await _checklistService.AddChecklistItemAsync(request);
            return Ok(item);
        }

        [HttpPut("checklists/items/{itemId}")]
        public async Task<IActionResult> UpdateChecklistItem(int itemId, [FromBody] CreateSafetyChecklistItemRequest request)
        {
            await _checklistService.UpdateChecklistItemAsync(itemId, request);
            return NoContent();
        }

        [HttpDelete("checklists/items/{itemId}")]
        public async Task<IActionResult> DeleteChecklistItem(int itemId)
        {
            await _checklistService.DeleteChecklistItemAsync(itemId);
            return NoContent();
        }

        #endregion

        #region Safety Inspections

        [HttpGet("inspections")]
        public async Task<IActionResult> GetInspections([FromQuery] SafetyInspectionQueryParams? queryParams)
        {
            var inspections = await _inspectionService.GetInspectionsAsync(queryParams);
            return Ok(inspections);
        }

        [HttpGet("inspections/{id}")]
        public async Task<IActionResult> GetInspection(int id)
        {
            var inspection = await _inspectionService.GetInspectionByIdAsync(id);
            if (inspection == null) return NotFound();
            return Ok(inspection);
        }

        [HttpPost("inspections")]
        public async Task<IActionResult> CreateInspection([FromBody] CreateSafetyInspectionRequest request)
        {
            var inspection = await _inspectionService.CreateInspectionAsync(request);
            return CreatedAtAction(nameof(GetInspection), new { id = inspection.Id }, inspection);
        }

        [HttpPut("inspections/{id}")]
        public async Task<IActionResult> UpdateInspection(int id, [FromBody] CreateSafetyInspectionRequest request)
        {
            var inspection = await _inspectionService.UpdateInspectionAsync(id, request);
            return Ok(inspection);
        }

        [HttpDelete("inspections/{id}")]
        public async Task<IActionResult> DeleteInspection(int id)
        {
            await _inspectionService.DeleteInspectionAsync(id);
            return NoContent();
        }

        [HttpGet("inspections/project/{projectId}")]
        public async Task<IActionResult> GetInspectionsByProject(int projectId)
        {
            var inspections = await _inspectionService.GetInspectionsByProjectAsync(projectId);
            return Ok(inspections);
        }

        [HttpGet("safety/dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var dashboard = await _inspectionService.GetDashboardStatsAsync();
            return Ok(dashboard);
        }

        #endregion

        #region Safety Incidents

        [HttpGet("incidents")]
        public async Task<IActionResult> GetIncidents([FromQuery] SafetyIncidentQueryParams? queryParams)
        {
            var incidents = await _incidentService.GetIncidentsAsync(queryParams);
            return Ok(incidents);
        }

        [HttpGet("incidents/{id}")]
        public async Task<IActionResult> GetIncident(int id)
        {
            var incident = await _incidentService.GetIncidentByIdAsync(id);
            if (incident == null) return NotFound();
            return Ok(incident);
        }

        [HttpPost("incidents")]
        public async Task<IActionResult> CreateIncident([FromBody] CreateSafetyIncidentRequest request)
        {
            var incident = await _incidentService.CreateIncidentAsync(request);
            return CreatedAtAction(nameof(GetIncident), new { id = incident.Id }, incident);
        }

        [HttpPut("incidents/{id}")]
        public async Task<IActionResult> UpdateIncident(int id, [FromBody] UpdateSafetyIncidentRequest request)
        {
            var incident = await _incidentService.UpdateIncidentAsync(id, request);
            return Ok(incident);
        }

        [HttpDelete("incidents/{id}")]
        public async Task<IActionResult> DeleteIncident(int id)
        {
            await _incidentService.DeleteIncidentAsync(id);
            return NoContent();
        }

        [HttpGet("incidents/project/{projectId}")]
        public async Task<IActionResult> GetIncidentsByProject(int projectId)
        {
            var incidents = await _incidentService.GetIncidentsByProjectAsync(projectId);
            return Ok(incidents);
        }

        [HttpGet("incidents/critical")]
        public async Task<IActionResult> GetCriticalIncidents()
        {
            var incidents = await _incidentService.GetCriticalIncidentsAsync();
            return Ok(incidents);
        }

        [HttpPut("incidents/{id}/investigation")]
        public async Task<IActionResult> UpdateInvestigation(int id, [FromBody] InvestigationUpdateRequest request)
        {
            var incident = await _incidentService.UpdateInvestigationAsync(id, request.RootCauseAnalysis, request.CorrectiveActions);
            return Ok(incident);
        }

        #endregion

        #region Safety Training

        [HttpGet("trainings")]
        public async Task<IActionResult> GetTrainings([FromQuery] SafetyTrainingQueryParams? queryParams)
        {
            var trainings = await _trainingService.GetTrainingsAsync(queryParams);
            return Ok(trainings);
        }

        [HttpGet("trainings/{id}")]
        public async Task<IActionResult> GetTraining(int id)
        {
            var training = await _trainingService.GetTrainingByIdAsync(id);
            if (training == null) return NotFound();
            return Ok(training);
        }

        [HttpPost("trainings")]
        public async Task<IActionResult> CreateTraining([FromBody] CreateSafetyTrainingRequest request)
        {
            var training = await _trainingService.CreateTrainingAsync(request);
            return CreatedAtAction(nameof(GetTraining), new { id = training.Id }, training);
        }

        [HttpPut("trainings/{id}")]
        public async Task<IActionResult> UpdateTraining(int id, [FromBody] UpdateSafetyTrainingRequest request)
        {
            var training = await _trainingService.UpdateTrainingAsync(id, request);
            return Ok(training);
        }

        [HttpDelete("trainings/{id}")]
        public async Task<IActionResult> DeleteTraining(int id)
        {
            await _trainingService.DeleteTrainingAsync(id);
            return NoContent();
        }

        [HttpPost("trainings/{id}/complete")]
        public async Task<IActionResult> CompleteTraining(int id, [FromBody] CompleteTrainingRequest request)
        {
            var training = await _trainingService.CompleteTrainingAsync(id, request);
            return Ok(training);
        }

        [HttpPost("trainings/{id}/participants/{userId}")]
        public async Task<IActionResult> AddParticipant(int id, int userId)
        {
            var training = await _trainingService.AddParticipantAsync(id, userId);
            return Ok(training);
        }

        [HttpDelete("trainings/{id}/participants/{userId}")]
        public async Task<IActionResult> RemoveParticipant(int id, int userId)
        {
            var training = await _trainingService.RemoveParticipantAsync(id, userId);
            return Ok(training);
        }

        [HttpGet("trainings/upcoming")]
        public async Task<IActionResult> GetUpcomingTrainings()
        {
            var trainings = await _trainingService.GetUpcomingTrainingsAsync();
            return Ok(trainings);
        }

        [HttpGet("trainings/expiring")]
        public async Task<IActionResult> GetExpiringCertifications([FromQuery] int daysAhead = 30)
        {
            var trainings = await _trainingService.GetExpiringCertificationsAsync(daysAhead);
            return Ok(trainings);
        }

        #endregion

        #region Safety Compliance

        [HttpGet("compliance/{projectId}")]
        public async Task<IActionResult> GetComplianceRecords(int projectId)
        {
            var records = await _complianceService.GetComplianceRecordsAsync(projectId);
            return Ok(records);
        }

        [HttpGet("compliance/record/{id}")]
        public async Task<IActionResult> GetComplianceRecord(int id)
        {
            var record = await _complianceService.GetComplianceByIdAsync(id);
            if (record == null) return NotFound();
            return Ok(record);
        }

        [HttpPost("compliance")]
        public async Task<IActionResult> CreateComplianceRecord([FromBody] CreateSafetyComplianceRequest request)
        {
            var record = await _complianceService.CreateComplianceRecordAsync(request);
            return CreatedAtAction(nameof(GetComplianceRecord), new { id = record.Id }, record);
        }

        [HttpPut("compliance/record/{id}")]
        public async Task<IActionResult> UpdateComplianceRecord(int id, [FromBody] CreateSafetyComplianceRequest request)
        {
            var record = await _complianceService.UpdateComplianceRecordAsync(id, request);
            return Ok(record);
        }

        [HttpDelete("compliance/record/{id}")]
        public async Task<IActionResult> DeleteComplianceRecord(int id)
        {
            await _complianceService.DeleteComplianceRecordAsync(id);
            return NoContent();
        }

        [HttpPut("compliance/record/{id}/compliant")]
        public async Task<IActionResult> MarkAsCompliant(int id, [FromBody] ComplianceNoteRequest request)
        {
            var record = await _complianceService.MarkAsCompliantAsync(id, request.Notes);
            return Ok(record);
        }

        [HttpPut("compliance/record/{id}/non-compliant")]
        public async Task<IActionResult> MarkAsNonCompliant(int id, [FromBody] ComplianceNoteRequest request)
        {
            var record = await _complianceService.MarkAsNonCompliantAsync(id, request.Notes);
            return Ok(record);
        }

        #endregion
    }

    public class InvestigationUpdateRequest
    {
        public string RootCauseAnalysis { get; set; } = string.Empty;
        public string CorrectiveActions { get; set; } = string.Empty;
    }

    public class ComplianceNoteRequest
    {
        public string Notes { get; set; } = string.Empty;
    }
}

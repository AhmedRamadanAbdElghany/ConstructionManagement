using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    #region Employee Documents Controller

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeeDocumentsController : ControllerBase
    {
        private readonly IEmployeeDocumentService _service;
        private readonly ICurrentUserService _currentUser;

        public EmployeeDocumentsController(IEmployeeDocumentService service, ICurrentUserService currentUser)
        {
            _service = service;
            _currentUser = currentUser;
        }

        #region Categories

        [HttpGet("categories")]
        public async Task<ActionResult<List<EmployeeDocumentCategoryDto>>> GetCategories()
        {
            var result = await _service.GetCategoriesAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        [HttpGet("categories/{id}")]
        public async Task<ActionResult<EmployeeDocumentCategoryDto>> GetCategory(int id)
        {
            var result = await _service.GetCategoryByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("categories")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EmployeeDocumentCategoryDto>> CreateCategory([FromBody] CreateDocumentCategoryRequest request)
        {
            var result = await _service.CreateCategoryAsync(request, _currentUser.CompanyId, _currentUser.UserId);
            return CreatedAtAction(nameof(GetCategory), new { id = result.Id }, result);
        }

        [HttpPut("categories/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EmployeeDocumentCategoryDto>> UpdateCategory(int id, [FromBody] UpdateDocumentCategoryRequest request)
        {
            var result = await _service.UpdateCategoryAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("categories/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            await _service.DeleteCategoryAsync(id);
            return NoContent();
        }

        #endregion

        #region Documents

        [HttpGet]
        public async Task<ActionResult<List<EmployeeDocumentDto>>> GetDocuments([FromQuery] int? employeeId, [FromQuery] int? categoryId, [FromQuery] string? status)
        {
            var result = await _service.GetDocumentsAsync(_currentUser.CompanyId, employeeId, categoryId, status);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDocumentDto>> GetDocument(int id)
        {
            var result = await _service.GetDocumentByIdAsync(id);
            if (result == null) return NotFound();
            
            // Company isolation check: only allow access to documents within the same company
            if (result.CompanyId != _currentUser.CompanyId)
            {
                return Forbid();
            }
            
            return Ok(result);
        }

        [HttpPost]
        [RequestSizeLimit(50_000_000)] // 50MB
        public async Task<ActionResult<EmployeeDocumentDto>> UploadDocument([FromForm] CreateEmployeeDocumentRequest request, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            using var stream = new System.IO.MemoryStream();
            await file.CopyToAsync(stream);
            var fileData = stream.ToArray();

            var result = await _service.UploadDocumentAsync(request, fileData, file.FileName, file.ContentType, _currentUser.CompanyId, _currentUser.UserId);
            return CreatedAtAction(nameof(GetDocument), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<EmployeeDocumentDto>> UpdateDocument(int id, [FromBody] UpdateEmployeeDocumentRequest request)
        {
            var result = await _service.UpdateDocumentAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            await _service.DeleteDocumentAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/versions")]
        [RequestSizeLimit(50_000_000)]
        public async Task<ActionResult<EmployeeDocumentDto>> UploadNewVersion(int id, IFormFile file, [FromForm] string? changeNotes)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            using var stream = new System.IO.MemoryStream();
            await file.CopyToAsync(stream);
            var fileData = stream.ToArray();

            var result = await _service.UploadNewVersionAsync(id, fileData, file.FileName, file.ContentType, changeNotes, _currentUser.UserId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("{id}/versions")]
        public async Task<ActionResult<List<DocumentVersionDto>>> GetVersions(int id)
        {
            var result = await _service.GetDocumentVersionsAsync(id);
            return Ok(result);
        }

        [HttpPost("{id}/verify")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<EmployeeDocumentDto>> VerifyDocument(int id, [FromBody] VerifyDocumentRequest request)
        {
            var result = await _service.VerifyDocumentAsync(id, request, _currentUser.UserId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            var fileData = await _service.DownloadDocumentAsync(id);
            if (fileData == null) return NotFound();

            var document = await _service.GetDocumentByIdAsync(id);
            return File(fileData, "application/octet-stream", document.FileName);
        }

        #endregion

        #region Expiry Alerts

        [HttpGet("expiring")]
        public async Task<ActionResult<List<DocumentExpiryAlertDto>>> GetExpiringDocuments([FromQuery] int daysThreshold = 30)
        {
            var result = await _service.GetExpiringDocumentsAsync(_currentUser.CompanyId, daysThreshold);
            return Ok(result);
        }

        [HttpGet("expiry-report")]
        public async Task<ActionResult<ExpiringDocumentsReport>> GetExpiryReport()
        {
            var result = await _service.GetExpiryReportAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        #endregion
    }

    #endregion

    #region Worker Self Service Controller

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkerSelfServiceController : ControllerBase
    {
        private readonly IWorkerSelfServiceService _service;
        private readonly ICurrentUserService _currentUser;

        public WorkerSelfServiceController(IWorkerSelfServiceService service, ICurrentUserService currentUser)
        {
            _service = service;
            _currentUser = currentUser;
        }

        #region Profile

        [HttpGet("profile")]
        public async Task<ActionResult<WorkerProfileDto>> GetProfile()
        {
            var result = await _service.GetProfileAsync(_currentUser.UserId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("profile/update-request")]
        public async Task<ActionResult<WorkerProfileUpdateRequestDto>> RequestProfileUpdate([FromBody] CreateProfileUpdateRequest request)
        {
            var result = await _service.RequestProfileUpdateAsync(_currentUser.UserId, request, _currentUser.CompanyId);
            return Ok(result);
        }

        [HttpGet("profile/pending-updates")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<WorkerProfileUpdateRequestDto>>> GetPendingProfileUpdates()
        {
            var result = await _service.GetPendingProfileUpdatesAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        [HttpPost("profile/update-requests/{id}/review")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<WorkerProfileUpdateRequestDto>> ReviewProfileUpdate(int id, [FromBody] ReviewProfileUpdateRequest request)
        {
            var result = await _service.ReviewProfileUpdateAsync(id, request, _currentUser.UserId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        #endregion

        #region Emergency Contacts

        [HttpGet("emergency-contacts")]
        public async Task<ActionResult<List<EmergencyContactDto>>> GetEmergencyContacts()
        {
            var result = await _service.GetEmergencyContactsAsync(_currentUser.UserId);
            return Ok(result);
        }

        [HttpPost("emergency-contacts")]
        public async Task<ActionResult<EmergencyContactDto>> AddEmergencyContact([FromBody] CreateEmergencyContactRequest request)
        {
            var result = await _service.AddEmergencyContactAsync(_currentUser.UserId, request, _currentUser.CompanyId);
            return Ok(result);
        }

        [HttpPut("emergency-contacts/{id}")]
        public async Task<ActionResult<EmergencyContactDto>> UpdateEmergencyContact(int id, [FromBody] UpdateEmergencyContactRequest request)
        {
            var result = await _service.UpdateEmergencyContactAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("emergency-contacts/{id}")]
        public async Task<IActionResult> DeleteEmergencyContact(int id)
        {
            await _service.DeleteEmergencyContactAsync(id, _currentUser.UserId);
            return NoContent();
        }

        [HttpPost("emergency-contacts/{id}/set-primary")]
        public async Task<IActionResult> SetPrimaryEmergencyContact(int id)
        {
            await _service.SetPrimaryEmergencyContactAsync(id, _currentUser.UserId);
            return NoContent();
        }

        #endregion

        #region Bank Accounts

        [HttpGet("bank-accounts")]
        public async Task<ActionResult<List<BankAccountDto>>> GetBankAccounts()
        {
            var result = await _service.GetBankAccountsAsync(_currentUser.UserId);
            return Ok(result);
        }

        [HttpPost("bank-accounts")]
        public async Task<ActionResult<BankAccountDto>> AddBankAccount([FromBody] CreateBankAccountRequest request)
        {
            var result = await _service.AddBankAccountAsync(_currentUser.UserId, request, _currentUser.CompanyId);
            return Ok(result);
        }

        [HttpPut("bank-accounts/{id}")]
        public async Task<ActionResult<BankAccountDto>> UpdateBankAccount(int id, [FromBody] UpdateBankAccountRequest request)
        {
            var result = await _service.UpdateBankAccountAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("bank-accounts/{id}")]
        public async Task<IActionResult> DeleteBankAccount(int id)
        {
            await _service.DeleteBankAccountAsync(id, _currentUser.UserId);
            return NoContent();
        }

        [HttpPost("bank-accounts/{id}/set-active")]
        public async Task<IActionResult> SetActiveBankAccount(int id)
        {
            await _service.SetActiveBankAccountAsync(id, _currentUser.UserId);
            return NoContent();
        }

        #endregion
    }

    #endregion

    #region Employee Onboarding Controller

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeeOnboardingController : ControllerBase
    {
        private readonly IEmployeeOnboardingService _service;
        private readonly ICurrentUserService _currentUser;

        public EmployeeOnboardingController(IEmployeeOnboardingService service, ICurrentUserService currentUser)
        {
            _service = service;
            _currentUser = currentUser;
        }

        #region Templates

        [HttpGet("templates")]
        public async Task<ActionResult<List<OnboardingTemplateDto>>> GetTemplates([FromQuery] bool? isActive)
        {
            var result = await _service.GetTemplatesAsync(_currentUser.CompanyId, isActive);
            return Ok(result);
        }

        [HttpGet("templates/{id}")]
        public async Task<ActionResult<OnboardingTemplateDto>> GetTemplate(int id)
        {
            var result = await _service.GetTemplateByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("templates")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<OnboardingTemplateDto>> CreateTemplate([FromBody] CreateOnboardingTemplateRequest request)
        {
            var result = await _service.CreateTemplateAsync(request, _currentUser.CompanyId, _currentUser.UserId);
            return CreatedAtAction(nameof(GetTemplate), new { id = result.Id }, result);
        }

        [HttpPut("templates/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<OnboardingTemplateDto>> UpdateTemplate(int id, [FromBody] UpdateOnboardingTemplateRequest request)
        {
            var result = await _service.UpdateTemplateAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("templates/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            await _service.DeleteTemplateAsync(id);
            return NoContent();
        }

        #endregion

        #region Task Templates

        [HttpGet("templates/{templateId}/tasks")]
        public async Task<ActionResult<List<OnboardingTaskTemplateDto>>> GetTaskTemplates(int templateId)
        {
            var result = await _service.GetTaskTemplatesAsync(templateId);
            return Ok(result);
        }

        [HttpPost("templates/{templateId}/tasks")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<OnboardingTaskTemplateDto>> AddTaskTemplate(int templateId, [FromBody] CreateTaskTemplateRequest request)
        {
            var result = await _service.AddTaskTemplateAsync(templateId, request);
            return Ok(result);
        }

        [HttpPut("task-templates/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<OnboardingTaskTemplateDto>> UpdateTaskTemplate(int id, [FromBody] CreateTaskTemplateRequest request)
        {
            var result = await _service.UpdateTaskTemplateAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("task-templates/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteTaskTemplate(int id)
        {
            await _service.DeleteTaskTemplateAsync(id);
            return NoContent();
        }

        [HttpPost("templates/{templateId}/tasks/reorder")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> ReorderTaskTemplates(int templateId, [FromBody] List<int> taskIds)
        {
            await _service.ReorderTaskTemplatesAsync(templateId, taskIds);
            return NoContent();
        }

        #endregion

        #region Processes

        [HttpGet("processes")]
        public async Task<ActionResult<List<OnboardingProcessDto>>> GetProcesses([FromQuery] string? status, [FromQuery] int? employeeId)
        {
            var result = await _service.GetProcessesAsync(_currentUser.CompanyId, status, employeeId);
            return Ok(result);
        }

        [HttpGet("processes/{id}")]
        public async Task<ActionResult<OnboardingProcessDto>> GetProcess(int id)
        {
            var result = await _service.GetProcessByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("processes")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<OnboardingProcessDto>> StartOnboarding([FromBody] CreateOnboardingProcessRequest request)
        {
            var result = await _service.StartOnboardingAsync(request, _currentUser.CompanyId);
            return CreatedAtAction(nameof(GetProcess), new { id = result.Id }, result);
        }

        [HttpPost("processes/{id}/complete")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> CompleteOnboarding(int id)
        {
            await _service.CompleteOnboardingAsync(id);
            return NoContent();
        }

        #endregion

        #region Tasks

        [HttpGet("processes/{processId}/tasks")]
        public async Task<ActionResult<List<OnboardingTaskDto>>> GetProcessTasks(int processId)
        {
            var result = await _service.GetProcessTasksAsync(processId);
            return Ok(result);
        }

        [HttpPut("tasks/{taskId}")]
        public async Task<ActionResult<OnboardingTaskDto>> UpdateTaskStatus(int taskId, [FromBody] UpdateOnboardingTaskRequest request)
        {
            var result = await _service.UpdateTaskStatusAsync(taskId, request, _currentUser.UserId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("tasks/{taskId}/documents")]
        public async Task<ActionResult<OnboardingTaskDto>> UploadTaskDocument(int taskId, [FromBody] UploadTaskDocumentRequest request)
        {
            var result = await _service.UploadTaskDocumentAsync(taskId, request.DocumentName, request.FilePath);
            if (result == null) return NotFound();
            return Ok(result);
        }

        #endregion

        #region Dashboard

        [HttpGet("dashboard")]
        public async Task<ActionResult<OnboardingDashboardDto>> GetDashboard()
        {
            var result = await _service.GetDashboardAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        #endregion
    }

    public class UploadTaskDocumentRequest
    {
        public string DocumentName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
    }

    #endregion

    #region Disciplinary Actions Controller

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DisciplinaryActionsController : ControllerBase
    {
        private readonly IDisciplinaryActionService _service;
        private readonly ICurrentUserService _currentUser;

        public DisciplinaryActionsController(IDisciplinaryActionService service, ICurrentUserService currentUser)
        {
            _service = service;
            _currentUser = currentUser;
        }

        #region Action Types

        [HttpGet("types")]
        public async Task<ActionResult<List<DisciplinaryActionTypeDto>>> GetActionTypes([FromQuery] bool? isActive)
        {
            var result = await _service.GetActionTypesAsync(_currentUser.CompanyId, isActive);
            return Ok(result);
        }

        [HttpGet("types/{id}")]
        public async Task<ActionResult<DisciplinaryActionTypeDto>> GetActionType(int id)
        {
            var result = await _service.GetActionTypeByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("types")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<DisciplinaryActionTypeDto>> CreateActionType([FromBody] CreateDisciplinaryActionTypeRequest request)
        {
            var result = await _service.CreateActionTypeAsync(request, _currentUser.CompanyId);
            return CreatedAtAction(nameof(GetActionType), new { id = result.Id }, result);
        }

        [HttpPut("types/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<DisciplinaryActionTypeDto>> UpdateActionType(int id, [FromBody] UpdateDisciplinaryActionTypeRequest request)
        {
            var result = await _service.UpdateActionTypeAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("types/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteActionType(int id)
        {
            await _service.DeleteActionTypeAsync(id);
            return NoContent();
        }

        #endregion

        #region Actions

        [HttpGet]
        public async Task<ActionResult<List<DisciplinaryActionDto>>> GetActions([FromQuery] int? employeeId, [FromQuery] string? status)
        {
            var result = await _service.GetActionsAsync(_currentUser.CompanyId, employeeId, status);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DisciplinaryActionDto>> GetAction(int id)
        {
            var result = await _service.GetActionByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager")]
        public async Task<ActionResult<DisciplinaryActionDto>> CreateAction([FromBody] CreateDisciplinaryActionRequest request)
        {
            var result = await _service.CreateActionAsync(request, _currentUser.CompanyId, _currentUser.UserId);
            return CreatedAtAction(nameof(GetAction), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<DisciplinaryActionDto>> UpdateAction(int id, [FromBody] UpdateDisciplinaryActionRequest request)
        {
            var result = await _service.UpdateActionAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteAction(int id)
        {
            await _service.DeleteActionAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/attach-document")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<DisciplinaryActionDto>> AttachDocument(int id, [FromBody] AttachDocumentRequest request)
        {
            var result = await _service.AttachDocumentAsync(id, request.DocumentPath);
            if (result == null) return NotFound();
            return Ok(result);
        }

        #endregion

        #region Appeals

        [HttpPost("{actionId}/appeal")]
        public async Task<ActionResult<DisciplinaryAppealDto>> SubmitAppeal(int actionId, [FromBody] CreateDisciplinaryAppealRequest request)
        {
            request.DisciplinaryActionId = actionId;
            var result = await _service.SubmitAppealAsync(request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("appeals/{appealId}/review")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<DisciplinaryAppealDto>> ReviewAppeal(int appealId, [FromBody] ReviewAppealRequest request)
        {
            var result = await _service.ReviewAppealAsync(appealId, request, _currentUser.UserId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("appeals/pending")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<DisciplinaryAppealDto>>> GetPendingAppeals()
        {
            var result = await _service.GetPendingAppealsAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        #endregion

        #region Records

        [HttpGet("records/employee/{employeeId}")]
        public async Task<ActionResult<EmployeeDisciplinaryRecordDto>> GetEmployeeRecord(int employeeId)
        {
            var result = await _service.GetEmployeeRecordAsync(employeeId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("records")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<List<EmployeeDisciplinaryRecordDto>>> GetEmployeeRecords()
        {
            var result = await _service.GetEmployeeRecordsAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        #endregion

        #region Dashboard

        [HttpGet("dashboard")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<DisciplinaryDashboardDto>> GetDashboard()
        {
            var result = await _service.GetDashboardAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        #endregion
    }

    public class AttachDocumentRequest
    {
        public string DocumentPath { get; set; } = string.Empty;
    }

    #endregion

    #region Skills Matrix Controller

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SkillsMatrixController : ControllerBase
    {
        private readonly ISkillsMatrixService _service;
        private readonly ICurrentUserService _currentUser;

        public SkillsMatrixController(ISkillsMatrixService service, ICurrentUserService currentUser)
        {
            _service = service;
            _currentUser = currentUser;
        }

        #region Categories

        [HttpGet("categories")]
        public async Task<ActionResult<List<SkillCategoryDto>>> GetCategories([FromQuery] bool? isActive)
        {
            var result = await _service.GetCategoriesAsync(_currentUser.CompanyId, isActive);
            return Ok(result);
        }

        [HttpGet("categories/{id}")]
        public async Task<ActionResult<SkillCategoryDto>> GetCategory(int id)
        {
            var result = await _service.GetCategoryByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("categories")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<SkillCategoryDto>> CreateCategory([FromBody] CreateSkillCategoryRequest request)
        {
            var result = await _service.CreateCategoryAsync(request, _currentUser.CompanyId);
            return CreatedAtAction(nameof(GetCategory), new { id = result.Id }, result);
        }

        [HttpPut("categories/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<SkillCategoryDto>> UpdateCategory(int id, [FromBody] UpdateSkillCategoryRequest request)
        {
            var result = await _service.UpdateCategoryAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("categories/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            await _service.DeleteCategoryAsync(id);
            return NoContent();
        }

        #endregion

        #region Skills

        [HttpGet("skills")]
        public async Task<ActionResult<List<SkillDto>>> GetSkills([FromQuery] int? categoryId, [FromQuery] bool? isActive)
        {
            var result = await _service.GetSkillsAsync(_currentUser.CompanyId, categoryId, isActive);
            return Ok(result);
        }

        [HttpGet("skills/{id}")]
        public async Task<ActionResult<SkillDto>> GetSkill(int id)
        {
            var result = await _service.GetSkillByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("skills")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<SkillDto>> CreateSkill([FromBody] CreateSkillRequest request)
        {
            var result = await _service.CreateSkillAsync(request, _currentUser.CompanyId);
            return CreatedAtAction(nameof(GetSkill), new { id = result.Id }, result);
        }

        [HttpPut("skills/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<SkillDto>> UpdateSkill(int id, [FromBody] UpdateSkillRequest request)
        {
            var result = await _service.UpdateSkillAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("skills/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            await _service.DeleteSkillAsync(id);
            return NoContent();
        }

        #endregion

        #region Competency Levels

        [HttpGet("competency-levels")]
        public async Task<ActionResult<List<CompetencyLevelDto>>> GetCompetencyLevels()
        {
            var result = await _service.GetCompetencyLevelsAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        [HttpPost("competency-levels")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<CompetencyLevelDto>> CreateCompetencyLevel([FromBody] CreateCompetencyLevelRequest request)
        {
            var result = await _service.CreateCompetencyLevelAsync(request, _currentUser.CompanyId);
            return Ok(result);
        }

        [HttpPut("competency-levels/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<CompetencyLevelDto>> UpdateCompetencyLevel(int id, [FromBody] UpdateCompetencyLevelRequest request)
        {
            var result = await _service.UpdateCompetencyLevelAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("competency-levels/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteCompetencyLevel(int id)
        {
            await _service.DeleteCompetencyLevelAsync(id);
            return NoContent();
        }

        #endregion

        #region Employee Skills

        [HttpGet("employee/{employeeId}/skills")]
        public async Task<ActionResult<List<EmployeeSkillDto>>> GetEmployeeSkills(int employeeId)
        {
            var result = await _service.GetEmployeeSkillsAsync(employeeId);
            return Ok(result);
        }

        [HttpGet("employee-skills/{id}")]
        public async Task<ActionResult<EmployeeSkillDto>> GetEmployeeSkill(int id)
        {
            var result = await _service.GetEmployeeSkillByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("employee-skills")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager")]
        public async Task<ActionResult<EmployeeSkillDto>> AssessEmployeeSkill([FromBody] CreateEmployeeSkillRequest request)
        {
            var result = await _service.AssessEmployeeSkillAsync(request, _currentUser.CompanyId, _currentUser.UserId);
            return Ok(result);
        }

        [HttpPut("employee-skills/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager")]
        public async Task<ActionResult<EmployeeSkillDto>> UpdateEmployeeSkill(int id, [FromBody] UpdateEmployeeSkillRequest request)
        {
            var result = await _service.UpdateEmployeeSkillAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("employee-skills/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> DeleteEmployeeSkill(int id)
        {
            await _service.DeleteEmployeeSkillAsync(id);
            return NoContent();
        }

        [HttpGet("employee/{employeeId}/profile")]
        public async Task<ActionResult<EmployeeSkillsProfileDto>> GetEmployeeSkillsProfile(int employeeId)
        {
            var result = await _service.GetEmployeeSkillsProfileAsync(employeeId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        #endregion

        #region Skill Requirements

        [HttpGet("requirements/{entityType}/{entityId}")]
        public async Task<ActionResult<List<SkillRequirementDto>>> GetSkillRequirements(string entityType, int entityId)
        {
            var result = await _service.GetSkillRequirementsAsync(entityType, entityId);
            return Ok(result);
        }

        [HttpPost("requirements")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager")]
        public async Task<ActionResult<SkillRequirementDto>> AddSkillRequirement([FromBody] CreateSkillRequirementRequest request)
        {
            var result = await _service.AddSkillRequirementAsync(request, _currentUser.CompanyId);
            return Ok(result);
        }

        [HttpDelete("requirements/{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager")]
        public async Task<IActionResult> DeleteSkillRequirement(int id)
        {
            await _service.DeleteSkillRequirementAsync(id);
            return NoContent();
        }

        #endregion

        #region Gap Analysis

        [HttpGet("gaps")]
        public async Task<ActionResult<List<SkillGapAnalysisDto>>> GetSkillGaps([FromQuery] int? employeeId)
        {
            var result = await _service.GetSkillGapsAsync(_currentUser.CompanyId, employeeId);
            return Ok(result);
        }

        [HttpPost("analyze/employee/{employeeId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager")]
        public async Task<ActionResult<List<SkillGapAnalysisDto>>> AnalyzeEmployeeGaps(int employeeId)
        {
            var result = await _service.AnalyzeEmployeeGapsAsync(employeeId);
            return Ok(result);
        }

        [HttpPost("analyze/project/{projectId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager")]
        public async Task<ActionResult<List<SkillGapAnalysisDto>>> AnalyzeProjectGaps(int projectId)
        {
            var result = await _service.AnalyzeProjectGapsAsync(projectId);
            return Ok(result);
        }

        #endregion

        #region Dashboard

        [HttpGet("dashboard")]
        public async Task<ActionResult<SkillsMatrixDashboardDto>> GetDashboard()
        {
            var result = await _service.GetDashboardAsync(_currentUser.CompanyId);
            return Ok(result);
        }

        #endregion

        #region Bulk Operations

        [HttpPost("employee/{employeeId}/bulk-assess")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager")]
        public async Task<IActionResult> BulkAssessSkills(int employeeId, [FromBody] List<CreateEmployeeSkillRequest> requests)
        {
            await _service.BulkAssessSkillsAsync(employeeId, requests, _currentUser.CompanyId, _currentUser.UserId);
            return NoContent();
        }

        [HttpGet("skills/{skillId}/employees")]
        public async Task<ActionResult<List<EmployeeSkillDto>>> FindEmployeesWithSkill(int skillId, [FromQuery] int minimumLevel = 1)
        {
            var result = await _service.FindEmployeesWithSkillAsync(skillId, minimumLevel);
            return Ok(result);
        }

        #endregion
    }

    #endregion
}

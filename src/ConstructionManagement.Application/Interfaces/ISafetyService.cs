using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface ISafetyChecklistService
    {
        Task<IEnumerable<SafetyChecklistDto>> GetChecklistsAsync();
        Task<SafetyChecklistDto?> GetChecklistByIdAsync(int id);
        Task<SafetyChecklistDto> CreateChecklistAsync(CreateSafetyChecklistRequest request);
        Task<SafetyChecklistDto> UpdateChecklistAsync(int id, UpdateSafetyChecklistRequest request);
        Task<bool> DeleteChecklistAsync(int id);
        Task<IEnumerable<SafetyChecklistItemDto>> GetChecklistItemsAsync(int checklistId);
        Task<SafetyChecklistItemDto> AddChecklistItemAsync(CreateSafetyChecklistItemRequest request);
        Task<bool> UpdateChecklistItemAsync(int itemId, CreateSafetyChecklistItemRequest request);
        Task<bool> DeleteChecklistItemAsync(int itemId);
    }

    public interface ISafetyInspectionService
    {
        Task<IEnumerable<SafetyInspectionDto>> GetInspectionsAsync(SafetyInspectionQueryParams? queryParams = null);
        Task<SafetyInspectionDto?> GetInspectionByIdAsync(int id);
        Task<SafetyInspectionDto> CreateInspectionAsync(CreateSafetyInspectionRequest request);
        Task<SafetyInspectionDto> UpdateInspectionAsync(int id, CreateSafetyInspectionRequest request);
        Task<bool> DeleteInspectionAsync(int id);
        Task<IEnumerable<SafetyInspectionDto>> GetInspectionsByProjectAsync(int projectId);
        Task<SafetyDashboardDto> GetDashboardStatsAsync();
    }

    public interface ISafetyIncidentService
    {
        Task<IEnumerable<SafetyIncidentDto>> GetIncidentsAsync(SafetyIncidentQueryParams? queryParams = null);
        Task<SafetyIncidentDto?> GetIncidentByIdAsync(int id);
        Task<SafetyIncidentDto> CreateIncidentAsync(CreateSafetyIncidentRequest request);
        Task<SafetyIncidentDto> UpdateIncidentAsync(int id, UpdateSafetyIncidentRequest request);
        Task<bool> DeleteIncidentAsync(int id);
        Task<IEnumerable<SafetyIncidentDto>> GetIncidentsByProjectAsync(int projectId);
        Task<IEnumerable<SafetyIncidentDto>> GetCriticalIncidentsAsync();
        Task<SafetyIncidentDto> UpdateInvestigationAsync(int id, string rootCause, string correctiveActions);
    }

    public interface ISafetyTrainingService
    {
        Task<IEnumerable<SafetyTrainingDto>> GetTrainingsAsync(SafetyTrainingQueryParams? queryParams = null);
        Task<SafetyTrainingDto?> GetTrainingByIdAsync(int id);
        Task<SafetyTrainingDto> CreateTrainingAsync(CreateSafetyTrainingRequest request);
        Task<SafetyTrainingDto> UpdateTrainingAsync(int id, UpdateSafetyTrainingRequest request);
        Task<bool> DeleteTrainingAsync(int id);
        Task<SafetyTrainingDto> CompleteTrainingAsync(int id, CompleteTrainingRequest request);
        Task<SafetyTrainingDto> AddParticipantAsync(int trainingId, int userId);
        Task<SafetyTrainingDto> RemoveParticipantAsync(int trainingId, int userId);
        Task<IEnumerable<SafetyTrainingDto>> GetUpcomingTrainingsAsync();
        Task<IEnumerable<SafetyTrainingDto>> GetExpiringCertificationsAsync(int daysAhead = 30);
    }

    public interface ISafetyComplianceService
    {
        Task<IEnumerable<SafetyComplianceDto>> GetComplianceRecordsAsync(int projectId);
        Task<SafetyComplianceDto?> GetComplianceByIdAsync(int id);
        Task<SafetyComplianceDto> CreateComplianceRecordAsync(CreateSafetyComplianceRequest request);
        Task<SafetyComplianceDto> UpdateComplianceRecordAsync(int id, CreateSafetyComplianceRequest request);
        Task<bool> DeleteComplianceRecordAsync(int id);
        Task<SafetyComplianceDto> MarkAsCompliantAsync(int id, string notes);
        Task<SafetyComplianceDto> MarkAsNonCompliantAsync(int id, string notes);
    }
}

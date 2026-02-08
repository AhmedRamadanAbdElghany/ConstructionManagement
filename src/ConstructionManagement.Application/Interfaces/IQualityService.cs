using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IQualityService
    {
        #region Quality Standards

        Task<IEnumerable<QualityStandardDto>> GetQualityStandardsAsync(int companyId);
        Task<QualityStandardDto?> GetQualityStandardByIdAsync(int id, int companyId);
        Task<QualityStandardDto> CreateQualityStandardAsync(CreateQualityStandardRequest request, int companyId, string userId);
        Task<QualityStandardDto> UpdateQualityStandardAsync(UpdateQualityStandardRequest request, int companyId, string userId);
        Task<bool> DeleteQualityStandardAsync(int id, int companyId);
        Task<IEnumerable<QualityStandardDto>> GetActiveQualityStandardsByCategoryAsync(int companyId, string category);

        #endregion

        #region Quality Inspections

        Task<IEnumerable<QualityInspectionDto>> GetInspectionsAsync(int companyId, int? projectId = null, int? phaseId = null, string? status = null);
        Task<QualityInspectionDto?> GetInspectionByIdAsync(int id, int companyId);
        Task<QualityInspectionDto> CreateInspectionAsync(CreateQualityInspectionRequest request, int companyId, string userId);
        Task<QualityInspectionDto> UpdateInspectionAsync(UpdateQualityInspectionRequest request, int companyId, string userId);
        Task<bool> DeleteInspectionAsync(int id, int companyId);
        Task<QualityInspectionDto> StartInspectionAsync(int id, int companyId, string userId);
        Task<QualityInspectionDto> CompleteInspectionAsync(CompleteInspectionRequest request, int companyId, string userId);
        Task<QualityInspectionItemDto> UpdateInspectionItemResultAsync(UpdateInspectionItemResultRequest request, int companyId, string userId);
        Task<IEnumerable<QualityInspectionDto>> GetUpcomingInspectionsAsync(int companyId, int days = 7);
        Task<IEnumerable<QualityInspectionDto>> GetRecentInspectionsAsync(int companyId, int count = 10);

        #endregion

        #region Defects

        Task<IEnumerable<DefectDto>> GetDefectsAsync(int companyId, int? projectId = null, int? phaseId = null, string? status = null, string? severity = null);
        Task<DefectDto?> GetDefectByIdAsync(int id, int companyId);
        Task<DefectDto> CreateDefectAsync(CreateDefectRequest request, int companyId, string userId, string reporterId);
        Task<DefectDto> UpdateDefectAsync(UpdateDefectRequest request, int companyId, string userId);
        Task<bool> DeleteDefectAsync(int id, int companyId);
        Task<DefectDto> AssignDefectAsync(AssignDefectRequest request, int companyId, string userId);
        Task<DefectDto> ResolveDefectAsync(ResolveDefectRequest request, int companyId, string userId);
        Task<DefectDto> CloseDefectAsync(int id, int companyId, string userId, string closureNotes);
        Task<DefectDto> ReopenDefectAsync(int id, int companyId, string userId, string reason);
        Task<IEnumerable<DefectDto>> GetOpenDefectsAsync(int companyId, int? projectId = null);
        Task<IEnumerable<DefectDto>> GetOverdueDefectsAsync(int companyId);
        Task<IEnumerable<DefectDto>> GetCriticalDefectsAsync(int companyId);
        Task<IEnumerable<DefectDto>> GetSafetyRelatedDefectsAsync(int companyId);

        #endregion

        #region Punch List Items

        Task<IEnumerable<PunchListItemDto>> GetPunchListItemsAsync(int companyId, int? projectId = null, int? phaseId = null, string? status = null);
        Task<PunchListItemDto?> GetPunchListItemByIdAsync(int id, int companyId);
        Task<PunchListItemDto> CreatePunchListItemAsync(CreatePunchListItemRequest request, int companyId, string userId);
        Task<PunchListItemDto> UpdatePunchListItemAsync(UpdatePunchListItemRequest request, int companyId, string userId);
        Task<bool> DeletePunchListItemAsync(int id, int companyId);
        Task<PunchListItemDto> CompletePunchListItemAsync(CompletePunchListItemRequest request, int companyId, string userId);
        Task<PunchListItemDto> VerifyPunchListItemAsync(VerifyPunchListItemRequest request, int companyId, string userId);
        Task<PunchListItemDto> AcceptPunchListItemAsync(int id, int companyId, string userId, string? notes);
        Task<IEnumerable<PunchListItemDto>> GetPendingPunchListItemsAsync(int companyId, int? projectId = null);
        Task<IEnumerable<PunchListItemDto>> GetPunchListItemsByDefectAsync(int defectId, int companyId);

        #endregion

        #region Defect Resolutions

        Task<IEnumerable<DefectResolutionDto>> GetDefectResolutionsAsync(int defectId, int companyId);
        Task<DefectResolutionDto> AddDefectResolutionAsync(AddDefectResolutionRequest request, int companyId, string userId);

        #endregion

        #region Statistics

        Task<QualityStatisticsDto> GetQualityStatisticsAsync(int companyId, int? projectId = null);
        Task<QualityStatisticsDto> GetProjectQualityStatisticsAsync(int companyId, int projectId);
        Task<IEnumerable<InspectionTypeSummary>> GetInspectionsByTypeAsync(int companyId, int? projectId = null);
        Task<IEnumerable<CategorySummary>> GetDefectsByCategoryAsync(int companyId, int? projectId = null);
        Task<IEnumerable<MonthlyTrend>> GetMonthlyQualityTrendsAsync(int companyId, int months = 12);

        #endregion
    }
}

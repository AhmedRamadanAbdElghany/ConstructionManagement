using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IPerformanceEvaluationService
    {
        #region Evaluation Criteria
        
        Task<List<EvaluationCriteriaDto>> GetEvaluationCriteriaAsync(int? companyId = null);
        Task<EvaluationCriteriaDto> CreateEvaluationCriteriaAsync(CreateEvaluationCriteriaRequest request, int? companyId = null);
        Task<EvaluationCriteriaDto> UpdateEvaluationCriteriaAsync(int id, UpdateEvaluationCriteriaRequest request);
        Task DeleteEvaluationCriteriaAsync(int id);
        
        #endregion
        
        #region Evaluation Periods
        
        Task<List<EvaluationPeriodDto>> GetEvaluationPeriodsAsync(int? companyId = null);
        Task<EvaluationPeriodDto> GetEvaluationPeriodAsync(int id);
        Task<EvaluationPeriodDto> CreateEvaluationPeriodAsync(CreateEvaluationPeriodRequest request, int? companyId = null);
        Task<EvaluationPeriodDto> UpdateEvaluationPeriodAsync(int id, UpdateEvaluationPeriodRequest request);
        Task ActivateEvaluationPeriodAsync(int id);
        Task CloseEvaluationPeriodAsync(int id);
        
        #endregion
        
        #region Performance Evaluations
        
        Task<List<PerformanceEvaluationDto>> GetEvaluationsAsync(int? periodId, int? employeeId, int? managerId, string? status);
        Task<PerformanceEvaluationDto> GetEvaluationAsync(int id);
        Task<PerformanceEvaluationDto> CreateEvaluationAsync(CreatePerformanceEvaluationRequest request);
        Task<PerformanceEvaluationDto> StartSelfAssessmentAsync(int evaluationId, int employeeId);
        Task<PerformanceEvaluationDto> SubmitSelfAssessmentAsync(int evaluationId, int employeeId, SelfAssessmentRequest request);
        Task<PerformanceEvaluationDto> SubmitManagerAssessmentAsync(int evaluationId, int managerId, ManagerAssessmentRequest request);
        Task<PerformanceEvaluationDto> AcknowledgeEvaluationAsync(int evaluationId, int employeeId, AcknowledgmentRequest request);
        Task DeleteEvaluationAsync(int id);
        
        #endregion
        
        #region Goals
        
        Task<EvaluationGoalDto> AddGoalAsync(CreateGoalRequest request);
        Task<EvaluationGoalDto> UpdateGoalAsync(int goalId, UpdateGoalRequest request);
        Task DeleteGoalAsync(int goalId);
        
        #endregion
        
        #region Peer Feedback
        
        Task<List<PeerFeedbackDto>> GetPeerFeedbackAsync(int evaluationId);
        Task<PeerFeedbackDto> SubmitPeerFeedbackAsync(int evaluationId, int reviewerId, CreatePeerFeedbackRequest request);
        
        #endregion
        
        #region Reports
        
        Task<PerformanceReportDto> GetPerformanceReportAsync(int periodId);
        Task<EmployeePerformanceHistoryDto> GetEmployeePerformanceHistoryAsync(int employeeId, int? count = null);
        Task<List<TopPerformerDto>> GetTopPerformersAsync(int periodId, int count = 10);
        
        #endregion
    }
}

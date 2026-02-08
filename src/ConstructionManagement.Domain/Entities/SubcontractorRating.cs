using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Performance ratings for subcontractors
    /// </summary>
    public class SubcontractorRating : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

        // References
        public int SubcontractorId { get; set; }
        [ForeignKey(nameof(SubcontractorId))]
        public virtual Subcontractor Subcontractor { get; set; } = null!;

        public int? ContractId { get; set; }
        [ForeignKey(nameof(ContractId))]
        public virtual SubcontractorContract? Contract { get; set; }

        public int? ProjectId { get; set; }
        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        // Rating Details
        public string EvaluatorId { get; set; } = string.Empty;
        public string EvaluatorName { get; set; } = string.Empty;
        public string EvaluatorRole { get; set; } = string.Empty;

        public DateTime EvaluationDate { get; set; }
        public DateTime? ContractCompletionDate { get; set; }

        // Performance Scores (1-5 scale)
        public double QualityOfWork { get; set; }           // Workmanship quality
        public double Timeliness { get; set; }              // On-time delivery
        public double Communication { get; set; }           // Communication responsiveness
        public double Professionalism { get; set; }        // Professional conduct
        public double SafetyCompliance { get; set; }        // Safety protocol adherence
        public double BudgetAdherence { get; set; }         // Staying within budget
        public double ProblemSolving { get; set; }           // Issue resolution
        public double Documentation { get; set; }           // Paperwork and documentation

        // Calculated Overall
        public double OverallRating { get; set; }
        public string RatingGrade { get; set; } = string.Empty;  // A, B, C, D, F

        // Qualitative Assessment
        public string? Strengths { get; set; }
        public string? Weaknesses { get; set; }
        public string? Recommendations { get; set; }
        public string? GeneralComments { get; set; }

        // Supporting metrics
        public int? DaysEarly { get; set; }
        public int? DaysLate { get; set; }
        public decimal? BudgetVariance { get; set; }
        public int? ChangeOrderCount { get; set; }
        public int? SafetyIncidentsCount { get; set; }
        public int? DefectCount { get; set; }

        // Would Recommend?
        public bool WouldRecommend { get; set; }
        public bool WouldHireAgain { get; set; }

        // Status
        public bool IsFinalized { get; set; } = false;
        public string? ReviewedBy { get; set; }
        public DateTime? ReviewDate { get; set; }

        // Project-specific context
        public string? ProjectPhase { get; set; }
        public string? ScopeDescription { get; set; }
    }

    public static class RatingGradeCalculator
    {
        public static string CalculateGrade(double overallRating)
        {
            return overallRating >= 4.5 ? "A" :
                   overallRating >= 3.5 ? "B" :
                   overallRating >= 2.5 ? "C" :
                   overallRating >= 1.5 ? "D" : "F";
        }

        public static double CalculateOverallRating(SubcontractorRating rating)
        {
            var weights = new Dictionary<string, double>
            {
                { "QualityOfWork", 0.25 },
                { "Timeness", 0.15 },
                { "Communication", 0.10 },
                { "Professionalism", 0.10 },
                { "SafetyCompliance", 0.15 },
                { "BudgetAdherence", 0.10 },
                { "ProblemSolving", 0.10 },
                { "Documentation", 0.05 }
            };

            double total = 0;
            double totalWeight = 0;

            if (rating.QualityOfWork > 0) { total += rating.QualityOfWork * weights["QualityOfWork"]; totalWeight += weights["QualityOfWork"]; }
            if (rating.Timeliness > 0) { total += rating.Timeliness * weights["Timeness"]; totalWeight += weights["Timeness"]; }
            if (rating.Communication > 0) { total += rating.Communication * weights["Communication"]; totalWeight += weights["Communication"]; }
            if (rating.Professionalism > 0) { total += rating.Professionalism * weights["Professionalism"]; totalWeight += weights["Professionalism"]; }
            if (rating.SafetyCompliance > 0) { total += rating.SafetyCompliance * weights["SafetyCompliance"]; totalWeight += weights["SafetyCompliance"]; }
            if (rating.BudgetAdherence > 0) { total += rating.BudgetAdherence * weights["BudgetAdherence"]; totalWeight += weights["BudgetAdherence"]; }
            if (rating.ProblemSolving > 0) { total += rating.ProblemSolving * weights["ProblemSolving"]; totalWeight += weights["ProblemSolving"]; }
            if (rating.Documentation > 0) { total += rating.Documentation * weights["Documentation"]; totalWeight += weights["Documentation"]; }

            return totalWeight > 0 ? Math.Round(total / totalWeight, 2) : 0;
        }
    }
}

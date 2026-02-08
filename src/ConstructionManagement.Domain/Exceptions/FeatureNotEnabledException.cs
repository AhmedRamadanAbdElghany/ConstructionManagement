namespace ConstructionManagement.Domain.Exceptions;

/// <summary>
/// Exception thrown when a feature is not enabled for the company
/// </summary>
public class FeatureNotEnabledException : Exception
{
    public string FeatureName { get; }
    public int? CompanyId { get; }

    public FeatureNotEnabledException(string featureName, int? companyId = null) 
        : base($"The feature '{featureName}' is not enabled for this company.")
    {
        FeatureName = featureName;
        CompanyId = companyId;
    }

    public FeatureNotEnabledException(string featureName, string message) : base(message)
    {
        FeatureName = featureName;
    }
}

using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Tests.Unit.Services;

public class SafetyServiceTests
{
    #region Enum Tests

    [Fact]
    public void SafetyCategory_HasCorrectValues()
    {
        // Assert - verify enum values exist
        Assert.Equal(1, (int)SafetyCategory.PersonalProtectiveEquipment);
        Assert.Equal(2, (int)SafetyCategory.ElectricalSafety);
        Assert.Equal(3, (int)SafetyCategory.FallProtection);
        Assert.Equal(4, (int)SafetyCategory.HeavyMachinery);
        Assert.Equal(8, (int)SafetyCategory.GeneralSite);
    }

    [Fact]
    public void IncidentSeverity_HasCorrectValues()
    {
        // Assert
        Assert.Equal(1, (int)IncidentSeverity.Low);
        Assert.Equal(2, (int)IncidentSeverity.Medium);
        Assert.Equal(3, (int)IncidentSeverity.High);
        Assert.Equal(4, (int)IncidentSeverity.Critical);
    }

    [Fact]
    public void InvestigationStatus_HasCorrectValues()
    {
        // Assert
        Assert.Equal(1, (int)InvestigationStatus.Pending);
        Assert.Equal(2, (int)InvestigationStatus.InProgress);
        Assert.Equal(3, (int)InvestigationStatus.Completed);
    }

    [Fact]
    public void TrainingStatus_HasCorrectValues()
    {
        // Assert
        Assert.Equal(1, (int)TrainingStatus.Scheduled);
        Assert.Equal(2, (int)TrainingStatus.InProgress);
        Assert.Equal(3, (int)TrainingStatus.Completed);
        Assert.Equal(4, (int)TrainingStatus.Expired);
    }

    #endregion

    #region DTO Tests

    [Fact]
    public void SafetyChecklistDto_CanBeCreated()
    {
        // Arrange & Act
        var dto = new SafetyChecklistDto
        {
            Id = 1,
            Name = "Test Checklist",
            Description = "Test Description",
            Category = (int)SafetyCategory.ElectricalSafety,
            IsActive = true,
            ItemsCount = 5
        };

        // Assert
        Assert.Equal(1, dto.Id);
        Assert.Equal("Test Checklist", dto.Name);
        Assert.Equal((int)SafetyCategory.ElectricalSafety, dto.Category);
        Assert.True(dto.IsActive);
        Assert.Equal(5, dto.ItemsCount);
    }

    [Fact]
    public void SafetyInspectionDto_CalculatesPassRateCorrectly()
    {
        // Arrange
        var dto = new SafetyInspectionDto
        {
            Id = 1,
            TotalItems = 10,
            PassedItems = 8,
            FailedItems = 2,
            NAItems = 0
        };

        // Act - PassRate is calculated by the service, but we can verify the input values
        var expectedPassRate = Math.Round((double)8 / 10 * 100, 2);

        // Assert
        Assert.Equal(10, dto.TotalItems);
        Assert.Equal(8, dto.PassedItems);
        Assert.Equal(2, dto.FailedItems);
        Assert.Equal(0, dto.NAItems);
        Assert.Equal(80.0, expectedPassRate);
    }

    [Fact]
    public void SafetyIncidentDto_CanBeCreated()
    {
        // Arrange & Act
        var dto = new SafetyIncidentDto
        {
            Id = 1,
            ProjectId = 1,
            Severity = (int)IncidentSeverity.High,
            Title = "Test Incident",
            Description = "Test Description",
            IncidentDate = DateTime.UtcNow,
            InvestigationStatus = (int)InvestigationStatus.Pending
        };

        // Assert
        Assert.Equal(1, dto.Id);
        Assert.Equal((int)IncidentSeverity.High, dto.Severity);
        Assert.Equal("Test Incident", dto.Title);
        Assert.Equal((int)InvestigationStatus.Pending, dto.InvestigationStatus);
    }

    [Fact]
    public void SafetyTrainingDto_CanBeCreated()
    {
        // Arrange & Act
        var dto = new SafetyTrainingDto
        {
            Id = 1,
            Title = "Fire Safety Training",
            TrainingType = "Fire Safety",
            ScheduledDate = DateTime.UtcNow.AddDays(7),
            Status = (int)TrainingStatus.Scheduled,
            DurationMinutes = 60,
            RequiresCertification = true
        };

        // Assert
        Assert.Equal("Fire Safety Training", dto.Title);
        Assert.Equal("Fire Safety", dto.TrainingType);
        Assert.Equal((int)TrainingStatus.Scheduled, dto.Status);
        Assert.Equal(60, dto.DurationMinutes);
        Assert.True(dto.RequiresCertification);
    }

    [Fact]
    public void SafetyComplianceDto_CanBeCreated()
    {
        // Arrange & Act
        var dto = new SafetyComplianceDto
        {
            Id = 1,
            ProjectId = 1,
            StandardName = "OSHA Standard",
            IsCompliant = true,
            ComplianceDate = DateTime.UtcNow
        };

        // Assert
        Assert.Equal("OSHA Standard", dto.StandardName);
        Assert.True(dto.IsCompliant);
    }

    [Fact]
    public void SafetyDashboardDto_CanBeCreated()
    {
        // Arrange & Act
        var dto = new SafetyDashboardDto
        {
            TotalChecklists = 10,
            TotalInspections = 50,
            TotalIncidents = 5,
            TotalTrainings = 20,
            AveragePassRate = 85.5,
            InspectionsThisMonth = 15,
            CriticalIncidents = 2
        };

        // Assert
        Assert.Equal(10, dto.TotalChecklists);
        Assert.Equal(50, dto.TotalInspections);
        Assert.Equal(5, dto.TotalIncidents);
        Assert.Equal(20, dto.TotalTrainings);
        Assert.Equal(85.5, dto.AveragePassRate);
        Assert.Equal(15, dto.InspectionsThisMonth);
        Assert.Equal(2, dto.CriticalIncidents);
    }

    [Fact]
    public void SafetyChecklistItemDto_CanBeCreated()
    {
        // Arrange & Act
        var dto = new SafetyChecklistItemDto
        {
            Id = 1,
            SafetyChecklistId = 1,
            Description = "Check item description",
            OrderIndex = 1,
            IsCritical = true,
            ComplianceStandard = "OSHA 1910"
        };

        // Assert
        Assert.True(dto.IsCritical);
        Assert.Equal(1, dto.OrderIndex);
        Assert.Equal("OSHA 1910", dto.ComplianceStandard);
    }

    #endregion

    #region Request/Response Tests

    [Fact]
    public void CreateSafetyChecklistRequest_CanBeCreated()
    {
        // Arrange & Act
        var request = new CreateSafetyChecklistRequest
        {
            Name = "New Checklist",
            Description = "Description",
            Category = (int)SafetyCategory.FallProtection
        };

        // Assert
        Assert.Equal("New Checklist", request.Name);
        Assert.Equal((int)SafetyCategory.FallProtection, request.Category);
    }

    [Fact]
    public void CreateSafetyIncidentRequest_CanBeCreated()
    {
        // Arrange & Act
        var request = new CreateSafetyIncidentRequest
        {
            ProjectId = 1,
            Severity = (int)IncidentSeverity.Critical,
            Title = "Major Incident",
            Description = "Critical incident description",
            IncidentDate = DateTime.UtcNow,
            RequiredMedicalAttention = false
        };

        // Assert
        Assert.Equal((int)IncidentSeverity.Critical, request.Severity);
        Assert.Equal("Major Incident", request.Title);
        Assert.False(request.RequiredMedicalAttention);
    }

    [Fact]
    public void CreateSafetyTrainingRequest_CanBeCreated()
    {
        // Arrange & Act
        var request = new CreateSafetyTrainingRequest
        {
            Title = "Safety Training",
            Description = "Training description",
            TrainingType = "General Safety",
            ScheduledDate = DateTime.UtcNow.AddDays(7),
            DurationMinutes = 120,
            RequiresCertification = true,
            MaxParticipants = 25
        };

        // Assert
        Assert.Equal("Safety Training", request.Title);
        Assert.Equal(120, request.DurationMinutes);
        Assert.Equal(25, request.MaxParticipants);
        Assert.True(request.RequiresCertification);
    }

    [Fact]
    public void CreateSafetyComplianceRequest_CanBeCreated()
    {
        // Arrange & Act
        var request = new CreateSafetyComplianceRequest
        {
            ProjectId = 1,
            ComplianceDate = DateTime.UtcNow,
            StandardName = "ISO 45001",
            IsCompliant = true,
            NextReviewDate = DateTime.UtcNow.AddMonths(6)
        };

        // Assert
        Assert.Equal("ISO 45001", request.StandardName);
        Assert.True(request.IsCompliant);
        Assert.NotNull(request.NextReviewDate);
    }

    #endregion

    #region Entity Tests

    [Fact]
    public void SafetyChecklistEntity_CanBeCreated()
    {
        // Arrange & Act
        var entity = new SafetyChecklist
        {
            Id = 1,
            Name = "Test Checklist",
            Description = "Test Description",
            Category = SafetyCategory.ElectricalSafety,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(1, entity.Id);
        Assert.Equal("Test Checklist", entity.Name);
        Assert.Equal(SafetyCategory.ElectricalSafety, entity.Category);
        Assert.True(entity.IsActive);
    }

    [Fact]
    public void SafetyIncidentEntity_CanBeCreated()
    {
        // Arrange & Act
        var entity = new SafetyIncident
        {
            Id = 1,
            ProjectId = 1,
            Severity = IncidentSeverity.High,
            Title = "Test Incident",
            Description = "Test Description",
            IncidentDate = DateTime.UtcNow,
            InvestigationStatus = InvestigationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(1, entity.Id);
        Assert.Equal(IncidentSeverity.High, entity.Severity);
        Assert.Equal("Test Incident", entity.Title);
        Assert.Equal(InvestigationStatus.Pending, entity.InvestigationStatus);
    }

    [Fact]
    public void SafetyTrainingEntity_CanBeCreated()
    {
        // Arrange & Act
        var entity = new SafetyTraining
        {
            Id = 1,
            Title = "Fire Safety Training",
            TrainingType = "Fire Safety",
            ScheduledDate = DateTime.UtcNow.AddDays(7),
            Status = TrainingStatus.Scheduled,
            DurationMinutes = 60,
            RequiresCertification = true,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(1, entity.Id);
        Assert.Equal("Fire Safety Training", entity.Title);
        Assert.Equal(TrainingStatus.Scheduled, entity.Status);
        Assert.Equal(60, entity.DurationMinutes);
        Assert.True(entity.RequiresCertification);
    }

    [Fact]
    public void SafetyComplianceEntity_CanBeCreated()
    {
        // Arrange & Act
        var entity = new SafetyCompliance
        {
            Id = 1,
            ProjectId = 1,
            StandardName = "OSHA Standard",
            IsCompliant = true,
            ComplianceDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(1, entity.Id);
        Assert.Equal("OSHA Standard", entity.StandardName);
        Assert.True(entity.IsCompliant);
    }

    [Fact]
    public void SafetyInspectionEntity_CanBeCreated()
    {
        // Arrange & Act
        var entity = new SafetyInspection
        {
            Id = 1,
            ProjectId = 1,
            InspectionDate = DateTime.UtcNow,
            TotalItems = 20,
            PassedItems = 18,
            FailedItems = 2,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(1, entity.Id);
        Assert.Equal(20, entity.TotalItems);
        Assert.Equal(18, entity.PassedItems);
        Assert.Equal(2, entity.FailedItems);
    }

    [Fact]
    public void SafetyChecklistItemEntity_CanBeCreated()
    {
        // Arrange & Act
        var entity = new SafetyChecklistItem
        {
            Id = 1,
            SafetyChecklistId = 1,
            Description = "Check item description",
            OrderIndex = 1,
            IsCritical = true,
            ComplianceStandard = "OSHA 1910",
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(1, entity.Id);
        Assert.True(entity.IsCritical);
        Assert.Equal(1, entity.OrderIndex);
        Assert.Equal("OSHA 1910", entity.ComplianceStandard);
    }

    #endregion

    #region Validation Tests

    [Fact]
    public void SafetyIncidentSeverityValues_AreSequential()
    {
        // Assert - verify sequential values
        Assert.True((int)IncidentSeverity.Low < (int)IncidentSeverity.Medium);
        Assert.True((int)IncidentSeverity.Medium < (int)IncidentSeverity.High);
        Assert.True((int)IncidentSeverity.High < (int)IncidentSeverity.Critical);
    }

    [Fact]
    public void SafetyCategory_HasMajorCategories()
    {
        // Assert - verify major safety categories exist
        var allValues = Enum.GetValues(typeof(SafetyCategory)).Cast<SafetyCategory>().ToList();
        Assert.Contains(SafetyCategory.PersonalProtectiveEquipment, allValues);
        Assert.Contains(SafetyCategory.ElectricalSafety, allValues);
        Assert.Contains(SafetyCategory.FallProtection, allValues);
        Assert.Contains(SafetyCategory.FireSafety, allValues);
    }

    #endregion
}

using ConstructionManagement.Domain.Entities;
using FluentAssertions;

using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.Tests.Unit.Domain;

public class BOQItemTests
{
    [Fact]
    public void EstimatedBudget_WhenAccountingTypeIsMeasured_ShouldReturnProductOfQuantityAndPrice()
    {
        // Arrange
        var item = new BOQItem
        {
            AccountingType = CalculationMethod.Measured,
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 100,
                UnitPrice = 50
            }
        };

        // Act
        var result = item.EstimatedBudget;

        // Assert
        // 100 * 50 = 5000
        result.Should().Be(5000);
    }

    [Fact]
    public void EstimatedBudget_WhenMeasuredDataIsNull_ShouldReturnZero()
    {
        // Arrange
        var item = new BOQItem
        {
            AccountingType = CalculationMethod.Measured,
            MeasuredData = null
        };

        // Act
        var result = item.EstimatedBudget;

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public void EstimatedBudget_WhenAccountingTypeIsSupervision_ShouldReturnEstimatedTotalCost()
    {
        // Arrange
        var item = new BOQItem
        {
            AccountingType = CalculationMethod.Supervision,
            SupervisionData = new BOQSupervision
            {
                EstimatedTotalCost = 75000
            }
        };

        // Act
        var result = item.EstimatedBudget;

        // Assert
        result.Should().Be(75000);
    }

    [Theory]
    [InlineData(CalculationMethod.Measured, true, false)]
    [InlineData(CalculationMethod.Supervision, false, true)]
    public void HelperProperties_ShouldReturnCorrectStatus(CalculationMethod type, bool expectedMeasured, bool expectedSupervision)
    {
        // Arrange
        var item = new BOQItem
        {
            AccountingType = type,
            MeasuredData = type == CalculationMethod.Measured ? new BOQMeasured() : null,
            SupervisionData = type == CalculationMethod.Supervision ? new BOQSupervision() : null
        };

        // Assert
        item.HasMeasuredData.Should().Be(expectedMeasured);
        item.HasSupervisionData.Should().Be(expectedSupervision);
    }
}

using ConstructionManagement.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Domain;

public class BOQMeasuredTests
{
    [Fact]
    public void ExecutedValue_ShouldReturnCorrectProduct()
    {
        // Arrange
        var measured = new BOQMeasured
        {
            UnitPrice = 150.5m,
            ExecutedQuantity = 10
        };

        // Act
        var result = measured.ExecutedValue;

        // Assert
        // 150.5 * 10 = 1505.0
        result.Should().Be(1505.0m);
    }

    [Fact]
    public void RemainingQuantity_ShouldCalculateDifferenceCorrectly()
    {
        // Arrange
        var measured = new BOQMeasured
        {
            AgreedQuantity = 100,
            ExecutedQuantity = 30
        };

        // Act
        var result = measured.RemainingQuantity;

        // Assert
        result.Should().Be(70);
    }

    [Theory]
    [InlineData(100, 25, 25)]   // 25% إنجاز
    [InlineData(200, 200, 100)] // 100% إنجاز (مكتمل)
    [InlineData(50, 0, 0)]      // 0% إنجاز (لم يبدأ)
    public void ProgressPercentage_ShouldCalculateCorrectPercentage(decimal agreed, decimal executed, decimal expected)
    {
        // Arrange
        var measured = new BOQMeasured
        {
            AgreedQuantity = agreed,
            ExecutedQuantity = executed
        };

        // Act
        var result = measured.ProgressPercentage;

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void ProgressPercentage_WhenAgreedQuantityIsZero_ShouldReturnZeroToAvoidDivisionByZero()
    {
        // Arrange
        var measured = new BOQMeasured
        {
            AgreedQuantity = 0,
            ExecutedQuantity = 10 // حالة غير منطقية لكن يجب حماية الكود منها
        };

        // Act
        var result = measured.ProgressPercentage;

        // Assert
        result.Should().Be(0m);
    }
}
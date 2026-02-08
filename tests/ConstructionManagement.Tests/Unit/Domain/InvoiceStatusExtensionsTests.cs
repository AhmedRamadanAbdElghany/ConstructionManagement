using ConstructionManagement.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Domain;

/// <summary>
/// Unit tests for InvoiceStatus enum and its extensions.
/// </summary>
public class InvoiceStatusExtensionsTests
{
    #region GetDescription Tests

    [Theory]
    [InlineData(InvoiceStatus.Draft, "مسودة")]
    [InlineData(InvoiceStatus.Pending, "قيد المراجعة")]
    [InlineData(InvoiceStatus.Approved, "موافق عليه")]
    [InlineData(InvoiceStatus.Rejected, "مرفوض")]
    [InlineData(InvoiceStatus.Paid, "مدفوع")]
    [InlineData(InvoiceStatus.Cancelled, "ملغى")]
    [InlineData(InvoiceStatus.Voided, "لاغٍ")]
    public void GetDescription_ShouldReturnArabicDescription(InvoiceStatus status, string expected)
    {
        // Act
        var result = status.GetDescription();

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region GetEnglishDescription Tests

    [Theory]
    [InlineData(InvoiceStatus.Draft, "Draft")]
    [InlineData(InvoiceStatus.Pending, "Pending Review")]
    [InlineData(InvoiceStatus.Approved, "Approved")]
    [InlineData(InvoiceStatus.Rejected, "Rejected")]
    [InlineData(InvoiceStatus.Paid, "Paid")]
    [InlineData(InvoiceStatus.Cancelled, "Cancelled")]
    [InlineData(InvoiceStatus.Voided, "Voided")]
    public void GetEnglishDescription_ShouldReturnEnglishDescription(InvoiceStatus status, string expected)
    {
        // Act
        var result = status.GetEnglishDescription();

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region IsTerminalStatus Tests

    [Theory]
    [InlineData(InvoiceStatus.Paid, true)]
    [InlineData(InvoiceStatus.Cancelled, true)]
    [InlineData(InvoiceStatus.Voided, true)]
    [InlineData(InvoiceStatus.Draft, false)]
    [InlineData(InvoiceStatus.Pending, false)]
    [InlineData(InvoiceStatus.Approved, false)]
    [InlineData(InvoiceStatus.Rejected, false)]
    public void IsTerminalStatus_ShouldReturnCorrectValue(InvoiceStatus status, bool expected)
    {
        // Act
        var result = status.IsTerminalStatus();

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region CanEdit Tests

    [Theory]
    [InlineData(InvoiceStatus.Draft, true)]
    [InlineData(InvoiceStatus.Rejected, true)]
    [InlineData(InvoiceStatus.Pending, false)]
    [InlineData(InvoiceStatus.Approved, false)]
    [InlineData(InvoiceStatus.Paid, false)]
    [InlineData(InvoiceStatus.Cancelled, false)]
    [InlineData(InvoiceStatus.Voided, false)]
    public void CanEdit_ShouldReturnCorrectValue(InvoiceStatus status, bool expected)
    {
        // Act
        var result = status.CanEdit();

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region CanReview Tests

    [Theory]
    [InlineData(InvoiceStatus.Pending, true)]
    [InlineData(InvoiceStatus.Draft, false)]
    [InlineData(InvoiceStatus.Approved, false)]
    [InlineData(InvoiceStatus.Rejected, false)]
    [InlineData(InvoiceStatus.Paid, false)]
    [InlineData(InvoiceStatus.Cancelled, false)]
    [InlineData(InvoiceStatus.Voided, false)]
    public void CanReview_ShouldReturnCorrectValue(InvoiceStatus status, bool expected)
    {
        // Act
        var result = status.CanReview();

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region GetAllowedTransitions Tests

    [Fact]
    public void GetAllowedTransitions_Draft_ShouldAllowPendingAndCancelled()
    {
        // Act
        var transitions = InvoiceStatus.Draft.GetAllowedTransitions().ToList();

        // Assert
        transitions.Should().HaveCount(2);
        transitions.Should().Contain(InvoiceStatus.Pending);
        transitions.Should().Contain(InvoiceStatus.Cancelled);
    }

    [Fact]
    public void GetAllowedTransitions_Pending_ShouldAllowApprovedRejectedAndDraft()
    {
        // Act
        var transitions = InvoiceStatus.Pending.GetAllowedTransitions().ToList();

        // Assert
        transitions.Should().HaveCount(3);
        transitions.Should().Contain(InvoiceStatus.Approved);
        transitions.Should().Contain(InvoiceStatus.Rejected);
        transitions.Should().Contain(InvoiceStatus.Draft);
    }

    [Fact]
    public void GetAllowedTransitions_Approved_ShouldAllowPaidAndCancelled()
    {
        // Act
        var transitions = InvoiceStatus.Approved.GetAllowedTransitions().ToList();

        // Assert
        transitions.Should().HaveCount(2);
        transitions.Should().Contain(InvoiceStatus.Paid);
        transitions.Should().Contain(InvoiceStatus.Cancelled);
    }

    [Fact]
    public void GetAllowedTransitions_Rejected_ShouldAllowDraftAndCancelled()
    {
        // Act
        var transitions = InvoiceStatus.Rejected.GetAllowedTransitions().ToList();

        // Assert
        transitions.Should().HaveCount(2);
        transitions.Should().Contain(InvoiceStatus.Draft);
        transitions.Should().Contain(InvoiceStatus.Cancelled);
    }

    [Fact]
    public void GetAllowedTransitions_Paid_ShouldReturnEmpty()
    {
        // Act
        var transitions = InvoiceStatus.Paid.GetAllowedTransitions().ToList();

        // Assert
        transitions.Should().BeEmpty();
    }

    #endregion

    #region CanTransitionTo Tests

    [Theory]
    [InlineData(InvoiceStatus.Draft, InvoiceStatus.Pending, true)]
    [InlineData(InvoiceStatus.Draft, InvoiceStatus.Cancelled, true)]
    [InlineData(InvoiceStatus.Draft, InvoiceStatus.Paid, false)]
    [InlineData(InvoiceStatus.Pending, InvoiceStatus.Approved, true)]
    [InlineData(InvoiceStatus.Pending, InvoiceStatus.Rejected, true)]
    [InlineData(InvoiceStatus.Pending, InvoiceStatus.Draft, true)]
    [InlineData(InvoiceStatus.Pending, InvoiceStatus.Paid, false)]
    [InlineData(InvoiceStatus.Approved, InvoiceStatus.Paid, true)]
    [InlineData(InvoiceStatus.Approved, InvoiceStatus.Rejected, false)]
    public void CanTransitionTo_ShouldReturnCorrectValue(InvoiceStatus from, InvoiceStatus to, bool expected)
    {
        // Act
        var result = from.CanTransitionTo(to);

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region CanCancel Tests

    [Theory]
    [InlineData(InvoiceStatus.Draft, true)]
    [InlineData(InvoiceStatus.Rejected, true)]
    [InlineData(InvoiceStatus.Pending, false)] // Cannot cancel while pending review
    [InlineData(InvoiceStatus.Approved, false)]
    [InlineData(InvoiceStatus.Paid, false)]
    [InlineData(InvoiceStatus.Cancelled, false)]
    [InlineData(InvoiceStatus.Voided, false)]
    public void CanCancel_ShouldReturnCorrectValue(InvoiceStatus status, bool expected)
    {
        // Act
        var result = status.CanCancel();

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region FromString Tests

    [Theory]
    [InlineData("Pending", InvoiceStatus.Pending)]
    [InlineData("pending", InvoiceStatus.Pending)]
    [InlineData("PENDING", InvoiceStatus.Pending)]
    [InlineData("Approved", InvoiceStatus.Approved)]
    [InlineData("approved", InvoiceStatus.Approved)]
    [InlineData("paid", InvoiceStatus.Paid)]
    [InlineData("PAID", InvoiceStatus.Paid)]
    [InlineData("Cancelled", InvoiceStatus.Cancelled)]
    [InlineData("canceled", InvoiceStatus.Cancelled)]
    [InlineData("Draft", InvoiceStatus.Draft)]
    [InlineData("Voided", InvoiceStatus.Voided)]
    public void FromString_ShouldParseValidValues(string input, InvoiceStatus expected)
    {
        // Act
        var result = InvoiceStatusExtensions.FromString(input);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("invalid")]
    [InlineData("unknown")]
    public void FromString_ShouldReturnNullForInvalidValues(string? input)
    {
        // Act
        var result = InvoiceStatusExtensions.FromString(input);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region ToDatabaseString Tests

    [Theory]
    [InlineData(InvoiceStatus.Pending, "Pending")]
    [InlineData(InvoiceStatus.Approved, "Approved")]
    [InlineData(InvoiceStatus.Paid, "Paid")]
    public void ToDatabaseString_ShouldReturnEnumName(InvoiceStatus status, string expected)
    {
        // Act
        var result = status.ToDatabaseString();

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region GetColorCode Tests

    [Theory]
    [InlineData(InvoiceStatus.Draft, "secondary")]
    [InlineData(InvoiceStatus.Pending, "warning")]
    [InlineData(InvoiceStatus.Approved, "success")]
    [InlineData(InvoiceStatus.Rejected, "danger")]
    [InlineData(InvoiceStatus.Paid, "info")]
    [InlineData(InvoiceStatus.Cancelled, "dark")]
    [InlineData(InvoiceStatus.Voided, "light")]
    public void GetColorCode_ShouldReturnBootstrapColorCode(InvoiceStatus status, string expected)
    {
        // Act
        var result = status.GetColorCode();

        // Assert
        result.Should().Be(expected);
    }

    #endregion

    #region GetIconClass Tests

    [Theory]
    [InlineData(InvoiceStatus.Draft, "bi-file-earmark-text")]
    [InlineData(InvoiceStatus.Pending, "bi-clock-history")]
    [InlineData(InvoiceStatus.Approved, "bi-check-circle")]
    [InlineData(InvoiceStatus.Rejected, "bi-x-circle")]
    [InlineData(InvoiceStatus.Paid, "bi-currency-dollar")]
    [InlineData(InvoiceStatus.Cancelled, "bi-x-lg")]
    [InlineData(InvoiceStatus.Voided, "bi-ban")]
    public void GetIconClass_ShouldReturnBootstrapIconClass(InvoiceStatus status, string expected)
    {
        // Act
        var result = status.GetIconClass();

        // Assert
        result.Should().Be(expected);
    }

    #endregion
}

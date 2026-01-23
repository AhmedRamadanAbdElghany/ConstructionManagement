using ConstructionManagement.Domain.Entities;
using FluentAssertions;

namespace ConstructionManagement.Tests.Unit.Domain;

public class BOQItemNoteTests
{
    [Fact]
    public void BOQItemNote_ShouldHaveDefaultValues_UponInitialization()
    {
        // Arrange & Act
        var note = new BOQItemNote();

        // Assert
        note.NoteType.Should().Be("General");
        note.VisibleToRole.Should().Be("SiteEngineer");
        note.NoteText.Should().BeEmpty();
    }

    [Fact]
    public void BOQItemNote_ShouldAssignPropertiesCorrectly()
    {
        // Arrange
        var noteText = "هناك مشكلة في جودة صب الخرسانة في هذا البند";
        var type = "QualityIssue";
        var creatorId = 5;

        // Act
        var note = new BOQItemNote
        {
            NoteText = noteText,
            NoteType = type,
            CreatorUserId = creatorId,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        note.NoteText.Should().Be(noteText);
        note.NoteType.Should().Be(type);
        note.CreatorUserId.Should().Be(creatorId);
    }

    [Fact]
    public void RelatedMedia_ShouldBeNullable_WhenNoEvidenceProvided()
    {
        // Arrange
        var note = new BOQItemNote
        {
            NoteText = "ملاحظة بدون صورة",
            RelatedMediaId = null
        };

        // Assert
        note.RelatedMediaId.Should().BeNull();
        note.RelatedMedia.Should().BeNull();
    }

    [Fact]
    public void RelatedMedia_ShouldLinkCorrectId_WhenEvidenceIsAttached()
    {
        // Arrange
        int mediaId = 101;
        var note = new BOQItemNote
        {
            NoteText = "ملاحظة مع صورة دليل",
            RelatedMediaId = mediaId
        };

        // Assert
        note.RelatedMediaId.Should().NotBeNull();
        note.RelatedMediaId.Should().Be(mediaId);
    }
}
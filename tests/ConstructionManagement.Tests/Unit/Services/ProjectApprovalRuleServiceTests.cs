using ConstructionManagement.Application.DTOs.ProjectApprovalRule;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using MockQueryable.Moq;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class ProjectApprovalRuleServiceTests
{
    private readonly Mock<IRepository<ProjectApprovalRule>> _ruleRepoMock = new();
    private readonly Mock<IRepository<Project>> _projectRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    private ProjectApprovalRuleService CreateService() =>
        new(_ruleRepoMock.Object, _projectRepoMock.Object, _uowMock.Object);

    #region Create Rule Tests

    [Fact]
    public async Task CreateRuleAsync_ShouldSaveAndReturnId_WhenDataIsValid()
    {
        // Arrange
        var projectId = 1;
        var request = new CreateApprovalRuleRequest(SourceType.OnlineUpload, "Engineer", "Project Manager", 24);

        var projects = new List<Project> { new Project { Id = projectId } }.BuildMock();
        _projectRepoMock.Setup(r => r.AsQueryable()).Returns(projects);

        _ruleRepoMock.Setup(r => r.AddAsync(It.IsAny<ProjectApprovalRule>()))
            .Callback<ProjectApprovalRule>(r => r.Id = 101)
            .ReturnsAsync((ProjectApprovalRule r) => r);

        var service = CreateService();

        // Act
        var result = await service.CreateRuleAsync(projectId, request);

        // Assert
        result.Should().Be(101);
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateRuleAsync_ShouldThrowException_WhenProjectDoesNotExist()
    {
        // Arrange
        _projectRepoMock.Setup(r => r.AsQueryable()).Returns(new List<Project>().BuildMock());
        var service = CreateService();
        var request = new CreateApprovalRuleRequest(SourceType.OnlineUpload, "Eng", "PM", 12);

        // Act
        var act = async () => await service.CreateRuleAsync(999, request);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("المشروع غير موجود");
    }

    [Theory]
    [InlineData("", "PM")]
    [InlineData("Engineer", " ")]
    public async Task CreateRuleAsync_ShouldThrowException_WhenRolesAreMissing(string uploader, string approver)
    {
        // Arrange
        var projectId = 1;
        _projectRepoMock.Setup(r => r.AsQueryable()).Returns(new List<Project> { new Project { Id = projectId } }.BuildMock());
        var service = CreateService();
        var request = new CreateApprovalRuleRequest(SourceType.OnlineUpload, uploader, approver, 12);

        // Act
        var act = async () => await service.CreateRuleAsync(projectId, request);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>().WithMessage("الرولات مطلوبة");
    }

    #endregion

    #region Applicable Rule Logic (Priority Tests)

    [Fact]
    public async Task GetApplicableRuleAsync_ShouldReturnSpecificRule_IfExits()
    {
        // Arrange
        var projectId = 1;
        var boqId = 55;
        var sourceType = SourceType.OnlineUpload;

        var rules = new List<ProjectApprovalRule>
        {
            new ProjectApprovalRule { Id = 1, ProjectId = projectId, BOQItemId = null, Source = sourceType },
            new ProjectApprovalRule { Id = 2, ProjectId = projectId, BOQItemId = boqId, Source = sourceType }
        }.BuildMock();

        _ruleRepoMock.Setup(r => r.AsQueryable()).Returns(rules);
        var service = CreateService();

        // Act
        var result = await service.GetApplicableRuleAsync(projectId, boqId, sourceType);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(2); // الأولوية للبند المحدد
    }

    [Fact]
    public async Task GetApplicableRuleAsync_ShouldFallbackToDefaultRule_WhenSpecificRuleDoesNotExist()
    {
        // Arrange
        var projectId = 1;
        var boqId = 99; // بند ليس له قاعدة خاصة
        var sourceType = SourceType.OnlineUpload;

        var rules = new List<ProjectApprovalRule>
        {
            new ProjectApprovalRule { Id = 1, ProjectId = projectId, BOQItemId = null, Source = sourceType }
        }.BuildMock();

        _ruleRepoMock.Setup(r => r.AsQueryable()).Returns(rules);
        var service = CreateService();

        // Act
        var result = await service.GetApplicableRuleAsync(projectId, boqId, sourceType);

        // Assert
        result.Should().NotBeNull();
        result!.BOQItemId.Should().BeNull(); // تم الرجوع للقاعدة العامة
        result.Id.Should().Be(1);
    }

    #endregion

    #region Retrieval Tests

    [Fact]
    public async Task GetRulesForProjectAsync_ShouldReturnList()
    {
        // Arrange
        var projectId = 1;
        var rules = new List<ProjectApprovalRule>
        {
            new ProjectApprovalRule { Id = 1, ProjectId = projectId },
            new ProjectApprovalRule { Id = 2, ProjectId = projectId },
            new ProjectApprovalRule { Id = 3, ProjectId = 2 } // لمشروع آخر
        }.BuildMock();

        _ruleRepoMock.Setup(r => r.AsQueryable()).Returns(rules);
        var service = CreateService();

        // Act
        var result = await service.GetRulesForProjectAsync(projectId);

        // Assert
        result.Should().HaveCount(2);
        result.All(r => r.ProjectId == projectId).Should().BeTrue();
    }

    #endregion
}
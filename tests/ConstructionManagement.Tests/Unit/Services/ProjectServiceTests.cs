using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;

namespace ConstructionManagement.Tests.Unit.Services;

public class ProjectServiceTests
{
    // تعريف الموكس بأسماء واضحة وموحدة
    private readonly Mock<IRepository<Project>> _projectRepo = new();
    private readonly Mock<IRepository<UserRole>> _userRoleRepo = new();
    private readonly Mock<IRepository<User>> _userRepo = new();
    private readonly Mock<IRepository<ProjectSettings>> _settingsRepo = new();
    private readonly Mock<IUnitOfWork> _uowMock = new(); // تأكد أن الاسم هنا هو المستخدم بالأسفل

    private ProjectService CreateService() =>
        new(_projectRepo.Object, _userRoleRepo.Object, _userRepo.Object, _settingsRepo.Object, _uowMock.Object);

    [Fact]
    public async Task CreateProjectAsync_ValidRequest_CommitsTransaction()
    {
        // Arrange
        int gmId = 1;
        var request = new CreateProjectRequest("Project A", "Desc", DateTime.UtcNow, null, gmId, "Measured", 1000000);

        _userRepo.Setup(r => r.ExistsAsync(gmId)).ReturnsAsync(true);
        var service = CreateService();

        // Act
        var result = await service.CreateProjectAsync(request, 1);

        // Assert
        _uowMock.Verify(u => u.BeginTransactionAsync(), Times.Once());
        _uowMock.Verify(u => u.CommitAsync(), Times.Once());
        _projectRepo.Verify(r => r.AddAsync(It.IsAny<Project>()), Times.Once());
    }

    [Fact]
    public async Task CreateProjectAsync_WhenExceptionOccursDuringSave_RollsBack()
    {
        // Arrange
        int gmId = 1;
        var request = new CreateProjectRequest("Project B", "Desc", DateTime.UtcNow, null, gmId, "Supervision", 500000);

        _userRepo.Setup(r => r.ExistsAsync(gmId)).ReturnsAsync(true);

        // إجبار الخطأ عند إضافة الإعدادات
        _settingsRepo.Setup(r => r.AddAsync(It.IsAny<ProjectSettings>()))
            .ThrowsAsync(new System.Exception("DB Error"));

        var service = CreateService();

        // Act
        var act = async () => await service.CreateProjectAsync(request, 1);

        // Assert
        await act.Should().ThrowAsync<System.Exception>();
        _uowMock.Verify(u => u.RollbackAsync(), Times.Once()); // تم التصحيح هنا من _unitOfWork إلى _uowMock
    }

    [Fact]
    public async Task UpdateProjectAsync_WhenValid_ShouldUpdateFields()
    {
        // Arrange
        int projectId = 1, userId = 10;
        var project = new Project { Id = projectId, OwnerUserId = userId, IsClosed = false };

        var request = new UpdateProjectRequest(
            ProjectName: "New Name",
            Description: "New Desc",
            StartDate: null,
            EndDate: null,
            TotalContractValue: 500000,
            GeneralManagerUserId: 5
        );

        _projectRepo.Setup(r => r.GetByIdAsync(projectId)).ReturnsAsync(project);
        _projectRepo.Setup(r => r.AsQueryable()).Returns(new List<Project> { project }.BuildMock());
        _userRoleRepo.Setup(r => r.AsQueryable()).Returns(new List<UserRole>().BuildMock());
        _userRepo.Setup(r => r.ExistsAsync(5)).ReturnsAsync(true);

        var service = CreateService();

        // Act
        var result = await service.UpdateProjectAsync(projectId, request, userId);

        // Assert
        result.Should().BeTrue();
        project.ProjectName.Should().Be("New Name");
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce());
    }

    [Fact]
    public async Task CloseProjectAsync_WhenUserIsOwner_UpdatesStatus()
    {
        // Arrange
        int projectId = 1, userId = 10;
        var project = new Project { Id = projectId, OwnerUserId = userId, IsClosed = false };

        _projectRepo.Setup(r => r.GetByIdAsync(projectId)).ReturnsAsync(project);
        _projectRepo.Setup(r => r.AsQueryable()).Returns(new List<Project> { project }.BuildMock());
        _userRoleRepo.Setup(r => r.AsQueryable()).Returns(new List<UserRole>().BuildMock());

        var service = CreateService();

        // Act
        var result = await service.CloseProjectAsync(projectId, userId);

        // Assert
        result.Should().BeTrue();
        project.IsClosed.Should().BeTrue();
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce());
    }

    [Fact]
    public async Task GetProjectsByUserAsync_ShouldFilterByTeamMember()
    {
        // Arrange
        int userId = 1;
        var projects = new List<Project>
        {
            new Project { Id = 1, OwnerUserId = userId, TeamMembers = new List<ProjectTeamMember>() },
            new Project { Id = 2, OwnerUserId = 99, TeamMembers = new List<ProjectTeamMember>() }
        }.BuildMock();

        _projectRepo.Setup(r => r.AsQueryable()).Returns(projects);
        var service = CreateService();

        // Act
        var result = await service.GetProjectsByUserAsync(userId);

        // Assert
        result.Should().HaveCount(1);
    }
}

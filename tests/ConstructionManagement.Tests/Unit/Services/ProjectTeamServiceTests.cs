using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;

namespace ConstructionManagement.Tests.Unit.Services;

public class ProjectTeamServiceTests
{
    private readonly Mock<IRepository<ProjectTeamMember>> _teamRepo = new();
    private readonly Mock<IRepository<ProjectRole>> _roleRepo = new();
    private readonly Mock<IRepository<ProjectTeamRole>> _teamRoleRepo = new();
    private readonly Mock<IRepository<User>> _userRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new(); // إضافة الموك

    private ProjectTeamService CreateService() =>
        new(_teamRepo.Object, _roleRepo.Object, _teamRoleRepo.Object, _userRepo.Object, _unitOfWork.Object);

    [Fact]
    public async Task AddTeamMemberAsync_WhenValid_ShouldSaveAndCallUnitOfWork()
    {
        // Arrange
        int projectId = 10, userId = 1;
        _userRepo.Setup(r => r.ExistsAsync(userId)).ReturnsAsync(true);
        _teamRepo.Setup(r => r.AsQueryable()).Returns(new List<ProjectTeamMember>().BuildMock());

        var service = CreateService();

        // Act
        await service.AddTeamMemberAsync(projectId, userId, null);

        // Assert
        _teamRepo.Verify(r => r.AddAsync(It.IsAny<ProjectTeamMember>()), Times.Once());
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once()); // التأكد من الحفظ
    }

    [Fact]
    public async Task AddTeamMemberAsync_WhenUserReportsToHimself_ThrowsException()
    {
        // Arrange
        int userId = 1;
        _userRepo.Setup(r => r.ExistsAsync(userId)).ReturnsAsync(true);
        var service = CreateService();

        // Act & Assert
        await service.Invoking(s => s.AddTeamMemberAsync(10, userId, userId))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*نفسه*");

        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Never()); // لا يجب الحفظ في حالة الخطأ
    }

    [Fact]
    public async Task AssignRoleToMemberAsync_WhenValid_ShouldCallSaveChangesAsync()
    {
        // Arrange
        int teamId = 1, roleId = 1;
        _teamRoleRepo.Setup(r => r.AsQueryable()).Returns(new List<ProjectTeamRole>().BuildMock());
        var service = CreateService();

        // Act
        await service.AssignRoleToMemberAsync(teamId, roleId);

        // Assert
        _teamRoleRepo.Verify(r => r.AddAsync(It.IsAny<ProjectTeamRole>()), Times.Once());
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task GetProjectTeamAsync_ReturnsCorrectDataWithRoles()
    {
        // Arrange
        int projectId = 1;
        var teamList = new List<ProjectTeamMember>
        {
            new ProjectTeamMember
            {
                Id = 1, ProjectId = projectId, UserId = 5,
                User = new User { FullName = "Ahmed Ramadan" },
                ProjectTeamRoles = new List<ProjectTeamRole> {
                    new ProjectTeamRole { ProjectRole = new ProjectRole { Name = "Manager" } }
                }
            }
        }.BuildMock();

        _teamRepo.Setup(r => r.AsQueryable()).Returns(teamList);
        var service = CreateService();

        // Act
        var result = await service.GetProjectTeamAsync(projectId);

        // Assert
        result.Should().HaveCount(1);
        result[0].UserFullName.Should().Be("Ahmed Ramadan");
        result[0].Roles.Should().Contain("Manager");
    }
}
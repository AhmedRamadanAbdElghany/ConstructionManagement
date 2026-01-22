﻿using ConstructionManagement.Application.DTOs;
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

public class RoleServiceTests
{
    private readonly Mock<IRepository<Role>> _roleRepo = new();
    private readonly Mock<IRepository<UserRole>> _userRoleRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new(); // إضافة الموك

    private RoleService CreateService() =>
        new(_roleRepo.Object, _userRoleRepo.Object, _unitOfWork.Object);

    private void SetupAdmin(int adminId, bool isSuper)
    {
        var roles = isSuper
            ? new List<UserRole> { new UserRole { UserId = adminId, Role = new Role { Name = "SuperAdmin" } } }
            : new List<UserRole>();
        _userRoleRepo.Setup(r => r.AsQueryable()).Returns(roles.BuildMock());
    }

    [Fact]
    public async Task AddRoleAsync_ShouldSaveCorrectlyAndCallUnitOfWork()
    {
        // Arrange
        SetupAdmin(1, true);
        _roleRepo.Setup(r => r.AsQueryable()).Returns(new List<Role>().BuildMock());
        var service = CreateService();

        // Act
        await service.AddRoleAsync(new AddRoleRequest("Manager", "Desc"), 1);

        // Assert
        _roleRepo.Verify(r => r.AddAsync(It.Is<Role>(role => role.Name == "Manager")), Times.Once());
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once()); // التأكد من استدعاء الحفظ
    }

    [Fact]
    public async Task DeleteRoleAsync_WhenValid_ShouldCallSaveChangesAsync()
    {
        // Arrange
        SetupAdmin(1, true);
        var role = new Role { Id = 5, Name = "Engineer" };
        _roleRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(role);
        var service = CreateService();

        // Act
        await service.DeleteRoleAsync(5, 1);

        // Assert
        _roleRepo.Verify(r => r.DeleteAsync(role), Times.Once());
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task AddRoleAsync_WhenDuplicateName_ThrowsExceptionAndDoesNotSave()
    {
        // Arrange
        SetupAdmin(1, true);
        var existingRoles = new List<Role> { new Role { Name = "Admin" } };
        _roleRepo.Setup(r => r.AsQueryable()).Returns(existingRoles.BuildMock());
        var service = CreateService();

        // Act
        var act = async () => await service.AddRoleAsync(new AddRoleRequest("Admin", "Desc"), 1);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>();
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Never()); // التأكد من عدم الحفظ في حالة الخطأ
    }

    [Fact]
    public async Task DeleteRoleAsync_WhenDeletingSuperAdmin_ThrowsException()
    {
        // Arrange
        SetupAdmin(1, true);
        var role = new Role { Id = 10, Name = "SuperAdmin" };
        _roleRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(role);

        var service = CreateService();

        // Act & Assert
        await service.Invoking(s => s.DeleteRoleAsync(10, 1))
            .Should().ThrowAsync<InvalidOperationException>().WithMessage("*مدير النظام الأساسي*");

        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Never());
    }
}
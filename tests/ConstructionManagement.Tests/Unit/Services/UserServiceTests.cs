﻿using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using MockQueryable.Moq;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class UserServiceTests
{
    private readonly Mock<IRepository<User>> _userRepo = new();
    private readonly Mock<IRepository<Role>> _roleRepo = new();
    private readonly Mock<IRepository<UserRole>> _userRoleRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new(); // إضافة الموك

    private UserService CreateService()
    {
        return new UserService(
            _userRepo.Object,
            _roleRepo.Object,
            _userRoleRepo.Object,
            _unitOfWork.Object); // تمرير الموك للخدمة
    }

    private void SetupAdminPermission(int adminId, bool hasPermission)
    {
        var userRolesList = hasPermission
            ? new List<UserRole> { new UserRole { UserId = adminId, Role = new Role { Name = "SuperAdmin" } } }
            : new List<UserRole>();

        _userRoleRepo.Setup(r => r.AsQueryable()).Returns(userRolesList.BuildMock());
    }

    [Fact]
    public async Task AddUserAsync_ShouldHashPasswordAndSaveThroughUnitOfWork()
    {
        // Arrange
        SetupAdminPermission(adminId: 1, hasPermission: true);
        _userRepo.Setup(r => r.AsQueryable()).Returns(new List<User>().BuildMock());

        var service = CreateService();
        var request = new AddUserRequest("Ahmed", "ahmed@test.com", "PlainPassword123");

        // Act
        await service.AddUserAsync(request, 1);

        // Assert
        // التأكد من إضافة المستخدم
        _userRepo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once());
        // التأكد من استدعاء الحفظ النهائي عبر Unit of Work
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task DeleteUserAsync_WhenValid_ShouldCallSaveChangesAsync()
    {
        // Arrange
        int adminId = 1, targetUserId = 2;
        SetupAdminPermission(adminId, true);
        var user = new User { Id = targetUserId };
        _userRepo.Setup(r => r.GetByIdAsync(targetUserId)).ReturnsAsync(user);

        var service = CreateService();

        // Act
        await service.DeleteUserAsync(targetUserId, adminId);

        // Assert
        _userRepo.Verify(r => r.DeleteAsync(user), Times.Once());
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task AssignRoleToUserAsync_WhenNewRole_ShouldSaveThroughUnitOfWork()
    {
        // Arrange
        int userId = 10, roleId = 5, adminId = 1;
        SetupAdminPermission(adminId, true);

        _roleRepo.Setup(r => r.AsQueryable())
            .Returns(new List<Role> { new Role { Id = roleId, Name = "Engineer" } }.BuildMock());

        var service = CreateService();

        // Act
        await service.AssignRoleToUserAsync(userId, "Engineer", adminId);

        // Assert
        _userRoleRepo.Verify(r => r.AddAsync(It.IsAny<UserRole>()), Times.Once());
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once());
    }
}
﻿using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using MockQueryable;
using MockQueryable.Moq;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class SiteMediaServiceTests
{
    private readonly Mock<IRepository<SiteMedia>> _mediaRepo = new();
    private readonly Mock<IRepository<ProjectSettings>> _settingsRepo = new();
    private readonly Mock<IFileStorageService> _fileStorage = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private SiteMediaService CreateService() =>
        new SiteMediaService(
            _mediaRepo.Object,
            _settingsRepo.Object,
            _fileStorage.Object,
            _unitOfWork.Object
        );

    [Fact]
    public async Task UploadMediaAsync_ShouldCallUnitOfWorkSave_WhenSettingsExist()
    {
        // Arrange
        const int projectId = 1;
        const int userId = 10;
        const string filePath = "path/to/file.jpg";

        var fileMock = new Mock<IFormFile>();

        // ProjectSettings with shared PK = projectId
        var settingsList = new List<ProjectSettings>
        {
            new ProjectSettings
            {
                Id = projectId,               // ← shared PK = projectId
                EnablePhotoUpload = true,
                RequirePhotoReview = false
            }
        }.BuildMock();

        _settingsRepo.Setup(r => r.AsQueryable())
            .Returns(settingsList);

        _fileStorage.Setup(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync(filePath);

        _mediaRepo.Setup(r => r.AddAsync(It.IsAny<SiteMedia>()))
            .Callback<SiteMedia>(m => m.Id = 999) // Simulate DB-generated ID
            .ReturnsAsync((SiteMedia m) => m);

        var service = CreateService();

        // Act
        var result = await service.UploadMediaAsync(
            boqItemId: null,
            projectId: projectId,
            mediaType: "Photo",
            description: "Desc",
            file: fileMock.Object,
            uploaderUserId: userId,
            source: SourceType.OnlineUpload
        );

        // Assert
        result.Should().Be(999);

        _mediaRepo.Verify(r => r.AddAsync(It.Is<SiteMedia>(m =>
            m.ProjectId == projectId &&
            m.UploaderUserId == userId &&
            m.FilePath == filePath &&
            m.MediaType == "Photo" &&
            m.Source == SourceType.OnlineUpload
        )), Times.Once());

        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task UploadMediaAsync_ShouldThrowException_WhenSettingsNotFound()
    {
        // Arrange
        const int projectId = 99; // Non-existent project

        var fileMock = new Mock<IFormFile>();

        _settingsRepo.Setup(r => r.AsQueryable())
            .Returns(new List<ProjectSettings>().BuildMock());

        var service = CreateService();

        // Act
        var act = async () => await service.UploadMediaAsync(
            boqItemId: null,
            projectId: projectId,
            mediaType: "Photo",
            description: "Desc",
            file: fileMock.Object,
            uploaderUserId: 1,
            source: SourceType.OnlineUpload
        );

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("إعدادات المشروع غير موجودة.");
    }
}
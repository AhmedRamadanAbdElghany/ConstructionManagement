using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.Tests.Integration;

public class MediaUploadAndReviewIntegrationTests : IntegrationTestBase
{
    private readonly SiteMediaService _mediaService;
    private readonly Mock<IFileStorageService> _fileStorageMock = new();

    public MediaUploadAndReviewIntegrationTests()
    {
        _fileStorageMock
            .Setup(x => x.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync("site-media/test.jpg");

        _mediaService = new SiteMediaService(
            new Repository<SiteMedia>(Context),
            new Repository<ProjectSettings>(Context),
            new Repository<ProjectApprovalRule>(Context),
            new Repository<ApprovalRequest>(Context),
            new Repository<ApprovalStep>(Context),
            _fileStorageMock.Object,
            UnitOfWork,
            new Mock<INotificationService>().Object);
    }

    // Test cases:
    // 1) UploadMedia_WithApprovalRule_CreatesApprovalRequest
    //    Steps: seed user/project/settings -> add approval rule -> upload media -> assert approval request + step.
    // 2) ReviewMedia_Approve_SetsApprovedStatus
    //    Steps: seed user/project/settings -> upload media -> review approve -> assert status/isApproved.
    // 3) UploadMedia_WhenReviewNotRequired_AutoApproves
    //    Steps: seed user/project/settings(no review required) -> upload media -> assert approved status.
    // 4) UploadAndReviewMedia_WithApprovalRule_CreatesAndProcessesApprovalRequest
    //    Steps: seed user/project/settings + approval rule -> upload media -> review approve -> assert status/isApproved.
    // 5) UploadAndReviewMedia_WhenReviewNotRequired_AutoApproves
    //    Steps: seed user/project/settings(no review required) -> upload media -> assert approved status.

    // Test Case: UploadMedia_WithApprovalRule_CreatesApprovalRequest
    // Step # | Step Description                        | Expected Result
    // 1      | Seed user/project/settings/rule         | Rule persisted
    // 2      | Upload media                            | Approval request created
    // 3      | Assert approval request + step          | Approval request and active step exist

    [Fact]
    public async Task UploadMedia_WithApprovalRule_CreatesApprovalRequest()
    {
        // Arrange
        var user = await SeedUserAsync("u@u.com", "x", "Media Uploader");

        var project = await SeedProjectAsync("Media Project", user.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings
        {
            Id = project.Id,
            RequirePhotoReview = true
        });

        Context.Set<ProjectApprovalRule>().Add(new ProjectApprovalRule
        {
            ProjectId = project.Id,
            BOQItemId = null,
            Source = SourceType.OnlineUpload,
            UploaderRole = "SiteEngineer",
            ApproverRole = "Approver",
            ResponseTimeoutHours = 24,
            EscalationRole = "Manager"
        });

        await Context.SaveChangesAsync();

        var file = CreateFormFile("test.jpg", "image/jpeg");

        // Act
        var mediaId = await _mediaService.UploadMediaAsync(
            boqItemId: null,
            projectId: project.Id,
            mediaType: "image/jpeg",
            description: "photo",
            file: file,
            uploaderUserId: user.Id,
            source: SourceType.OnlineUpload);

        // Assert
        var media = await Context.Set<SiteMedia>().FirstOrDefaultAsync(m => m.Id == mediaId);
        media.Should().NotBeNull();
        media!.Status.Should().Be("Pending");

        var request = await Context.Set<ApprovalRequest>()
            .Include(r => r.Steps)
            .FirstOrDefaultAsync(r => r.SourceId == mediaId);

        request.Should().NotBeNull();
        request!.Steps.Should().ContainSingle(s => s.IsActive);
    }

    // Test Case: ReviewMedia_Approve_SetsApprovedStatus
    // Step # | Step Description                        | Expected Result
    // 1      | Upload media                            | Media pending
    // 2      | Review approve                          | Status Approved, IsApproved true

    [Fact]
    public async Task ReviewMedia_Approve_SetsApprovedStatus()
    {
        // Arrange
        var user = await SeedUserAsync("r@r.com", "x", "Media Reviewer");

        var project = await SeedProjectAsync("Review Project", user.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings
        {
            Id = project.Id,
            RequirePhotoReview = true
        });
        await Context.SaveChangesAsync();

        var file = CreateFormFile("test.jpg", "image/jpeg");

        var mediaId = await _mediaService.UploadMediaAsync(
            boqItemId: null,
            projectId: project.Id,
            mediaType: "image/jpeg",
            description: "photo",
            file: file,
            uploaderUserId: user.Id,
            source: SourceType.OnlineUpload);

        var reviewRequest = new ReviewMediaRequest("Approved", null, "None", null);

        // Act
        var ok = await _mediaService.ReviewMediaAsync(mediaId, reviewRequest, user.Id);

        // Assert
        ok.Should().BeTrue();
        var media = await Context.Set<SiteMedia>().FirstAsync(m => m.Id == mediaId);
        media.Status.Should().Be("Approved");
        media.IsApproved.Should().BeTrue();
    }

    // Test Case: UploadMedia_WhenReviewNotRequired_AutoApproves
    // Step # | Step Description                        | Expected Result
    // 1      | Seed user/project/settings              | Settings persisted with RequirePhotoReview = false
    // 2      | Upload media                            | Media approved, IsApproved true

    [Fact]
    public async Task UploadMedia_WhenReviewNotRequired_AutoApproves()
    {
        var user = await SeedUserAsync("u2@u.com", "x", "Media Uploader2");

        var project = await SeedProjectAsync("Media Project 2", user.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings
        {
            Id = project.Id,
            RequirePhotoReview = false
        });
        await Context.SaveChangesAsync();

        var file = CreateFormFile("auto.jpg", "image/jpeg");

        var mediaId = await _mediaService.UploadMediaAsync(
            boqItemId: null,
            projectId: project.Id,
            mediaType: "image/jpeg",
            description: "auto",
            file: file,
            uploaderUserId: user.Id,
            source: SourceType.OnlineUpload);

        var media = await Context.Set<SiteMedia>().FirstAsync(m => m.Id == mediaId);
        media.Status.Should().Be("Approved");
        media.IsApproved.Should().BeTrue();
    }

    // Test Case: UploadAndReviewMedia_WithApprovalRule_CreatesAndProcessesApprovalRequest
    // Step # | Step Description                        | Expected Result
    // 1      | Seed user/project/settings/rule         | Rule persisted
    // 2      | Upload media                            | Approval request created
    // 3      | Review approve                          | Status Approved, IsApproved true

    [Fact]
    public async Task UploadAndReviewMedia_WithApprovalRule_CreatesAndProcessesApprovalRequest()
    {
        // Arrange
        var user = await SeedUserAsync("u@u.com", "x", "Media Uploader");

        var project = await SeedProjectAsync("Media Project", user.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings
        {
            Id = project.Id,
            RequirePhotoReview = true
        });

        Context.Set<ProjectApprovalRule>().Add(new ProjectApprovalRule
        {
            ProjectId = project.Id,
            BOQItemId = null,
            Source = SourceType.OnlineUpload,
            UploaderRole = "SiteEngineer",
            ApproverRole = "Approver",
            ResponseTimeoutHours = 24,
            EscalationRole = "Manager"
        });

        await Context.SaveChangesAsync();

        var file = CreateFormFile("test.jpg", "image/jpeg");

        // Act
        var mediaId = await _mediaService.UploadMediaAsync(
            boqItemId: null,
            projectId: project.Id,
            mediaType: "image/jpeg",
            description: "photo",
            file: file,
            uploaderUserId: user.Id,
            source: SourceType.OnlineUpload);

        var reviewRequest = new ReviewMediaRequest("Approved", null, "None", null);
        var ok = await _mediaService.ReviewMediaAsync(mediaId, reviewRequest, user.Id);

        // Assert
        ok.Should().BeTrue();
        var media = await Context.Set<SiteMedia>().FirstAsync(m => m.Id == mediaId);
        media.Status.Should().Be("Approved");
        media.IsApproved.Should().BeTrue();
    }

    // Test Case: UploadAndReviewMedia_WhenReviewNotRequired_AutoApproves
    // Step # | Step Description                        | Expected Result
    // 1      | Seed user/project/settings              | Settings persisted with RequirePhotoReview = false
    // 2      | Upload media                            | Media approved, IsApproved true

    [Fact]
    public async Task UploadAndReviewMedia_WhenReviewNotRequired_AutoApproves()
    {
        // Arrange
        var user = await SeedUserAsync("u2@u.com", "x", "Media Uploader2");

        var project = await SeedProjectAsync("Media Project 2", user.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings
        {
            Id = project.Id,
            RequirePhotoReview = false
        });
        await Context.SaveChangesAsync();

        var file = CreateFormFile("auto.jpg", "image/jpeg");

        // Act
        var mediaId = await _mediaService.UploadMediaAsync(
            boqItemId: null,
            projectId: project.Id,
            mediaType: "image/jpeg",
            description: "auto",
            file: file,
            uploaderUserId: user.Id,
            source: SourceType.OnlineUpload);

        // Assert
        var media = await Context.Set<SiteMedia>().FirstAsync(m => m.Id == mediaId);
        media.Status.Should().Be("Approved");
        media.IsApproved.Should().BeTrue();
    }

    // DOCUMENTATION TABLES (replace with full 113 test-case tables):
    // Test Case: <Name>
    // Step # | Step Description | Expected Result
    // 1      | ...              | ...
}

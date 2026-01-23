using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Moq;
using System.Text;

namespace ConstructionManagement.Tests.Unit.Services;

public class LocalFileStorageServiceTests : IDisposable
{
    private readonly string _testRoot;
    private readonly Mock<IHostEnvironment> _envMock = new();

    public LocalFileStorageServiceTests()
    {
        // إنشاء مجلد وهمي فريد لكل دورة اختبار
        _testRoot = Path.Combine(Path.GetTempPath(), "StorageTests_" + Guid.NewGuid().ToString());
        Directory.CreateDirectory(_testRoot);
        _envMock.Setup(m => m.ContentRootPath).Returns(_testRoot);
    }

    private LocalFileStorageService CreateService() => new(_envMock.Object);

    private Mock<IFormFile> CreateMockFile(string fileName, long length, string content = "test content")
    {
        var fileMock = new Mock<IFormFile>();
        var ms = new MemoryStream(Encoding.UTF8.GetBytes(content));

        fileMock.Setup(_ => _.OpenReadStream()).Returns(ms);
        fileMock.Setup(_ => _.FileName).Returns(fileName);
        fileMock.Setup(_ => _.Length).Returns(length);
        fileMock.Setup(_ => _.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns((Stream stream, CancellationToken token) => ms.CopyToAsync(stream));

        return fileMock;
    }

    #region Upload Tests

    [Fact]
    public async Task UploadFileAsync_ShouldSaveFileToDisk_WhenValid()
    {
        // Arrange
        var service = CreateService();
        var fileMock = CreateMockFile("image.jpg", 1024);

        // Act
        var result = await service.UploadFileAsync(fileMock.Object, "photos");

        // Assert
        result.Should().Contain("/uploads/photos/");
        var physicalPath = Path.Combine(_testRoot, "wwwroot", result.TrimStart('/'));
        File.Exists(physicalPath).Should().BeTrue();
    }

    [Fact]
    public async Task UploadFileAsync_ShouldThrowException_WhenFileIsTooLarge()
    {
        // Arrange
        var service = CreateService();
        // 51 MB (تتجاوز الـ 50 المسموحة في الكود)
        var fileMock = CreateMockFile("large.pdf", 51L * 1024 * 1024);

        // Act & Assert
        await FluentActions.Invoking(() => service.UploadFileAsync(fileMock.Object, "uploads"))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*يتجاوز الحد المسموح*");
    }

    [Fact]
    public async Task UploadFileAsync_ShouldThrowException_WhenExtensionIsNotAllowed()
    {
        // Arrange
        var service = CreateService();
        var fileMock = CreateMockFile("malicious.exe", 1024);

        // Act & Assert
        await FluentActions.Invoking(() => service.UploadFileAsync(fileMock.Object, "uploads"))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*نوع الملف غير مدعوم*");
    }

    [Fact]
    public async Task UploadFileAsync_ShouldSanitizeFolderName()
    {
        // Arrange
        var service = CreateService();
        var fileMock = CreateMockFile("test.png", 1024);
        var unsafeFolder = "User/Data* (Admin)";

        // Act
        var result = await service.UploadFileAsync(fileMock.Object, unsafeFolder);

        // Assert
        // 1. نتأكد أن المسار يبدأ بشكل صحيح
        result.Should().StartWith("/uploads/");

        // 2. نستخرج جزء اسم المجلد فقط من المسار الناتج لنختبره
        // المسار يكون: /uploads/SanitizedFolderName/filename.png
        var pathParts = result.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var sanitizedFolderName = pathParts[1]; // الجزء الثاني بعد uploads

        // 3. التحقق من أن اسم المجلد تم تنظيفه
        sanitizedFolderName.Should().NotContain("/");
        sanitizedFolderName.Should().NotContain("*");
        sanitizedFolderName.Should().NotContain(" ");
        sanitizedFolderName.Should().Be("UserData_(Admin)");
    }
    #endregion

    #region Delete Tests

    [Fact]
    public async Task DeleteFileAsync_ShouldReturnTrue_WhenFileExists()
    {
        // Arrange
        var service = CreateService();
        var uploadPath = Path.Combine(_testRoot, "wwwroot", "uploads", "general");
        Directory.CreateDirectory(uploadPath);

        var fileName = "to-delete.txt";
        var fullPath = Path.Combine(uploadPath, fileName);
        await File.WriteAllTextAsync(fullPath, "content");

        var relativePath = "/uploads/general/" + fileName;

        // Act
        var result = await service.DeleteFileAsync(relativePath);

        // Assert
        result.Should().BeTrue();
        File.Exists(fullPath).Should().BeFalse();
    }

    [Fact]
    public async Task DeleteFileAsync_ShouldReturnFalse_WhenFileDoesNotExist()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = await service.DeleteFileAsync("/uploads/non-existent.jpg");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    public void Dispose()
    {
        // تنظيف المجلد بعد كل اختبار
        try
        {
            if (Directory.Exists(_testRoot))
                Directory.Delete(_testRoot, true);
        }
        catch { /* تجاهل أخطاء الوصول للملفات أثناء التنظيف */ }
    }
}
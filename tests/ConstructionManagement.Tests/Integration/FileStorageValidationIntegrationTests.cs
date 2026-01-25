using ConstructionManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Integration;

/// <summary>
/// Integration tests for file storage scenarios.
/// </summary>
public class FileStorageValidationIntegrationTests
{
    /// <summary>
    /// Scenario 1: Upload a file with an invalid extension (e.g., .exe).
    /// Expected outcome: UploadFileAsync throws an ArgumentException.
    /// </summary>
    // Test Case: UploadFileAsync_InvalidExtension_ShouldThrow
    // Step # | Step Description                        | Expected Result
    // 1      | Create temp root + .exe file            | File prepared
    // 2      | Call UploadFileAsync                    | Throws ArgumentException
    [Fact]
    public async Task UploadFileAsync_InvalidExtension_ShouldThrow()
    {
        var root = CreateTempRoot();
        try
        {
            var service = new LocalFileStorageService(new TestHostEnvironment(root));
            var file = CreateFormFile("malware.exe", "application/octet-stream");

            await Assert.ThrowsAsync<ArgumentException>(() => service.UploadFileAsync(file, "site-media"));
        }
        finally
        {
            Directory.Delete(root, true);
        }
    }

    /// <summary>
    /// Scenario 2: Upload a file that exceeds the size limit (e.g., 51MB).
    /// Expected outcome: UploadFileAsync throws an ArgumentException.
    /// </summary>
    // Test Case: UploadFileAsync_TooLarge_ShouldThrow
    // Step # | Step Description                        | Expected Result
    // 1      | Create temp root + large file           | File prepared
    // 2      | Call UploadFileAsync                    | Throws ArgumentException
    [Fact]
    public async Task UploadFileAsync_TooLarge_ShouldThrow()
    {
        var root = CreateTempRoot();
        try
        {
            var service = new LocalFileStorageService(new TestHostEnvironment(root));

            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.Length).Returns(51L * 1024 * 1024);
            mockFile.Setup(f => f.FileName).Returns("big.jpg");

            await Assert.ThrowsAsync<ArgumentException>(() => service.UploadFileAsync(mockFile.Object, "site-media"));
        }
        finally
        {
            Directory.Delete(root, true);
        }
    }

    /// <summary>
    /// Scenario 3: Upload a valid file (e.g., ok.jpg).
    /// Expected outcome: UploadFileAsync returns a relative path starting with "/uploads/site-media/".
    /// </summary>
    // Test Case: UploadFileAsync_ValidFile_ShouldReturnRelativePath
    // Step # | Step Description                        | Expected Result
    // 1      | Create temp root + valid image file      | File prepared
    // 2      | Call UploadFileAsync                    | Returns relative path
    [Fact]
    public async Task UploadFileAsync_ValidFile_ShouldReturnRelativePath()
    {
        var root = CreateTempRoot();
        try
        {
            var service = new LocalFileStorageService(new TestHostEnvironment(root));
            var file = CreateFormFile("ok.jpg", "image/jpeg");

            var path = await service.UploadFileAsync(file, "site-media");

            Assert.StartsWith("/uploads/site-media/", path);
        }
        finally
        {
            Directory.Delete(root, true);
        }
    }

    /// <summary>
    /// Scenario 4: Delete an existing file.
    /// Expected outcome: DeleteFileAsync removes the file, and subsequent checks confirm the file does not exist.
    /// </summary>
    // Test Case: DeleteFileAsync_ExistingFile_ShouldRemove
    // Step # | Step Description                        | Expected Result
    // 1      | Upload valid file                       | Path returned
    // 2      | Delete file                             | File removed from disk
    [Fact]
    public async Task DeleteFileAsync_ExistingFile_ShouldRemoveFile()
    {
        var root = CreateTempRoot();
        try
        {
            var service = new LocalFileStorageService(new TestHostEnvironment(root));
            var file = CreateFormFile("to-delete.jpg", "image/jpeg");

            var path = await service.UploadFileAsync(file, "site-media");
            await service.DeleteFileAsync(path);

            var relative = path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var full = Path.Combine(root, relative);
            Assert.False(File.Exists(full));
        }
        finally
        {
            Directory.Delete(root, true);
        }
    }

    private static IFormFile CreateFormFile(string fileName, string contentType)
    {
        var ms = new MemoryStream(new byte[] { 1, 2, 3, 4 });
        return new FormFile(ms, 0, ms.Length, "file", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    private static string CreateTempRoot()
    {
        var root = Path.Combine(Path.GetTempPath(), $"cm-tests-{Guid.NewGuid()}");
        Directory.CreateDirectory(root);
        return root;
    }

    private sealed class TestHostEnvironment : IHostEnvironment
    {
        public TestHostEnvironment(string rootPath)
        {
            ContentRootPath = rootPath;
            ContentRootFileProvider = new PhysicalFileProvider(rootPath);
        }

        public string EnvironmentName { get; set; } = "Tests";
        public string ApplicationName { get; set; } = "ConstructionManagement.Tests";
        public string ContentRootPath { get; set; }
        public IFileProvider ContentRootFileProvider { get; set; }
    }

    // DOCUMENTATION TABLES (replace with full 113 test-case tables):
    // Test Case: <Name>
    // Step # | Step Description | Expected Result
    // 1      | ...              | ...
}

// NOTE: No error-related changes required here.

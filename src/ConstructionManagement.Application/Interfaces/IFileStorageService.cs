using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Result of a file storage operation.
/// </summary>
public class FileStorageResult
{
    public string Path { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}

/// <summary>
/// Interface for file storage operations.
/// </summary>
public interface IFileStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string? folder = null);
    Task<FileStorageResult> SaveFileAsync(IFormFile file, string folder);
    Task DeleteFileAsync(string filePath);
}

// Infrastructure/Services/IFileStorageService.cs
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Infrastructure.Services;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string? folder = null);
}
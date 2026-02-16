using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace ConstructionManagement.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _rootPath;
    private const long MaxFileSize = 50 * 1024 * 1024; // حد أقصى 50 ميجابايت مثلاً

    public LocalFileStorageService(IHostEnvironment env)
    {
        // استخدام Path.Combine لضمان التوافق مع Linux و Windows
        _rootPath = Path.Combine(env.ContentRootPath, "wwwroot", "uploads");

        if (!Directory.Exists(_rootPath))
            Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> UploadFileAsync(IFormFile file, string? folder = null)
    {
        // 1. التحقق الأساسي
        if (file == null || file.Length == 0)
            throw new ArgumentException("لا يوجد ملف للرفع أو الملف فارغ");

        if (file.Length > MaxFileSize)
            throw new ArgumentException("حجم الملف يتجاوز الحد المسموح به (50 ميجابايت)");

        // 2. التحقق من الامتدادات المسموحة (White List)
        var allowedExtensions = new HashSet<string> { ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".pdf", ".dwg", ".dxf" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension) && extension != ".dwg" && extension != ".dxf") // safety check
            throw new ArgumentException("نوع الملف غير مدعوم");


        // 3. تأمين اسم المجلد (Sanitization)
        var safeFolder = string.IsNullOrEmpty(folder)
            ? "general"
            : string.Concat(folder.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_");

        var targetDirectory = Path.Combine(_rootPath, safeFolder);

        if (!Directory.Exists(targetDirectory))
            Directory.CreateDirectory(targetDirectory);

        // 4. توليد اسم ملف فريد جداً
        var uniqueFileName = $"{Guid.NewGuid()}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
        var fullPath = Path.Combine(targetDirectory, uniqueFileName);

        // 5. الرفع الفعلي
        using (var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
        {
            await file.CopyToAsync(stream);
        }

        // إرجاع المسار النسبي الذي سيخزن في قاعدة البيانات
        return $"/uploads/{safeFolder}/{uniqueFileName}";
    }

    public async Task<FileStorageResult> SaveFileAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("No file provided or file is empty");

        if (file.Length > MaxFileSize)
            throw new ArgumentException($"File size exceeds maximum allowed ({MaxFileSize / 1024 / 1024} MB)");

        var allowedExtensions = new HashSet<string> { ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".dwg", ".dxf" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException($"File type '{extension}' is not supported");

        var safeFolder = string.IsNullOrEmpty(folder)
            ? "general"
            : string.Concat(folder.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_");

        var targetDirectory = Path.Combine(_rootPath, safeFolder);

        if (!Directory.Exists(targetDirectory))
            Directory.CreateDirectory(targetDirectory);

        var uniqueFileName = $"{Guid.NewGuid()}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
        var fullPath = Path.Combine(targetDirectory, uniqueFileName);

        using (var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/uploads/{safeFolder}/{uniqueFileName}";

        return new FileStorageResult
        {
            Path = relativePath,
            FileName = uniqueFileName
        };
    }


    public Task DeleteFileAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath)) return Task.CompletedTask;

        // تحويل المسار النسبي إلى مسار فيزيائي للحذف
        var physicalPath = Path.Combine(_rootPath, "..", filePath.TrimStart('/'));

        if (File.Exists(physicalPath))
        {
            File.Delete(physicalPath);
        }
        return Task.CompletedTask;
    }
}

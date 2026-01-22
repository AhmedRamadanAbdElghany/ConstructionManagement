using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace ConstructionManagement.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // 1. تحديد المسار الأساسي (Base Path)
        // البحث عن ملف appsettings.json في مشروع الـ WebApi
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "ConstructionManagement.WebApi");

        // إذا كنت تشغل الأمر من داخل مجلد src، قد تحتاج لهذا التعديل:
        if (!Directory.Exists(basePath))
        {
            basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "ConstructionManagement.WebApi");
        }

        // 2. بناء الـ Configuration مع التأكد من وجود الملف
        var builder = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

        var configuration = builder.Build();

        // 3. جلب الـ Connection String
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Could not find 'DefaultConnection' in appsettings.json");
        }

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }

}
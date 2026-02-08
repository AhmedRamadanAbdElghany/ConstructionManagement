using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace ConstructionManagement.Infrastructure;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // الحصول على مسار المشروع الحالي (Infrastructure) ثم الرجوع للخلف للوصول لـ WebApi
        var basePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "src", "ConstructionManagement.WebApi");

        // إذا لم يجد المسار، جرب المسار المباشر (للتأكد فقط)
        if (!Directory.Exists(basePath))
        {
            basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "ConstructionManagement.WebApi");
        }

        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .Build();

        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        builder.UseSqlServer(connectionString);

        return new ApplicationDbContext(builder.Options);
    }
}

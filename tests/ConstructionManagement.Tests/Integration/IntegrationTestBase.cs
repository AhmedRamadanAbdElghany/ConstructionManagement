using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services; // أضف هذا لاستخدام TenantContext
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;

using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.Tests.Integration
{
    public abstract class IntegrationTestBase : IDisposable
    {
        protected readonly ApplicationDbContext Context;
        protected readonly IUnitOfWork UnitOfWork;
        protected readonly ICompanyContext CompanyContext; // Support for ICompanyContext

        protected IntegrationTestBase()
        {
            // 1. Setup CompanyContext
            CompanyContext = new CompanyContext { CompanyId = 1 };

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite("DataSource=:memory:")
                .Options;

            // 2. Pass CompanyContext to Context
            Context = new ApplicationDbContext(options, CompanyContext);

            // Enable foreign key constraints for SQLite
            Context.Database.OpenConnection();
            Context.Database.ExecuteSqlRaw("PRAGMA foreign_keys = ON;");
            try 
            {
                Context.Database.EnsureCreated();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FATAL: EnsureCreated failed: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                throw;
            }

            UnitOfWork = new UnitOfWork(Context);
        }

        public void Dispose()
        {
            Context.Database.CloseConnection();
            Context.Dispose();
        }

        // Update SeedUser to include CompanyId
        protected async Task<User> SeedUserAsync(string email, string passwordHash, string fullName = "Test User", int? companyId = 1)
        {
            var nameParts = fullName.Split(' ', 2);
            var user = new User
            {
                FirstName = nameParts[0],
                LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
                Email = email,
                PasswordHash = passwordHash,
                CompanyId = companyId
            };
            Context.Users.Add(user);
            await Context.SaveChangesAsync();
            return user;
        }

        protected async Task<Project> SeedProjectAsync(string name, int ownerUserId, int? companyId = null, Action<Project>? configure = null)
        {
            var project = new Project
            {
                ProjectName = name,
                OwnerUserId = ownerUserId,
                CompanyId = companyId,
                AccountingSystem = CalculationMethod.Measured,
                Status = "Active"
            };

            configure?.Invoke(project);

            Context.Projects.Add(project);
            await Context.SaveChangesAsync();
            return project;
        }

        protected static IFormFile CreateFormFile(string fileName, string contentType)
        {
            var bytes = new byte[] { 1, 2, 3, 4 };
            var stream = new MemoryStream(bytes);

            return new FormFile(stream, 0, bytes.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = contentType
            };
        }
    }
}

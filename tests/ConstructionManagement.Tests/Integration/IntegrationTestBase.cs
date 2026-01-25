using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Tests.Integration
{
    /// <summary>
    /// Test base setup:
    /// Steps: create in-memory SQLite DB -> open connection -> ensure schema -> provide UnitOfWork -> helpers for seeding and file creation.
    /// </summary>
    // Test Setup: IntegrationTestBase
    // Step # | Step Description                       | Expected Result
    // 1      | Create in-memory SQLite DB             | Connection opened
    // 2      | Ensure schema created                  | Tables available
    // 3      | Initialize UnitOfWork                  | Ready for tests
    // DOCUMENTATION TABLES (replace with full setup/fixture steps):
    // Step # | Step Description | Expected Result
    // 1      | ...              | ...
    public abstract class IntegrationTestBase : IDisposable
    {
        protected readonly ApplicationDbContext Context;
        protected readonly IUnitOfWork UnitOfWork; // يجب أن يكون protected ليراه الـ Test

        protected IntegrationTestBase()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite("DataSource=:memory:") // استخدام Sqlite في الذاكرة
                .Options;

            Context = new ApplicationDbContext(options);
            Context.Database.OpenConnection();
            Context.Database.EnsureCreated(); // SQLite in-memory يحتاج إنشاء المخطط لكل اتصال

            // السطر السحري: هنا يتم منع الـ NullReferenceException
            UnitOfWork = new UnitOfWork(Context);
        }

        public void Dispose()
        {
            Context.Database.CloseConnection();
            Context.Dispose();
        }

        protected async Task<User> SeedUserAsync(string email, string passwordHash, string fullName = "Test User")
        {
            var user = new User
            {
                FullName = fullName,
                Email = email,
                PasswordHash = passwordHash
            };
            Context.Users.Add(user);
            await Context.SaveChangesAsync();
            return user;
        }

        protected async Task<Project> SeedProjectAsync(string name, int ownerUserId, Action<Project>? configure = null)
        {
            var project = new Project
            {
                ProjectName = name,
                OwnerUserId = ownerUserId,
                AccountingSystem = "Measured",
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

        // TODO (planned new files):
        // - MediaUploadAndReviewIntegrationTests.cs
        // - TransactionsReviewIntegrationTests.cs
        // - FileStorageValidationIntegrationTests.cs

        // NOTE: Integration tests should validate setup correctness before service behavior.
        // NOTE: Prefer end-to-end flows that touch DB + service + validation.
        // NOTE: No error-related changes required here.
    }
}
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Tests.Integration
{
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
            Context.Database.EnsureCreated();

            // السطر السحري: هنا يتم منع الـ NullReferenceException
            UnitOfWork = new UnitOfWork(Context);
        }

        public void Dispose()
        {
            Context.Database.CloseConnection();
            Context.Dispose();
        }
    }
}
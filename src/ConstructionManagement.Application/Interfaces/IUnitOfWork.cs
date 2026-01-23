namespace ConstructionManagement.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    Task<int> SaveChangesAsync();
    // لتجنب الاعتماد المباشر على EF في الـ Application
    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
}
namespace ConstructionManagement.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    Task<int> SaveChangesAsync();

    Task BeginTransactionAsync();     // ← no return type
    Task CommitAsync();
    Task RollbackAsync();
}

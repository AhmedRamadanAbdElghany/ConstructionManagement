using ConstructionManagement.Application.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    // استبدل ApplicationDbContext باسم الكلاس الخاص بك إذا كان مختلفاً
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _currentTransaction;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public async Task BeginTransactionAsync()
    {
        if (_currentTransaction != null) return;
        _currentTransaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
            if (_currentTransaction != null) await _currentTransaction.CommitAsync();
        }
        finally { DisposeTransaction(); }
    }

    public async Task RollbackAsync()
    {
        try
        {
            if (_currentTransaction != null) await _currentTransaction.RollbackAsync();
        }
        finally { DisposeTransaction(); }
    }

    private void DisposeTransaction()
    {
        _currentTransaction?.Dispose();
        _currentTransaction = null;
    }

    public void Dispose()
    {
        DisposeTransaction();
        _context.Dispose();
    }
}
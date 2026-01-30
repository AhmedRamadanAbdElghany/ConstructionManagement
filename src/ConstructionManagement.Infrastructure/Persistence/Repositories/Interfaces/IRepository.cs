// Infrastructure/Persistence/Repositories/Interfaces/IRepository.cs
using System.Linq.Expressions;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task UpdateRangeAsync(IEnumerable<T> entities);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task<bool> ExistsAsync(int id);
    IQueryable<T> AsQueryable(); // For advanced queries (optional)
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
}

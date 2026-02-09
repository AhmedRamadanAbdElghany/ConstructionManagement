// Infrastructure/Persistence/Repositories/Interfaces/INotificationRepository.cs
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId);
    Task<Notification?> GetByIdAndUserIdAsync(int notificationId, int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync(int userId);
}

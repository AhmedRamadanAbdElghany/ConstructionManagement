// Infrastructure/Persistence/Repositories/NotificationRepository.cs
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetByIdAndUserIdAsync(int notificationId, int userId)
    {
        return await _dbSet.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _dbSet
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(int notificationId)
    {
        var notification = await _dbSet.FindAsync(notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            await UpdateAsync(notification);
        }
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifications = await _dbSet
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();
        
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }
        
        await UpdateRangeAsync(notifications);
    }
}

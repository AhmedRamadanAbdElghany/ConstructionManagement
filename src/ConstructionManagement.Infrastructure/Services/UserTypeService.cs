using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service implementation for managing user type changes
/// </summary>
public class UserTypeService : IUserTypeService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<UserTypeHistory> _userTypeHistoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserTypeService(
        IRepository<User> userRepository,
        IRepository<UserTypeHistory> userTypeHistoryRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _userTypeHistoryRepository = userTypeHistoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> ChangeUserTypeAsync(int userId, UserType newType, string? reason = null)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return false;

        var previousType = user.UserType;

        // Don't create history entry if the type hasn't changed
        if (previousType == newType)
            return true;

        // Update the user's type
        user.UserType = newType;
        await _userRepository.UpdateAsync(user);

        // Create a history entry
        var historyEntry = new UserTypeHistory
        {
            UserId = userId,
            PreviousType = previousType,
            NewType = newType,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = userId.ToString(), // User changed their own type
            Reason = reason
        };

        await _userTypeHistoryRepository.AddAsync(historyEntry);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<List<UserTypeHistory>> GetUserTypeHistoryAsync(int userId)
    {
        return await _userTypeHistoryRepository.AsQueryable()
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.ChangedAt)
            .ToListAsync();
    }

    public async Task<List<UserType>> GetUserTypeHistoryForNotificationsAsync(int userId)
    {
        var types = new List<UserType>();

        // Get current user's type
        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            types.Add(user.UserType);
        }

        // Get all previous types from history
        var historyTypes = await _userTypeHistoryRepository.AsQueryable()
            .Where(h => h.UserId == userId)
            .Select(h => h.PreviousType)
            .Distinct()
            .ToListAsync();

        // Add previous types that are not already in the list
        foreach (var type in historyTypes)
        {
            if (!types.Contains(type))
            {
                types.Add(type);
            }
        }

        return types;
    }

    public async Task<bool> CanSwitchToTypeAsync(int userId, UserType targetType)
    {
        // Any user can switch to any type based on the requirements
        // You can add additional validation here if needed
        // For example: check if user has required permissions for certain types

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return false;

        // Users can always switch to any type
        return true;
    }
}

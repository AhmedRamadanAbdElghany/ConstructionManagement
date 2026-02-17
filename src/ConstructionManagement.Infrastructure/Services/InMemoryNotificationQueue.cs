using ConstructionManagement.Application.DTOs.Notfification;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// In-memory implementation of the notification queue.
/// This is suitable for single-instance deployments or testing scenarios.
/// For multi-instance deployments, consider using Redis or Azure Service Bus.
/// </summary>
public class InMemoryNotificationQueue : INotificationQueue
{
    private readonly ConcurrentQueue<Application.Interfaces.NotificationMessage> _queue = new();
    private readonly ConcurrentDictionary<Application.Interfaces.NotificationPriority, ConcurrentQueue<Application.Interfaces.NotificationMessage>> _priorityQueues = new();
    private readonly ILogger<InMemoryNotificationQueue> _logger;
    private readonly object _lock = new();

    public InMemoryNotificationQueue(ILogger<InMemoryNotificationQueue> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        // Initialize priority queues
        foreach (Application.Interfaces.NotificationPriority priority in Enum.GetValues(typeof(Application.Interfaces.NotificationPriority)))
        {
            _priorityQueues[priority] = new ConcurrentQueue<Application.Interfaces.NotificationMessage>();
        }
    }

    public void QueueNotification(Application.Interfaces.NotificationMessage message)
    {
        if (message == null)
            throw new ArgumentNullException(nameof(message));
        
        QueueNotification(message, message.Priority);
    }

    public void QueueNotification(Application.Interfaces.NotificationMessage message, Application.Interfaces.NotificationPriority priority)
    {
        if (message == null)
            throw new ArgumentNullException(nameof(message));

        message.Priority = priority;
        message.CreatedAt = DateTime.UtcNow;

        _priorityQueues[priority].Enqueue(message);
        
        _logger.LogDebug(
            "Notification {NotificationId} queued with priority {Priority}. User: {UserId}, Type: {Type}",
            message.Id, priority, message.UserId, message.Type);
    }

    public async Task<Application.Interfaces.NotificationMessage?> DequeueAsync(CancellationToken cancellationToken = default)
    {
        // Process higher priority queues first
        for (int i = (int)Application.Interfaces.NotificationPriority.Urgent; i >= (int)Application.Interfaces.NotificationPriority.Low; i--)
        {
            var priority = (Application.Interfaces.NotificationPriority)i;
            
            if (_priorityQueues[priority].TryDequeue(out var message))
            {
                _logger.LogDebug(
                    "Dequeued notification {NotificationId} with priority {Priority}",
                    message.Id, priority);
                
                return message;
            }
        }

        // If no messages found, wait for one with timeout
        try
        {
            await Task.Delay(100, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            _logger.LogDebug("Notification queue dequeue operation was cancelled");
            return null;
        }

        return null;
    }

    public int Count
    {
        get
        {
            int total = 0;
            foreach (var queue in _priorityQueues.Values)
            {
                total += queue.Count;
            }
            return total;
        }
    }

    public void Clear()
    {
        lock (_lock)
        {
            foreach (var queue in _priorityQueues.Values)
            {
                while (queue.TryDequeue(out _))
                {
                    // Dequeue all items
                }
            }
        }

        _logger.LogInformation("Notification queue cleared. All pending notifications removed.");
    }
}

/// <summary>
/// Background service that processes notifications from the queue.
/// </summary>
public class NotificationQueueProcessor : BackgroundService
{
    private readonly INotificationQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationQueueProcessor> _logger;

    public NotificationQueueProcessor(
        INotificationQueue queue,
        IServiceProvider serviceProvider,
        ILogger<NotificationQueueProcessor> logger)
    {
        _queue = queue ?? throw new ArgumentNullException(nameof(queue));
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification queue processor started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var message = await _queue.DequeueAsync(stoppingToken);
                
                if (message != null)
                {
                    await ProcessNotificationAsync(message, stoppingToken);
                }
                else
                {
                    // No messages, wait before checking again
                    await Task.Delay(100, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Expected during shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing notification from queue");
                await Task.Delay(1000, stoppingToken); // Wait before retrying
            }
        }

        _logger.LogInformation("Notification queue processor stopped");
    }

    private async Task ProcessNotificationAsync(Application.Interfaces.NotificationMessage message, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Processing notification {NotificationId} for user {UserId}. Type: {Type}",
            message.Id, message.UserId, message.Type);

        try
        {
            // Use scope to get required services
            using var scope = _serviceProvider.CreateScope();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            // Parse the notification type from the message
            NotificationType parsedType = NotificationType.General;
            if (!string.IsNullOrEmpty(message.Type))
            {
                Enum.TryParse<NotificationType>(message.Type, true, out parsedType);
            }

            await notificationService.CreateAndSendAsync(
                userId: message.UserId,
                title: message.Title,
                message: message.Message,
                link: message.Link,
                type: parsedType,
                titleKey: message.TitleKey,
                messageKey: message.MessageKey,
                messageArgs: message.MessageArgs);

            _logger.LogInformation(
                "Notification {NotificationId} processed successfully",
                message.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process notification {NotificationId}", message.Id);

            if (message.RetryCount < message.MaxRetries)
            {
                message.RetryCount++;
                _logger.LogInformation(
                    "Retrying notification {NotificationId}. Attempt {Attempt} of {MaxRetries}",
                    message.Id, message.RetryCount, message.MaxRetries);

                // Re-queue with same priority
                _queue.QueueNotification(message, message.Priority);
            }
            else
            {
                _logger.LogError(
                    "Notification {NotificationId} failed after {MaxRetries} attempts. Dropping message.",
                    message.Id, message.MaxRetries);
            }
        }
    }
}

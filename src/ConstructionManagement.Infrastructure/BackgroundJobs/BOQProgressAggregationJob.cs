using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.BackgroundJobs;

public class BOQProgressAggregationJob
{
    private readonly IRepository<BOQExecutedDelta> _deltaRepo;
    private readonly IRepository<BOQItem> _boqRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BOQProgressAggregationJob> _logger;

    public BOQProgressAggregationJob(
        IRepository<BOQExecutedDelta> deltaRepo,
        IRepository<BOQItem> boqRepo,
        IUnitOfWork unitOfWork,
        ILogger<BOQProgressAggregationJob> logger)
    {
        _deltaRepo = deltaRepo;
        _boqRepo = boqRepo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task AggregatePendingDeltas()
    {
        _logger.LogInformation("Starting BOQ progress aggregation job...");

        var pendingDeltas = await _deltaRepo.AsQueryable()
            .Where(d => d.ProcessedAt == null)
            .GroupBy(d => d.BOQItemId)
            .Select(g => new
            {
                BOQItemId = g.Key,
                TotalDelta = g.Sum(d => d.DeltaQuantity)
            })
            .ToListAsync();

        if (!pendingDeltas.Any())
        {
            _logger.LogInformation("No pending deltas to process.");
            return;
        }

        foreach (var group in pendingDeltas)
        {
            var item = await _boqRepo.GetByIdAsync(group.BOQItemId);
            if (item == null || item.MeasuredData == null) continue;

            // تحديث القيمة التراكمية
            item.MeasuredData.ExecutedQuantity += group.TotalDelta;

            // مارك الـ deltas كـ processed
            var deltasToMark = await _deltaRepo.AsQueryable()
                .Where(d => d.BOQItemId == group.BOQItemId && d.ProcessedAt == null)
                .ToListAsync();

            foreach (var d in deltasToMark)
                d.ProcessedAt = DateTime.UtcNow;
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Processed {Count} BOQ items with pending deltas.", pendingDeltas.Count);
    }
}

using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IReviewService
    {
        Task<VendorReview> CreateReviewAsync(int reviewerId, int ratedUserId, int rating, string? comment, string? title, int? projectId);
        Task<List<VendorReview>> GetReviewsForUserAsync(int userId);
        Task<decimal> CalculateAverageRatingAsync(int userId);
        Task<bool> ReplyToReviewAsync(int reviewId, string reply, int userId);
        Task<bool> ApproveReviewAsync(int reviewId);
    }
}

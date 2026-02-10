using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Infrastructure.Services
{

    /// <summary>
    /// Service for review operations
    /// </summary>
    public class ReviewService : IReviewService
    {
        private readonly IUserService _userService;

        public ReviewService(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<VendorReview> CreateReviewAsync(int reviewerId, int ratedUserId, int rating, string? comment, string? title, int? projectId)
        {
            if (rating < 1 || rating > 5)
                throw new ArgumentException("Rating must be between 1 and 5");

            var review = new VendorReview
            {
                ReviewerUserId = reviewerId,
                RatedUserId = ratedUserId,
                Rating = rating,
                Comment = comment,
                Title = title,
                ProjectId = projectId,
                ReviewDate = DateTime.UtcNow,
                IsPublic = true
            };

            // Update user's average rating
            await UpdateUserRatingAsync(ratedUserId);

            return review;
        }

        public Task<List<VendorReview>> GetReviewsForUserAsync(int userId)
        {
            // Implementation would use repository
            return Task.FromResult(new List<VendorReview>());
        }

        public async Task<decimal> CalculateAverageRatingAsync(int userId)
        {
            var reviews = await GetReviewsForUserAsync(userId);
            if (!reviews.Any())
                return 0;

            return (decimal)reviews.Average(r => r.Rating);
        }

        public async Task<bool> ReplyToReviewAsync(int reviewId, string reply, int userId)
        {
            // Implementation would use repository
            await UpdateUserRatingAsync(userId);
            return true;
        }

        public async Task<bool> ApproveReviewAsync(int reviewId)
        {
            // Implementation would use repository
            return true;
        }

        private async Task UpdateUserRatingAsync(int userId)
        {
            var user = await _userService.GetUserByIdAsync(userId, userId);
            if (user == null)
                return;

            var averageRating = await CalculateAverageRatingAsync(userId);
            // Note: UserDto doesn't have AverageRating property
            // This would need to be implemented differently
        }
    }
}

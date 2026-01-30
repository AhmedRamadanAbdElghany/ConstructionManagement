using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.Interfaces;

public interface ISiteMediaService
{
    Task<int> UploadMediaAsync(
    int? boqItemId,
    int projectId,
    string mediaType,
    string? description,
    IFormFile file,
    int uploaderUserId,
    SourceType source
); Task<bool> ReviewMediaAsync(int mediaId, ReviewMediaRequest request, int reviewerUserId);
    Task<SiteMedia?> GetMediaByIdAsync(int mediaId);
    Task<List<SiteMedia>> GetMediaForProjectAsync(int projectId, int? itemId = null, string? status = null);
}

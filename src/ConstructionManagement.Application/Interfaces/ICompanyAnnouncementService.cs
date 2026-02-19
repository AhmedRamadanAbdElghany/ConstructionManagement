using ConstructionManagement.Application.DTOs.CompanyAnnouncement;

namespace ConstructionManagement.Application.Interfaces;

public interface ICompanyAnnouncementService
{
    // Announcements
    Task<IEnumerable<CompanyAnnouncementDto>> GetCompanyAnnouncementsAsync(int companyId);
    Task<CompanyAnnouncementDto> GetAnnouncementAsync(int announcementId);
    Task<int> CreateAnnouncementAsync(CreateAnnouncementRequest request);
    Task UpdateAnnouncementAsync(int announcementId, UpdateAnnouncementRequest request);
    Task DeleteAnnouncementAsync(int announcementId);

    // Subscriptions
    Task SubscribeAsync(int companyId);
    Task UnsubscribeAsync(int companyId);
    Task<bool> IsSubscribedAsync(int companyId);
    Task<int> GetSubscriberCountAsync(int companyId);
}

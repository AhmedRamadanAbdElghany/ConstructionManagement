namespace ConstructionManagement.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendAsync(string email, string subject, string body);
        
        // Company Request Emails
        Task SendCompanyRequestApprovedAsync(string email, string companyName);
        Task SendCompanyRequestRejectedAsync(string email, string reason);
        
        // Join Request Emails
        Task SendJoinRequestApprovedAsync(string email, string companyName);
        Task SendJoinRequestRejectedAsync(string email, string reason);
    }
}

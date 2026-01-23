namespace ConstructionManagement.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendAsync(string email, string subject, string body);
    }
}

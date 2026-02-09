using ConstructionManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace ConstructionManagement.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendAsync(string toEmail, string subject, string body)
    {
        // 1. فحص مدخلات الميثود (الوجود والصيغة)
        if (string.IsNullOrWhiteSpace(toEmail) || !IsValidEmail(toEmail) || string.IsNullOrWhiteSpace(subject))
        {
            _logger.LogWarning("Invalid email parameters: Subject or Recipient is missing or malformed.");
            return;
        }

        // 2. جلب وفحص الإعدادات
        var smtpServer = _configuration["EmailSettings:SmtpServer"];
        var senderEmail = _configuration["EmailSettings:SenderEmail"];

        if (string.IsNullOrWhiteSpace(smtpServer))
        {
            _logger.LogWarning("SMTP Configuration missing");
            return;
        }

        if (string.IsNullOrWhiteSpace(senderEmail))
        {
            _logger.LogWarning("Sender Email is not configured");
            return;
        }

        try
        {
            // 3. محاولة الإرسال
            var port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];
            var enableSsl = bool.Parse(_configuration["EmailSettings:EnableSsl"] ?? "true");

            using var client = new SmtpClient(smtpServer, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = enableSsl
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }

    // ميثود مساعدة لفحص صيغة الإيميل برمجياً لتجنب الـ FormatException
    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    // Company Request Email Methods
    public async Task SendCompanyRequestApprovedAsync(string email, string companyName)
    {
        var subject = "Your Company Request Has Been Approved";
        var body = string.Concat(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>",
            "<h2 style='color: #10b981;'>Congratulations!</h2>",
            "<p>Your company '<strong>", companyName, "</strong>' has been approved.</p>",
            "<p>You can now log in and start using your company account.</p>",
            "<p style='margin-top: 20px;'>Best regards,<br>Construction CMS Team</p>",
            "</div>"
        );
        await SendAsync(email, subject, body);
    }

    public async Task SendCompanyRequestRejectedAsync(string email, string reason)
    {
        var subject = "Your Company Request Has Been Rejected";
        var body = string.Concat(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>",
            "<h2 style='color: #ef4444;'>We're Sorry</h2>",
            "<p>Your company request has been rejected.</p>",
            "<p><strong>Reason:</strong> ", reason, "</p>",
            "<p>If you have any questions, please contact support.</p>",
            "<p style='margin-top: 20px;'>Best regards,<br>Construction CMS Team</p>",
            "</div>"
        );
        await SendAsync(email, subject, body);
    }

    // Join Request Email Methods
    public async Task SendJoinRequestApprovedAsync(string email, string companyName)
    {
        var subject = "Your Join Request Has Been Approved";
        var body = string.Concat(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>",
            "<h2 style='color: #10b981;'>Welcome!</h2>",
            "<p>Your request to join '<strong>", companyName, "</strong>' has been approved.</p>",
            "<p>You now have access to the company's resources and projects.</p>",
            "<p style='margin-top: 20px;'>Best regards,<br>Construction CMS Team</p>",
            "</div>"
        );
        await SendAsync(email, subject, body);
    }

    public async Task SendJoinRequestRejectedAsync(string email, string reason)
    {
        var subject = "Your Join Request Has Been Rejected";
        var body = string.Concat(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>",
            "<h2 style='color: #ef4444;'>We're Sorry</h2>",
            "<p>Your request to join the company has been rejected.</p>",
            "<p><strong>Reason:</strong> ", reason, "</p>",
            "<p>If you have any questions, please contact the company administrator.</p>",
            "<p style='margin-top: 20px;'>Best regards,<br>Construction CMS Team</p>",
            "</div>"
        );
        await SendAsync(email, subject, body);
    }
}

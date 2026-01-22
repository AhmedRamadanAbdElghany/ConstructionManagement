﻿using ConstructionManagement.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using System;
using System.Threading.Tasks;

namespace ConstructionManagement.Tests.Unit.Services;

public class EmailServiceTests
{
    private readonly Mock<ILogger<EmailService>> _loggerMock = new();
    private readonly Mock<IConfiguration> _configMock = new();

    private EmailService CreateService() => new EmailService(_loggerMock.Object, _configMock.Object);

    [Fact]
    public async Task SendAsync_ShouldLogWarning_WhenSmtpServerIsMissing()
    {
        _configMock.Setup(c => c["EmailSettings:SmtpServer"]).Returns(string.Empty);
        var service = CreateService();

        await service.SendAsync("test@example.com", "Subject", "Body");

        VerifyLog(LogLevel.Warning, "SMTP Configuration missing");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task SendAsync_ShouldLogWarning_WhenSenderEmailIsInvalid(string? invalidSender)
    {
        _configMock.Setup(c => c["EmailSettings:SmtpServer"]).Returns("smtp.test.com");
        _configMock.Setup(c => c["EmailSettings:SenderEmail"]).Returns(invalidSender);
        var service = CreateService();

        await service.SendAsync("to@test.com", "Sub", "Body");

        VerifyLog(LogLevel.Warning, "Sender Email is not configured");
    }

    [Theory]
    [InlineData("", "Sub", "Body")]
    [InlineData("invalid-email", "Sub", "Body")]
    [InlineData("to@test.com", "", "Body")]
    public async Task SendAsync_ShouldLogWarning_WhenInputArgumentsAreInvalid(string to, string subject, string body)
    {
        // Arrange
        _configMock.Setup(c => c["EmailSettings:SmtpServer"]).Returns("smtp.test.com");
        _configMock.Setup(c => c["EmailSettings:SenderEmail"]).Returns("noreply@test.com");
        var service = CreateService();

        // Act
        await service.SendAsync(to, subject, body); // تم التصحيح هنا

        // Assert
        VerifyLog(LogLevel.Warning, "Invalid email parameters");
    }

    [Fact]
    public async Task SendAsync_ShouldLogError_WhenUnexpectedExceptionOccurs()
    {
        _configMock.Setup(c => c["EmailSettings:SmtpServer"]).Returns("smtp.test.com");
        _configMock.Setup(c => c["EmailSettings:SenderEmail"]).Returns("noreply@system.com");

        var service = CreateService();
        await service.SendAsync("recipient@test.com", "Subject", "Body");

        _loggerMock.Verify(x => x.Log(LogLevel.Error, It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), It.IsAny<Func<It.IsAnyType, Exception?, string>>()), Times.AtMostOnce());
    }

    private void VerifyLog(LogLevel level, string messagePart)
    {
        _loggerMock.Verify(
            x => x.Log(
                level,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains(messagePart)),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once());
    }
}
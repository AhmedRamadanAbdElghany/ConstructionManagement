using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    /// <summary>
    /// Service for protecting sensitive data like API keys and secrets.
    /// Uses ASP.NET Core Data Protection API for encryption.
    /// </summary>
    public interface ISensitiveDataProtectionService
    {
        /// <summary>
        /// Encrypts a sensitive value for storage
        /// </summary>
        string? Protect(string? plainText);
        
        /// <summary>
        /// Decrypts a protected value
        /// </summary>
        string? Unprotect(string? protectedText);
        
        /// <summary>
        /// Checks if a value appears to be protected (encrypted)
        /// </summary>
        bool IsProtected(string? value);
    }

    public class SensitiveDataProtectionService : ISensitiveDataProtectionService
    {
        private readonly IDataProtector _protector;
        private readonly ILogger<SensitiveDataProtectionService> _logger;
        private const string ProtectorPurpose = "ConstructionManagement.SensitiveKeys.v1";

        public SensitiveDataProtectionService(
            IDataProtectionProvider protectionProvider,
            ILogger<SensitiveDataProtectionService> logger)
        {
            _protector = protectionProvider.CreateProtector(ProtectorPurpose);
            _logger = logger;
        }

        public string? Protect(string? plainText)
        {
            if (string.IsNullOrEmpty(plainText))
            {
                return plainText;
            }

            try
            {
                // Check if already protected
                if (IsProtected(plainText))
                {
                    _logger.LogWarning("Attempted to protect already-protected value");
                    return plainText;
                }

                var plainBytes = Encoding.UTF8.GetBytes(plainText);
                var protectedBytes = _protector.Protect(plainBytes);
                return Convert.ToBase64String(protectedBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to protect sensitive data");
                throw new InvalidOperationException("Failed to encrypt sensitive data", ex);
            }
        }

        public string? Unprotect(string? protectedText)
        {
            if (string.IsNullOrEmpty(protectedText))
            {
                return protectedText;
            }

            try
            {
                var protectedBytes = Convert.FromBase64String(protectedText);
                var plainBytes = _protector.Unprotect(protectedBytes);
                return Encoding.UTF8.GetString(plainBytes);
            }
            catch (FormatException)
            {
                // Not base64 - might be plain text (legacy data)
                _logger.LogWarning("Value was not in expected base64 format, returning as-is");
                return protectedText;
            }
            catch (CryptographicException ex)
            {
                _logger.LogError(ex, "Failed to unprotect sensitive data - key may have changed or data is corrupted");
                throw new InvalidOperationException("Failed to decrypt sensitive data. The data protection key may have changed.", ex);
            }
        }

        public bool IsProtected(string? value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return false;
            }

            try
            {
                var bytes = Convert.FromBase64String(value);
                // Try to unprotect - if it succeeds, it was protected
                _protector.Unprotect(bytes);
                return true;
            }
            catch (FormatException ex)
            {
                _logger.LogDebug(ex, "Value is not base64 encoded, likely plain text");
                return false;
            }
            catch (CryptographicException ex)
            {
                _logger.LogDebug(ex, "Value is base64 but not protected by this protector");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Unexpected error checking if value is protected");
                return false;
            }
        }
    }
}

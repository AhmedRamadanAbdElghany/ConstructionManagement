using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ConstructionManagement.Infrastructure.Services
{
    /// <summary>
    /// Implementation of translation service supporting Azure Translator and Google Translate
    /// </summary>
    public class TranslationService : ITranslationService
    {
        private readonly HttpClient _httpClient;
        private readonly TranslationSettings _settings;
        private readonly ILogger<TranslationService> _logger;

        public TranslationService(
            HttpClient httpClient,
            IOptions<TranslationSettings> settings,
            ILogger<TranslationService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<string> TranslateAsync(string text, string targetLanguage, string? sourceLanguage = null)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            try
            {
                return _settings.Provider.ToLowerInvariant() switch
                {
                    "azure" => await TranslateWithAzureAsync(text, targetLanguage, sourceLanguage),
                    "google" => await TranslateWithGoogleAsync(text, targetLanguage, sourceLanguage),
                    _ => throw new NotSupportedException($"Translation provider '{_settings.Provider}' is not supported")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Translation failed for text: {Text}", text.Substring(0, Math.Min(50, text.Length)));
                throw;
            }
        }

        public async Task<List<string>> TranslateBatchAsync(IEnumerable<string> texts, string targetLanguage, string? sourceLanguage = null)
        {
            var textList = texts.ToList();
            if (textList.Count == 0)
                return textList;

            try
            {
                return _settings.Provider.ToLowerInvariant() switch
                {
                    "azure" => await TranslateBatchWithAzureAsync(textList, targetLanguage, sourceLanguage),
                    "google" => await TranslateBatchWithGoogleAsync(textList, targetLanguage, sourceLanguage),
                    _ => throw new NotSupportedException($"Translation provider '{_settings.Provider}' is not supported")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Batch translation failed");
                throw;
            }
        }

        public async Task<string> DetectLanguageAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return "en";

            try
            {
                return _settings.Provider.ToLowerInvariant() switch
                {
                    "azure" => await DetectLanguageWithAzureAsync(text),
                    "google" => await DetectLanguageWithGoogleAsync(text),
                    _ => "en"
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Language detection failed, defaulting to English");
                return "en";
            }
        }

        #region Azure Translator Implementation

        private async Task<string> TranslateWithAzureAsync(string text, string targetLanguage, string? sourceLanguage)
        {
            var route = BuildAzureRoute(targetLanguage, sourceLanguage);
            var url = $"{_settings.AzureTranslator.BaseUrl}{route}";

            var body = new[] { new { Text = text } };
            var requestBody = JsonSerializer.Serialize(body);

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");
            request.Headers.Add("Ocp-Apim-Subscription-Key", _settings.AzureTranslator.SubscriptionKey);
            request.Headers.Add("Ocp-Apim-Subscription-Region", _settings.AzureTranslator.Region);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<List<AzureTranslationResponse>>(jsonResponse);

            return result?.FirstOrDefault()?.Translations?.FirstOrDefault()?.Text ?? text;
        }

        private async Task<List<string>> TranslateBatchWithAzureAsync(List<string> texts, string targetLanguage, string? sourceLanguage)
        {
            var route = BuildAzureRoute(targetLanguage, sourceLanguage);
            var url = $"{_settings.AzureTranslator.BaseUrl}{route}";

            var body = texts.Select(t => new { Text = t }).ToArray();
            var requestBody = JsonSerializer.Serialize(body);

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");
            request.Headers.Add("Ocp-Apim-Subscription-Key", _settings.AzureTranslator.SubscriptionKey);
            request.Headers.Add("Ocp-Apim-Subscription-Region", _settings.AzureTranslator.Region);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var results = JsonSerializer.Deserialize<List<AzureTranslationResponse>>(jsonResponse);

            return results?.Select(r => r.Translations?.FirstOrDefault()?.Text ?? "").ToList() ?? texts;
        }

        private async Task<string> DetectLanguageWithAzureAsync(string text)
        {
            var url = $"{_settings.AzureTranslator.Endpoint}/detect?api-version=3.0";

            var body = new[] { new { Text = text } };
            var requestBody = JsonSerializer.Serialize(body);

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");
            request.Headers.Add("Ocp-Apim-Subscription-Key", _settings.AzureTranslator.SubscriptionKey);
            request.Headers.Add("Ocp-Apim-Subscription-Region", _settings.AzureTranslator.Region);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<List<AzureDetectionResponse>>(jsonResponse);

            return result?.FirstOrDefault()?.Language ?? "en";
        }

        private string BuildAzureRoute(string targetLanguage, string? sourceLanguage)
        {
            var route = $"&to={targetLanguage}";
            if (!string.IsNullOrEmpty(sourceLanguage))
                route = $"&from={sourceLanguage}{route}";
            return route;
        }

        #endregion

        #region Google Translate Implementation

        private async Task<string> TranslateWithGoogleAsync(string text, string targetLanguage, string? sourceLanguage)
        {
            var url = $"{_settings.GoogleTranslate.Endpoint}/language/translate/v2?key={_settings.GoogleTranslate.ApiKey}";

            var body = new
            {
                q = text,
                target = targetLanguage,
                source = sourceLanguage,
                format = "text"
            };
            var requestBody = JsonSerializer.Serialize(body);

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<GoogleTranslationResponse>(jsonResponse);

            return result?.Data?.Translations?.FirstOrDefault()?.TranslatedText ?? text;
        }

        private async Task<List<string>> TranslateBatchWithGoogleAsync(List<string> texts, string targetLanguage, string? sourceLanguage)
        {
            var url = $"{_settings.GoogleTranslate.Endpoint}/language/translate/v2?key={_settings.GoogleTranslate.ApiKey}";

            var body = new
            {
                q = texts,
                target = targetLanguage,
                source = sourceLanguage,
                format = "text"
            };
            var requestBody = JsonSerializer.Serialize(body);

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<GoogleTranslationResponse>(jsonResponse);

            return result?.Data?.Translations?.Select(t => t.TranslatedText ?? "").ToList() ?? texts;
        }

        private async Task<string> DetectLanguageWithGoogleAsync(string text)
        {
            var url = $"{_settings.GoogleTranslate.Endpoint}/language/translate/v2/detect?key={_settings.GoogleTranslate.ApiKey}";

            var body = new { q = text };
            var requestBody = JsonSerializer.Serialize(body);

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<GoogleDetectionResponse>(jsonResponse);

            return result?.Data?.Detections?.FirstOrDefault()?.FirstOrDefault()?.Language ?? "en";
        }

        #endregion

        #region Response Models

        private class AzureTranslationResponse
        {
            public List<AzureTranslation>? Translations { get; set; }
        }

        private class AzureTranslation
        {
            public string Text { get; set; } = string.Empty;
            public string? To { get; set; }
        }

        private class AzureDetectionResponse
        {
            public string Language { get; set; } = string.Empty;
            public double Score { get; set; }
        }

        private class GoogleTranslationResponse
        {
            public GoogleTranslationData? Data { get; set; }
        }

        private class GoogleTranslationData
        {
            public List<GoogleTranslation>? Translations { get; set; }
        }

        private class GoogleTranslation
        {
            public string? TranslatedText { get; set; }
            public string? DetectedSourceLanguage { get; set; }
        }

        private class GoogleDetectionResponse
        {
            public GoogleDetectionData? Data { get; set; }
        }

        private class GoogleDetectionData
        {
            public List<List<GoogleDetection>>? Detections { get; set; }
        }

        private class GoogleDetection
        {
            public string Language { get; set; } = string.Empty;
            public double Confidence { get; set; }
        }

        #endregion
    }
}
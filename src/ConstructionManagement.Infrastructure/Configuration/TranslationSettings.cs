namespace ConstructionManagement.Infrastructure.Configuration
{
    /// <summary>
    /// Configuration settings for translation services
    /// </summary>
    public class TranslationSettings
    {
        public string Provider { get; set; } = "Azure"; // "Azure" or "Google"
        public AzureTranslatorSettings AzureTranslator { get; set; } = new();
        public GoogleTranslateSettings GoogleTranslate { get; set; } = new();
    }

    public class AzureTranslatorSettings
    {
        public string SubscriptionKey { get; set; } = string.Empty;
        public string Region { get; set; } = "eastus";
        public string Endpoint { get; set; } = "https://api.cognitive.microsofttranslator.com";
        public string BaseUrl { get; set; } = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
    }

    public class GoogleTranslateSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string ProjectId { get; set; } = string.Empty;
        public string Endpoint { get; set; } = "https://translation.googleapis.com";
    }
}
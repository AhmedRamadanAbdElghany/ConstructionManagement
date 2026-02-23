namespace ConstructionManagement.Application.Interfaces
{
    /// <summary>
    /// Service for translating text between languages
    /// </summary>
    public interface ITranslationService
    {
        /// <summary>
        /// Translates text to the target language
        /// </summary>
        /// <param name="text">Text to translate</param>
        /// <param name="targetLanguage">Target language code (e.g., "ar" for Arabic)</param>
        /// <param name="sourceLanguage">Optional source language code (auto-detected if not provided)</param>
        /// <returns>Translated text</returns>
        Task<string> TranslateAsync(string text, string targetLanguage, string? sourceLanguage = null);

        /// <summary>
        /// Translates multiple texts to the target language
        /// </summary>
        /// <param name="texts">Texts to translate</param>
        /// <param name="targetLanguage">Target language code</param>
        /// <param name="sourceLanguage">Optional source language code</param>
        /// <returns>List of translated texts</returns>
        Task<List<string>> TranslateBatchAsync(IEnumerable<string> texts, string targetLanguage, string? sourceLanguage = null);

        /// <summary>
        /// Detects the language of the text
        /// </summary>
        /// <param name="text">Text to analyze</param>
        /// <returns>Language code</returns>
        Task<string> DetectLanguageAsync(string text);
    }
}
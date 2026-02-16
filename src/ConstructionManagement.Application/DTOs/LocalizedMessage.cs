namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// Represents a message with both Arabic and English translations.
/// Arabic is the primary language as per application requirements.
/// </summary>
public class LocalizedMessage
{
    /// <summary>
    /// The Arabic text of the message (primary language).
    /// </summary>
    public string Ar { get; set; } = string.Empty;

    /// <summary>
    /// The English text of the message.
    /// </summary>
    public string En { get; set; } = string.Empty;

    /// <summary>
    /// Creates a new LocalizedMessage with the specified Arabic and English texts.
    /// </summary>
    /// <param name="ar">Arabic text (primary)</param>
    /// <param name="en">English text</param>
    public LocalizedMessage(string ar, string en)
    {
        Ar = ar;
        En = en;
    }

    /// <summary>
    /// Creates an empty LocalizedMessage.
    /// </summary>
    public LocalizedMessage() { }

    /// <summary>
    /// Creates a LocalizedMessage with the same text for both languages.
    /// Useful for development or when translation is not yet available.
    /// </summary>
    /// <param name="message">The message to use for both languages</param>
    public static LocalizedMessage Same(string message) => new(message, message);

    /// <summary>
    /// Gets the message for the specified language code.
    /// Defaults to Arabic if the language is not found.
    /// </summary>
    /// <param name="languageCode">Language code (e.g., "ar", "en")</param>
    /// <returns>The message in the requested language</returns>
    public string GetMessage(string? languageCode)
    {
        return languageCode?.ToLowerInvariant() switch
        {
            "en" => En,
            _ => Ar // Default to Arabic
        };
    }

    /// <summary>
    /// Implicit conversion from string to LocalizedMessage (creates same text for both languages).
    /// This is useful for backward compatibility during migration.
    /// </summary>
    public static implicit operator LocalizedMessage(string message) => Same(message);

    /// <summary>
    /// Returns a string representation of the message (defaults to Arabic).
    /// </summary>
    public override string ToString() => Ar;
}

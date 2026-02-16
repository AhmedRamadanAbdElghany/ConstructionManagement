using System.Text.Json.Serialization;

namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// Standardized API response wrapper with bilingual message support.
/// All API responses should use this format for consistency.
/// </summary>
/// <typeparam name="T">The type of the data payload</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Indicates whether the operation was successful.
    /// </summary>
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    /// <summary>
    /// The data payload of the response (null if unsuccessful).
    /// </summary>
    [JsonPropertyName("data")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public T? Data { get; set; }

    /// <summary>
    /// Success message with Arabic and English translations.
    /// </summary>
    [JsonPropertyName("message")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public LocalizedMessage? Message { get; set; }

    /// <summary>
    /// Error message with Arabic and English translations (null if successful).
    /// </summary>
    [JsonPropertyName("error")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public LocalizedMessage? Error { get; set; }

    /// <summary>
    /// Validation errors with field names as keys and bilingual messages as values.
    /// </summary>
    [JsonPropertyName("validationErrors")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, LocalizedMessage>? ValidationErrors { get; set; }

    /// <summary>
    /// HTTP status code for the response.
    /// </summary>
    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; }

    /// <summary>
    /// Timestamp of the response.
    /// </summary>
    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Creates a successful response with data and optional message.
    /// </summary>
    public static ApiResponse<T> SuccessResponse(T data, LocalizedMessage? message = null, int statusCode = 200)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message,
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Creates a successful response with only a message (no data).
    /// </summary>
    public static ApiResponse<T> SuccessMessage(LocalizedMessage message, int statusCode = 200)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Creates a failure response with an error message.
    /// </summary>
    public static ApiResponse<T> FailureResponse(LocalizedMessage error, int statusCode = 400)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = error,
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Creates a failure response with validation errors.
    /// </summary>
    public static ApiResponse<T> ValidationFailureResponse(
        Dictionary<string, LocalizedMessage> validationErrors,
        LocalizedMessage? generalError = null,
        int statusCode = 400)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = generalError,
            ValidationErrors = validationErrors,
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Creates a not found response.
    /// </summary>
    public static ApiResponse<T> NotFoundResponse(LocalizedMessage error)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = error,
            StatusCode = 404
        };
    }

    /// <summary>
    /// Creates an unauthorized response.
    /// </summary>
    public static ApiResponse<T> UnauthorizedResponse(LocalizedMessage error)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = error,
            StatusCode = 401
        };
    }

    /// <summary>
    /// Creates a forbidden response.
    /// </summary>
    public static ApiResponse<T> ForbiddenResponse(LocalizedMessage error)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = error,
            StatusCode = 403
        };
    }
}

/// <summary>
/// Non-generic version of ApiResponse for operations that don't return data.
/// </summary>
public class ApiResponse : ApiResponse<object>
{
    /// <summary>
    /// Creates a successful response with only a message.
    /// </summary>
    public static ApiResponse SuccessResponse(LocalizedMessage message, int statusCode = 200)
    {
        return new ApiResponse
        {
            Success = true,
            Message = message,
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Creates a failure response with an error message.
    /// </summary>
    public new static ApiResponse FailureResponse(LocalizedMessage error, int statusCode = 400)
    {
        return new ApiResponse
        {
            Success = false,
            Error = error,
            StatusCode = statusCode
        };
    }
}

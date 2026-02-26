using ConstructionManagement.Application.Constants;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Base controller for all API controllers in the application.
/// Provides helper methods for returning standardized bilingual API responses.
/// Arabic is the primary language as per application requirements.
/// </summary>
[ApiController]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Returns a successful response with data.
    /// </summary>
    /// <typeparam name="T">The type of the data</typeparam>
    /// <param name="data">The data to return</param>
    /// <param name="messageKey">Optional message key from MessageKeys</param>
    /// <param name="statusCode">HTTP status code (default 200)</param>
    /// <returns>Action result with the response</returns>
    protected ActionResult<ApiResponse<T>> Success<T>(T data, string? messageKey = null, int statusCode = 200)
    {
        var message = messageKey != null ? MessageProvider.GetMessage(messageKey) : null;
        var response = ApiResponse<T>.SuccessResponse(data, message, statusCode);
        return StatusCode(statusCode, response);
    }

    /// <summary>
    /// Returns a successful response with only a message (no data).
    /// </summary>
    /// <param name="messageKey">Message key from MessageKeys</param>
    /// <param name="statusCode">HTTP status code (default 200)</param>
    /// <returns>Action result with the response</returns>
    protected ActionResult<ApiResponse> Success(string messageKey, int statusCode = 200)
    {
        var message = MessageProvider.GetMessage(messageKey);
        var response = ApiResponse.SuccessResponse(message, statusCode);
        return StatusCode(statusCode, response);
    }

    /// <summary>
    /// Returns a successful response with a custom bilingual message.
    /// </summary>
    /// <param name="message">The bilingual message</param>
    /// <param name="statusCode">HTTP status code (default 200)</param>
    /// <returns>Action result with the response</returns>
    protected ActionResult<ApiResponse> Success(LocalizedMessage message, int statusCode = 200)
    {
        var response = ApiResponse.SuccessResponse(message, statusCode);
        return StatusCode(statusCode, response);
    }

    /// <summary>
    /// Returns a failure response with an error message.
    /// </summary>
    /// <typeparam name="T">The type of the data (usually void)</typeparam>
    /// <param name="messageKey">Message key from MessageKeys</param>
    /// <param name="statusCode">HTTP status code (default 400)</param>
    /// <returns>Action result with the response</returns>
    protected ActionResult<ApiResponse<T>> Failure<T>(string messageKey, int statusCode = 400)
    {
        var error = MessageProvider.GetMessage(messageKey);
        var response = ApiResponse<T>.FailureResponse(error, statusCode);
        return StatusCode(statusCode, response);
    }

    /// <summary>
    /// Returns a failure response with a custom bilingual error message.
    /// </summary>
    /// <typeparam name="T">The type of the data (usually void)</typeparam>
    /// <param name="error">The bilingual error message</param>
    /// <param name="statusCode">HTTP status code (default 400)</param>
    /// <returns>Action result with the response</returns>
    protected ActionResult<ApiResponse<T>> Failure<T>(LocalizedMessage error, int statusCode = 400)
    {
        var response = ApiResponse<T>.FailureResponse(error, statusCode);
        return StatusCode(statusCode, response);
    }

    /// <summary>
    /// Returns a not found response.
    /// </summary>
    /// <typeparam name="T">The type of the data (usually void)</typeparam>
    /// <param name="messageKey">Message key from MessageKeys (default: General.NotFound)</param>
    /// <returns>Action result with 404 status</returns>
    protected ActionResult<ApiResponse<T>> NotFoundResult<T>(string messageKey = MessageKeys.NotFound)
    {
        var error = MessageProvider.GetMessage(messageKey);
        var response = ApiResponse<T>.NotFoundResponse(error);
        return StatusCode(404, response);
    }

    /// <summary>
    /// Returns an unauthorized response.
    /// </summary>
    /// <typeparam name="T">The type of the data (usually void)</typeparam>
    /// <param name="messageKey">Message key from MessageKeys (default: General.Unauthorized)</param>
    /// <returns>Action result with 401 status</returns>
    protected ActionResult<ApiResponse<T>> UnauthorizedResult<T>(string messageKey = MessageKeys.Unauthorized)
    {
        var error = MessageProvider.GetMessage(messageKey);
        var response = ApiResponse<T>.UnauthorizedResponse(error);
        return StatusCode(401, response);
    }

    /// <summary>
    /// Returns a forbidden response.
    /// </summary>
    /// <typeparam name="T">The type of the data (usually void)</typeparam>
    /// <param name="messageKey">Message key from MessageKeys (default: General.Forbidden)</param>
    /// <returns>Action result with 403 status</returns>
    protected ActionResult<ApiResponse<T>> ForbiddenResult<T>(string messageKey = MessageKeys.Forbidden)
    {
        var error = MessageProvider.GetMessage(messageKey);
        var response = ApiResponse<T>.ForbiddenResponse(error);
        return StatusCode(403, response);
    }

    /// <summary>
    /// Returns a validation error response.
    /// </summary>
    /// <typeparam name="T">The type of the data (usually void)</typeparam>
    /// <param name="validationErrors">Dictionary of field names to bilingual error messages</param>
    /// <param name="generalErrorKey">Optional general error message key</param>
    /// <returns>Action result with 400 status</returns>
    protected ActionResult<ApiResponse<T>> ValidationFailure<T>(
        Dictionary<string, LocalizedMessage> validationErrors,
        string? generalErrorKey = null)
    {
        var generalError = generalErrorKey != null ? MessageProvider.GetMessage(generalErrorKey) : null;
        var response = ApiResponse<T>.ValidationFailureResponse(validationErrors, generalError);
        return StatusCode(400, response);
    }

    /// <summary>
    /// Returns a validation error response for a single field.
    /// </summary>
    /// <typeparam name="T">The type of the data (usually void)</typeparam>
    /// <param name="fieldName">The field name with the error</param>
    /// <param name="messageKey">Message key for the error</param>
    /// <returns>Action result with 400 status</returns>
    protected ActionResult<ApiResponse<T>> ValidationFailure<T>(string fieldName, string messageKey)
    {
        var validationErrors = new Dictionary<string, LocalizedMessage>
        {
            [fieldName] = MessageProvider.GetMessage(messageKey)
        };
        var response = ApiResponse<T>.ValidationFailureResponse(validationErrors);
        return StatusCode(400, response);
    }

    /// <summary>
    /// Returns a bad request response with an error message.
    /// </summary>
    /// <typeparam name="T">The type of the data (usually void)</typeparam>
    /// <param name="messageKey">Message key from MessageKeys</param>
    /// <returns>Action result with 400 status</returns>
    protected ActionResult<ApiResponse<T>> BadRequestResult<T>(string messageKey)
    {
        return Failure<T>(messageKey, 400);
    }

    /// <summary>
    /// Returns a created response with data.
    /// </summary>
    /// <typeparam name="T">The type of the data</typeparam>
    /// <param name="data">The data to return</param>
    /// <param name="messageKey">Optional message key from MessageKeys</param>
    /// <returns>Action result with 201 status</returns>
    protected ActionResult<ApiResponse<T>> Created<T>(T data, string? messageKey = null)
    {
        return Success(data, messageKey, 201);
    }

    /// <summary>
    /// Gets the current user's ID from the JWT token claims.
    /// </summary>
    /// <returns>The current user's ID</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown if the user is not authenticated</exception>
    protected int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }
        return userId;
    }

    /// <summary>
    /// Gets the current company context. 
    /// Priority: X-Company-ID header > JWT companyId claim.
    /// Use this for operations that target a specific company.
    /// </summary>
    /// <returns>The company ID if found, null otherwise</returns>
    protected int? GetCompanyId()
    {
        // First, check for X-Company-ID header (specific company context)
        if (Request.Headers.TryGetValue("X-Company-ID", out var headerCompanyId))
        {
            if (int.TryParse(headerCompanyId, out var companyIdFromHeader))
            {
                return companyIdFromHeader;
            }
        }

        // Fallback to JWT claim
        var companyIdClaim = User.FindFirst("companyId")?.Value;
        if (!string.IsNullOrEmpty(companyIdClaim) && int.TryParse(companyIdClaim, out var companyId))
        {
            return companyId;
        }

        return null;
    }

    /// <summary>
    /// Gets ALL company IDs the user is registered with.
    /// Use this for operations that should show data across all companies.
    /// </summary>
    /// <returns>List of company IDs from the JWT companyIds claim</returns>
    protected List<int> GetAllCompanyIds()
    {
        var companyIdsClaim = User.FindFirst("companyIds")?.Value;
        if (string.IsNullOrEmpty(companyIdsClaim))
        {
            // Fallback to single companyId claim
            var singleId = GetCompanyId();
            return singleId.HasValue ? new List<int> { singleId.Value } : new List<int>();
        }

        return companyIdsClaim.Split(',')
            .Where(s => int.TryParse(s.Trim(), out _))
            .Select(s => int.Parse(s.Trim()))
            .ToList();
    }
}

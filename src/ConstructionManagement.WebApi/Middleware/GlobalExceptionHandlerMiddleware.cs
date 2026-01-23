using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace ConstructionManagement.WebApi.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _env; // عشان نعرف إذا Development أو Production

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, IHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var problemDetails = new ProblemDetails
        {
            Status = (int)HttpStatusCode.InternalServerError,
            Title = "حدث خطأ داخلي في الخادم",
            Detail = _env.IsDevelopment() ? exception.Message : "يرجى المحاولة لاحقًا",
            Instance = context.Request.Path
        };

        // تخصيص حسب نوع الخطأ
        if (exception is ArgumentException argEx)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            problemDetails.Status = context.Response.StatusCode;
            problemDetails.Title = "طلب غير صالح";
            problemDetails.Detail = argEx.Message;
        }
        else if (exception is UnauthorizedAccessException)
        {
            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            problemDetails.Status = context.Response.StatusCode;
            problemDetails.Title = "غير مصرح";
            problemDetails.Detail = "غير مصرح لك بالوصول إلى هذا المورد";
        }
        else if (exception is KeyNotFoundException)
        {
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            problemDetails.Status = context.Response.StatusCode;
            problemDetails.Title = "غير موجود";
            problemDetails.Detail = "الموارد المطلوبة غير موجودة";
        }

        // في Development بس، نضيف Stack Trace
        if (_env.IsDevelopment())
        {
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;
            problemDetails.Extensions["innerException"] = exception.InnerException?.Message;
        }

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        await context.Response.WriteAsync(json);
    }
}
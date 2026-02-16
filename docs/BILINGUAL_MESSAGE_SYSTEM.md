# Bilingual Message System Documentation

## Overview

This application is designed to use **Arabic as the primary language** with English as a secondary language. All messages returned from the backend to the frontend contain both Arabic and English text, and the correct language is displayed based on the user's language selection.

## Architecture

### Backend Components

#### 1. LocalizedMessage DTO
**File:** `src/ConstructionManagement.Application/DTOs/LocalizedMessage.cs`

A DTO class that holds messages in both languages:

```csharp
public class LocalizedMessage
{
    public string Ar { get; set; }  // Arabic - Primary language
    public string En { get; set; }  // English - Secondary language
    
    // Helper methods
    public string GetMessage(string languageCode) { ... }
    public static LocalizedMessage Same(string message) { ... }
    public static implicit operator LocalizedMessage(string message) { ... }
}
```

#### 2. ApiResponse DTO
**File:** `src/ConstructionManagement.Application/DTOs/ApiResponse.cs`

Standardized API response wrapper that includes bilingual messages:

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public LocalizedMessage? Message { get; set; }
    public LocalizedMessage? Error { get; set; }
    public Dictionary<string, LocalizedMessage>? ValidationErrors { get; set; }
    public int StatusCode { get; set; }
    public DateTime Timestamp { get; set; }
    
    // Static factory methods
    public static ApiResponse<T> SuccessResponse(T data, string messageKey) { ... }
    public static ApiResponse<T> FailureResponse(string messageKey, int statusCode) { ... }
    public static ApiResponse<T> NotFoundResponse(string messageKey) { ... }
    // ... more factory methods
}
```

#### 3. MessageKeys Constants
**File:** `src/ConstructionManagement.Application/Constants/MessageKeys.cs`

Centralized constants for all message keys:

```csharp
public static class MessageKeys
{
    // General
    public const string Success = "Success";
    public const string Error = "Error";
    
    // Auth
    public const string AuthLoginSuccess = "Auth.Login.Success";
    public const string AuthInvalidCredentials = "Auth.InvalidCredentials";
    
    // Client
    public const string ClientNotFound = "Client.NotFound";
    public const string ClientCreated = "Client.Created";
    // ... more keys
}
```

#### 4. MessageProvider
**File:** `src/ConstructionManagement.Application/Services/MessageProvider.cs`

Static class that provides bilingual messages:

```csharp
public static class MessageProvider
{
    private static readonly Dictionary<string, LocalizedMessage> Messages = new()
    {
        // General
        { MessageKeys.Success, new LocalizedMessage { Ar = "Success", En = "Success" } },
        { MessageKeys.Error, new LocalizedMessage { Ar = "Error", En = "Error" } },
        
        // Auth
        { MessageKeys.AuthLoginSuccess, new LocalizedMessage { Ar = "Login successful", En = "Login successful" } },
        { MessageKeys.AuthInvalidCredentials, new LocalizedMessage { Ar = "Invalid email or password", En = "Invalid email or password" } },
        
        // ... more messages
    };
    
    public static LocalizedMessage GetMessage(string key) { ... }
    public static LocalizedMessage GetMessage(string key, params object[] parameters) { ... }
}
```

#### 5. BaseApiController
**File:** `src/ConstructionManagement.WebApi/Controllers/BaseApiController.cs`

Base controller with helper methods for returning bilingual responses:

```csharp
public abstract class BaseApiController : ControllerBase
{
    protected ActionResult<ApiResponse<T>> Success<T>(T data, string messageKey) { ... }
    protected ActionResult<ApiResponse<T>> NotFoundResult<T>(string messageKey) { ... }
    protected ActionResult<ApiResponse<T>> UnauthorizedResult<T>(string messageKey) { ... }
    protected ActionResult<ApiResponse<T>> BadRequestResult<T>(string messageKey) { ... }
    // ... more helper methods
}
```

### Frontend Components

#### 1. TypeScript Interfaces
**File:** `construction-cms/src/app/core/models/api-response.models.ts`

```typescript
export interface LocalizedMessage {
  ar: string;  // Arabic - Primary
  en: string;  // English - Secondary
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: LocalizedMessage | null;
  error: LocalizedMessage | null;
  validationErrors: Record<string, LocalizedMessage> | null;
  statusCode: number;
  timestamp: string;
}
```

#### 2. MessageService
**File:** `construction-cms/src/app/core/services/message.service.ts`

Angular service for extracting the correct language from responses:

```typescript
@Injectable({ providedIn: 'root' })
export class MessageService {
    constructor(private translate: TranslateService) {}
    
    getMessage(response: ApiResponse<any>): string { ... }
    getSuccessMessage(response: ApiResponse<any>): string { ... }
    getErrorMessage(response: ApiResponse<any>): string { ... }
    getValidationErrors(response: ApiResponse<any>): Record<string, string> { ... }
}
```

#### 3. HTTP Interceptor
**File:** `construction-cms/src/app/core/auth/auth.interceptor.ts`

Automatically adds language headers to all HTTP requests:

```typescript
export class AuthInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentLanguage = localStorage.getItem('language') || 'ar';
        
        const headers: Record<string, string> = {
            'Accept-Language': currentLanguage,
            'X-Language': currentLanguage
        };
        
        // ... add headers to request
    }
}
```

## Usage Guide

### Backend Usage

#### 1. Controller Implementation

Inherit from `BaseApiController` and use the helper methods:

```csharp
[ApiController]
[Route("api/[controller]")]
public class MyController : BaseApiController
{
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<MyDto>>> Get(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFoundResult<MyDto>(MessageKeys.ItemNotFound);
        
        return Success(item, MessageKeys.Success);
    }
    
    [HttpPost]
    public async Task<ActionResult<ApiResponse<MyDto>>> Create([FromBody] CreateRequest request)
    {
        var item = await _service.CreateAsync(request);
        return Created(nameof(Get), Success(item, MessageKeys.ItemCreated));
    }
}
```

#### 2. Adding New Messages

1. Add the message key to `MessageKeys.cs`:
```csharp
public const string ItemNotFound = "Item.NotFound";
```

2. Add the bilingual message to `MessageProvider.cs`:
```csharp
{ MessageKeys.ItemNotFound, new LocalizedMessage { Ar = "Item not found", En = "Item not found" } },
```

### Frontend Usage

#### 1. Using the MessageService

```typescript
constructor(private messageService: MessageService) {}

this.myService.getData().subscribe({
    next: (response) => {
        const message = this.messageService.getSuccessMessage(response);
        this.snackBar.open(message, 'Close');
        this.data = response.data;
    },
    error: (error) => {
        const message = this.messageService.getErrorMessage(error.error);
        this.snackBar.open(message, 'Close');
    }
});
```

#### 2. Setting the Language

```typescript
// In language switcher component
setLanguage(lang: 'ar' | 'en') {
    localStorage.setItem('language', lang);
    this.translate.use(lang);
    // The HTTP interceptor will automatically send the new language in headers
}
```

## API Response Examples

### Success Response
```json
{
    "success": true,
    "data": { "id": 1, "name": "Item Name" },
    "message": {
        "ar": "Success",
        "en": "Success"
    },
    "error": null,
    "validationErrors": null,
    "statusCode": 200,
    "timestamp": "2026-02-16T18:00:00Z"
}
```

### Error Response
```json
{
    "success": false,
    "data": null,
    "message": null,
    "error": {
        "ar": "Item not found",
        "en": "Item not found"
    },
    "validationErrors": null,
    "statusCode": 404,
    "timestamp": "2026-02-16T18:00:00Z"
}
```

### Validation Error Response
```json
{
    "success": false,
    "data": null,
    "message": null,
    "error": {
        "ar": "Validation failed",
        "en": "Validation failed"
    },
    "validationErrors": {
        "Name": {
            "ar": "Name is required",
            "en": "Name is required"
        },
        "Email": {
            "ar": "Invalid email format",
            "en": "Invalid email format"
        }
    },
    "statusCode": 400,
    "timestamp": "2026-02-16T18:00:00Z"
}
```

## Message Categories

The message keys are organized into the following categories:

| Category | Prefix | Examples |
|----------|--------|----------|
| General | `General.` | `Success`, `Error`, `NotFound` |
| Auth | `Auth.` | `Login.Success`, `InvalidCredentials` |
| User | `User.` | `NotFound`, `Created`, `Updated` |
| Client | `Client.` | `NotFound`, `Created`, `AccessGranted` |
| Project | `Project.` | `NotFound`, `Created`, `StatusUpdated` |
| Company | `Company.` | `NotFound`, `Created` |
| Material | `Material.` | `NotFound`, `LowStock` |
| Equipment | `Equipment.` | `NotFound`, `Assigned` |
| Inventory | `Inventory.` | `NotFound`, `StockUpdated` |
| Warehouse | `Warehouse.` | `NotFound`, `RequestCreated` |
| Task | `Task.` | `NotFound`, `Completed` |
| DailyReport | `DailyReport.` | `NotFound`, `Submitted` |
| Notification | `Notification.` | `Sent`, `Read` |
| File | `File.` | `Uploaded`, `Deleted` |
| Validation | `Validation.` | `Required`, `InvalidFormat` |
| Permission | `Permission.` | `Denied`, `Insufficient` |

## Best Practices

1. **Always use MessageKeys constants** - Never hardcode message key strings
2. **Add messages to MessageProvider** - Ensure all keys have corresponding bilingual messages
3. **Arabic first** - Arabic is the primary language, always provide Arabic text
4. **Consistent naming** - Use dot notation for message key categories (e.g., `Client.NotFound`)
5. **Use BaseApiController** - Inherit from the base controller to get helper methods
6. **Handle validation errors** - Use `ValidationFailure` for model validation errors

## Migration Guide

To migrate existing controllers to use bilingual responses:

1. Change the controller to inherit from `BaseApiController`
2. Add `using ConstructionManagement.Application.Constants;` and `using ConstructionManagement.Application.DTOs;`
3. Update return types to `ActionResult<ApiResponse<T>>`
4. Replace `Ok(data)` with `Success(data, MessageKeys.Success)`
5. Replace `NotFound(new { message = "..." })` with `NotFoundResult<T>(MessageKeys.NotFound)`
6. Replace `BadRequest(new { message = "..." })` with `BadRequestResult<T>(MessageKeys.Error)`
7. Replace `Unauthorized(new { message = "..." })` with `UnauthorizedResult<T>(MessageKeys.Unauthorized)`

## Testing

When testing the bilingual message system:

1. Test with both Arabic (`ar`) and English (`en`) language headers
2. Verify that the correct language message is returned
3. Test validation errors with multiple fields
4. Test all response types (success, error, not found, unauthorized, etc.)
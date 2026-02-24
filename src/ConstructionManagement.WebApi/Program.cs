using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Application.Validators;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Authorization;
using ConstructionManagement.Infrastructure.BackgroundJobs;
using ConstructionManagement.Infrastructure.Configuration;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using ConstructionManagement.WebApi.Middleware;
using FluentValidation;
using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.Extensions.FileProviders;
using System.Globalization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// 1. Controllers + FluentValidation
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        
        // Ensure UTC DateTime serialization with 'Z' suffix
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    });

// Custom UTC DateTime Converter moved to end of file

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateProjectRequestValidator>();

// 1.5 Localization - Arabic as default, English as secondary
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.AddScoped<ILocalizationService, LocalizationService>();
builder.Services.AddHttpContextAccessor();

var supportedCultures = new[]
{
    new CultureInfo("ar"),
    new CultureInfo("en")
};

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new Microsoft.AspNetCore.Localization.RequestCulture("ar");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
    
    // Custom provider to check Accept-Language header, X-Language header, and query string
    options.RequestCultureProviders.Insert(0, new Microsoft.AspNetCore.Localization.CustomRequestCultureProvider(context =>
    {
        // Check Accept-Language header
        var acceptLanguage = context.Request.Headers["Accept-Language"].FirstOrDefault();
        if (!string.IsNullOrEmpty(acceptLanguage))
        {
            if (acceptLanguage.StartsWith("en", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult<Microsoft.AspNetCore.Localization.ProviderCultureResult?>(new Microsoft.AspNetCore.Localization.ProviderCultureResult("en"));
            if (acceptLanguage.StartsWith("ar", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult<Microsoft.AspNetCore.Localization.ProviderCultureResult?>(new Microsoft.AspNetCore.Localization.ProviderCultureResult("ar"));
        }
        
        // Check X-Language header
        var langHeader = context.Request.Headers["X-Language"].FirstOrDefault();
        if (!string.IsNullOrEmpty(langHeader))
        {
            if (langHeader.Equals("en", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult<Microsoft.AspNetCore.Localization.ProviderCultureResult?>(new Microsoft.AspNetCore.Localization.ProviderCultureResult("en"));
            if (langHeader.Equals("ar", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult<Microsoft.AspNetCore.Localization.ProviderCultureResult?>(new Microsoft.AspNetCore.Localization.ProviderCultureResult("ar"));
        }
        
        // Check query string
        var langQuery = context.Request.Query["lang"].FirstOrDefault();
        if (!string.IsNullOrEmpty(langQuery))
        {
            if (langQuery.Equals("en", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult<Microsoft.AspNetCore.Localization.ProviderCultureResult?>(new Microsoft.AspNetCore.Localization.ProviderCultureResult("en"));
            if (langQuery.Equals("ar", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult<Microsoft.AspNetCore.Localization.ProviderCultureResult?>(new Microsoft.AspNetCore.Localization.ProviderCultureResult("ar"));
        }
        
        // Default to Arabic
        return Task.FromResult<Microsoft.AspNetCore.Localization.ProviderCultureResult?>(new Microsoft.AspNetCore.Localization.ProviderCultureResult("ar"));
    }));
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
bool isTesting = (connectionString?.Contains("DataSource=", StringComparison.OrdinalIgnoreCase) ?? false)
              || builder.Configuration.GetValue<bool>("IsTesting") 
              || builder.Environment.EnvironmentName == "Testing"
              || Environment.GetEnvironmentVariable("IsTesting") == "true"
              || Environment.CommandLine.Contains("testhost", StringComparison.OrdinalIgnoreCase)
              || Environment.CommandLine.Contains("xunit", StringComparison.OrdinalIgnoreCase)
              || AppDomain.CurrentDomain.GetAssemblies().Any(a => a.FullName!.Contains("xunit", StringComparison.OrdinalIgnoreCase));

Console.WriteLine($"DEBUG: isTesting={isTesting}, ConnectionString={connectionString}");

// 2. Database
if (!isTesting)
{
    builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
    {
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        options.UseSqlServer(connectionString);
    });
}


// 4. Company context (scoped per request)
builder.Services.AddScoped<ICompanyContext, CompanyContext>();

// 5. Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectItemRepository, ProjectItemRepository>();
builder.Services.AddScoped<IRepository<ProjectApprovalRule>, Repository<ProjectApprovalRule>>();
builder.Services.AddScoped<IRepository<ProjectItemProfitabilityLog>, Repository<ProjectItemProfitabilityLog>>();
builder.Services.AddScoped<IRepository<ProjectSettings>, Repository<ProjectSettings>>();
builder.Services.AddScoped<IRepository<EscalationLog>, Repository<EscalationLog>>();
builder.Services.AddScoped<IRepository<Notification>, Repository<Notification>>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IRepository<UserTypeHistory>, Repository<UserTypeHistory>>();
builder.Services.AddScoped<IRepository<ProjectTeamRole>, Repository<ProjectTeamRole>>();
builder.Services.AddScoped<IRepository<ProjectItemExecutedDelta>, Repository<ProjectItemExecutedDelta>>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<ICompanyRequestRepository, CompanyRequestRepository>();
builder.Services.AddScoped<IJoinRequestRepository, JoinRequestRepository>();
builder.Services.AddScoped<IMaterialRepository, MaterialRepository>();
builder.Services.AddScoped<IMaterialCategoryRepository, MaterialCategoryRepository>();
builder.Services.AddScoped<IMaterialStockRepository, MaterialStockRepository>();
builder.Services.AddScoped<IMaterialRequestRepository, MaterialRequestRepository>();
builder.Services.AddScoped<IMaterialRequestItemRepository, MaterialRequestItemRepository>();
builder.Services.AddScoped<IMaterialConsumptionRepository, MaterialConsumptionRepository>();
builder.Services.AddScoped<IWarehouseRepository, WarehouseRepository>();

// 6. Services
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectTeamService, ProjectTeamService>();
builder.Services.AddScoped<IProjectItemService, ProjectItemService>();
builder.Services.AddScoped<IPhaseService, PhaseService>();
builder.Services.AddScoped<IDailyLogService, DailyLogService>();
builder.Services.AddScoped<ISiteMediaService, SiteMediaService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IProjectSettingsService, ProjectSettingsService>();
builder.Services.AddScoped<IProjectApprovalRuleService, ProjectApprovalRuleService>();
builder.Services.AddScoped<IProjectDelayEscalationService, ProjectDelayEscalationService>(); // renamed & kept
builder.Services.AddScoped<IProjectTransactionService, ProjectTransactionService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
    builder.Services.AddScoped<IDesignService, DesignService>();
    builder.Services.AddScoped<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<ICashVoucherService, CashVoucherService>();
builder.Services.AddScoped<IMiscExpenseService, MiscExpenseService>();
builder.Services.AddScoped<ISocialMediaService, SocialMediaService>();
builder.Services.AddScoped<ITranslationService, TranslationService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Configure settings
builder.Services.Configure<SocialMediaSettings>(builder.Configuration.GetSection("SocialMedia"));
builder.Services.Configure<TranslationSettings>(builder.Configuration.GetSection("Translation"));

// Register HttpClient for external API calls
builder.Services.AddHttpClient<ITranslationService, TranslationService>();
builder.Services.AddHttpClient<ISocialMediaService, SocialMediaService>();
builder.Services.AddScoped<IQualityService, QualityService>();
builder.Services.AddScoped<ISafetyChecklistService, SafetyService>();
builder.Services.AddScoped<ISafetyInspectionService, SafetyService>();
builder.Services.AddScoped<ISafetyIncidentService, SafetyService>();
builder.Services.AddScoped<ISafetyTrainingService, SafetyService>();
builder.Services.AddScoped<ISafetyComplianceService, SafetyService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IClientPortalService, ClientPortalService>();
builder.Services.AddScoped<ICompanyRequestService, CompanyRequestService>();
builder.Services.AddScoped<IJoinRequestService, JoinRequestService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IWarehouseOrderService, WarehouseOrderService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<ISubcontractorService, SubcontractorService>();
builder.Services.AddScoped<ICompanyAnnouncementService, CompanyAnnouncementService>();
builder.Services.AddScoped<IHRService, HRService>();
builder.Services.AddScoped<IProductCategoryService, ProductCategoryService>();
builder.Services.AddScoped<IMessagingService, MessagingService>();
builder.Services.AddScoped<ILocationTrackingService, LocationTrackingService>();
builder.Services.AddScoped<IGeofenceService, GeofenceService>();
builder.Services.AddScoped<ISensitiveDataProtectionService, SensitiveDataProtectionService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IPushNotificationService, PushNotificationService>();
builder.Services.AddHttpClient<IPushNotificationService, PushNotificationService>();
builder.Services.AddScoped<ILeaveManagementService, LeaveManagementService>();
builder.Services.AddScoped<IFinancialReportService, FinancialReportService>();
builder.Services.AddScoped<IPerformanceEvaluationService, PerformanceEvaluationService>();
builder.Services.AddScoped<IVideoVoiceCallService, VideoVoiceCallService>();
builder.Services.AddScoped<IMultiCurrencyService, MultiCurrencyService>();
builder.Services.AddScoped<ITrainingService, TrainingService>();
builder.Services.AddScoped<IInspectionService, InspectionService>();
// HR Gap Features Services
builder.Services.AddScoped<IEmployeeDocumentService, EmployeeDocumentService>();
builder.Services.AddScoped<IWorkerSelfServiceService, WorkerSelfServiceService>();
builder.Services.AddScoped<IEmployeeOnboardingService, EmployeeOnboardingService>();
builder.Services.AddScoped<IDisciplinaryActionService, DisciplinaryActionService>();
builder.Services.AddScoped<ISkillsMatrixService, SkillsMatrixService>();
builder.Services.AddScoped<IWarehouseJoinRequestService, WarehouseJoinRequestService>();
builder.Services.AddScoped<IUserTypeService, UserTypeService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
// Task Management & Workflow Services
builder.Services.AddScoped<ITaskManagementService, TaskManagementService>();
builder.Services.AddScoped<ITaskNotificationService, TaskNotificationService>();
builder.Services.AddScoped<IEscalationService, EscalationService>();
builder.Services.AddScoped<IWorkflowConfigurationService, WorkflowConfigurationService>();
builder.Services.AddScoped<IDailyTaskBoardService, DailyTaskBoardService>();
builder.Services.AddScoped<IWorkflowBackgroundJobService, WorkflowBackgroundJobService>();
// builder.Services.AddHttpClient<PushNotificationService>(); // Redundant and redundant




// Approval-specific escalation job
builder.Services.AddScoped<ApprovalEscalationJob>();
builder.Services.AddScoped<LocationTrackingJobs>();

// 7. JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtConfig = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtConfig["Key"] ?? throw new InvalidOperationException("JWT Key is missing");
    var keyBytes = Encoding.UTF8.GetBytes(secretKey);

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = jwtConfig["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtConfig["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// 8. Authorization Policies (project-specific + global)
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthorizationHandler, ProjectRoleHandler>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("CanManageUsers", policy => policy.RequireRole("SuperAdmin", "CompanyAdmin"));

    // Project-specific permissions
    options.AddPolicy("CanViewProject", policy => policy.AddRequirements(new ProjectRoleRequirement("Project.View")));
    options.AddPolicy("CanEditProject", policy => policy.AddRequirements(new ProjectRoleRequirement("Project.Edit")));
    options.AddPolicy("CanCloseProject", policy => policy.AddRequirements(new ProjectRoleRequirement("Project.Close")));
    options.AddPolicy("CanViewProjectFinancials", policy => policy.AddRequirements(new ProjectRoleRequirement("Financials.View")));
    options.AddPolicy("CanAddTransaction", policy => policy.AddRequirements(new ProjectRoleRequirement("Transaction.Add")));
    options.AddPolicy("CanViewTransactions", policy => policy.AddRequirements(new ProjectRoleRequirement("Financials.View")));
    options.AddPolicy("CanReviewTransactions", policy => policy.AddRequirements(new ProjectRoleRequirement("Transaction.Review")));
    options.AddPolicy("CanReviewInvoices", policy => policy.AddRequirements(new ProjectRoleRequirement("Transaction.Review")));
    options.AddPolicy("CanReviewSiteMedia", policy => policy.AddRequirements(new ProjectRoleRequirement("Media.Review")));
    options.AddPolicy("CanReviewSiteImage", policy => policy.AddRequirements(new ProjectRoleRequirement("Media.Review")));
    options.AddPolicy("CanCloseDailyLog", policy => policy.AddRequirements(new ProjectRoleRequirement("DailyLog.Close")));
    options.AddPolicy("CanManageProjectSettings", policy => policy.AddRequirements(new ProjectRoleRequirement("Settings.Manage")));
    
    // Daily Log specific permissions
    options.AddPolicy("CanAddProgressEntry", policy => policy.AddRequirements(new ProjectRoleRequirement("DailyLog.AddEntry")));
    options.AddPolicy("CanReopenClosedDaily", policy => policy.AddRequirements(new ProjectRoleRequirement("DailyLog.Reopen")));
    options.AddPolicy("CanApproveProgressEntry", policy => policy.AddRequirements(new ProjectRoleRequirement("DailyLog.Approve")));

    // Design permissions
    options.AddPolicy("CanAddDesign", policy => policy.AddRequirements(new ProjectRoleRequirement("Design.Add")));

    // NOTE: Add policy tests for each permission.
});

// 9. Hangfire
var hfConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!isTesting && hfConnectionString != null && !hfConnectionString.Contains("DataSource=", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseSqlServerStorage(hfConnectionString));

    builder.Services.AddHangfireServer();
}

// 10. Swagger with JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Construction Management API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options => {
    // Development policy - more permissive for local development
    options.AddPolicy("Development",
        builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

    // Production policy - restrict to known origins
    options.AddPolicy("Production", corsBuilder =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (allowedOrigins.Length > 0)
        {
            corsBuilder.WithOrigins(allowedOrigins)
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        }
        else
        {
            // Fallback: only allow same-origin if no origins configured
            corsBuilder.SetIsOriginAllowed(origin => false);
        }
    });

    // Default policy for backward compatibility (uses environment-appropriate settings)
    options.AddPolicy("AllowAll",
        corsBuilder => corsBuilder.SetIsOriginAllowed(_ => builder.Environment.IsDevelopment())
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

// 10.5 Rate Limiting for Payment Endpoints
builder.Services.AddRateLimiter(options =>
{
    // Get rate limiting configuration
    var paymentRateLimit = builder.Configuration.GetSection("RateLimiting:PaymentEndpoints");
    var permitLimit = paymentRateLimit.GetValue<int>("PermitLimit", 10);
    var windowMinutes = paymentRateLimit.GetValue<int>("WindowMinutes", 1);

    // Payment endpoints rate limit policy - prevents abuse of payment initiation
    options.AddPolicy("PaymentRateLimit", context =>
    {
        var userId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: userId,
            factory: _ => new System.Threading.RateLimiting.SlidingWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromMinutes(windowMinutes),
                SegmentsPerWindow = 4, // Smoother distribution
                QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst,
                QueueLimit = 2 // Allow small queue for burst handling
            });
    });

    // Global rate limit for all API endpoints
    options.AddFixedWindowLimiter("GlobalApiLimit", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 10;
    });

    // Handle rate limit exceeded
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        
        var response = new
        {
            Success = false,
            Message = "Too many requests. Please try again later.",
            MessageKey = "Errors.RateLimitExceeded"
        };
        
        await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken);
    };
});

var app = builder.Build();

// 11. Middleware Pipeline (ترتيب Middleware مهم جداً) ---

// Exception handler MUST be FIRST to catch everything
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Ensure WebRootPath is set
if (string.IsNullOrEmpty(app.Environment.WebRootPath))
{
    app.Environment.WebRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Explicitly serve files from wwwroot/uploads
var contentRoot = app.Environment.ContentRootPath;
var uploadsPath = Path.Combine(contentRoot, "wwwroot", "uploads");

// Log paths for debugging (optional, will show in console)
Console.WriteLine($"[StaticFiles] ContentRoot: {contentRoot}");
Console.WriteLine($"[StaticFiles] UploadsPath: {uploadsPath}");

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Setup ContentType provider for CAD files
var contentTypeProvider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
contentTypeProvider.Mappings[".dwg"] = "application/acad";
contentTypeProvider.Mappings[".dxf"] = "application/dxf";
contentTypeProvider.Mappings[".pdf"] = "application/pdf";

app.UseStaticFiles(); // Default wwwroot

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
    ContentTypeProvider = contentTypeProvider,
    ServeUnknownFileTypes = true,
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000");
    }
});

app.UseRouting();

// Use environment-appropriate CORS policy
if (app.Environment.IsDevelopment())
{
    app.UseCors("Development");
}
else
{
    app.UseCors("Production");
}

// Localization middleware - MUST come before authentication
var localizationOptions = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<RequestLocalizationOptions>>().Value;
app.UseRequestLocalization(localizationOptions);

// Company resolution middleware – MUST come early
app.UseMiddleware<CompanyResolutionMiddleware>();

// Hangfire Dashboard (secured – only SuperAdmin)
if (!isTesting && hfConnectionString != null && !hfConnectionString.Contains("DataSource=", StringComparison.OrdinalIgnoreCase))
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[] { new HangfireCustomAuthorizationFilter() }
    });

    // Schedule background jobs

    // 1. Daily project/item delay & budget warnings (morning check)
    RecurringJob.AddOrUpdate<IProjectDelayEscalationService>(
        "project-delay-escalation-daily",
        service => service.CheckProjectAndItemDelaysAsync(),
        Cron.Daily(8));  // Every day at 8:00 AM

    // 2. Hourly approval workflow timeouts
    RecurringJob.AddOrUpdate<ApprovalEscalationJob>(
        "approval-escalation-check-hourly",
        job => job.CheckAndEscalateDelayedApprovalsAsync(),
        Cron.Hourly);  // Every hour

    // TODO: Create ProjectItemProgressAggregationJob if needed
    // RecurringJob.AddOrUpdate<ProjectItemProgressAggregationJob>(
    //     "aggregate-projectitem-deltas",
    //     job => job.AggregatePendingDeltas(),
    //     Cron.Hourly);

    // Location Tracking Jobs
    // 4. Daily random check generation (early morning before work starts)
    RecurringJob.AddOrUpdate<LocationTrackingJobs>(
        "location-random-checks-daily",
        job => job.GenerateDailyRandomChecksAsync(),
        Cron.Daily(6));  // Every day at 6:00 AM

    // 5. Process expired location requests (every 5 minutes)
    RecurringJob.AddOrUpdate<LocationTrackingJobs>(
        "location-expired-requests",
        job => job.ProcessExpiredRequestsAsync(),
        "*/5 * * * *");  // Every 5 minutes

    // 6. Send location reminders (every 5 minutes)
    RecurringJob.AddOrUpdate<LocationTrackingJobs>(
        "location-reminders",
        job => job.SendLocationRemindersAsync(),
        "*/5 * * * *");  // Every 5 minutes

    // 7. Check geofence violations (every 10 minutes)
    RecurringJob.AddOrUpdate<LocationTrackingJobs>(
        "geofence-violations-check",
        job => job.CheckGeofenceViolationsAsync(),
        "*/10 * * * *");  // Every 10 minutes

    // 8. Social Media Fetch Job - Daily fetch from all configured sources
    RecurringJob.AddOrUpdate<SocialMediaFetchJob>(
        "social-media-fetch-daily",
        job => job.FetchAndTranslateAsync(),
        Cron.Daily(7));  // Every day at 7:00 AM
}

app.UseAuthentication();
app.UseAuthorization();

// Rate limiting middleware - must be after authentication for user-based rate limiting
app.UseRateLimiter();

app.MapControllers();


try 
{
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"FATAL: Application startup failed: {ex}");
    throw;
}

// Hangfire Custom Authorization Filter
public class HangfireCustomAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        return httpContext.User.Identity?.IsAuthenticated == true &&
               httpContext.User.IsInRole("SuperAdmin");
    }
}
  
public partial class Program {} 

// Custom UTC DateTime Converter
public class UtcDateTimeConverter : System.Text.Json.Serialization.JsonConverter<DateTime>
{
    public override DateTime Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
    {
        var date = reader.GetDateTime();
        return date.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(date, DateTimeKind.Utc) : date.ToUniversalTime();
    }

    public override void Write(System.Text.Json.Utf8JsonWriter writer, DateTime value, System.Text.Json.JsonSerializerOptions options)
    {
        var utcValue = value.Kind == DateTimeKind.Unspecified 
            ? DateTime.SpecifyKind(value, DateTimeKind.Utc) 
            : value.ToUniversalTime();
            
        writer.WriteStringValue(utcValue.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
    }
}

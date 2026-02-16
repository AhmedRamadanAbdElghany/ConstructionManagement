using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Application.Validators;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Authorization;
using ConstructionManagement.Infrastructure.BackgroundJobs;
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
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.Extensions.FileProviders;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// 1. Controllers + FluentValidation
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateProjectRequestValidator>();

// 1.5 Localization - Arabic as default, English as secondary
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.AddSingleton<ILocalizationService, LocalizationService>();
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
                return Task.FromResult(new Microsoft.AspNetCore.Localization.ProviderCultureResult("en"));
            if (acceptLanguage.StartsWith("ar", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult(new Microsoft.AspNetCore.Localization.ProviderCultureResult("ar"));
        }
        
        // Check X-Language header
        var langHeader = context.Request.Headers["X-Language"].FirstOrDefault();
        if (!string.IsNullOrEmpty(langHeader))
        {
            if (langHeader.Equals("en", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult(new Microsoft.AspNetCore.Localization.ProviderCultureResult("en"));
            if (langHeader.Equals("ar", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult(new Microsoft.AspNetCore.Localization.ProviderCultureResult("ar"));
        }
        
        // Check query string
        var langQuery = context.Request.Query["lang"].FirstOrDefault();
        if (!string.IsNullOrEmpty(langQuery))
        {
            if (langQuery.Equals("en", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult(new Microsoft.AspNetCore.Localization.ProviderCultureResult("en"));
            if (langQuery.Equals("ar", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult(new Microsoft.AspNetCore.Localization.ProviderCultureResult("ar"));
        }
        
        // Default to Arabic
        return Task.FromResult(new Microsoft.AspNetCore.Localization.ProviderCultureResult("ar"));
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
builder.Services.AddScoped<IBOQItemRepository, BOQItemRepository>();
builder.Services.AddScoped<IRepository<ProjectApprovalRule>, Repository<ProjectApprovalRule>>();
builder.Services.AddScoped<IRepository<BOQProfitabilityLog>, Repository<BOQProfitabilityLog>>();
builder.Services.AddScoped<IRepository<ProjectSettings>, Repository<ProjectSettings>>();
builder.Services.AddScoped<IRepository<EscalationLog>, Repository<EscalationLog>>();
builder.Services.AddScoped<IRepository<Notification>, Repository<Notification>>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IRepository<UserTypeHistory>, Repository<UserTypeHistory>>();
builder.Services.AddScoped<IRepository<ProjectTeamRole>, Repository<ProjectTeamRole>>();
builder.Services.AddScoped<IRepository<BOQExecutedDelta>, Repository<BOQExecutedDelta>>();
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
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectTeamService, ProjectTeamService>();
builder.Services.AddScoped<IBOQItemService, BOQItemService>();
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
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<ICashVoucherService, CashVoucherService>();
builder.Services.AddScoped<IMiscExpenseService, MiscExpenseService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IUserTypeService, UserTypeService>();
builder.Services.AddScoped<IDashboardStatisticsService, DashboardStatisticsService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IMaterialService, MaterialService>();
builder.Services.AddScoped<IMaterialCategoryService, MaterialCategoryService>();
builder.Services.AddScoped<IMaterialStockService, MaterialStockService>();
builder.Services.AddScoped<IMaterialRequestService, MaterialRequestService>();
builder.Services.AddScoped<IMaterialConsumptionService, MaterialConsumptionService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<IEquipmentService, EquipmentService>();
builder.Services.AddScoped<IEquipmentMaintenanceService, EquipmentMaintenanceService>();
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





// Approval-specific escalation job
builder.Services.AddScoped<ApprovalEscalationJob>();

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
    var keyBytes = Encoding.ASCII.GetBytes(secretKey);

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
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// --- 11. Middleware Pipeline (ترتيب Middleware مهم جداً) ---

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
app.UseCors("AllowAll");

// Localization middleware - MUST come before authentication
var localizationOptions = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<RequestLocalizationOptions>>().Value;
app.UseRequestLocalization(localizationOptions);

// Company resolution middleware – MUST come early
app.UseMiddleware<CompanyResolutionMiddleware>();

app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

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

    // في Program.cs بعد AddHangfireServer()
    RecurringJob.AddOrUpdate<BOQProgressAggregationJob>(
        "aggregate-boq-deltas",
        job => job.AggregatePendingDeltas(),
        Cron.Hourly);  // كل ساعة – أو Cron.Daily(3) لكل يوم الساعة 3 صباحًا
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();

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

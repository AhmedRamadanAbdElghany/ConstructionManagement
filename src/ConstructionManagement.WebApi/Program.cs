using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Application.Validators;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Authorization;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

// Add these for Google Gemini (official SDK)
using Google.GenAI;
using Google.GenAI.Types;

var builder = WebApplication.CreateBuilder(args);

// 1. Add controllers
builder.Services.AddControllers();

// 2. FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateProjectRequestValidator>();

// 3. Database (SQL Server)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 4. Generic + Specific Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Specific repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBOQItemRepository, BOQItemRepository>();
builder.Services.AddScoped<IRepository<ProjectApprovalRule>, Repository<ProjectApprovalRule>>();
builder.Services.AddScoped<IRepository<BOQProfitabilityLog>, Repository<BOQProfitabilityLog>>();
builder.Services.AddScoped<IRepository<ProjectSettings>, Repository<ProjectSettings>>();
builder.Services.AddScoped<IRepository<EscalationLog>, Repository<EscalationLog>>();
builder.Services.AddScoped<IRepository<Notification>, Repository<Notification>>();

// 5. All Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectTeamService, ProjectTeamService>();
builder.Services.AddScoped<IBOQItemService, BOQItemService>();
builder.Services.AddScoped<IDailyLogService, DailyLogService>();
builder.Services.AddScoped<ISiteMediaService, SiteMediaService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>(); // or AzureFileStorageService later
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IProjectSettingsService, ProjectSettingsService>();
builder.Services.AddScoped<IProjectApprovalRuleService, ProjectApprovalRuleService>();
builder.Services.AddScoped<IEscalationService, EscalationService>();
builder.Services.AddScoped<IProjectTransactionService, ProjectTransactionService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Notification & Email stubs (replace with real impl later)
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// 6. JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// 7. Authorization Policies + Custom Handlers
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthorizationHandler, ProjectRoleHandler>();

// Read Gemini API key (falls back to environment variable)
var geminiApiKey = builder.Configuration["Gemini:ApiKey"]
    ?? builder.Configuration["GEMINI_API_KEY"];

if (string.IsNullOrWhiteSpace(geminiApiKey))
{
    if (builder.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Gemini API key is missing! Add it via: dotnet user-secrets set \"Gemini:ApiKey\" \"your-key\"");
    }
    else
    {
        throw new InvalidOperationException("Gemini API key is missing. Set it as environment variable.");
    }
}

// Register the official Google GenAI client (thread-safe, singleton is fine)
builder.Services.AddSingleton<Client>(sp => new Client(apiKey: geminiApiKey));

builder.Services.AddAuthorization(options =>
{
    // Global roles
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("CanManageUsers", policy => policy.RequireRole("SuperAdmin", "CompanyAdmin"));
    options.AddPolicy("CanCreateProject", policy => policy.RequireRole("SuperAdmin", "ProjectCreator"));
    options.AddPolicy("CanEditProject", policy => policy.RequireRole("SuperAdmin", "ProjectAdmin"));
    options.AddPolicy("CanCloseProject", policy => policy.RequireRole("SuperAdmin", "ProjectAdmin"));
    options.AddPolicy("CanManageProjectSettings", policy => policy.RequireRole("SuperAdmin", "ProjectAdmin"));
    options.AddPolicy("CanViewProjectFinancials", policy =>
        policy.RequireRole("SuperAdmin", "ProjectAdmin", "FinanceManager"));
    options.AddPolicy("CanAddTransaction", policy =>
        policy.RequireRole("SuperAdmin", "FinanceManager", "ProjectAdmin"));
    options.AddPolicy("CanViewTransactions", policy =>
        policy.RequireRole("SuperAdmin", "FinanceManager", "ProjectAdmin"));
    options.AddPolicy("CanReviewTransactions", policy =>
        policy.RequireRole("SuperAdmin", "FinanceManager"));

    // Project-specific custom policies
    options.AddPolicy("CanReviewSiteImage", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("MediaReviewer")));
    options.AddPolicy("CanCloseDaily", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("SiteEngineer")));
});

// 8. Hangfire for background jobs
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

// 9. Swagger
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

var app = builder.Build();

// 10. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Hangfire Dashboard (secured - only SuperAdmin)
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles(); // for serving local uploaded files (images, invoices, etc.)

app.MapControllers();

// Schedule daily escalation job
RecurringJob.AddOrUpdate<IEscalationService>(
    "daily-delay-escalations",
    service => service.CheckAndSendDelayEscalationsAsync(),
    Cron.Daily(8)); // every day at 8 AM

app.Run();

// Hangfire Dashboard Authorization Filter
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        return httpContext.User.Identity?.IsAuthenticated == true &&
               httpContext.User.IsInRole("SuperAdmin");
    }
}
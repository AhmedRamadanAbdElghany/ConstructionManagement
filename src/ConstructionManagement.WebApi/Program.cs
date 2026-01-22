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
using Google.GenAI;

var builder = WebApplication.CreateBuilder(args);

// 1. Add controllers + FluentValidation
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateProjectRequestValidator>();

// 2. Database (SQL Server)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Repositories (Generic + Specific)
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBOQItemRepository, BOQItemRepository>();
builder.Services.AddScoped<IRepository<ProjectApprovalRule>, Repository<ProjectApprovalRule>>();
builder.Services.AddScoped<IRepository<BOQProfitabilityLog>, Repository<BOQProfitabilityLog>>();
builder.Services.AddScoped<IRepository<ProjectSettings>, Repository<ProjectSettings>>();
builder.Services.AddScoped<IRepository<EscalationLog>, Repository<EscalationLog>>();
builder.Services.AddScoped<IRepository<Notification>, Repository<Notification>>();

// 4. Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectTeamService, ProjectTeamService>();
builder.Services.AddScoped<IBOQItemService, BOQItemService>();
builder.Services.AddScoped<IDailyLogService, DailyLogService>();
builder.Services.AddScoped<ISiteMediaService, SiteMediaService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IProjectSettingsService, ProjectSettingsService>();
builder.Services.AddScoped<IProjectApprovalRuleService, ProjectApprovalRuleService>();
builder.Services.AddScoped<IEscalationService, EscalationService>();
builder.Services.AddScoped<IProjectTransactionService, ProjectTransactionService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Notification & Email
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// 5. JWT Authentication
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

// 6. Authorization + Custom Policy Handlers
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthorizationHandler, ProjectRoleHandler>();

builder.Services.AddAuthorization(options =>
{
    // Global roles
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("CanManageUsers", policy => policy.RequireRole("SuperAdmin", "CompanyAdmin"));

    // Project-specific permissions (using custom requirement & handler)
    options.AddPolicy("CanEditProject", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("Project.Edit")));

    options.AddPolicy("CanCloseProject", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("Project.Close")));

    options.AddPolicy("CanViewProjectFinancials", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("Financials.View")));

    options.AddPolicy("CanAddTransaction", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("Transaction.Add")));

    options.AddPolicy("CanReviewTransactions", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("Transaction.Review")));

    options.AddPolicy("CanReviewSiteMedia", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("Media.Review")));

    options.AddPolicy("CanCloseDailyLog", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("DailyLog.Close")));

    options.AddPolicy("CanManageProjectSettings", policy =>
        policy.AddRequirements(new ProjectRoleRequirement("ProjectSettings.Manage")));
});

// 7. Gemini AI Client (singleton)
var geminiApiKey = builder.Configuration["Gemini:ApiKey"]
    ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

if (string.IsNullOrWhiteSpace(geminiApiKey))
{
    if (builder.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Gemini API key is missing! Add it via: dotnet user-secrets set \"Gemini:ApiKey\" \"your-key\"");
    }
    throw new InvalidOperationException("Gemini API key is missing in production.");
}

builder.Services.AddSingleton<Client>(sp => new Client(apiKey: geminiApiKey));

// 8. Hangfire Configuration
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

// 9. Swagger with JWT support
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

// Hangfire Dashboard (secured – only SuperAdmin)
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireCustomAuthorizationFilter() }
});

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles(); // لخدمة الملفات المرفوعة محليًا (صور، فواتير، إلخ)

app.MapControllers();

// Schedule daily escalation check (8 AM every day)
RecurringJob.AddOrUpdate<IEscalationService>(
    "daily-delay-escalations",
    service => service.CheckAndSendDelayEscalationsAsync(),
    Cron.Daily(8));

app.Run();

// ── Hangfire Custom Authorization Filter ──────────────────────────────────────
public class HangfireCustomAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        return httpContext.User.Identity?.IsAuthenticated == true &&
               httpContext.User.IsInRole("SuperAdmin");
    }
}
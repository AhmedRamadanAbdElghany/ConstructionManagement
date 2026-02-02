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

var builder = WebApplication.CreateBuilder(args);

// 1. Controllers + FluentValidation
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateProjectRequestValidator>();

// 2. Database
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString);
});


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
builder.Services.AddScoped<IRepository<ProjectTeamRole>, Repository<ProjectTeamRole>>();
builder.Services.AddScoped<IRepository<BOQExecutedDelta>, Repository<BOQExecutedDelta>>();

// 6. Services
builder.Services.AddScoped<IRoleService, RoleService>();
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
builder.Services.AddScoped<IProjectDelayEscalationService, ProjectDelayEscalationService>(); // renamed & kept
builder.Services.AddScoped<IProjectTransactionService, ProjectTransactionService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Notification & Email
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Approval-specific escalation job
builder.Services.AddScoped<ApprovalEscalationJob>();

// 7. JWT Authentication
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
    options.AddPolicy("CanReviewTransactions", policy => policy.AddRequirements(new ProjectRoleRequirement("Transaction.Review")));
    options.AddPolicy("CanReviewSiteMedia", policy => policy.AddRequirements(new ProjectRoleRequirement("Media.Review")));
    options.AddPolicy("CanCloseDailyLog", policy => policy.AddRequirements(new ProjectRoleRequirement("DailyLog.Close")));
    options.AddPolicy("CanManageProjectSettings", policy => policy.AddRequirements(new ProjectRoleRequirement("Settings.Manage")));
    
    // Daily Log specific permissions
    options.AddPolicy("CanAddProgressEntry", policy => policy.AddRequirements(new ProjectRoleRequirement("DailyLog.AddEntry")));
    options.AddPolicy("CanReopenClosedDaily", policy => policy.AddRequirements(new ProjectRoleRequirement("DailyLog.Reopen")));
    options.AddPolicy("CanApproveProgressEntry", policy => policy.AddRequirements(new ProjectRoleRequirement("DailyLog.Approve")));

    // NOTE: Add policy tests for each permission.
});

// 9. Hangfire
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

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

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowAll");

// Company resolution middleware – MUST come early
app.UseMiddleware<CompanyResolutionMiddleware>();

app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Hangfire Dashboard (secured – only SuperAdmin)
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireCustomAuthorizationFilter() }
});

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles(); // for uploaded files (photos, invoices, etc.)

app.MapControllers();

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

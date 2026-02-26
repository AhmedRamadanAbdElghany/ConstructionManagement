using ConstructionManagement.Application.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Middleware
{
    // Middleware/CompanyResolutionMiddleware.cs
    public class CompanyResolutionMiddleware
    {
        private readonly RequestDelegate _next;

        public CompanyResolutionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext, ICompanyContext companyContext)
        {
            var token = httpContext.Request.Headers["Authorization"]
                .FirstOrDefault()?
                .Replace("Bearer ", "");

            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var roleClaim = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");

                    // 1. If SuperAdmin, always bypass global filters
                    if (roleClaim?.Value == "SuperAdmin")
                    {
                        companyContext.CompanyId = null; 
                    }
                    // 2. If X-Company-ID header is provided, use it for specific company context
                    else if (httpContext.Request.Headers.TryGetValue("X-Company-ID", out var headerCompanyId) 
                             && int.TryParse(headerCompanyId, out var cid))
                    {
                        companyContext.CompanyId = cid;
                    }
                    // 3. Otherwise, set to null to allow multi-company fetching in services/controllers
                    // (The controllers/services will then use GetAllCompanyIds() to filter)
                    else
                    {
                        companyContext.CompanyId = null;
                    }
                }
                catch
                {
                    companyContext.CompanyId = null;
                }
            }

            await _next(httpContext);
        }
    }
}

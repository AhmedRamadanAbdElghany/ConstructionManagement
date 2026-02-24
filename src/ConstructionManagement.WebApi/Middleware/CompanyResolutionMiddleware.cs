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

                    var companyIdClaim = jwt.Claims.FirstOrDefault(c => c.Type == "companyId");

                    var roleClaim = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
                    
                    if (roleClaim?.Value == "SuperAdmin")
                    {
                        companyContext.CompanyId = null; // Bypass filters
                    }
                    else if (companyIdClaim != null && int.TryParse(companyIdClaim.Value, out var companyId))
                    {
                        companyContext.CompanyId = companyId;
                    }

                    
                }
                catch
                {
                    // Invalid token → let auth middleware reject later
                }
            }

            await _next(httpContext);
        }
    }
}

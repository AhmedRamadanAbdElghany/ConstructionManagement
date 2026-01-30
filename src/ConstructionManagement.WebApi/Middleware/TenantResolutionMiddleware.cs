using ConstructionManagement.Application.Interfaces;
using System.IdentityModel.Tokens.Jwt;

namespace ConstructionManagement.WebApi.Middleware
{
    // Middleware/TenantResolutionMiddleware.cs
    public class TenantResolutionMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantResolutionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext, ITenantContext tenantContext)
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

                    var tenantIdClaim = jwt.Claims.FirstOrDefault(c => c.Type == "tenantId");


                    if (tenantIdClaim != null)
                    {
                        // تعيين اسم قاعدة البيانات للسياق الحالي
                        tenantContext.TenantId = tenantIdClaim.Value;
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

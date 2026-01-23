using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        if (!response.Success)
        {
            return Unauthorized(new { message = response.Message });
        }

        // response now directly contains Token and User (UserDto)
        if (string.IsNullOrEmpty(response.Token) || response.User == null)
        {
            return StatusCode(500, new { message = "Login succeeded but token or user data is missing" });
        }

        var user = response.User;
        var token = response.Token;

        return Ok(new
        {
            token,
            user = new
            {
                userId = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                roles = user.Roles,
                createdAt = user.CreatedAt
                // tenantId is already inside the JWT – client can decode if needed
            }
        });
    }
}
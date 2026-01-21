using Microsoft.AspNetCore.Mvc;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;

namespace ConstructionManagement.WebApi.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        if (!response.Success)
            return Unauthorized(new { message = response.Message });

        return Ok(response);
    }
}
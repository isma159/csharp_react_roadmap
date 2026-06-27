using AIEmailClient.DTOs;
using AIEmailClient.Service;
using Microsoft.AspNetCore.Mvc;

namespace AIEmailClient.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController: ControllerBase
{

    private readonly LoginService _loginService;

    public EmailController(LoginService loginService)
    {
        _loginService = loginService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> SaveLogin(LoginDto loginDto)
    {

        if (string.IsNullOrWhiteSpace(loginDto.Email) || !loginDto.Email.Contains('@'))
        {
            return BadRequest();
        }

        string imapHost = _loginService.SuggestImapHost(loginDto.Email);

        bool success = await _loginService.VerifyCredentials(loginDto.Email, loginDto.Password, imapHost);

        if (success)
        {
            return Ok(new { imapHost });
        }
        
        return Unauthorized();
    }
}
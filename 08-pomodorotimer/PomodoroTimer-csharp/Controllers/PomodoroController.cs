using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PomodoroTimer.Data;
using PomodoroTimer.DTOs;
using PomodoroTimer.Entities;

namespace PomodoroTimer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PomodoroController: ControllerBase
{

    private readonly AppDbContext _context;
    
    public PomodoroController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<List<PomodoroSession>>> GetSessions()
    {
        var sessions = await _context.Sessions.ToListAsync();
        return Ok(sessions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PomodoroSession>> GetSession(int id)
    {
        var session = await _context.Sessions.FindAsync(id);
        if (session == null) {return NotFound();}

        return Ok(session);
    }

    [HttpPost]
    public async Task<ActionResult<PomodoroSession>> CreateSession(CreateSessionDTO dto)
    {
        var session = new PomodoroSession {DurationMinutes = dto.DurationMinutes, SessionType = dto.SessionType};
        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSession), new { Id = session.Id }, session);
    }
}
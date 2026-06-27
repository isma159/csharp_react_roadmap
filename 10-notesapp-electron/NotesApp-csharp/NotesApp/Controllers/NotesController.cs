using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApp.Data;
using NotesApp.DTOs;
using NotesApp.Entities;

namespace NotesApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController: ControllerBase
{
    private readonly AppDbContext _context;
    
    public NotesController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<List<Note>> GetNotes()
    {

        return await _context.Notes.ToListAsync();

    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Note>> GetNote(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) { return NotFound(); }
        return Ok(note);
    }

    [HttpPost]
    public async Task<ActionResult<Note>> CreateNote(CreateNoteDTO createNoteDto)
    {

        var note = new Note { Title = createNoteDto.Title, Content = createNoteDto.Content };
        _context.Notes.Add(note);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNote(int id, UpdateNoteDTO updateNoteDto)
    {
        var foundNote = await _context.Notes.FindAsync(id);
        if (foundNote == null) { return NotFound();}

        foundNote.Title = updateNoteDto.Title;
        foundNote.Content = updateNoteDto.Content;

        await _context.SaveChangesAsync();

        return Ok(foundNote);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNote(int id)
    {
        var foundNote = await _context.Notes.FindAsync(id);
        if (foundNote == null) { return NotFound(); }

        _context.Notes.Remove(foundNote);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
}
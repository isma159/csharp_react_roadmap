using System.ComponentModel.DataAnnotations;

namespace NotesApp.Entities;

public class Note
{
    [Key]
    public int Id { get; private set; }
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    [MaxLength(250)]
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
}
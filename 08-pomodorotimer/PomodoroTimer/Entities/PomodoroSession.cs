using System.ComponentModel.DataAnnotations;

namespace PomodoroTimer.Entities;

public class PomodoroSession
{
    [Key]
    public int Id { get; private set; }
    public DateTime CompletedAt { get; private set; } = DateTime.UtcNow;
    public int DurationMinutes { get; set; }
    [MaxLength(50)]
    public string SessionType { get; set; } = "Work";
}
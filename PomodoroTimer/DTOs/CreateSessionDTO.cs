namespace PomodoroTimer.DTOs;

public record CreateSessionDTO(int DurationMinutes, string SessionType) {}
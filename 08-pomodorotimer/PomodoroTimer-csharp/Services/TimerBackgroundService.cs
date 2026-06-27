using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PomodoroTimer.Data;
using PomodoroTimer.Entities;
using PomodoroTimer.Hubs;

namespace PomodoroTimer.Services;

public class TimerBackgroundService: BackgroundService
{

    private readonly IHubContext<TimerHub> _hubContext;
    private readonly IServiceScopeFactory _scopeFactory;
    
    private int _secondsRemaining;
    private bool _isRunning;

    private readonly int WORK_DURATION = 10;
    private readonly int BREAK_DURATION = 5;
    private readonly int LONG_BREAK_DURATION = 20;

    private int _completedWorkSessions = 0;
    
    private Phases _phase = Phases.WORK;
    public Phases Phase => _phase;

    public int SecondsRemaining => _secondsRemaining;

    public TimerBackgroundService(IHubContext<TimerHub> hubContext, IServiceScopeFactory scopeFactory)
    {
        _hubContext = hubContext;
        _scopeFactory = scopeFactory;

        _secondsRemaining = WORK_DURATION;
    }

    public void Start(int durationSeconds)
    {
        _secondsRemaining = durationSeconds;
        _isRunning = true;
    }

    public void Pause()
    {
        _isRunning = false;
    }

    public void Stop()
    {
        _isRunning = false;
        _secondsRemaining = 0;
        _completedWorkSessions = _phase == Phases.WORK ? _completedWorkSessions + 1 : _completedWorkSessions;
    }

    private async Task LogCompletedSession()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Sessions.Add(new PomodoroSession { DurationMinutes = 25, SessionType = "WORK" });
        await context.SaveChangesAsync();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var timer = new PeriodicTimer(TimeSpan.FromSeconds(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            if (_isRunning && _secondsRemaining > 0)
            {
                _secondsRemaining--;
                await _hubContext.Clients.All.SendAsync("ReceiveTick", _secondsRemaining);

                if (_secondsRemaining == 0)
                {
                    if (_phase == Phases.WORK)
                    {
                        await LogCompletedSession();
                    }
                    AdvancePhase();
                    _isRunning = false;
                    await _hubContext.Clients.All.SendAsync("SessionCompleted", _phase, _secondsRemaining);
                }
            }
        }
    }

    private void AdvancePhase()
    {
        if (_phase == Phases.WORK)
        {
            _completedWorkSessions++;
            _phase = _completedWorkSessions % 4 == 0 ? Phases.LONGBREAK : Phases.SHORTBREAK;
            _secondsRemaining = _completedWorkSessions % 4 == 0 ? LONG_BREAK_DURATION : BREAK_DURATION;
        }
        else
        {
            _phase = Phases.WORK;
            _secondsRemaining = WORK_DURATION;
        }
    }
}
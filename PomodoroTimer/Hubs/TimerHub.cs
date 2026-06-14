using Microsoft.AspNetCore.SignalR;
using PomodoroTimer.Services;

namespace PomodoroTimer.Hubs;

public class TimerHub: Hub
{
    private readonly TimerBackgroundService _timerService;

    public TimerHub(TimerBackgroundService timerService)
    {
        _timerService = timerService;
    }

    public Task StartTimer(int durationSeconds)
    {
        Console.WriteLine("Starting TIMER!!!!");
        _timerService.Start(durationSeconds);
        return Task.CompletedTask;
    }
    
    public Task PauseTimer()
    {
        _timerService.Pause();
        return Task.CompletedTask;
    }
    
    public Task StopTimer()
    {
        _timerService.Stop();
        return Task.CompletedTask;
    }

    public Task<object> GetState()
    {
        var result = new
        {
            phase = _timerService.Phase,
            secondsRemaining = _timerService.SecondsRemaining
        };
        
        Console.WriteLine($"GetState called: phase={_timerService.Phase}, seconds={_timerService.SecondsRemaining}");

        return Task.FromResult<object>(result);
    }
    
}
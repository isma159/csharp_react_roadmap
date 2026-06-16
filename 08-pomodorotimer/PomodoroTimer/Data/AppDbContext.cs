using Microsoft.EntityFrameworkCore;
using PomodoroTimer.Entities;

namespace PomodoroTimer.Data;

public class AppDbContext: DbContext
{
    
    public AppDbContext(DbContextOptions<AppDbContext> options): base(options) {}
    
    public DbSet<PomodoroSession> Sessions { get; set; }
    
}
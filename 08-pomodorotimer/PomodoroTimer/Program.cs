
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PomodoroTimer.Data;
using PomodoroTimer.Hubs;
using PomodoroTimer.Services;

var builder = WebApplication.CreateBuilder();

builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
}).AddJsonProtocol(options => options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddCors(option => option.AddPolicy("AllowReact", policy =>
{
    policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
}));

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    
});

builder.Services.AddSingleton<TimerBackgroundService>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<TimerBackgroundService>());


var app = builder.Build();

app.UseCors("AllowReact");
app.UseHttpsRedirection();
app.MapControllers();

app.MapHub<TimerHub>("/timerhub");

app.Run();
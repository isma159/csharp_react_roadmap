using AIChatBot.Services;
using Microsoft.SemanticKernel;
using OllamaSharp;

var builder = WebApplication.CreateBuilder();

builder.Services.AddControllers();

builder.Services.AddCors(options => options.AddPolicy("AllowReact", policy => policy.WithOrigins("http://localhost:5174").AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddSingleton<ChatService>();

builder.Services.AddSingleton<IOllamaApiClient>(new OllamaApiClient("http://localhost:11434"));

builder.Services.AddKernel();

var app = builder.Build();

app.UseCors("AllowReact");
app.MapControllers();

app.Run();
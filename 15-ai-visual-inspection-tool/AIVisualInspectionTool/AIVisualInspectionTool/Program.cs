using Microsoft.SemanticKernel;

var builder = WebApplication.CreateBuilder();

builder.Services.AddControllers();

builder.Services.AddCors(options => options.AddPolicy("AllowReact", policy => policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddKernel().AddOllamaChatCompletion(modelId: "gemma4:31b-cloud", endpoint: new Uri("http://localhost:11434"));

var app = builder.Build();

app.UseCors("AllowReact");

app.MapControllers();

app.Run();
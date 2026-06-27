using Microsoft.SemanticKernel;

var builder = WebApplication.CreateBuilder();

builder.Services.AddControllers();

builder.Services.AddCors(options => options.AddPolicy("AllowReact", policy => policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddSingleton<Kernel>(_ =>
    Kernel.CreateBuilder().AddOllamaChatCompletion(modelId: "qwen2.5:7b", endpoint: new Uri("http://localhost:11434"))
        .Build());

var app = builder.Build();

app.UseCors("AllowReact");
app.MapControllers();

app.Run();
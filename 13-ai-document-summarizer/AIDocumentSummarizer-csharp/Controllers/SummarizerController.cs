using System.Text.Json;
using AIDocumentSummarizer.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace AIDocumentSummarizer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SummarizerController: ControllerBase
{

    private readonly Kernel _kernel;
    private readonly string systemPrompt = "Your only responsibility is to summarize the document given to you. Produce a clean, well-structured summary using headers, bullet points, and prose. Do not attempt to recreate tables from the source — use bullet points instead. No conversations, no answers to questions, just the summary.";
    private readonly PDFExtractorService _extractorService;
    private readonly IChatCompletionService _chat;
    
    public SummarizerController(Kernel kernel, PDFExtractorService extractorService)
    {
        _kernel = kernel;
        _chat = kernel.GetRequiredService<IChatCompletionService>();
        _extractorService = extractorService;
    }

    [HttpPost]
    public async Task SendSummary(IFormFile file, CancellationToken cancellationToken)
    {
        
        ChatHistory chatHistory = new ChatHistory();
        chatHistory.AddSystemMessage(systemPrompt);

        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";

        if (file == null || file.Length == 0)
        {
            Response.StatusCode = 400;
            return;
        }

        using var fileStream = file.OpenReadStream();

        string documentContent = _extractorService.SummarizeFromStream(fileStream);
        
        chatHistory.AddUserMessage(documentContent);

        var response = _chat.GetStreamingChatMessageContentsAsync(chatHistory, cancellationToken:cancellationToken);

        await foreach (var chunk in response)
        {
            if (cancellationToken.IsCancellationRequested) break;
            
            if (string.IsNullOrWhiteSpace(chunk.Content)) continue;

            var payload = JsonSerializer.Serialize(chunk.Content);
            
            await Response.WriteAsync($"data: {payload}\n\n", cancellationToken:cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
    }
}
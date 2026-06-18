using System.Diagnostics;
using System.Text;
using System.Text.Json;
using AIChatBot.DTOs;
using AIChatBot.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using OllamaSharp;
using OllamaSharp.Models.Chat;

namespace AIChatBot.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{

    private readonly Kernel _kernel;
    private readonly IOllamaApiClient _ollamaApiClient;
    private ChatService _chatHistory;
    private readonly string _systemPrompt = "Your final answer must be condensed, concise, and directly address only what the user asked. No brick wall of text, but rather, precise information without reiterating yourself. To avoid brick walls of text, make use of tables, bullet points and other ways to showcase information. All responses should contain fully complete sentences.";

    public ChatController(Kernel kernel, ChatService chatService, IOllamaApiClient ollamaApiClient)
    {
        _kernel = kernel;
        _chatHistory = chatService;
        _ollamaApiClient = ollamaApiClient;
        _ollamaApiClient.SelectedModel = "gemma4:31b-cloud";
    }

    [HttpPost]
    public async Task SendMessage(MessageDTO message)
    {
        if (_chatHistory.OChatHistory.Count == 0)
        {
            _chatHistory.AddMessage(ChatRole.System, _systemPrompt);
        }
        
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";
        
        _chatHistory.AddMessage(ChatRole.User, message.Content);

        var chatRequest = new ChatRequest
        {
            Model = "gemma4:31b-cloud",
            Messages = _chatHistory.OChatHistory,
            Stream = true,
            Think = true
        };
        
        var response = _ollamaApiClient.ChatAsync(chatRequest);

        var fullResponse = new StringBuilder();

        try
        {
            await foreach (var chunk in response)
            {
                if (!string.IsNullOrWhiteSpace(chunk?.Message.Thinking))
                {
                    var payload = new MessageDTO(chunk.Message.Thinking, true);

                    string jsonChunk = JsonSerializer.Serialize(payload, jsonOptions);

                    await Response.WriteAsync($"data: {jsonChunk}\n\n");
                    await Response.Body.FlushAsync();

                }
                else if (!string.IsNullOrWhiteSpace(chunk?.Message.Content))
                {
                    fullResponse.Append(chunk.Message.Content);

                    var payload = new MessageDTO(chunk.Message.Content, false);

                    string jsonChunk = JsonSerializer.Serialize(payload, jsonOptions);

                    await Response.WriteAsync($"data: {jsonChunk}\n\n");
                    await Response.Body.FlushAsync();
                }
            }

            _chatHistory.AddMessage(ChatRole.Assistant, fullResponse.ToString());
        }
        catch (Exception e)
        {
            Debug.WriteLine("Streaming error: " + e);
        }
    }
}
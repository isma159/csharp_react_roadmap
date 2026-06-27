using Microsoft.SemanticKernel.ChatCompletion;
using OllamaSharp.Models.Chat;

namespace AIChatBot.Services;

public class ChatService
{
    public ChatHistory ChatHistory { get; private set; } = new ChatHistory();
    public List<Message> OChatHistory { get; private set; } = new List<Message>();

    public void AddMessage(ChatRole role, string content)
    {
        if (role == ChatRole.User) {ChatHistory.AddUserMessage(content);}
        else if (role == ChatRole.Assistant) {ChatHistory.AddAssistantMessage(content);}
        else if (role == ChatRole.System) {ChatHistory.AddSystemMessage(content);}
        
        OChatHistory.Add(new Message(role, content));
    }
}
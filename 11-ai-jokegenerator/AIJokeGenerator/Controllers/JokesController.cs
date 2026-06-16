using AIJokeGenerator.DTOs;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace AIJokeGenerator.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JokesController : ControllerBase
{

    private readonly Kernel _kernel;

    public JokesController(Kernel kernel)
    {
        _kernel = kernel;
    }

    [HttpGet]
    public async Task<ActionResult<string>> GetJoke()
    {
        var chat = _kernel.GetRequiredService<IChatCompletionService>();

        var history = new ChatHistory();
        history.AddSystemMessage("You are a comedian who tells short jokes with excellent punchlines.");
        history.AddUserMessage("Tell me a joke!");

        var response = await chat.GetChatMessageContentAsync(history);

        return Ok(response.Content);
    }
}
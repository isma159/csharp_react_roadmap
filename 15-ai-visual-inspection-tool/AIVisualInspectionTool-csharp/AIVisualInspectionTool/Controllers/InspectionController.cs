using System.Text.Json;
using AIVisualInspectionTool.DTOs;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace AIVisualInspectionTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InspectionController: ControllerBase
{

    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chat;
    

    public InspectionController(Kernel kernel)
    {
        _kernel = kernel;
        _chat = _kernel.GetRequiredService<IChatCompletionService>();
    }

    [HttpPost("description")]
    [RequestSizeLimit(52428800)]
    public async Task<ActionResult<string>> DescribeImage(IFormFile? image, CancellationToken cancellationToken)
    {

        if (image == null || image.Length == 0)
        {
            return BadRequest("No valid image file was uploaded");
        }

        var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true};
        
        string systemPrompt = """
                              Analyze this image and respond ONLY with a valid JSON object in exactly this format, no other text:
                              
                              Example:
                              {
                                "title": "short title of what the image shows",
                                "description": "detailed description in 2-3 sentences",
                                "tags": needs to be an empty array,
                                "confidence": give a score of your confidence from 0-100
                              }
                              
                              NO OTHER TEXT THAN A VALID JSON OBJECT IN THIS FORMAT!
                              """;
        
        var chatHistory = new ChatHistory();
        chatHistory.AddSystemMessage(systemPrompt);
        
        

        using var imageStream = image.OpenReadStream();

        using var memoryStream = new MemoryStream();
        
        using (var img = await Image.LoadAsync(imageStream, cancellationToken))
        {
            int maxDimension = 1024;
            if (img.Width > maxDimension || img.Height > maxDimension)
            {
                img.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(maxDimension, maxDimension),
                    Mode = ResizeMode.Max
                }));
            }

            await img.SaveAsJpegAsync(memoryStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder { Quality = 75 }, cancellationToken);
        }

        byte[] imageBytes = memoryStream.ToArray();

        var imageContent = new ImageContent(new ReadOnlyMemory<byte>(imageBytes), image.ContentType);

        var message = new ChatMessageContent(AuthorRole.User, "Describe this image");
        message.Items.Add(imageContent);
        chatHistory.Add(message);

        var response = await _chat.GetChatMessageContentAsync(chatHistory, cancellationToken: cancellationToken);

        int firstBrace = response.ToString().IndexOf('{', StringComparison.Ordinal);
        int lastBrace = response.ToString().LastIndexOf('}');

        string aiResponse = response.ToString().Substring(firstBrace, lastBrace - firstBrace + 1);

        var jsonResult = JsonSerializer.Deserialize<ResultResponse>(aiResponse, jsonOptions);

        return Ok(jsonResult);
    }
}
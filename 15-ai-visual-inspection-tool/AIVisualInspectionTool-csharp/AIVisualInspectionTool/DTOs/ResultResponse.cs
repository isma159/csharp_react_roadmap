namespace AIVisualInspectionTool.DTOs;

public record ResultResponse(string Title, string Description, string[] Tags, double Confidence);
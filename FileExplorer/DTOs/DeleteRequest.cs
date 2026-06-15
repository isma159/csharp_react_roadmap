namespace FileExplorer.DTOs;

public record DeleteRequest(string Name, string Path, bool IsDirectory);
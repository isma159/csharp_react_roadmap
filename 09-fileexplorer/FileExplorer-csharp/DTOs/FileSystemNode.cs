namespace FileExplorer.DTOs;

public record FileSystemNode(string Name, string Path, bool IsDirectory, long? Size, string LastModified);
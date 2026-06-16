namespace FileExplorer.DTOs;

public record RenameRequest(string OldName, string NewName, string Path, bool IsDirectory);
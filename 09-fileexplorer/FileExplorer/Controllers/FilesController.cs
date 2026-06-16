using FileExplorer.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace FileExplorer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController: ControllerBase
{

    [HttpGet]
    public ActionResult<List<FileSystemNode>> GetFiles([FromQuery] string path)
    {
        if (!Directory.Exists(path)) {return NotFound();}

        try
        {
            var dirs = Directory.GetDirectories(path).Select(d => new DirectoryInfo(d))
                .Select(d => new FileSystemNode(d.Name, d.FullName, true, null, d.LastWriteTime.ToShortDateString())).ToList();
            var files = Directory.GetFiles(path).Select(f => new FileInfo(f)).Select(f =>
                new FileSystemNode(f.Name, f.FullName, false, f.Length, f.LastWriteTime.ToShortDateString())).ToList();

            return Ok(dirs.Concat(files).ToList());
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("shortcuts")]
    public ActionResult<List<FileSystemNode>> GetShortcuts()
    {
        var shortcuts = new List<FileSystemNode>
        {
            new("Home", Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), true, null, DateTime.Now.ToShortDateString()),
            new("Documents", Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), true, null,
                DateTime.Now.ToShortDateString()),
            new("Downloads",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads"), true, null,
                DateTime.Now.ToShortDateString()),
            new("Desktop", Environment.GetFolderPath(Environment.SpecialFolder.Desktop), true, null, DateTime.Now.ToShortDateString())
        };

        return Ok(shortcuts);
    }

    [HttpPost("file")]
    public IActionResult CreateFile(FileSystemNode node)
    {
        using var file = System.IO.File.Create(Path.Combine(node.Path, node.Name));
        return Ok();
    }
    
    [HttpPost("directory")]
    public IActionResult CreateDirectory(FileSystemNode node)
    {
        var directory = Directory.CreateDirectory(Path.Combine(node.Path, node.Name));
        return Ok();
    }

    [HttpPatch("rename")]
    public IActionResult RenameNode(RenameRequest request)
    {
        string oldPath = Path.Combine(request.Path, request.OldName);
        string newPath = Path.Combine(request.Path, request.NewName);
        
        if (request.IsDirectory && !Directory.Exists(oldPath))
        {
            return NotFound("Source Directory not found");
        }

        if (!request.IsDirectory && !System.IO.File.Exists(oldPath))
        {
            return NotFound("Source File not found");
        }

        if (request.IsDirectory)
        {
            Directory.Move(oldPath, newPath);
        }
        else
        {
            System.IO.File.Move(oldPath, newPath);
        }

        return Ok();
    }

    [HttpDelete]
    public IActionResult DeleteNode([FromQuery] string path, [FromQuery] bool isDirectory)
    {
        if (isDirectory)
        {
            if (!Directory.Exists(path)) { return NotFound("Source Directory not found"); }
            Directory.Delete(path);
        }
        else
        {
            if (!System.IO.File.Exists(path)) {return NotFound("Source File not found");}
            System.IO.File.Delete(path);
        }

        return NoContent();
    }
}
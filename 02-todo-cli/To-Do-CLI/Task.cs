namespace To_Do_CLI;

public class Task
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public bool Completed { get; set; }
    public PriorityLevel Priority { get; set; }
    public DateTime DueDate { get; set; }
    
};
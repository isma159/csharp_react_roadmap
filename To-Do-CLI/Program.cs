
using System.Text.Json;
using To_Do_CLI;
using Task = To_Do_CLI.Task;

var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

string jsonPath = "tasks.json";
List<Task> tasks = ReadTasks(jsonPath);

List<Task> ReadTasks(string path)
{
    if (!File.Exists(path)) return [];
    
    string jsonString = File.ReadAllText(path);
    
    List<Task> taskList = JsonSerializer.Deserialize<List<Task>>(jsonString, options) ?? [];

    return taskList;
}

void AddTask(Task task, List<Task> taskList, string path)
{
    
    taskList.Add(task);
    
    SaveTasks(taskList, path);
    
}

void CompleteTask(Task task, List<Task> taskList, string path)
{
    task.Completed = true;
    SaveTasks(taskList, path);
}

void DeleteTask(Task task, List<Task> taskList, string path)
{
    taskList.Remove(task);
    SaveTasks(taskList, path);
}

void SaveTasks(List<Task> taskList, string path)
{
    string jsonString = JsonSerializer.Serialize(taskList);
    
    File.WriteAllText(path, jsonString);
}

while (true)
{
    
    Console.WriteLine("""
                      ===== TO-DO LIST =====
                      1. View tasks
                      2. Add task
                      3. Complete task
                      4. Delete task
                      5. Exit
                      ======================
                      """);

    Console.Write("\nChoose action: ");
    string decision = Console.ReadLine() ?? "";

    if (decision == "1")
    {
        Console.Write("Insert priority filter (Enter to skip): ");
        string input = Console.ReadLine() ?? "";
        bool success = Enum.TryParse(input, true, out PriorityLevel priority);

        List<Task> filteredList = success ? tasks.Where(t => t.Priority == priority).ToList() : tasks;
        
        foreach (Task task in filteredList)
        {
            string completed = task.Completed ? "✓" : " ";
            Console.WriteLine($"""
                              ===================================================================================
                              [{task.Id}] {task.Title}                                              [{completed}]
                              Priority: [{task.Priority.ToString()}]
                              Due date: {task.DueDate.ToString("dd-MM-yyyy")}
                              ===================================================================================
                              """);
        }
    }
    else if (decision == "2")
    {
        Console.Write("Insert title: ");
        string title = Console.ReadLine() ?? "No title";
        
        Console.Write("Insert priority: ");
        string input = Console.ReadLine() ?? "Low";
        bool worked = Enum.TryParse(input, true, out PriorityLevel priority);

        if (!worked)
        {
            Console.WriteLine("Invalid Priority");
            continue;
        }

        Console.Write("Insert due date: ");
        input = Console.ReadLine() ?? DateTime.Now.ToString("dd-MM-yyyy");
        bool dueDateWorked = DateTime.TryParse(input, out DateTime dueDate);

        if (!dueDateWorked)
        {
            Console.WriteLine("Invalid Date");
            continue;
        }

        int nextId = tasks.Count > 0 ? tasks[^1].Id + 1 : 1;

        Task task = new Task { Id = nextId, Title = title, Completed = false, Priority = priority, DueDate = dueDate };
        
        AddTask(task, tasks, jsonPath);
    }
    else if (decision == "3")
    {   
        Console.Write("Insert Task ID: ");
        string input = Console.ReadLine() ?? "";
        bool success = int.TryParse(input, out int id);

        if (!success)
        {
            Console.WriteLine("Invalid Task ID");
            continue;
        }

        Task? task = tasks.FirstOrDefault(t => t.Id == id);

        if (task != null)
        {
            CompleteTask(task, tasks, jsonPath);
            Console.WriteLine("Task Completed!");
        }
    }
    else if (decision == "4")
    {
        Console.Write("Insert Task ID: ");
        string input = Console.ReadLine() ?? "";
        bool success = int.TryParse(input, out int id);

        if (!success)
        {
            Console.WriteLine("Invalid Task ID");
            continue;
        }

        Task? task = tasks.FirstOrDefault(t => t.Id == id);

        if (task != null)
        {
            DeleteTask(task, tasks, jsonPath);
            Console.WriteLine("Task Deleted!");
        }
    }
    else if (decision == "5")
    {
        break;
    }
    else
    {
        Console.WriteLine("Invalid Decision!!!");
    }
}
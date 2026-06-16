double Calculate(double a, string op, double b)
{
    switch (op)
    {
        case "+":
        {
            return a + b;
        }
        case "-":
        {
            return a - b;
        }
        case "*":
        {
            return a * b;
        }
        case "/":
        {
            return a / b;
        }
    }

    return 0;
}

void WriteHistory(string history, string path)
{
    File.AppendAllLines(path, [history]);
}

List<String> ReadHistory(string path)
{
    string[] historyData = File.ReadAllLines(path);

    return historyData.ToList();
}

double result = 0;
string operation;
double nextNumber;

bool isFirstCalc = true;

string input = "";

Console.WriteLine("""
                  === CALCULATOR ===
                  1. Calculate
                  2. View History
                  ==================
                  """);

Console.Write("\nChoose action: ");
string decision = Console.ReadLine() ?? "";

if (decision == "1")
{
    while (true)
    {
        try
        {
            if (isFirstCalc)
            {
                isFirstCalc = false;
                Console.Write("Insert number: ");
                input = Console.ReadLine() ?? "";
                if (input.ToLower() == "exit") {break;}
                result = Convert.ToDouble(input);
            }
            
            Console.Write("Insert next operator: ");
            input = Console.ReadLine() ?? "";
            if (input.ToLower() == "exit") {break;}

            if (input != "+" && input != "-" && input != "*" && input != "/")
            {
                Console.WriteLine("Invalid operation");
                continue;
            }
            operation = input;
            
            Console.Write("Insert next number: ");
            input = Console.ReadLine() ?? "";
            if (input.ToLower() == "exit") {break;}
            nextNumber = Convert.ToDouble(input);

            double firstNumber = result;

            result = Calculate(result, operation, nextNumber);
            
            WriteHistory($"{firstNumber} {operation} {nextNumber} = {result}", "history.txt");
            
            Console.WriteLine("\n" + result);

        }
        catch (FormatException e)
        { 
            Console.WriteLine("Input is not valid number");
        }
        
    }
}
else if (decision == "2")
{
    foreach (string line in ReadHistory("history.txt"))
    {
        Console.WriteLine(line);
    }
}
using System.Text.Json;
using WeatherCLI.WeatherClasses;

Config? config = null;

if (File.Exists("config.json"))
{
    config = JsonSerializer.Deserialize<Config>(File.ReadAllText("config.json"))!;
}


while (true)
{
    if (config == null)
    {
        Console.WriteLine("API KEY not found. Either config file is missing, or it doesn't contain a key.");
        break;
    }
    
    Console.WriteLine("""
                      ===== WEATHER CLI =====
                      1. Current weather
                      2. 5-day forecast
                      3. Exit
                      =======================
                      """);
    
    Console.Write("Choose action: ");
    string? decision = Console.ReadLine();
    
    if (decision == null) continue;

    if (decision == "1")
    {
        
        Console.Write("Insert city: ");
        string? input = Console.ReadLine();
        
        if (input == null) continue;

        WeatherResponse? weatherResponse = await WeatherService.GetCurrentWeather(input, config.ApiKey);
        if (weatherResponse == null) continue;

        string topLayer = $"===== {weatherResponse.Name} =====";
        string bottomLayer = new string('=', topLayer.Length);
        
        Console.WriteLine($"""
                          {topLayer}
                          Temperature: {weatherResponse.Main.Temp:F1}°C
                          Feels Like: {weatherResponse.Main.Feels_Like:F1}°C
                          Humidity: {weatherResponse.Main.Humidity}%
                          Wind Speed: {weatherResponse.Wind.Speed} m/s
                          Condition: {weatherResponse.Weather[0].Description}
                          {bottomLayer}
                          """);
    }
    else if (decision == "2")
    {
        
        Console.Write("Insert city: ");
        string? input = Console.ReadLine();
        
        if (input == null) continue;

        ForecastResponse? forecastResponse = await WeatherService.GetForecast(input, config.ApiKey);
        if (forecastResponse == null) continue;

        string topLayer = $"===== {forecastResponse.City.Name} =====";
        string bottomLayer = new string('=', topLayer.Length);
        
        Console.WriteLine(topLayer);

        for (int i = 0; i < 5; i++)
        {
            int offset = i * 8;
            
            string dateTime = DateTime.UnixEpoch.AddSeconds(forecastResponse.List[offset].Dt).ToString("dd-MM-yyyy");
            Console.WriteLine($"{dateTime}      {forecastResponse.List[offset].Main.Temp:F1}°C      {forecastResponse.List[offset].Weather[0].Description}");
        }
        
        Console.WriteLine(bottomLayer);
    }
    else if (decision == "3")
    {
        break;
    }
}
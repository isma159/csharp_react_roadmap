namespace WeatherCLI.WeatherClasses;

public record WeatherResponse(Main Main, List<Weather> Weather, Wind Wind, string Name, int Dt);
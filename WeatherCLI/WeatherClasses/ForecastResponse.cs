namespace WeatherCLI.WeatherClasses;

public record ForecastResponse(List<WeatherResponse> List, City City);
using System.Net;
using System.Text.Json;

namespace WeatherCLI.WeatherClasses;

public class WeatherService
{

    private static readonly HttpClient _client = new HttpClient();
    private static readonly string _Base_URL = "https://api.openweathermap.org/data/2.5/";

    private static readonly JsonSerializerOptions Options = new JsonSerializerOptions
        { PropertyNameCaseInsensitive = true };

    public static async Task<WeatherResponse?> GetCurrentWeather(string city, string apiKey)
    {
        try
        {
            var response = await _client.GetAsync($"{_Base_URL}weather?q={city}&appId={apiKey}&units=metric");

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                Console.WriteLine("City not found");
                return null;
            }

            string json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<WeatherResponse>(json, Options);
        }
        catch (HttpRequestException)
        {
            Console.WriteLine("No internet connection");
            return null;
        }
    }

    public static async Task<ForecastResponse?> GetForecast(string city, string apiKey)
    {
        try
        {
            var response = await _client.GetAsync($"{_Base_URL}forecast?q={city}&appId={apiKey}&units=metric");

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                Console.WriteLine("City not found");
                return null;
            }

            string json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ForecastResponse>(json, Options);
        }
        catch (HttpRequestException)
        {
            Console.WriteLine("No internet connection");
            return null;
        }
    }

}
import './index.css'
import {Input} from "./components/ui/input.tsx";
import {Search} from "lucide-react";
import {getForecast, getWeather} from "./services/weatherService.ts";
import {useEffect, useMemo, useState} from "react";
import type {ForecastData, ForecastItem, WeatherData} from "./interfaces/weatherInterfaces.ts";

const weatherIconMap = {
    "01d": "clear-day",
    "01n": "clear-night",
    "02d": "partly-cloudy-day",
    "02n": "partly-cloudy-night",
    "03d": "cloudy",
    "03n": "cloudy",
    "04d": "overcast-day",
    "04n": "overcast-night",
    "09d": "drizzle",
    "09n": "drizzle",
    "10d": "rain",
    "10n": "rain",
    "11d": "thunderstorms-day",
    "11n": "thunderstorms-night",
    "13d": "snow",
    "13n": "snow",
    "50d": "mist",
    "50n": "mist",
};

function App() {
  return (
      <div className="flex justify-center items-center w-full h-screen bg-[#0F131A]">
        <WeatherDashboard/>
      </div>
  );
}

function WeatherDashboard() {
    const [city, setCity] = useState("Copenhagen");

    return (
        <div className="flex flex-col w-150 h-125 bg-[#161B26] rounded-2xl border-2 border-[#242C3D]">
            <SearchBar setCity={setCity}/>
            <WeatherView city={city}/>
            <ForecastView city={city}/>
        </div>
    );
}

function SearchBar({setCity}: {setCity: (city: string) => void}) {
    const [input, setInput] = useState("");

    return (
      <div className="flex justify-center items-center w-full h-1/8 p-3 border-b-2 border-[#242C3D]">
          <form onSubmit={(e) => {setCity(input); e.preventDefault()}} className="relative flex justify-center items-center flex-1 border-2 h-full border-[#242C3D] bg-[#0B0F19] rounded-lg hover:border-[#2D3748] focus-within:border-[#00A3C4]! transition-colors duration-300">
              <Input value={input} onChange={(e) => setInput(e.target.value)} className="border-none focus-visible:ring-0 text-white"/>
              <button className="w-8 h-8 text-[#00A3C4] hover:text-[#00D2FF] hover:drop-shadow-[0_0_4px_rgba(0,210,255,0.6)] transition-all duration-300">
                  <Search size={18} strokeWidth={3}/>
              </button>
          </form>
      </div>
  );
}

function WeatherView({city}: {city: string}) {

    const [weather, setWeather] = useState<WeatherData>();

    useEffect(() => {
        getWeather(city).then((data) =>
            setWeather(data)
        )
    }, [city])
    
    return (
        <div className="relative flex flex-col items-center w-full h-5/8 pt-6 gap-4">

            <img
                src={`/monochrome/${weather?.weather?.[0]?.icon ? weatherIconMap[weather.weather[0].icon as keyof typeof weatherIconMap]: ""}.svg`}
                className="absolute inset-0 m-auto w-100 h-100 opacity-10 pointer-events-none select-none brightness-0 invert-100"
            />

            <h1 className="text-white text-2xl font-bold">{weather != undefined ? weather.name : ""}</h1>
            <h1 className="text-white text-6xl font-bold drop-shadow-[0px_0px_15px_#FFFFFF]">{weather != undefined ? weather.main.temp : ""}°C</h1>
            <h1 className="text-[#E2E8F0] text-2xl font-bold">{weather != undefined ? weather.weather[0].description : ""}</h1>
            <div className="flex items-center justify-center flex-1 w-full h-full gap-8 p-4">
                <h1 className="text-white text-sm font-bold">Feels like: {weather != undefined ? weather.main.feels_like : ""}°C</h1>
                <h1 className="text-white text-sm font-bold">Humidity: {weather != undefined ? weather.main.humidity : ""}%</h1>
                <h1 className="text-white text-sm font-bold">Wind speed: {weather != undefined ? weather.wind.speed : ""} m/s</h1>
            </div>
        </div>
    );
}

function ForecastView({city}: {city: string}) {

    const [forecast, setForecast] = useState<ForecastData>()

    useEffect(() => {
        getForecast(city).then((data) =>
            setForecast(data)
        )
    }, [city])

    const filteredList = useMemo(() => {
        return forecast != undefined ? forecast.list.filter((item) => (
            new Date(item.dt * 1000).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC"
            }).includes("12")
        )).slice(0, 5) : []
    }, [forecast]);

    return (
        <div className="flex justify-center items-center w-full h-2/8 border-t-2 border-[#242C3D] divide-x-2 divide-[#242C3D]">
            {filteredList.map(f => (
                <ForecastItem key={f.dt} forecastData={f}/>
            ))}
        </div>
    );
}

function ForecastItem({forecastData}: {forecastData:ForecastItem}) {

    const day: string = new Date(forecastData.dt * 1000).toLocaleDateString("en-US", {weekday: "short", timeZone: "UTC"})

    return (
        <div className="flex flex-col items-center p-1 h-full w-1/5">
            <h1 className="text-white text-lg">{day.toUpperCase()}</h1>
            <img src={`/monochrome/${weatherIconMap[forecastData.weather[0].icon as keyof typeof weatherIconMap]}.svg`} className="w-16 h-16 brightness-0 invert-100"/>
            <h1 className="text-white">{forecastData.main.temp}°C</h1>
        </div>
    );
}

export default App

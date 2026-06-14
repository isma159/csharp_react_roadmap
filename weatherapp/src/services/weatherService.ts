import type {ForecastData, WeatherData} from "../interfaces/weatherInterfaces.ts";

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function getWeather(city: string): Promise<WeatherData> {
    const response = await fetch(BASE_URL + `/weather?q=${city}&appId=${API_KEY}&units=metric`);
    if (response.status == 404) throw new Error("City not found!");
    return await response.json() as Promise<WeatherData>;
}

export async function getForecast(city: string): Promise<ForecastData> {
    const response = await fetch(BASE_URL + `/forecast?q=${city}&appId=${API_KEY}&units=metric`);
    if (response.status == 404) throw new Error("City not found!");
    return await response.json() as Promise<ForecastData>;
}
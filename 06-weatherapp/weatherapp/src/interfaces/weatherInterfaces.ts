export interface WeatherData {
    name: string,
    main: {
        temp: number,
        feels_like: number,
        humidity: number,
    }
    wind: { speed: number }
    weather: { description: string, icon: string }[]

}

export interface ForecastItem {
    dt: number
    main: { temp: number }
    weather: {description: string, icon: string}[]
}

export interface ForecastData {
    city: {name: string},
    list: ForecastItem[]
}
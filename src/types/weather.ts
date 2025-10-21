export interface WeatherData {
  error: string;
  timezone: number;
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  weather: { description: string; icon: string }[];
  city: string;

  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure?: number;
  };
  wind: { speed: number; deg?: number };
  coord: { lon: number; lat: number };
  clouds: { all: number };
  dt: number;
  hourly?: HourlyData[];
  daily?: DailyData[];
}

export interface HourlyData {
  dt: number;
  temp: number;
  weather: { description: string; icon: string }[];
  wind_speed: number;
  pop: number;
}

export interface DailyData {
  dt: number;
  temp: { min: number; max: number };
  weather: { description: string; icon: string }[];
  pop: number;
}

export interface ForecastItem {
  dt: number;
  main: { temp: number };
  weather: { description: string; icon: string }[];
  wind: { speed: number };
  pop?: number;
}

export interface ForecastResponse {
  list: ForecastItem[];
}

import { LS_KEY } from "@/constants";
import { initialState, WeatherState } from "@/store/weather/weatherSlice";

export const loadWeatherFromLocalStorage = (): WeatherState => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return initialState;
    
    const parsed = JSON.parse(raw);
    const weatherData = parsed.weather || {};
    
    return { ...initialState, ...weatherData };
  } catch {
    return initialState;
  }
};

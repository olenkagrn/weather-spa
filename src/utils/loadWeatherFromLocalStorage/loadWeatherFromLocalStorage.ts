import { LS_KEY } from "@/constants";
import { initialState, WeatherState } from "@/store/weather/weatherSlice";

export const loadWeatherFromLocalStorage = (): WeatherState => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return initialState;

    const parsed = JSON.parse(raw);
    const weatherData = parsed.weather || {};

    const loadedState = { ...initialState, ...weatherData };

    loadedState.cities.forEach((city: string) => {
      if (!loadedState.status[city]) {
        loadedState.status[city] = "idle";
      }
      if (loadedState.error[city] === undefined) {
        loadedState.error[city] = null;
      }
    });

    return loadedState;
  } catch {
    return initialState;
  }
};

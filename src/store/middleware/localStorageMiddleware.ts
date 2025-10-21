import { Middleware } from "@reduxjs/toolkit";
import { LS_KEY } from "@/constants";
import { WeatherState } from "../weather/weatherSlice";

export const localStorageMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    try {
      const state = store.getState();
      const weatherState: WeatherState = state.weather;

      const filteredCities = weatherState.cities.filter(
        (city) => weatherState.status[city] === "succeeded"
      );

      const filteredData: WeatherState = {
        cities: filteredCities,
        data: {},
        status: {},
        error: {},
        loadedCities: {},
      };

      filteredCities.forEach((city) => {
        filteredData.data[city] = weatherState.data[city];
        filteredData.status[city] = weatherState.status[city];
        filteredData.error[city] = weatherState.error[city];
      });

      localStorage.setItem(LS_KEY, JSON.stringify({ weather: filteredData }));
    } catch {
      throw new Error("Failed to save state to localStorage");
    }

    return result;
  };

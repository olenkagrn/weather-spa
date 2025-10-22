import { Middleware } from "@reduxjs/toolkit";
import { LS_KEY } from "@/constants";
import { WeatherState } from "../weather/weatherSlice";

export const localStorageMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    try {
      const state = store.getState();
      const weatherState: WeatherState = state.weather;

      const dataToSave: WeatherState = {
        cities: weatherState.cities,
        data: {},
        status: {},
        error: {},
        loadedCities: {},
      };

      weatherState.cities.forEach((city) => {
        if (
          weatherState.status[city] === "succeeded" &&
          weatherState.data[city]
        ) {
          dataToSave.data[city] = weatherState.data[city];
          dataToSave.status[city] = weatherState.status[city];
          dataToSave.error[city] = weatherState.error[city];
          dataToSave.loadedCities[city] = true;
        }
      });

      localStorage.setItem(LS_KEY, JSON.stringify({ weather: dataToSave }));
    } catch {
      throw new Error("Failed to save state to localStorage");
    }

    return result;
  };

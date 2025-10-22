import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const selectCities = (state: RootState) => state.weather.cities;
export const selectWeatherData = (state: RootState) => state.weather.data;
export const selectWeatherStatus = (state: RootState) => state.weather.status;
export const selectWeatherErrors = (state: RootState) => state.weather.error;
export const selectLoadedCities = (state: RootState) =>
  state.weather.loadedCities;

export const selectWeatherStats = createSelector(
  [selectCities, selectWeatherStatus],
  (cities, status) => ({
    totalCities: cities.length,
    loadingCities: Object.values(status).filter((s) => s === "loading").length,
    successfulCities: Object.values(status).filter((s) => s === "succeeded")
      .length,
    failedCities: Object.values(status).filter((s) => s === "failed").length,
  })
);

export const selectAllCitiesLoaded = createSelector(
  [selectCities, selectWeatherStatus],
  (cities, status) => cities.every((city) => status[city] === "succeeded")
);

export const selectCityWeather = (cityName: string) =>
  createSelector(
    [selectWeatherData, selectWeatherStatus, selectWeatherErrors],
    (data, status, errors) => ({
      data: data[cityName] || null,
      status: status[cityName] || "idle",
      error: errors[cityName] || null,
    })
  );

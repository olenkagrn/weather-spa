import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchWeatherByCity, fetchWeatherBatch } from "./weatherThunk";
import { WeatherData } from "@/types/weather";

export interface WeatherState {
  cities: string[];
  data: Record<string, WeatherData>;
  status: Record<string, "idle" | "loading" | "succeeded" | "failed">;
  error: Record<string, string | null>;
  loadedCities: Record<string, boolean>;
}
export const initialState: WeatherState = {
  cities: [],
  data: {},
  status: {},
  error: {},
  loadedCities: {},
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    addCity(state, action: PayloadAction<string>) {
      const city = action.payload.trim();
      if (!city) return;
      if (!state.cities.includes(city)) state.cities.push(city);
    },
    removeCity(state, action: PayloadAction<string>) {
      const city = action.payload;
      state.cities = state.cities.filter((c) => c !== city);
      delete state.data[city];
      delete state.status[city];
      delete state.error[city];
    },
    clearAll(state) {
      state.cities = [];
      state.data = {};
      state.status = {};
      state.error = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherByCity.pending, (state, action) => {
        const city = action.meta.arg;
        state.status[city] = "loading";
        state.error[city] = null;
      })
      .addCase(fetchWeatherByCity.fulfilled, (state, action) => {
        const { city, data } = action.payload;
        state.status[city] = "succeeded";
        state.data[city] = data;
        state.error[city] = null;
        state.loadedCities[city] = true;
      })
      .addCase(fetchWeatherByCity.rejected, (state, action) => {
        const city = action.meta.arg;
        state.status[city] = "failed";
        state.error[city] = action.payload || action.error.message || "Error";
      })
      .addCase(fetchWeatherBatch.pending, (state, action) => {
        action.meta.arg.forEach((city) => {
          state.status[city] = "loading";
          state.error[city] = null;
        });
      })
      .addCase(fetchWeatherBatch.fulfilled, (state, action) => {
        action.payload.forEach(({ city, data, error }) => {
          if (data && !error) {
            state.status[city] = "succeeded";
            state.data[city] = data;
            state.error[city] = null;
            state.loadedCities[city] = true;
          } else {
            state.status[city] = "failed";
            state.error[city] = error || "Failed to load";
          }
        });
      })
      .addCase(fetchWeatherBatch.rejected, (state, action) => {
        action.meta.arg.forEach((city) => {
          state.status[city] = "failed";
          state.error[city] =
            action.payload || action.error.message || "Batch error";
        });
      });
  },
});

export const { addCity, removeCity, clearAll } = weatherSlice.actions;
export default weatherSlice.reducer;

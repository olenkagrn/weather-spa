import { WeatherData } from "@/types/weather";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchWeatherByCity = createAsyncThunk<
  { city: string; data: WeatherData },
  string,
  { rejectValue: string }
>("weather/fetchByCity", async (city, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/weather/?city=${encodeURIComponent(city)}`);
    const data: WeatherData = await res.json();
    if (!res.ok) {
      return rejectWithValue(data?.error || "Failed to fetch weather");
    }
    return { city, data };
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Network error"
    );
  }
});

export const fetchWeatherBatch = createAsyncThunk<
  Array<{ city: string; data: WeatherData | null; error?: string }>,
  string[],
  { rejectValue: string }
>("weather/fetchBatch", async (cities, { rejectWithValue }) => {
  try {
    const weatherPromises = cities.map(async (city) => {
      try {
        const res = await fetch(`/api/weather/?city=${encodeURIComponent(city)}`);
        const data: WeatherData = await res.json();
        if (!res.ok) {
          return { city, data: null, error: data?.error || "Failed to fetch weather" };
        }
        return { city, data, error: undefined };
      } catch (err: unknown) {
        return { 
          city, 
          data: null, 
          error: err instanceof Error ? err.message : "Network error" 
        };
      }
    });

    const results = await Promise.all(weatherPromises);
    return results;
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Batch fetch failed"
    );
  }
});

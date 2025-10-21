import { API_KEY, BASE_URL } from "@/constants";
import { WeatherData, ForecastResponse } from "@/types/weather";

export async function getWeather(city: string): Promise<WeatherData | null> {
  try {
    const decoded = decodeURIComponent(city);
    const res = await fetch(
      `${BASE_URL}/data/2.5/weather?q=${encodeURIComponent(decoded)}&appid=${API_KEY}&units=metric`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.warn("Weather fetch failed:", res.status, res.statusText);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Weather fetch error:", err);
    return null;
  }
}

export async function getForecast(
  city: string
): Promise<ForecastResponse | null> {
  try {
    const decoded = decodeURIComponent(city);
    const res = await fetch(
      `${BASE_URL}/data/2.5/forecast?q=${encodeURIComponent(decoded)}&appid=${API_KEY}&units=metric`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const text = await res.text();
      console.warn("Forecast fetch error:", res.status, res.statusText, text);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Forecast fetch error:", err);
    return null;
  }
}

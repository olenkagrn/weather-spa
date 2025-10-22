import { API_KEY, BASE_URL } from "@/constants";
import { WeatherData, ForecastResponse } from "@/types/weather";

export async function getWeather(city: string): Promise<WeatherData | null> {
  if (!API_KEY) {
    console.error("OPEN_WEATHER_KEY is not set in environment variables");
    return null;
  }

  try {
    const decoded = decodeURIComponent(city);
    const res = await fetch(
      `${BASE_URL}/data/2.5/weather?q=${encodeURIComponent(decoded)}&appid=${API_KEY}&units=metric`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`City not found in OpenWeather database: "${decoded}"`);
        return null;
      }
      
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
  if (!API_KEY) {
    console.error("OPEN_WEATHER_KEY is not set in environment variables");
    return null;
  }

  try {
    const decoded = decodeURIComponent(city);
    
    const url = `${BASE_URL}/data/2.5/forecast?q=${encodeURIComponent(decoded)}&appid=${API_KEY}&units=metric`;
    
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`City not found in OpenWeather database: "${decoded}"`);
        return null;
      }
      
      const text = await res.text();
      console.error(`OpenWeather forecast API error:`, {
        status: res.status,
        statusText: res.statusText,
        city: decoded,
        response: text,
      });
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Forecast fetch error:", err);
    return null;
  }
}

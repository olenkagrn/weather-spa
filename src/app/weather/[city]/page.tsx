import WeatherDetailPage from "@/components/WeatherDetail/WeatherDetailPage";
import { getForecast, getWeather } from "@/utils/openWeather/openWeather";
import { Metadata } from "next";

interface Props {
  params: Promise<{ city: string | string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = Array.isArray(city) ? city[0] : city;
  const decodedCity = decodeURIComponent(cityName || "");

  return {
    title: `Weather in ${decodedCity} - Personal Weather Tracker`,
    description: `Current weather and forecast for ${decodedCity}`,
    keywords: ["weather", "forecast", decodedCity, "temperature", "humidity"],
  };
}

export default async function WeatherDetailServerPage({ params }: Props) {
  const { city } = await params;

  const cityName = Array.isArray(city) ? city[0] : city;
  if (!cityName) throw new Error("City not specified");

  const decodedCity = decodeURIComponent(cityName);

  try {
    const [initialWeather, initialForecast] = await Promise.all([
      getWeather(decodedCity),
      getForecast(decodedCity),
    ]);

    if (!initialWeather) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: "600px",
            margin: "2rem auto",
          }}
        >
          <h1>City Not Found</h1>
          <p>
            Weather data for &ldquo;{decodedCity}&rdquo; is not available.
            Please check the city name and try again.
          </p>
        </div>
      );
    }

    return (
      <WeatherDetailPage
        city={decodedCity}
        initialWeather={initialWeather}
        initialForecast={initialForecast}
      />
    );
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          maxWidth: "600px",
          margin: "2rem auto",
        }}
      >
        <h1>Error</h1>
        <p>
          Failed to load weather data for &ldquo;{decodedCity}&rdquo;. Please
          try again later.
        </p>
      </div>
    );
  }
}

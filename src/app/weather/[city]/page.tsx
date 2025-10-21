import WeatherDetailPage from "@/components/WeatherDetail/WeatherDetailPage";
import { getForecast, getWeather } from "@/utils/openWeather/openWeather";
import { Metadata } from 'next';

interface Props {
  params: Promise<{ city: string | string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = Array.isArray(city) ? city[0] : city;
  const decodedCity = decodeURIComponent(cityName || '');
  
  return {
    title: `Weather in ${decodedCity} - Personal Weather Tracker`,
    description: `Current weather and forecast for ${decodedCity}`,
    keywords: ['weather', 'forecast', decodedCity, 'temperature', 'humidity'],
  };
}

export default async function WeatherDetailServerPage({ params }: Props) {
  const { city } = await params;

  const cityName = Array.isArray(city) ? city[0] : city;
  if (!cityName) throw new Error("City not specified");

  const decodedCity = decodeURIComponent(cityName);

  const [initialWeather, initialForecast] = await Promise.all([
    getWeather(decodedCity),
    getForecast(decodedCity),
  ]);

  return (
    <WeatherDetailPage
      city={decodedCity}
      initialWeather={initialWeather}
      initialForecast={initialForecast}
    />
  );
}

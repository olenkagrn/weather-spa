"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { WeatherData, ForecastResponse } from "@/types/weather";
import { useWeatherForecast } from "@/hooks/useWeatherForecast";
import WeatherHeader from "./components/WeatherHeader";

import CurrentWeather from "./components/CurrentWeather";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";

import styles from "./WeatherDetail.module.scss";

interface WeatherDetailPageProps {
  city?: string;
  initialWeather?: WeatherData | null;
  initialForecast?: ForecastResponse | null;
}

export default function WeatherDetailPage({
  city,
  initialWeather,
  initialForecast,
}: WeatherDetailPageProps) {
  const params = useParams();
  const cityName =
    city || (Array.isArray(params.city) ? params.city[0] : params.city);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const weather =
    useSelector((state: RootState) => state.weather.data[cityName!]) ||
    initialWeather;

  const { hourly, daily, loadingHourly, loadingDaily } = useWeatherForecast(
    cityName,
    initialForecast
  );

  if (!mounted) return null;

  if (!weather)
    return <p className={styles.message}>No data available for this city.</p>;

  return (
    <section className={styles.weatherDetail}>
      <WeatherHeader weather={weather} />
      <CurrentWeather weather={weather} />

      <div className={styles.forecastsContainer}>
        <HourlyForecast hourly={hourly} loading={loadingHourly} />
        <DailyForecast daily={daily} loading={loadingDaily} />
      </div>
    </section>
  );
}

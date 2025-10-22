import { useEffect, useState } from "react";
import axios from "axios";
import { DailyData, ForecastResponse, HourlyData } from "@/types/weather";

interface ForecastState {
  hourly: HourlyData[];
  daily: DailyData[];
  loadingHourly: boolean;
  loadingDaily: boolean;
}

export const useWeatherForecast = (
  cityName: string | undefined,
  initialForecast?: ForecastResponse | null
): ForecastState => {
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [loadingHourly, setLoadingHourly] = useState(false);
  const [loadingDaily, setLoadingDaily] = useState(false);

  useEffect(() => {
    if (!cityName) return;

    const fetchForecasts = async () => {
      setLoadingHourly(true);
      setLoadingDaily(true);

      try {
        let forecastList: ForecastResponse["list"] | undefined =
          initialForecast?.list;

        if (!forecastList) {
          const res = await axios.get<ForecastResponse>(
            `/api/weather/forecast`,
            {
              params: { city: cityName },
            }
          );

          if (!res.data || !res.data.list) {
            console.warn(`No forecast data returned for city "${cityName}"`);
            setHourly([]);
            setDaily([]);
            return;
          }

          forecastList = res.data.list;
        }
        if (!forecastList || forecastList.length === 0) {
          console.warn(`Forecast list is empty for city "${cityName}"`);
          setHourly([]);
          setDaily([]);
          setLoadingHourly(false);
          setLoadingDaily(false);
          return;
        }

        const next8Entries = forecastList.slice(0, 8);
        const processedHourly: HourlyData[] = next8Entries.map((h) => ({
          dt: h.dt,
          temp: h.main?.temp ?? 0,
          weather: h.weather ?? [],
          wind_speed: h.wind?.speed ?? 0,
          pop: h.pop ?? 0,
        }));
        setHourly(processedHourly);
        setLoadingHourly(false);

        const dailyMap = new Map<string, DailyData>();
        forecastList.forEach((item) => {
          if (!item || !item.main || !item.weather) return;
          const dateKey = new Date(item.dt * 1000).toDateString();
          const temp = item.main.temp;
          const pop = item.pop ?? 0;

          if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
              dt: item.dt,
              temp: { min: temp, max: temp },
              weather: item.weather,
              pop,
            });
          } else {
            const current = dailyMap.get(dateKey)!;
            dailyMap.set(dateKey, {
              ...current,
              temp: {
                min: Math.min(current.temp.min, temp),
                max: Math.max(current.temp.max, temp),
              },
            });
          }
        });

        const processedDaily: DailyData[] = Array.from(dailyMap.values()).slice(
          0,
          8
        );
        setDaily(processedDaily);
        setLoadingDaily(false);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            console.warn(`Forecast not available for city "${cityName}" - city not found in weather database`);
          } else {
            console.error(`Failed to fetch forecast data for "${cityName}":`, err.response?.data || err.message);
          }
        } else {
          console.error("Failed to fetch forecast data:", err);
        }
        
        setHourly([]);
        setDaily([]);
        setLoadingHourly(false);
        setLoadingDaily(false);
      }
    };

    fetchForecasts();
  }, [cityName, initialForecast]);

  return { hourly, daily, loadingHourly, loadingDaily };
};

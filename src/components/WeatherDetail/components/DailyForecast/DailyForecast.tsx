import { DailyData } from "@/types/weather";
import Image from "next/image";
import { formatDayOfWeek, formatDate } from "@/utils/formatters";
import styles from "./DailyForecast.module.scss";
import { IMG_URL } from "@/constants";

interface DailyForecastProps {
  daily: DailyData[];
  loading: boolean;
}

export default function DailyForecast({ daily, loading }: DailyForecastProps) {
  if (loading) return <p>Loading daily forecast...</p>;
  if (!daily.length) return <p>Daily forecast unavailable.</p>;

  return (
    <div className={styles.dailyForecast}>
      <h3>Daily Forecast</h3>
      <ul>
        {daily.map((day, index) => (
          <li key={index}>
            <span className={styles.day}>
              {index === 0 ? "Today" : formatDayOfWeek(day.dt)}{" "}
              {formatDate(day.dt)}
            </span>
            <Image
              src={`${IMG_URL}/img/wn/${day.weather[0].icon}@2x.png`}
              alt={day.weather[0].description}
              className={styles.icn}
              width={50}
              height={50}
              priority
            />
            <span className={styles.description}>
              {day.weather[0].description}
            </span>
            <p>
              Max Temp: <strong>{Math.round(day.temp.max)}°C</strong>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

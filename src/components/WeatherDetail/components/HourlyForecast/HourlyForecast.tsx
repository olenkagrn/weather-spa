import { HourlyData } from "@/types/weather";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import styles from "./HourlyForecast.module.scss";
import { IMG_URL } from "@/constants";

interface HourlyForecastProps {
  hourly: HourlyData[];
  loading: boolean;
}

export default function HourlyForecast({
  hourly,
  loading,
}: HourlyForecastProps) {
  if (loading) return <p>Loading hourly forecast...</p>;
  if (!hourly.length) return <p>Hourly forecast unavailable.</p>;

  return (
    <div className={styles.hourlyForecast}>
      <h3>Hourly Forecast (next 24 hours)</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={hourly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="dt"
              tickFormatter={(dt) =>
                new Date(dt * 1000).getHours().toString() + ":00"
              }
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(temp) => `${Math.round(temp)}°`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              labelFormatter={(dt) =>
                new Date(dt * 1000).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              formatter={(value: number) => [
                `${Math.round(value)}°C`,
                "Temperature",
              ]}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#ff7300"
              strokeWidth={2}
              dot={{ stroke: "#ff7300", strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className={styles.chartFooter}>
          {hourly.map((hour, index) => (
            <div key={index} className={styles.chartFooterItem}>
              <Image
                src={`${IMG_URL}/img/wn/${hour.weather[0].icon}@2x.png`}
                alt={hour.weather[0].description}
                width={35}
                height={35}
                priority
              />
              <span>{Math.round(hour.pop * 100)}%</span>
              <span>{Math.round(hour.wind_speed)} m/s</span>
              <span className={styles.descriptionText}>
                {hour.weather[0].description.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

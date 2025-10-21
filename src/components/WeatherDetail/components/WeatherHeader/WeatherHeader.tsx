import { WeatherData } from "@/types/weather";
import { formatFullDate } from "@/utils/formatters";
import AddToFavorite from "../../../AddToFavorite/AddToFavorite";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import styles from "./WeatherHeader.module.scss";
interface WeatherHeaderProps {
  weather: WeatherData;
}

export default function WeatherHeader({ weather }: WeatherHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.header__left}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft />
        </Link>
        <p className={styles.date}>
          {formatFullDate(weather.dt || Date.now() / 1000)}
        </p>
        <h2 className={styles.city}>
          {weather.name}, {weather.sys.country}
        </h2>
      </div>
      <AddToFavorite city={weather.name} />
    </div>
  );
}

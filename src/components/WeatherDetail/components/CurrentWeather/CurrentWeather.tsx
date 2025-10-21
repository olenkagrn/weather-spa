import { WeatherData } from "@/types/weather";
import Image from "next/image";
import { formatTime } from "@/utils/formatters";
import styles from "./CurrentWeather.module.scss";
import { IMG_URL } from "@/constants";

interface CurrentWeatherProps {
  weather: WeatherData;
}

export default function CurrentWeather({ weather }: CurrentWeatherProps) {
  const dewPoint = Math.round(
    weather.main.temp - (100 - weather.main.humidity) / 5
  );

  const cityDetails = {
    name: weather.name,
    country: weather.sys.country,
    lat: weather.coord.lat,
    lon: weather.coord.lon,
    sunrise: weather.sys.sunrise,
    sunset: weather.sys.sunset,
    timezone: weather.timezone,
  };

  return (
    <div className={styles.currentWeather}>
      <div className={styles.mainInfo}>
        <div className={styles.tempValue}>
          <Image
            src={`${IMG_URL}/img/wn/${weather.weather[0].icon}@4x.png`}
            alt={weather.weather[0].description}
            width={120}
            height={120}
            priority
          />
          {Math.round(weather.main.temp)}°C
        </div>
        <p className={styles.groundFrostWarning}>Frost warning</p>
        <p className={styles.feelsLike}>
          Feels like {Math.round(weather.main.feels_like)}°C
        </p>
        <p className={styles.description}>
          {weather.weather[0].description}, light breeze
        </p>
        <div className={styles.detailsList}>
          <div>
            <span>🌬</span> {weather.wind.speed} m/s
          </div>
          <div>
            <span>💧</span> Humidity: {weather.main.humidity}%
          </div>
          <div>
            <span>☁</span> Dew point: {dewPoint}°C
          </div>
          <div>
            <span>🧭</span> {weather.main.pressure} hPa
          </div>
          <div>
            <span>📏</span> Visibility: 10.0 km
          </div>
        </div>
      </div>

      <div className={styles.cityDetails}>
        <h3>City Details</h3>
        <ul>
          <li>
            <strong>City:</strong> {cityDetails.name}
          </li>
          <li>
            <strong>Country:</strong> {cityDetails.country}
          </li>
          <li>
            <strong>Coordinates:</strong> {cityDetails.lat}, {cityDetails.lon}
          </li>
          <li>
            <strong>Sunrise:</strong>{" "}
            {formatTime(cityDetails.sunrise + cityDetails.timezone)}
          </li>
          <li>
            <strong>Sunset:</strong>{" "}
            {formatTime(cityDetails.sunset + cityDetails.timezone)}
          </li>
          <li>
            <strong>Timezone offset:</strong> {cityDetails.timezone / 3600}h
          </li>
        </ul>
      </div>
    </div>
  );
}

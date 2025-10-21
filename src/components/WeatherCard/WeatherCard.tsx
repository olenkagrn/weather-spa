"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { RefreshCw, Trash2, ExternalLink } from "lucide-react";
import styles from "./WeatherCard.module.scss";
import { removeCity } from "@/store/weather/weatherSlice";
import { fetchWeatherByCity } from "@/store/weather/weatherThunk";
import Link from "next/link";
import Image from "next/image";
import AddToFavorite from "../AddToFavorite/AddToFavorite";
import { IMG_URL } from "@/constants";

interface Props {
  city: string;
  onClick?: () => void;
}

export default function WeatherCard({ city, onClick }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const weather = useSelector((s: RootState) => s.weather.data[city]);
  const status = useSelector(
    (s: RootState) => s.weather.status[city] || "idle"
  );
  const error = useSelector((s: RootState) => s.weather.error[city] || null);
  const favorites = useSelector((s: RootState) => s.weather.cities);
  const isFavorite = favorites.includes(city);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(fetchWeatherByCity(city));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeCity(city));
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <div
      className={styles.weatherCard}
      onClick={handleDetails}
      role="button"
      tabIndex={0}
    >
      <div className={styles.actions}>
        <AddToFavorite city={city} />
      </div>

      {status === "loading" ? (
        <div className={styles.message}>Loading...</div>
      ) : error ? (
        <div className={styles.message}>City not found</div>
      ) : weather ? (
        <>
          <Image
            className={styles.icon}
            src={`${IMG_URL}/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            width={100}
            height={100}
            priority
          />
          <h3 className={styles.city}>
            {weather.name}, {weather.sys.country}
          </h3>
          <div className={styles.temp}>
            <span className={styles.value}>
              {Math.round(weather.main.temp)}°C
            </span>
            <span className={styles.feels}>
              (feels {Math.round(weather.main.feels_like)}°)
            </span>
          </div>
          <p className={styles.desc}>{weather.weather[0].description}</p>
          <div className={styles.meta}>
            <span>💧 {weather.main.humidity}%</span>
            <span>🌬 {weather.wind.speed} m/s</span>
          </div>
          <div className={styles.meta}>
            <Link href={`/weather/${city}`} className={styles.detailsBtn}>
              <ExternalLink size={14} /> <span>Details</span>
            </Link>

            <button
              className={styles.iconBtn}
              onClick={handleRefresh}
              aria-label={`Refresh ${city}`}
            >
              <RefreshCw size={18} />
            </button>

            {weather && isFavorite && (
              <button
                className={styles.iconBtn}
                onClick={handleDelete}
                aria-label={`Remove ${city}`}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </>
      ) : (
        <div className={styles.message}>No data</div>
      )}
    </div>
  );
}

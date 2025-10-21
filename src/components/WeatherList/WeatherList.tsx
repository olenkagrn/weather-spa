"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import WeatherCard from "../WeatherCard/WeatherCard";
import styles from "./WeatherList.module.scss";
import { fetchWeatherBatch } from "@/store/weather/weatherThunk";

export default function WeatherList() {
  const dispatch = useDispatch<AppDispatch>();
  const cities = useSelector((state: RootState) => state.weather.cities);
  const status = useSelector((state: RootState) => state.weather.status);

  const loadedCities = useSelector(
    (state: RootState) => state.weather.loadedCities
  );

  useEffect(() => {
    if (cities.length === 0) return;

    // Знаходимо міста, які потребують завантаження
    const citiesToLoad = cities.filter(
      (city) =>
        !status[city] || status[city] === "failed" || !loadedCities[city]
    );

    // Якщо є міста для завантаження, виконуємо batch запит
    if (citiesToLoad.length > 0) {
      dispatch(fetchWeatherBatch(citiesToLoad));
    }
  }, [cities, dispatch, status, loadedCities]);

  if (cities.length === 0) {
    return <p className={styles.message}>No favorite cities yet.</p>;
  }

  return (
    <section className={styles.favoriteSection}>
      <h2 className={styles.weatherHeader}>Favorite Cities</h2>
      <div className={styles.favoriteList}>
        {cities.map((city) => (
          <WeatherCard key={city} city={city} />
        ))}
      </div>
    </section>
  );
}

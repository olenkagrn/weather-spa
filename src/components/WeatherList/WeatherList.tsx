"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { selectCities, selectWeatherStatus, selectLoadedCities } from "@/store/selectors";
import WeatherCard from "../WeatherCard/WeatherCard";
import styles from "./WeatherList.module.scss";
import { fetchWeatherBatch } from "@/store/weather/weatherThunk";
import Loading from "@/app/loading";

export default function WeatherList() {
  const dispatch = useDispatch<AppDispatch>();
  const cities = useSelector(selectCities);
  const status = useSelector(selectWeatherStatus);
  const loadedCities = useSelector(selectLoadedCities);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const isAnyLoading = Object.values(status).some((s) => s === "loading");

  useEffect(() => {
    if (cities.length === 0) {
      setIsInitialLoading(false);
      return;
    }

    const citiesToLoad = cities.filter((city) => {
      const cityStatus = status[city];
      const isLoaded = loadedCities[city];

      return (
        !cityStatus ||
        cityStatus === "failed" ||
        (!isLoaded && cityStatus !== "succeeded")
      );
    });

    if (citiesToLoad.length > 0) {
      dispatch(fetchWeatherBatch(citiesToLoad));
    } else {
      setIsInitialLoading(false);
    }
  }, [cities, dispatch, status, loadedCities]);

  useEffect(() => {
    if (!isAnyLoading && cities.length > 0) {
      setIsInitialLoading(false);
    }
  }, [isAnyLoading, cities.length]);

  if (cities.length === 0) {
    return <p className={styles.message}>No favorite cities yet.</p>;
  }

  if (isInitialLoading) {
    return <Loading />;
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

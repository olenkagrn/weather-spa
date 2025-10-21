"use client";
import SearchBar from "@/components/SearchBar/SearchBar";
import WeatherList from "@/components/WeatherList/WeatherList";
import styles from "./page.module.scss";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className={styles.HomePage}>
      <h1 className={styles.title}>Personal Weather Tracker</h1>
      <SearchBar />
      <WeatherList />
    </main>
  );
}

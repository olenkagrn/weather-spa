"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addCity, removeCity } from "@/store/weather/weatherSlice";
import { Heart } from "lucide-react";
import styles from "./AddToFavorite.module.scss";

interface Props {
  city: string;
  className?: string;
}

export default function AddToFavorite({ city, className = "" }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const favorites = useSelector((s: RootState) => s.weather.cities);
  const isFavorite = favorites.includes(city);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFavorite) {
      dispatch(addCity(city));
    } else {
      dispatch(removeCity(city));
    }
  };

  return (
    <button
      type="button"
      className={`${styles.iconBtn} ${isFavorite ? styles.favoriteIcon : ""} ${className}`}
      onClick={handleClick}
      aria-label="Add to favorites"
    >
      <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}

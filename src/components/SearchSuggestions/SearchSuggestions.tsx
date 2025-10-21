"use client";

import React, { useMemo } from "react";
import styles from "./SearchSuggestions.module.scss";

interface Props {
  suggestions: string[];
  onSelect: (city: string) => void;
}

export default function SearchSuggestions({ suggestions, onSelect }: Props) {
  const uniqueSuggestions = useMemo(() => {
    return Array.from(new Set(suggestions));
  }, [suggestions]);

  if (uniqueSuggestions.length === 0) return null;

  return (
    <ul className={styles.suggestions}>
      {uniqueSuggestions.map((city, index) => (
        <li
          key={`${city}-${index}`}
          className={styles.suggestion}
          onClick={() => onSelect(city)}
        >
          {city}
        </li>
      ))}
    </ul>
  );
}

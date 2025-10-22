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
    <ul
      className={styles.suggestions}
      role="listbox"
      aria-label="City suggestions"
    >
      {uniqueSuggestions.map((city, index) => (
        <li
          key={`${city}-${index}`}
          className={styles.suggestion}
          role="option"
          aria-selected={false}
          tabIndex={0}
          onClick={() => onSelect(city)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(city);
            }
          }}
          aria-label={`Select ${city}`}
        >
          {city}
        </li>
      ))}
    </ul>
  );
}

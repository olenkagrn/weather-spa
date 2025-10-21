"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.scss";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import SearchSuggestions from "../SearchSuggestions/SearchSuggestions";
import { fetchCitySuggestions } from "./utils/fetchCitySuggestions";

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const { result: suggestions, loading } = useDebounce(
    value,
    1000,
    fetchCitySuggestions
  );

  const handleSelect = (city: string) => {
    router.push(`/weather/${city}`);
    setValue("");
  };

  return (
    <section className={styles.searchWrapper}>
      <div className={styles.inputWrap}>
        <Search className={styles.icon} size={24} />
        <input
          className={styles.input}
          placeholder="Enter city name..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Search city"
        />
      </div>

      {loading && <div className={styles.loader}>Loading...</div>}

      {!loading && value.trim() && (suggestions?.length ?? 0) === 0 && (
        <div className={styles.noResults}>
          City not found, please try again.
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <SearchSuggestions suggestions={suggestions} onSelect={handleSelect} />
      )}
    </section>
  );
}

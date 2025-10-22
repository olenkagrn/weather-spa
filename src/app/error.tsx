"use client";

import { useEffect } from "react";
import styles from './error.module.scss';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Something went wrong!</h2>
      <p className={styles.message}>
        {error.message || "Failed to load this page"}
      </p>
      <button
        onClick={() => reset()}
        className={styles.button}
      >
        Try again
      </button>
    </div>
  );
}

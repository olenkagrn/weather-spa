"use client";

import { useEffect } from "react";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h2>Something went wrong!</h2>
      <p style={{ margin: "1rem 0", color: "#666" }}>
        {error.message || "Failed to load this page"}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#f15d46",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

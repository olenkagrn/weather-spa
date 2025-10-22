import { useEffect, useRef, useState } from "react";

export function useDebounce<T>(
  value: string,
  delay: number,
  asyncFn: (v: string) => Promise<T>
) {
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!value.trim()) {
      setResult(null);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setHasSearched(false);
      try {
        const data = await asyncFn(value.trim());
        setResult(data);
        setHasSearched(true);
      } catch {
        setResult(null);
        setHasSearched(true);
        throw new Error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, asyncFn, delay]);

  return { result, loading, hasSearched };
}

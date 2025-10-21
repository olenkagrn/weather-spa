import { useEffect, useRef, useState } from "react";

export function useDebounce<T>(
  value: string,
  delay: number,
  asyncFn: (v: string) => Promise<T>
) {
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!value.trim()) {
      setResult(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await asyncFn(value.trim());
        setResult(data);
      } catch {
        throw new Error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, asyncFn, delay]);

  return { result, loading };
}

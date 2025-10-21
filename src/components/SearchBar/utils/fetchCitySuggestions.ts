export async function fetchCitySuggestions(query: string): Promise<string[]> {
  if (!query.trim()) return [];

  const res = await fetch(`/api/cities?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to fetch cities");

  const data: string[] = await res.json();
  return data;
}


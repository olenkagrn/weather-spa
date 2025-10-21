import { API_KEY, BASE_URL } from "@/constants";
import { NextResponse } from "next/server";

interface CityData {
  name: string;
  country: string;
}

// Cache cities for 1 hour since city names don't change frequently
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();

  if (!query || query.length < 3) return NextResponse.json([]);

  try {
    const res = await fetch(
      `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(
        query
      )}&limit=5&appid=${API_KEY}`
    );
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();

    const results = data.map(
      (item: CityData) => `${item.name}, ${item.country}`
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}

import { NextResponse } from "next/server";
import axios from "axios";
import { API_KEY, BASE_URL } from "@/constants";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city)
    return NextResponse.json({ error: "Missing city" }, { status: 400 });
  if (!API_KEY)
    return NextResponse.json({ error: "API key missing" }, { status: 500 });

  try {
    const { data } = await axios.get(`${BASE_URL}/data/2.5/weather`, {
      params: {
        q: city,
        units: "metric",
        appid: API_KEY,
      },
    });
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { getForecast } from "@/utils/openWeather/openWeather";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ message: "Missing city" }, { status: 400 });
  }

  try {
    const data = await getForecast(city);

    if (data === null) {
      return NextResponse.json(
        { message: "An error occurred" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}

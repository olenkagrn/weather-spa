import { WeatherData } from "@/types/weather";

export interface SearchState {
  query: string;
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

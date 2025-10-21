/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import { useWeatherForecast } from "@/hooks/useWeatherForecast/useWeatherForecast";
import { ForecastResponse, HourlyData } from "@/types/weather";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useWeatherForecast", () => {
  const mockForecastResponse: ForecastResponse = {
    list: [
      {
        dt: 1697904000,
        main: { temp: 20 },
        weather: [{ description: "cloudy", icon: "01d" }],
        wind: { speed: 3 },
        pop: 0.1,
      },
      {
        dt: 1697917600,
        main: { temp: 22 },
        weather: [{ description: "sunny", icon: "02d" }],
        wind: { speed: 4 },
        pop: 0.2,
      },
    ],
  };

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("fetches forecast data when cityName is provided", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockForecastResponse });

    const { result } = renderHook(() => useWeatherForecast("Kyiv"));

    expect(result.current.loadingHourly).toBe(true);
    expect(result.current.loadingDaily).toBe(true);

    await waitFor(() => {
      expect(result.current.loadingHourly).toBe(false);
    });

    const expectedHourly: HourlyData[] = mockForecastResponse.list.map((h) => ({
      dt: h.dt,
      temp: h.main?.temp ?? 0,
      weather: h.weather ?? [],
      wind_speed: h.wind?.speed ?? 0,
      pop: h.pop ?? 0,
    }));

    expect(result.current.hourly).toEqual(expectedHourly);
    expect(result.current.daily.length).toBeGreaterThan(0);
    expect(result.current.loadingHourly).toBe(false);
    expect(result.current.loadingDaily).toBe(false);
  });

  test("uses initialForecast if provided", () => {
    const { result } = renderHook(() =>
      useWeatherForecast("Kyiv", mockForecastResponse)
    );

    expect(result.current.hourly.length).toBe(2);
    expect(result.current.daily.length).toBeGreaterThan(0);
    expect(result.current.loadingHourly).toBe(false);
    expect(result.current.loadingDaily).toBe(false);
  });

  test("returns empty arrays if cityName is undefined", () => {
    const { result } = renderHook(() => useWeatherForecast(undefined));

    expect(result.current.hourly).toEqual([]);
    expect(result.current.daily).toEqual([]);
    expect(result.current.loadingHourly).toBe(false);
    expect(result.current.loadingDaily).toBe(false);
  });

  test("handles API error gracefully", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("API error"));

    const { result } = renderHook(() => useWeatherForecast("Kyiv"));

    await waitFor(() => {
      expect(result.current.loadingHourly).toBe(false);
      expect(result.current.loadingDaily).toBe(false);
    });

    expect(result.current.hourly).toEqual([]);
    expect(result.current.daily).toEqual([]);
  });

  test("handles empty forecast list", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { list: [] } });

    const { result } = renderHook(() => useWeatherForecast("Kyiv"));

    await waitFor(() => {
      expect(result.current.loadingHourly).toBe(false);
    });

    expect(result.current.hourly).toEqual([]);
    expect(result.current.daily).toEqual([]);
    expect(result.current.loadingHourly).toBe(false);
    expect(result.current.loadingDaily).toBe(false);
  });
});

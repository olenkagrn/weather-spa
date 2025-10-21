/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import WeatherList from "@/components/WeatherList/WeatherList";
import { fetchWeatherBatch } from "@/store/weather/weatherThunk";

// Моки
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/store/weather/weatherThunk", () => ({
  fetchWeatherBatch: jest.fn(),
}));

jest.mock("@/components/WeatherCard/WeatherCard", () => ({
  __esModule: true,
  default: ({ city }: { city: string }) => (
    <div data-testid={`weather-card-${city}`}>{city}</div>
  ),
}));

describe("WeatherList", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    jest.clearAllMocks();
  });

  test("renders message when no favorite cities", () => {
    (useSelector as unknown as jest.Mock).mockImplementation(
      (
        selectorFn: (state: {
          weather: {
            cities: string[];
            status: Record<string, string>;
            loadedCities: Record<string, boolean>;
          };
        }) => unknown
      ) => selectorFn({ weather: { cities: [], status: {}, loadedCities: {} } })
    );

    render(<WeatherList />);
    expect(screen.getByText("No favorite cities yet.")).toBeInTheDocument();
  });

  test("renders WeatherCard for each city", () => {
    const cities = ["Kyiv", "Lviv"];
    const status = { Kyiv: "succeeded", Lviv: "succeeded" };
    const loadedCities = { Kyiv: true, Lviv: true };

    (useSelector as unknown as jest.Mock).mockImplementation(
      (
        selectorFn: (state: {
          weather: {
            cities: string[];
            status: Record<string, string>;
            loadedCities: Record<string, boolean>;
          };
        }) => unknown
      ) => selectorFn({ weather: { cities, status, loadedCities } })
    );

    render(<WeatherList />);

    expect(screen.getByText("Favorite Cities")).toBeInTheDocument();
    cities.forEach((city) => {
      expect(screen.getByTestId(`weather-card-${city}`)).toBeInTheDocument();
    });
  });

  test("dispatches fetchWeatherBatch for cities that need loading", () => {
    const cities = ["Kyiv", "Lviv", "Odesa"];
    const status = { Kyiv: "succeeded", Lviv: "failed" };
    const loadedCities = { Kyiv: true, Lviv: false, Odesa: false };

    (useSelector as unknown as jest.Mock).mockImplementation(
      (
        selectorFn: (state: {
          weather: {
            cities: string[];
            status: Record<string, string>;
            loadedCities: Record<string, boolean>;
          };
        }) => unknown
      ) => selectorFn({ weather: { cities, status, loadedCities } })
    );

    render(<WeatherList />);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(fetchWeatherBatch(["Lviv", "Odesa"]));
  });

  test("does not dispatch when all cities are already loaded", () => {
    const cities = ["Kyiv", "Lviv"];
    const status = { Kyiv: "succeeded", Lviv: "succeeded" };
    const loadedCities = { Kyiv: true, Lviv: true };

    (useSelector as unknown as jest.Mock).mockImplementation(
      (
        selectorFn: (state: {
          weather: {
            cities: string[];
            status: Record<string, string>;
            loadedCities: Record<string, boolean>;
          };
        }) => unknown
      ) => selectorFn({ weather: { cities, status, loadedCities } })
    );

    render(<WeatherList />);

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

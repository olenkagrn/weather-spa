/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useWeatherForecast } from "@/hooks/useWeatherForecast/useWeatherForecast";
import WeatherDetailPage from "@/components/WeatherDetail/WeatherDetailPage";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("next/dynamic", () => () => {
  return () => null;
});
jest.mock("@/components/WeatherDetail/components/HourlyForecast", () => {
  const HourlyForecast = ({
    hourly,
    loading,
  }: {
    hourly: unknown[];
    loading: boolean;
  }) => (
    <div data-testid="hourly-forecast">
      {loading
        ? "Loading hourly..."
        : hourly.length === 0
          ? "Hourly forecast unavailable."
          : "Hourly data"}
    </div>
  );
  HourlyForecast.displayName = "HourlyForecast";
  return HourlyForecast;
});

jest.mock("@/components/WeatherDetail/components/DailyForecast", () => {
  const DailyForecast = ({
    daily,
    loading,
  }: {
    daily: unknown[];
    loading: boolean;
  }) => (
    <div data-testid="daily-forecast">
      {loading
        ? "Loading daily..."
        : daily.length === 0
          ? "Daily forecast unavailable."
          : "Daily data"}
    </div>
  );
  DailyForecast.displayName = "DailyForecast";
  return DailyForecast;
});
jest.mock("next/image", () => {
  const MockImage = ({
    alt,
    src,
    priority,
    ...restProps
  }: {
    alt: string;
    src?: string;
    priority?: boolean;
    [key: string]: unknown;
  }) => (
    <div
      {...restProps}
      data-testid="mock-image"
      data-src={src}
      data-alt={alt}
      data-priority={priority ? "true" : "false"}
    />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("@/hooks/useWeatherForecast/useWeatherForecast", () => ({
  useWeatherForecast: jest.fn(),
}));

jest.mock("@/components/WeatherDetail/components/WeatherHeader", () => {
  const WeatherHeader = () => <div data-testid="weather-header" />;
  WeatherHeader.displayName = "WeatherHeader";
  return WeatherHeader;
});
jest.mock("@/components/WeatherDetail/components/CurrentWeather", () => {
  const CurrentWeather = () => <div data-testid="current-weather" />;
  CurrentWeather.displayName = "CurrentWeather";
  return CurrentWeather;
});

describe("WeatherDetailPage", () => {
  const mockWeather = {
    name: "Kyiv",
    sys: { country: "UA", sunrise: 1640930400, sunset: 1640965200 },
    main: { temp: 24, feels_like: 22, humidity: 60 },
    weather: [{ icon: "04n", description: "cloudy" }],
    wind: { speed: 3.5 },
    clouds: { all: 20 },
    error: "",
    timezone: 7200,
    city: "Kyiv",
    coord: { lat: 50.4501, lon: 30.5234 },
    dt: 1640995200,
    visibility: 10000,
  };

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ city: "Kyiv" });
    (useSelector as unknown as jest.Mock).mockImplementation((fn) =>
      fn({ weather: { data: { Kyiv: mockWeather } } })
    );
    (useWeatherForecast as jest.Mock).mockReturnValue({
      hourly: [],
      daily: [],
      loadingHourly: false,
      loadingDaily: false,
    });
  });

  test("renders all subcomponents when data is available", () => {
    (useWeatherForecast as jest.Mock).mockReturnValue({
      hourly: [{ dt: 1640995200, temp: 20 }],
      daily: [{ dt: 1640995200, temp: { min: 15, max: 25 } }],
      loadingHourly: false,
      loadingDaily: false,
    });

    render(<WeatherDetailPage />);

    expect(screen.getByTestId("weather-header")).toBeInTheDocument();
    expect(screen.getByTestId("current-weather")).toBeInTheDocument();
  });

  test("renders 'No data' message when weather is not available", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((fn) =>
      fn({ weather: { data: {} } })
    );
    render(<WeatherDetailPage />);

    expect(
      screen.getByText("No data available for this city.")
    ).toBeInTheDocument();
  });

  test("renders loading states for forecasts", () => {
    (useWeatherForecast as jest.Mock).mockReturnValue({
      hourly: [],
      daily: [],
      loadingHourly: true,
      loadingDaily: true,
    });

    render(<WeatherDetailPage />);

    expect(screen.getByTestId("weather-header")).toBeInTheDocument();
    expect(screen.getByTestId("current-weather")).toBeInTheDocument();

    expect(
      screen.queryByText("Forecast data is not available for this location.")
    ).not.toBeInTheDocument();
  });

  test("renders no forecast message when no data and not loading", () => {
    (useWeatherForecast as jest.Mock).mockReturnValue({
      hourly: [],
      daily: [],
      loadingHourly: false,
      loadingDaily: false,
    });

    render(<WeatherDetailPage />);

    expect(
      screen.getByText("Hourly forecast unavailable.")
    ).toBeInTheDocument();
    expect(screen.getByText("Daily forecast unavailable.")).toBeInTheDocument();
  });
  test("renders correctly when initialWeather prop is provided", () => {
    render(
      <WeatherDetailPage initialWeather={mockWeather} initialForecast={null} />
    );

    expect(screen.getByTestId("weather-header")).toBeInTheDocument();
    expect(screen.getByTestId("current-weather")).toBeInTheDocument();
  });
});

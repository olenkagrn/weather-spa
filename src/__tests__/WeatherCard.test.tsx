/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore, { MockStore } from "redux-mock-store";
import WeatherCard from "@/components/WeatherCard";
import { removeCity } from "@/store/weather/weatherSlice";

jest.mock("next/link", () => {
  const MockLink = ({ children }: { children: React.ReactNode }) => (
    <a>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
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
jest.mock("@/components/AddToFavorite", () => {
  const MockAddToFavorite = () => <div data-testid="add-to-favorite" />;
  MockAddToFavorite.displayName = "MockAddToFavorite";
  return MockAddToFavorite;
});

const mockStore = configureStore([]);
const mockWeather = {
  name: "Kyiv",
  sys: { country: "UA" },
  main: { temp: 18.5, feels_like: 16.2, humidity: 60 },
  weather: [{ icon: "04n", description: "cloudy" }],
  wind: { speed: 3.5 },
};

describe("WeatherCard component", () => {
  let store: MockStore;

  beforeEach(() => {
    store = mockStore({
      weather: {
        data: { Kyiv: mockWeather },
        status: { Kyiv: "succeeded" },
        error: {},
        cities: ["Kyiv"],
      },
    });
    store.dispatch = jest.fn();
  });

  test("dispatches removeCity when delete clicked", () => {
    render(
      <Provider store={store}>
        <WeatherCard city="Kyiv" />
      </Provider>
    );

    const deleteBtn = screen.getByLabelText("Remove Kyiv");
    fireEvent.click(deleteBtn);

    expect(store.dispatch).toHaveBeenCalledWith(removeCity("Kyiv"));
  });

  test("shows loading state", () => {
    const loadingStore = mockStore({
      weather: {
        data: {},
        status: { Lviv: "loading" },
        error: {},
        cities: [],
      },
    });

    render(
      <Provider store={loadingStore}>
        <WeatherCard city="Lviv" />
      </Provider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("shows error state", () => {
    const errorStore = mockStore({
      weather: {
        data: {},
        status: { Paris: "failed" },
        error: { Paris: "City not found" },
        cities: [],
      },
    });

    render(
      <Provider store={errorStore}>
        <WeatherCard city="Paris" />
      </Provider>
    );

    expect(screen.getByText("City not found")).toBeInTheDocument();
  });
});

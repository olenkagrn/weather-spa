import { GET } from "@/app/api/weather/route";
import { NextResponse } from "next/server";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@/constants", () => ({
  API_KEY: "test-api-key",
  BASE_URL: "https://api.openweathermap.org",
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown, options?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      ok: options?.status
        ? options.status >= 200 && options.status < 300
        : true,
      status: options?.status || 200,
    })),
  },
}));

const mockedNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe("GET /api/weather", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Request validation", () => {
    test("returns 400 error when city parameter is missing", async () => {
      const req = new Request("http://localhost/api/weather");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ error: "Missing city" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { error: "Missing city" },
        { status: 400 }
      );
    });

    test("returns 400 error when city parameter is empty", async () => {
      const req = new Request("http://localhost/api/weather?city=");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ error: "Missing city" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { error: "Missing city" },
        { status: 400 }
      );
    });
  });

  describe("Successful API calls", () => {
    const mockWeatherData = {
      coord: { lon: 30.5167, lat: 50.4333 },
      weather: [
        {
          id: 800,
          main: "Clear",
          description: "clear sky",
          icon: "01d",
        },
      ],
      base: "stations",
      main: {
        temp: 15.25,
        feels_like: 14.32,
        temp_min: 13.89,
        temp_max: 16.11,
        pressure: 1015,
        humidity: 72,
      },
      visibility: 10000,
      wind: {
        speed: 3.44,
        deg: 280,
      },
      clouds: {
        all: 0,
      },
      dt: 1635768000,
      sys: {
        type: 2,
        id: 2003742,
        country: "UA",
        sunrise: 1635745800,
        sunset: 1635782400,
      },
      timezone: 7200,
      id: 703448,
      name: "Kiev",
      cod: 200,
    };

    test("returns weather data for valid city", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      const req = new Request("http://localhost/api/weather?city=Kiev");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(mockWeatherData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            q: "Kiev",
            units: "metric",
            appid: "test-api-key",
          },
        }
      );
      expect(mockedNextResponse.json).toHaveBeenCalledWith(mockWeatherData);
    });

    test("handles city names with spaces", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      const req = new Request("http://localhost/api/weather?city=New%20York");

      await GET(req);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            q: "New York",
            units: "metric",
            appid: "test-api-key",
          },
        }
      );
    });

    test("handles city names with special characters", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      const req = new Request("http://localhost/api/weather?city=São%20Paulo");

      await GET(req);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            q: "São Paulo",
            units: "metric",
            appid: "test-api-key",
          },
        }
      );
    });

    test("uses correct API parameters", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      const req = new Request("http://localhost/api/weather?city=London");

      await GET(req);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/data/2.5/weather"),
        expect.objectContaining({
          params: expect.objectContaining({
            units: "metric",
            appid: "test-api-key",
          }),
        })
      );
    });
  });

  describe("Error handling", () => {
    test("returns 500 error when axios throws network error", async () => {
      const networkError = new Error("Network Error");
      mockedAxios.get.mockRejectedValue(networkError);

      const req = new Request("http://localhost/api/weather?city=InvalidCity");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ error: "Network Error" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { error: "Network Error" },
        { status: 500 }
      );
    });

    test("returns 500 error when axios throws HTTP error", async () => {
      const httpError = new Error("Request failed with status code 404");
      Object.assign(httpError, {
        response: {
          status: 404,
          data: { message: "city not found" },
        },
      });
      mockedAxios.get.mockRejectedValue(httpError);

      const req = new Request(
        "http://localhost/api/weather?city=NonexistentCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ error: "Request failed with status code 404" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { error: "Request failed with status code 404" },
        { status: 500 }
      );
    });

    test("handles non-Error objects gracefully", async () => {
      mockedAxios.get.mockRejectedValue("Some string error");

      const req = new Request("http://localhost/api/weather?city=TestCity");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ error: "An error occurred" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { error: "An error occurred" },
        { status: 500 }
      );
    });

    test("handles null/undefined errors gracefully", async () => {
      mockedAxios.get.mockRejectedValue(null);

      const req = new Request("http://localhost/api/weather?city=TestCity");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ error: "An error occurred" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { error: "An error occurred" },
        { status: 500 }
      );
    });
  });

  describe("URL parsing", () => {
    test("correctly parses city from query parameters", async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      const testCases = [
        { url: "http://localhost/api/weather?city=Kiev", expected: "Kiev" },
        {
          url: "http://localhost/api/weather?city=London&other=param",
          expected: "London",
        },
        { url: "https://myapp.com/api/weather?city=Paris", expected: "Paris" },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        const req = new Request(testCase.url);

        await GET(req);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            params: expect.objectContaining({
              q: testCase.expected,
            }),
          })
        );
      }
    });

    test("handles multiple query parameters correctly", async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      const req = new Request(
        "http://localhost/api/weather?city=Kiev&lang=en&format=json"
      );

      await GET(req);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            q: "Kiev",
          }),
        })
      );
    });
  });

  describe("Response format", () => {
    test("returns JSON response with correct content type", async () => {
      const mockData = { temperature: 20, description: "sunny" };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const req = new Request("http://localhost/api/weather?city=TestCity");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(mockData);
      expect(mockedNextResponse.json).toHaveBeenCalledWith(mockData);
    });

    test("preserves all weather data fields", async () => {
      const completeWeatherData = {
        coord: { lon: -0.13, lat: 51.51 },
        weather: [
          {
            id: 300,
            main: "Drizzle",
            description: "light intensity drizzle",
            icon: "09d",
          },
        ],
        base: "stations",
        main: {
          temp: 280.32,
          pressure: 1012,
          humidity: 81,
          temp_min: 279.15,
          temp_max: 281.15,
        },
        visibility: 10000,
        wind: { speed: 4.1, deg: 80 },
        clouds: { all: 90 },
        dt: 1485789600,
        sys: {
          type: 1,
          id: 5091,
          country: "GB",
          sunrise: 1485762037,
          sunset: 1485794875,
        },
        id: 2643743,
        name: "London",
        cod: 200,
      };

      mockedAxios.get.mockResolvedValue({ data: completeWeatherData });

      const req = new Request("http://localhost/api/weather?city=London");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(completeWeatherData);
      expect(data).toHaveProperty("coord");
      expect(data).toHaveProperty("weather");
      expect(data).toHaveProperty("main");
      expect(data).toHaveProperty("wind");
      expect(data).toHaveProperty("clouds");
      expect(data).toHaveProperty("sys");
    });
  });
});

import { GET } from "@/app/api/weather/forecast/route";
import { NextResponse } from "next/server";
import { getForecast } from "@/utils/openWeather/openWeather";
import { ForecastResponse } from "@/types/weather";

jest.mock("@/utils/openWeather/openWeather", () => ({
  getForecast: jest.fn(),
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

const mockedGetForecast = getForecast as jest.MockedFunction<
  typeof getForecast
>;
const mockedNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe("GET /api/weather/forecast", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("Request validation", () => {
    test("returns 400 error when city parameter is missing", async () => {
      const req = new Request("http://localhost/api/weather/forecast");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ message: "Missing city" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { message: "Missing city" },
        { status: 400 }
      );
      expect(mockedGetForecast).not.toHaveBeenCalled();
    });

    test("returns 400 error when city parameter is empty", async () => {
      const req = new Request("http://localhost/api/weather/forecast?city=");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ message: "Missing city" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { message: "Missing city" },
        { status: 400 }
      );
      expect(mockedGetForecast).not.toHaveBeenCalled();
    });

    test("processes request when city parameter is provided", async () => {
      const mockForecastData: ForecastResponse = {
        list: [
          {
            dt: 1635768000,
            main: { temp: 15.25 },
            weather: [{ description: "clear sky", icon: "01d" }],
            wind: { speed: 3.44 },
            pop: 0.1,
          },
        ],
      };

      mockedGetForecast.mockResolvedValue(mockForecastData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=Kiev"
      );

      await GET(req);

      expect(mockedGetForecast).toHaveBeenCalledWith("Kiev");
    });
  });

  describe("Successful API calls", () => {
    const mockForecastData: ForecastResponse = {
      list: [
        {
          dt: 1635768000,
          main: { temp: 15.25 },
          weather: [{ description: "clear sky", icon: "01d" }],
          wind: { speed: 3.44 },
          pop: 0.1,
        },
        {
          dt: 1635778800,
          main: { temp: 18.3 },
          weather: [{ description: "few clouds", icon: "02d" }],
          wind: { speed: 2.89 },
          pop: 0.0,
        },
        {
          dt: 1635789600,
          main: { temp: 20.15 },
          weather: [{ description: "scattered clouds", icon: "03d" }],
          wind: { speed: 4.12 },
          pop: 0.2,
        },
      ],
    };

    test("returns forecast data for valid city", async () => {
      mockedGetForecast.mockResolvedValue(mockForecastData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=Kiev"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(mockForecastData);
      expect(mockedGetForecast).toHaveBeenCalledWith("Kiev");
      expect(mockedNextResponse.json).toHaveBeenCalledWith(mockForecastData);
    });

    test("handles city names with spaces", async () => {
      mockedGetForecast.mockResolvedValue(mockForecastData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=New%20York"
      );

      await GET(req);

      expect(mockedGetForecast).toHaveBeenCalledWith("New York");
    });

    test("handles city names with special characters", async () => {
      mockedGetForecast.mockResolvedValue(mockForecastData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=São%20Paulo"
      );

      await GET(req);

      expect(mockedGetForecast).toHaveBeenCalledWith("São Paulo");
    });

    test("handles encoded city names correctly", async () => {
      mockedGetForecast.mockResolvedValue(mockForecastData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=Kyiv%2C%20UA"
      );

      await GET(req);

      expect(mockedGetForecast).toHaveBeenCalledWith("Kyiv, UA");
    });

    test("returns complete forecast data structure", async () => {
      const completeForecastData: ForecastResponse = {
        list: Array.from({ length: 40 }, (_, i) => ({
          dt: 1635768000 + i * 10800,
          main: { temp: 15 + Math.random() * 10 },
          weather: [{ description: "clear sky", icon: "01d" }],
          wind: { speed: 2 + Math.random() * 5 },
          pop: Math.random() * 0.5,
        })),
      };

      mockedGetForecast.mockResolvedValue(completeForecastData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=London"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(completeForecastData);
      expect(Array.isArray(data.list)).toBe(true);
      expect(data.list).toHaveLength(40);

      const firstItem = data.list[0];
      expect(firstItem).toHaveProperty("dt");
      expect(firstItem).toHaveProperty("main.temp");
      expect(firstItem).toHaveProperty("weather");
      expect(firstItem).toHaveProperty("wind.speed");
      expect(firstItem).toHaveProperty("pop");
    });
  });

  describe("Error handling", () => {
    test("returns 404 error when getForecast returns null", async () => {
      mockedGetForecast.mockResolvedValue(null);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=InvalidCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({
        message: "City not found or forecast data unavailable",
      });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { message: "City not found or forecast data unavailable" },
        { status: 404 }
      );
    });

    test("returns 500 error when getForecast throws an Error", async () => {
      const testError = new Error("Network connection failed");
      mockedGetForecast.mockRejectedValue(testError);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=TestCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ message: "Network connection failed" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { message: "Network connection failed" },
        { status: 500 }
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Forecast API error for city "TestCity":',
        testError
      );
    });

    test("handles non-Error exceptions gracefully", async () => {
      mockedGetForecast.mockRejectedValue("String error");

      const req = new Request(
        "http://localhost/api/weather/forecast?city=TestCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ message: "An error occurred" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { message: "An error occurred" },
        { status: 500 }
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Forecast API error for city "TestCity":',
        "String error"
      );
    });

    test("handles null/undefined exceptions gracefully", async () => {
      mockedGetForecast.mockRejectedValue(null);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=TestCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual({ message: "An error occurred" });
      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        { message: "An error occurred" },
        { status: 500 }
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Forecast API error for city "TestCity":',
        null
      );
    });

    test("logs errors to console", async () => {
      const testError = new Error("Forecast service unavailable");
      mockedGetForecast.mockRejectedValue(testError);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=TestCity"
      );

      await GET(req);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Forecast API error for city "TestCity":',
        testError
      );
    });
  });

  describe("URL parsing", () => {
    test("correctly parses city from query parameters", async () => {
      mockedGetForecast.mockResolvedValue({ list: [] });

      const testCases = [
        {
          url: "http://localhost/api/weather/forecast?city=Kiev",
          expected: "Kiev",
        },
        {
          url: "http://localhost/api/weather/forecast?city=London&other=param",
          expected: "London",
        },
        {
          url: "https://myapp.com/api/weather/forecast?city=Paris",
          expected: "Paris",
        },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        const req = new Request(testCase.url);

        await GET(req);

        expect(mockedGetForecast).toHaveBeenCalledWith(testCase.expected);
      }
    });

    test("handles multiple query parameters correctly", async () => {
      mockedGetForecast.mockResolvedValue({ list: [] });

      const req = new Request(
        "http://localhost/api/weather/forecast?city=Kiev&lang=en&format=json"
      );

      await GET(req);

      expect(mockedGetForecast).toHaveBeenCalledWith("Kiev");
    });

    test("handles URL encoded characters in city names", async () => {
      mockedGetForecast.mockResolvedValue({ list: [] });

      const testCases = [
        { url: "?city=Los%20Angeles", expected: "Los Angeles" },
        { url: "?city=São%20Paulo", expected: "São Paulo" },
        { url: "?city=Zürich", expected: "Zürich" },
        { url: "?city=München", expected: "München" },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        const req = new Request(
          `http://localhost/api/weather/forecast${testCase.url}`
        );

        await GET(req);

        expect(mockedGetForecast).toHaveBeenCalledWith(testCase.expected);
      }
    });
  });

  describe("Response format", () => {
    test("returns JSON response with correct content type", async () => {
      const mockData = { list: [] };
      mockedGetForecast.mockResolvedValue(mockData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=TestCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(mockData);
      expect(mockedNextResponse.json).toHaveBeenCalledWith(mockData);
    });

    test("preserves all forecast data fields", async () => {
      const detailedForecastData: ForecastResponse = {
        list: [
          {
            dt: 1635768000,
            main: { temp: 15.25 },
            weather: [
              {
                description: "light intensity drizzle",
                icon: "09d",
              },
            ],
            wind: { speed: 4.1 },
            pop: 0.32,
          },
        ],
      };

      mockedGetForecast.mockResolvedValue(detailedForecastData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=London"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(detailedForecastData);
      expect(data.list[0]).toHaveProperty("dt", 1635768000);
      expect(data.list[0]).toHaveProperty("main.temp", 15.25);
      expect(data.list[0]).toHaveProperty(
        "weather.0.description",
        "light intensity drizzle"
      );
      expect(data.list[0]).toHaveProperty("weather.0.icon", "09d");
      expect(data.list[0]).toHaveProperty("wind.speed", 4.1);
      expect(data.list[0]).toHaveProperty("pop", 0.32);
    });

    test("handles empty forecast list", async () => {
      const emptyForecastData: ForecastResponse = { list: [] };
      mockedGetForecast.mockResolvedValue(emptyForecastData);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=TestCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(emptyForecastData);
      expect(Array.isArray(data.list)).toBe(true);
      expect(data.list).toHaveLength(0);
    });
  });

  describe("Integration with getForecast utility", () => {
    test("passes city parameter correctly to getForecast", async () => {
      mockedGetForecast.mockResolvedValue({ list: [] });

      const req = new Request(
        "http://localhost/api/weather/forecast?city=TestCity"
      );

      await GET(req);

      expect(mockedGetForecast).toHaveBeenCalledTimes(1);
      expect(mockedGetForecast).toHaveBeenCalledWith("TestCity");
    });

    test("handles getForecast returning null gracefully", async () => {
      mockedGetForecast.mockResolvedValue(null);

      const req = new Request(
        "http://localhost/api/weather/forecast?city=NonexistentCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe("City not found or forecast data unavailable");
    });

    test("does not call getForecast when city is missing", async () => {
      const req = new Request("http://localhost/api/weather/forecast");

      await GET(req);

      expect(mockedGetForecast).not.toHaveBeenCalled();
    });
  });
});

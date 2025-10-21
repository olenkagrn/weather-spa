import { GET } from "@/app/api/cities/route";
import { NextResponse } from "next/server";

jest.mock("@/constants", () => ({
  API_KEY: "test-api-key",
  BASE_URL: "https://api.openweathermap.org",
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown) => ({
      json: () => Promise.resolve(data),
      ok: true,
      status: 200,
    })),
  },
}));

const mockedNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe("GET /api/cities", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("Query validation", () => {
    test("returns empty array when query is missing", async () => {
      const req = new Request("http://localhost/api/cities");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual([]);
      expect(mockedNextResponse.json).toHaveBeenCalledWith([]);
    });

    test("returns empty array when query is empty string", async () => {
      const req = new Request("http://localhost/api/cities?query=");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual([]);
      expect(mockedNextResponse.json).toHaveBeenCalledWith([]);
    });

    test("returns empty array when query is only spaces", async () => {
      const req = new Request("http://localhost/api/cities?query=%20%20%20");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual([]);
      expect(mockedNextResponse.json).toHaveBeenCalledWith([]);
    });

    test("returns empty array when query is less than 3 characters", async () => {
      const req = new Request("http://localhost/api/cities?query=ab");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual([]);
      expect(mockedNextResponse.json).toHaveBeenCalledWith([]);
    });

    test("processes query when it has exactly 3 characters", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=abc");

      await GET(req);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.openweathermap.org/geo/1.0/direct?q=abc&limit=5&appid=test-api-key"
      );
    });

    test("trims whitespace from query", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=%20Kiev%20");

      await GET(req);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.openweathermap.org/geo/1.0/direct?q=Kiev&limit=5&appid=test-api-key"
      );
    });
  });

  describe("API interaction", () => {
    test("returns formatted city results on successful fetch", async () => {
      const mockCitiesData = [
        { name: "Kyiv", country: "UA", lat: 50.4501, lon: 30.5234 },
        { name: "Kiev", country: "UA", lat: 50.4501, lon: 30.5234 },
      ];

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCitiesData),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=Kiev");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(["Kyiv, UA", "Kiev, UA"]);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.openweathermap.org/geo/1.0/direct?q=Kiev&limit=5&appid=test-api-key"
      );
      expect(mockedNextResponse.json).toHaveBeenCalledWith([
        "Kyiv, UA",
        "Kiev, UA",
      ]);
    });

    test("handles special characters in city names", async () => {
      const mockCitiesData = [
        { name: "São Paulo", country: "BR", lat: -23.5505, lon: -46.6333 },
        { name: "Zürich", country: "CH", lat: 47.3769, lon: 8.5417 },
      ];

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCitiesData),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=São");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(["São Paulo, BR", "Zürich, CH"]);
    });

    test("properly encodes query parameter", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=New%20York");

      await GET(req);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.openweathermap.org/geo/1.0/direct?q=New%20York&limit=5&appid=test-api-key"
      );
    });

    test("limits results to 5 cities", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=London");

      await GET(req);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("&limit=5&")
      );
    });
  });

  describe("Error handling", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("returns empty array when external API response is not ok", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: "Not found" }),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=InvalidCity");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual([]);
      expect(mockedNextResponse.json).toHaveBeenCalledWith([]);
    });

    test("returns empty array when fetch throws network error", async () => {
      const networkError = new Error("Network error");
      global.fetch = jest.fn(() => Promise.reject(networkError));

      const req = new Request("http://localhost/api/cities?query=Kiev");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual([]);
      expect(mockedNextResponse.json).toHaveBeenCalledWith([]);
      expect(consoleSpy).toHaveBeenCalledWith(networkError);
    });

    test("returns empty array when external API returns invalid JSON", async () => {
      const jsonError = new Error("Invalid JSON");
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(jsonError),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=Kiev");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual([]);
      expect(mockedNextResponse.json).toHaveBeenCalledWith([]);
      expect(consoleSpy).toHaveBeenCalledWith(jsonError);
    });
    test("handles malformed city data gracefully", async () => {
      const mockInvalidData = [
        { name: "Kyiv", country: "UA" },
        { name: "InvalidCity" },
        { country: "US" },
        { name: "ValidCity", country: "US" },
      ];

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInvalidData),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=city");

      const response = await GET(req);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("Data transformation", () => {
    test("correctly formats city name and country", async () => {
      const mockCitiesData = [
        { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
        { name: "London", country: "CA", lat: 42.9849, lon: -81.2453 },
        { name: "London", country: "US", lat: 37.129, lon: -84.0833 },
      ];

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCitiesData),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=London");

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual(["London, GB", "London, CA", "London, US"]);
    });

    test("returns empty array when API returns empty array", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      );

      const req = new Request(
        "http://localhost/api/cities?query=NonexistentCity"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(data).toEqual([]);
      expect(mockedNextResponse.json).toHaveBeenCalledWith([]);
    });
  });

  describe("Request URL construction", () => {
    test("constructs correct OpenWeatherMap API URL", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      );

      const req = new Request("http://localhost/api/cities?query=TestCity");

      await GET(req);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.openweathermap.org/geo/1.0/direct?q=TestCity&limit=5&appid=test-api-key"
      );
    });

    test("handles URL parsing correctly", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      );

      const req1 = new Request("http://localhost:3000/api/cities?query=Test");
      const req2 = new Request("https://myapp.com/api/cities?query=Test");

      await GET(req1);
      await GET(req2);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        "https://api.openweathermap.org/geo/1.0/direct?q=Test&limit=5&appid=test-api-key"
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "https://api.openweathermap.org/geo/1.0/direct?q=Test&limit=5&appid=test-api-key"
      );
    });
  });
});

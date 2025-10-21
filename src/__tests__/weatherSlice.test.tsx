import weatherReducer, {
  WeatherState,
  initialState,
  addCity,
  removeCity,
  clearAll,
} from "@/store/weather/weatherSlice";
import { fetchWeatherByCity } from "@/store/weather/weatherThunk";
import { WeatherData } from "@/types/weather";

describe("weatherSlice reducers", () => {
  let state: WeatherState;

  beforeEach(() => {
    state = { ...initialState };
  });

  test("should handle addCity", () => {
    const nextState = weatherReducer(state, addCity("Kyiv"));
    expect(nextState.cities).toContain("Kyiv");

    // Adding the same city again does not duplicate
    const nextState2 = weatherReducer(nextState, addCity("Kyiv"));
    expect(nextState2.cities).toEqual(["Kyiv"]);

    const nextState3 = weatherReducer(nextState2, addCity("   "));
    expect(nextState3.cities).toEqual(["Kyiv"]);
  });

  test("should handle removeCity", () => {
    state.cities = ["Kyiv", "Lviv"];
    state.data = { Kyiv: { name: "Kyiv" } as WeatherData };
    state.status = { Kyiv: "succeeded" };
    state.error = { Kyiv: null };

    const nextState = weatherReducer(state, removeCity("Kyiv"));
    expect(nextState.cities).toEqual(["Lviv"]);
    expect(nextState.data.Kyiv).toBeUndefined();
    expect(nextState.status.Kyiv).toBeUndefined();
    expect(nextState.error.Kyiv).toBeUndefined();
  });

  test("should handle clearAll", () => {
    state.cities = ["Kyiv"];
    state.data = { Kyiv: { name: "Kyiv" } as WeatherData };
    state.status = { Kyiv: "succeeded" };
    state.error = { Kyiv: null };

    const nextState = weatherReducer(state, clearAll());
    expect(nextState.cities).toEqual([]);
    expect(nextState.data).toEqual({});
    expect(nextState.status).toEqual({});
    expect(nextState.error).toEqual({});
  });
});

describe("weatherSlice extraReducers", () => {
  const city = "Kyiv";
  const data: WeatherData = { name: "Kyiv" } as WeatherData;

  test("should handle fetchWeatherByCity.pending", () => {
    const action = {
      type: fetchWeatherByCity.pending.type,
      meta: { arg: city },
    };
    const nextState = weatherReducer(initialState, action);
    expect(nextState.status[city]).toBe("loading");
    expect(nextState.error[city]).toBeNull();
  });

  test("should handle fetchWeatherByCity.fulfilled", () => {
    const action = {
      type: fetchWeatherByCity.fulfilled.type,
      payload: { city, data },
      meta: { arg: city },
    };
    const nextState = weatherReducer(initialState, action);
    expect(nextState.status[city]).toBe("succeeded");
    expect(nextState.data[city]).toEqual(data);
    expect(nextState.error[city]).toBeNull();
    expect(nextState.loadedCities[city]).toBe(true);
  });

  test("should handle fetchWeatherByCity.rejected with payload", () => {
    const action = {
      type: fetchWeatherByCity.rejected.type,
      payload: "Network error",
      error: { message: "Some error" },
      meta: { arg: city },
    };
    const nextState = weatherReducer(initialState, action);
    expect(nextState.status[city]).toBe("failed");
    expect(nextState.error[city]).toBe("Network error");
  });

  test("should handle fetchWeatherByCity.rejected without payload", () => {
    const action = {
      type: fetchWeatherByCity.rejected.type,
      payload: undefined,
      error: { message: "Some error" },
      meta: { arg: city },
    };
    const nextState = weatherReducer(initialState, action);
    expect(nextState.status[city]).toBe("failed");
    expect(nextState.error[city]).toBe("Some error");
  });
});

describe("weatherSlice fetchWeatherBatch extraReducers", () => {
  const cities = ["Kyiv", "Lviv"];
  const mockResults = [
    { city: "Kyiv", data: { name: "Kyiv" } as WeatherData, error: undefined },
    { city: "Lviv", data: { name: "Lviv" } as WeatherData, error: undefined },
  ];

  test("should handle fetchWeatherBatch.pending", () => {
    const action = {
      type: "weather/fetchBatch/pending",
      meta: { arg: cities },
    };
    const nextState = weatherReducer(initialState, action);

    cities.forEach((city) => {
      expect(nextState.status[city]).toBe("loading");
      expect(nextState.error[city]).toBeNull();
    });
  });

  test("should handle fetchWeatherBatch.fulfilled with successful results", () => {
    const action = {
      type: "weather/fetchBatch/fulfilled",
      payload: mockResults,
      meta: { arg: cities },
    };
    const nextState = weatherReducer(initialState, action);

    cities.forEach((city, index) => {
      expect(nextState.status[city]).toBe("succeeded");
      expect(nextState.data[city]).toEqual(mockResults[index].data);
      expect(nextState.error[city]).toBeNull();
      expect(nextState.loadedCities[city]).toBe(true);
    });
  });

  test("should handle fetchWeatherBatch.fulfilled with mixed results", () => {
    const mixedResults = [
      { city: "Kyiv", data: { name: "Kyiv" } as WeatherData, error: undefined },
      { city: "Lviv", data: null, error: "City not found" },
    ];

    const action = {
      type: "weather/fetchBatch/fulfilled",
      payload: mixedResults,
      meta: { arg: cities },
    };
    const nextState = weatherReducer(initialState, action);

    expect(nextState.status["Kyiv"]).toBe("succeeded");
    expect(nextState.data["Kyiv"]).toEqual(mixedResults[0].data);
    expect(nextState.error["Kyiv"]).toBeNull();
    expect(nextState.loadedCities["Kyiv"]).toBe(true);

    expect(nextState.status["Lviv"]).toBe("failed");
    expect(nextState.error["Lviv"]).toBe("City not found");
    expect(nextState.loadedCities["Lviv"]).toBeUndefined();
  });

  test("should handle fetchWeatherBatch.rejected", () => {
    const action = {
      type: "weather/fetchBatch/rejected",
      payload: "Network error",
      error: { message: "Batch request failed" },
      meta: { arg: cities },
    };
    const nextState = weatherReducer(initialState, action);

    cities.forEach((city) => {
      expect(nextState.status[city]).toBe("failed");
      expect(nextState.error[city]).toBe("Network error");
    });
  });

  test("should handle fetchWeatherBatch.rejected without payload", () => {
    const action = {
      type: "weather/fetchBatch/rejected",
      payload: undefined,
      error: { message: "Batch request failed" },
      meta: { arg: cities },
    };
    const nextState = weatherReducer(initialState, action);

    cities.forEach((city) => {
      expect(nextState.status[city]).toBe("failed");
      expect(nextState.error[city]).toBe("Batch request failed");
    });
  });
});

import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "./weather/weatherSlice";
import { localStorageMiddleware } from "./middleware/localStorageMiddleware";
import { loadWeatherFromLocalStorage } from "@/utils/loadWeatherFromLocalStorage";

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
  preloadedState: {
    weather: loadWeatherFromLocalStorage(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

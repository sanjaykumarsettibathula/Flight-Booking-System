import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice";
import authReducer from "../features/auth/authSlice";
import flightReducer from "../features/flights/flightSlice";
import bookingReducer from "../features/bookings/bookingSlice";
import walletReducer from "../features/wallet/walletSlice";

// Custom middleware to handle async errors
const errorMiddleware = (store) => (next) => (action) => {
  if (action.type.endsWith("/rejected")) {
    console.error("API Error:", action.error);
  }
  return next(action);
};

// Custom middleware to handle pending actions
const loadingMiddleware = (store) => (next) => (action) => {
  if (action.type.endsWith("/pending")) {
    // You can dispatch a loading action here if needed
    console.log("Loading:", action.type);
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    flights: flightReducer,
    bookings: bookingReducer,
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/register/fulfilled",
          "auth/login/fulfilled",
          "auth/refreshToken/fulfilled",
        ],
      },
    }).concat([apiSlice.middleware, errorMiddleware, loadingMiddleware]),
  devTools: process.env.NODE_ENV !== "production",
});

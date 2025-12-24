import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Flight", "Booking", "User", "Wallet"],
  endpoints: () => ({}),
});

export const {
  middleware: apiMiddleware,
  reducerPath: apiReducerPath,
  reducer: apiReducer,
  util: apiUtil,
  injectEndpoints,
  endpoints,
  enhanceEndpoints,
} = apiSlice;

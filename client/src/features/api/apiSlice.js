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

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If 401 Unauthorized, try to refresh token
  if (result?.error?.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery(
      { url: "/users/refresh-token", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Store the new token
      api.dispatch({
        type: "auth/tokenReceived",
        payload: refreshResult.data.token,
      });

      // Retry the initial query
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed - log out
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
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

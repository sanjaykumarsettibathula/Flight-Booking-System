import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";

// Extended API slice for flights
export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFlights: builder.query({
      query: (queryParams = "") => `/flights${queryParams}`,
      // Backend returns { success, count, data: [...] }
      providesTags: (result) => {
        const flights = result?.data || [];
        return [
          "Flight",
          ...flights.map((flight) => ({
            type: "Flight",
            id: flight._id || flight.id,
          })),
        ];
      },
    }),
    getFlight: builder.query({
      query: (id) => `/flights/${id}`,
      providesTags: (result, error, id) => [{ type: "Flight", id }],
    }),
    searchFlights: builder.query({
      query: ({ departure, arrival, date, passengers = 1 }) =>
        `/flights/search?departure=${encodeURIComponent(
          departure
        )}&arrival=${encodeURIComponent(
          arrival
        )}&date=${date}&passengers=${passengers}`,
      // Also returns { success, count, data: [...] }
      providesTags: (result) => {
        const flights = result?.data || [];
        return [
          "Flight",
          ...flights.map((flight) => ({
            type: "Flight",
            id: flight._id || flight.id,
          })),
        ];
      },
    }),
    trackFlightPrice: builder.mutation({
      query: (flightId) => ({
        url: `/flights/${flightId}/price`,
        method: "GET",
      }),
    }),
    addBookingAttempt: builder.mutation({
      query: (flightId) => ({
        url: `/flights/${flightId}/attempt`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Flight", id }],
    }),
  }),
});

export const {
  useGetFlightsQuery,
  useGetFlightQuery,
  useSearchFlightsQuery,
  useTrackFlightPriceMutation,
  useAddBookingAttemptMutation,
} = extendedApiSlice;

// Thunk that triggers the existing RTK Query search endpoint
// This lets UI code dispatch `searchFlights` without directly using hooks.
export const searchFlights = createAsyncThunk(
  "flights/searchFlights",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        extendedApiSlice.endpoints.searchFlights.initiate(params)
      ).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Slice for local state
const flightSlice = createSlice({
  name: "flights",
  initialState: {
    searchResults: [],
    selectedFlight: null,
    loading: false,
    error: null,
    searchParams: {
      departure: "",
      arrival: "",
      date: new Date().toISOString().split("T")[0],
      passengers: 1,
    },
  },
  reducers: {
    setSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setSelectedFlight: (state, action) => {
      state.selectedFlight = action.payload;
    },
    clearSelectedFlight: (state) => {
      state.selectedFlight = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle search results
    builder.addMatcher(
      extendedApiSlice.endpoints.searchFlights.matchFulfilled,
      (state, { payload }) => {
        state.searchResults = payload.data || [];
        state.loading = false;
        state.error = null;
      }
    );
    builder.addMatcher(
      extendedApiSlice.endpoints.searchFlights.matchPending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      extendedApiSlice.endpoints.searchFlights.matchRejected,
      (state, { error }) => {
        state.loading = false;
        state.error = error.message || "Failed to search flights";
      }
    );

    // Handle single flight
    builder.addMatcher(
      extendedApiSlice.endpoints.getFlight.matchFulfilled,
      (state, { payload }) => {
        state.selectedFlight = payload.data;
        state.loading = false;
        state.error = null;
      }
    );
  },
});

export const {
  setSearchParams,
  clearSearchResults,
  setSelectedFlight,
  clearSelectedFlight,
  setLoading,
  setError,
  clearError,
} = flightSlice.actions;

export const selectSearchParams = (state) => state.flights.searchParams;
export const selectSearchResults = (state) => state.flights.searchResults;
export const selectSelectedFlight = (state) => state.flights.selectedFlight;
export const selectLoading = (state) => state.flights.loading;
export const selectError = (state) => state.flights.error;

export default flightSlice.reducer;

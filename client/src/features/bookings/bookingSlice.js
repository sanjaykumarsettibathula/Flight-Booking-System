import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";

// Extended API slice for bookings
export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: (queryParams = "") => `/bookings${queryParams}`,
      providesTags: (result) => {
        const bookings = result?.data || result || [];
        return [
          "Booking",
          ...bookings.map((booking) => ({
            type: "Booking",
            id: booking._id || booking.id,
          })),
        ];
      },
    }),
    getBooking: builder.query({
      query: (id) => `/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: "Booking", id }],
    }),
    createBooking: builder.mutation({
      query: (bookingData) => {
        const payload = {
          ...bookingData,
          flightId: bookingData.flightId || bookingData.flight,
          passengerCount: bookingData.passengerCount || 1,
          seatNumbers: bookingData.seatNumbers || [],
        };
        return {
          url: "/bookings",
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["Booking"],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }],
    }),
    downloadTicket: builder.mutation({
      query: (id) => ({
        url: `/bookings/${id}/ticket`,
        method: "GET",
        responseHandler: (response) => {
          const filename = response.headers
            .get("content-disposition")
            ?.split("filename=")[1];
          response.blob().then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename || "ticket.pdf";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
          });
          return "Download started";
        },
        cache: "no-cache",
      }),
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useDownloadTicketMutation,
} = extendedApiSlice;

// Slice for local state
const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    bookings: [],
    selectedBooking: null,
    loading: false,
    error: null,
    bookingStep: 1, // 1: Flight Selection, 2: Passenger Details, 3: Payment, 4: Confirmation
    passengerDetails: {
      adults: [],
      children: [],
      contactInfo: {
        email: "",
        phone: "",
      },
    },
    paymentDetails: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      nameOnCard: "",
      saveCard: false,
    },
  },
  reducers: {
    setBookingStep: (state, action) => {
      state.bookingStep = action.payload;
    },
    setPassengerDetails: (state, action) => {
      state.passengerDetails = { ...state.passengerDetails, ...action.payload };
    },
    setPaymentDetails: (state, action) => {
      state.paymentDetails = { ...state.paymentDetails, ...action.payload };
    },
    resetBookingState: (state) => {
      state.bookingStep = 1;
      state.passengerDetails = {
        adults: [],
        children: [],
        contactInfo: {
          email: "",
          phone: "",
        },
      };
      state.paymentDetails = {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        nameOnCard: "",
        saveCard: false,
      };
      state.error = null;
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
    // Handle getBookings
    builder.addMatcher(
      extendedApiSlice.endpoints.getBookings.matchFulfilled,
      (state, { payload }) => {
        state.bookings = payload?.data || payload || [];
        state.loading = false;
        state.error = null;
      }
    );
    builder.addMatcher(
      extendedApiSlice.endpoints.getBookings.matchPending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      extendedApiSlice.endpoints.getBookings.matchRejected,
      (state, { error }) => {
        state.loading = false;
        state.error = error?.data?.message || "Failed to load bookings";
      }
    );

    // Handle createBooking
    builder.addMatcher(
      extendedApiSlice.endpoints.createBooking.matchPending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      extendedApiSlice.endpoints.createBooking.matchFulfilled,
      (state, { payload }) => {
        state.loading = false;
        state.selectedBooking = payload?.data || payload;
        state.bookingStep = 4; // Move to confirmation step
      }
    );
    builder.addMatcher(
      extendedApiSlice.endpoints.createBooking.matchRejected,
      (state, { error }) => {
        state.loading = false;
        state.error = error.message || "Failed to create booking";
      }
    );
  },
});

export const {
  setBookingStep,
  setPassengerDetails,
  setPaymentDetails,
  resetBookingState,
  setLoading,
  setError,
  clearError,
} = bookingSlice.actions;

export const selectBookings = (state) => state.bookings.bookings;
export const selectSelectedBooking = (state) => state.bookings.selectedBooking;
export const selectBookingStep = (state) => state.bookings.bookingStep;
export const selectPassengerDetails = (state) =>
  state.bookings.passengerDetails;
export const selectPaymentDetails = (state) => state.bookings.paymentDetails;
export const selectBookingLoading = (state) => state.bookings.loading;
export const selectBookingError = (state) => state.bookings.error;

export default bookingSlice.reducer;

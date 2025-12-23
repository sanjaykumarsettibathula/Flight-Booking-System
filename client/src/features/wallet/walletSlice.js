import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";

// Extended API slice for wallet
export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query({
      query: () => "/wallet",
      providesTags: ["Wallet"],
    }),
    getWalletTransactions: builder.query({
      query: (queryParams = "") => `/wallet/transactions${queryParams}`,
      // Backend returns { success, data: [...] }
      providesTags: (result) => {
        const txns = result?.data || [];
        return [
          "Wallet",
          ...txns.map((t) => ({ type: "Wallet", id: t._id || t.id })),
        ];
      },
    }),
    addFunds: builder.mutation({
      query: (amount) => ({
        url: "/wallet/add-funds",
        method: "POST",
        body: { amount },
      }),
      invalidatesTags: ["Wallet"],
    }),
    transferFunds: builder.mutation({
      query: ({ amount, recipientId }) => ({
        url: "/wallet/transfer",
        method: "POST",
        body: { amount, recipientId },
      }),
      invalidatesTags: ["Wallet"],
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useAddFundsMutation,
  useTransferFundsMutation,
} = extendedApiSlice;

// Slice for local state
const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    balance: 50000, // Default balance as per requirements
    transactions: [],
    loading: false,
    error: null,
    addFundsModalOpen: false,
    transferModalOpen: false,
  },
  reducers: {
    setAddFundsModalOpen: (state, action) => {
      state.addFundsModalOpen = action.payload;
    },
    setTransferModalOpen: (state, action) => {
      state.transferModalOpen = action.payload;
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
    // Handle getWallet
    builder.addMatcher(
      extendedApiSlice.endpoints.getWallet.matchFulfilled,
      (state, { payload }) => {
        if (payload.data) {
          state.balance = payload.data.balance;
        }
        state.loading = false;
        state.error = null;
      }
    );

    // Handle getWalletTransactions
    builder.addMatcher(
      extendedApiSlice.endpoints.getWalletTransactions.matchFulfilled,
      (state, { payload }) => {
        if (payload.data) {
          state.transactions = payload.data;
        }
        state.loading = false;
        state.error = null;
      }
    );

    // Handle addFunds
    builder.addMatcher(
      extendedApiSlice.endpoints.addFunds.matchFulfilled,
      (state, { payload }) => {
        if (payload.data) {
          state.balance = payload.data.balance;
          state.transactions.unshift(payload.data.transaction);
          state.addFundsModalOpen = false;
        }
        state.loading = false;
      }
    );

    // Handle transferFunds
    builder.addMatcher(
      extendedApiSlice.endpoints.transferFunds.matchFulfilled,
      (state, { payload }) => {
        if (payload.data) {
          state.balance = payload.data.balance;
          state.transactions.unshift(payload.data.transaction);
          state.transferModalOpen = false;
        }
        state.loading = false;
      }
    );

    // Handle pending states
    builder.addMatcher(
      (action) => {
        return [
          extendedApiSlice.endpoints.getWallet.matchPending,
          extendedApiSlice.endpoints.getWalletTransactions.matchPending,
          extendedApiSlice.endpoints.addFunds.matchPending,
          extendedApiSlice.endpoints.transferFunds.matchPending,
        ].some((matcher) => matcher(action));
      },
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    // Handle rejected states
    builder.addMatcher(
      (action) => {
        return [
          extendedApiSlice.endpoints.getWallet.matchRejected,
          extendedApiSlice.endpoints.getWalletTransactions.matchRejected,
          extendedApiSlice.endpoints.addFunds.matchRejected,
          extendedApiSlice.endpoints.transferFunds.matchRejected,
        ].some((matcher) => matcher(action));
      },
      (state, { error }) => {
        state.loading = false;
        state.error = error?.data?.message || "Something went wrong";
      }
    );
  },
});

export const {
  setAddFundsModalOpen,
  setTransferModalOpen,
  setLoading,
  setError,
  clearError,
} = walletSlice.actions;

export const selectWalletBalance = (state) => state.wallet.balance;
export const selectWalletTransactions = (state) => state.wallet.transactions;
export const selectWalletLoading = (state) => state.wallet.loading;
export const selectWalletError = (state) => state.wallet.error;
export const selectAddFundsModalOpen = (state) =>
  state.wallet.addFundsModalOpen;
export const selectTransferModalOpen = (state) =>
  state.wallet.transferModalOpen;

export default walletSlice.reducer;

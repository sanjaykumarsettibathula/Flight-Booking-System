import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import theme from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/routing/PrivateRoute";
import PublicRoute from "./components/routing/PublicRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import FlightSearchPage from "./pages/flights/FlightSearchPage";
import FlightDetailsPage from "./pages/flights/FlightDetailsPage";
import BookingPage from "./pages/bookings/BookingPage";
import BookingConfirmationPage from "./pages/bookings/BookingConfirmationPage";
import BookingDetailsPage from "./pages/bookings/BookingDetailsPage";
import MyBookingsPage from "./pages/bookings/MyBookingsPage";
import WalletPage from "./pages/wallet/WalletPage";
import ProfilePage from "./pages/profile/ProfilePage";
import NotFoundPage from "./pages/error/NotFoundPage";
import { BASE_URL } from "./config";
import { login } from "./features/auth/authSlice";

const AppContent = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken && !isAuthenticated) {
        try {
          // Verify token with backend
          const response = await fetch(`${BASE_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Restore user session
            dispatch(
              login.fulfilled({
                token: storedToken,
                user: data.data,
              })
            );
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Session restoration error:", error);
          localStorage.removeItem("token");
        }
      }
    };

    restoreSession();
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />

            <Route
              path="login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route
              path="register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            <Route path="flights">
              <Route index element={<FlightSearchPage />} />
              <Route path=":id" element={<FlightDetailsPage />} />
            </Route>

            {/* Protected Routes */}
            <Route
              path="bookings/new"
              element={
                <PrivateRoute>
                  <BookingPage />
                </PrivateRoute>
              }
            />

            <Route
              path="bookings/confirmation"
              element={
                <PrivateRoute>
                  <BookingConfirmationPage />
                </PrivateRoute>
              }
            />

            <Route
              path="bookings/:id"
              element={
                <PrivateRoute>
                  <BookingDetailsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="my-bookings"
              element={
                <PrivateRoute>
                  <MyBookingsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="wallet"
              element={
                <PrivateRoute>
                  <WalletPage />
                </PrivateRoute>
              }
            />

            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
};

export default AppContent;


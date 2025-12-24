import React, { useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "./config";
import { setSession, logout } from "./features/auth/authSlice";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/routing/PrivateRoute";
import PublicRoute from "./components/routing/PublicRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy load pages for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const LoginPage = React.lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/auth/RegisterPage"));
const FlightSearchPage = React.lazy(() =>
  import("./pages/flights/FlightSearchPage")
);
const FlightDetailsPage = React.lazy(() =>
  import("./pages/flights/FlightDetailsPage")
);
const BookingPage = React.lazy(() => import("./pages/bookings/BookingPage"));
const BookingConfirmationPage = React.lazy(() =>
  import("./pages/bookings/BookingConfirmationPage")
);
const BookingDetailsPage = React.lazy(() =>
  import("./pages/bookings/BookingDetailsPage")
);
const MyBookingsPage = React.lazy(() =>
  import("./pages/bookings/MyBookingsPage")
);
const WalletPage = React.lazy(() => import("./pages/wallet/WalletPage"));
const ProfilePage = React.lazy(() => import("./pages/profile/ProfilePage"));
const NotFoundPage = React.lazy(() => import("./pages/error/NotFoundPage"));

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
              setSession({
                token: storedToken,
                user: data.data,
              })
            );
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("token");
            dispatch(logout());
          }
        } catch (error) {
          console.error("Session restoration error:", error);
          localStorage.removeItem("token");
          dispatch(logout());
        }
      }
    };

    restoreSession();
  }, [dispatch, isAuthenticated]);

  // Wrapper component to handle route errors
  const RouteErrorBoundary = ({ children }) => (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </ErrorBoundary>
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <RouteErrorBoundary>
            <Layout />
          </RouteErrorBoundary>
        }
      >
        <Route
          index
          element={
            <RouteErrorBoundary>
              <HomePage />
            </RouteErrorBoundary>
          }
        />

        <Route
          path="login"
          element={
            <PublicRoute>
              <RouteErrorBoundary>
                <LoginPage />
              </RouteErrorBoundary>
            </PublicRoute>
          }
        />

        <Route
          path="register"
          element={
            <PublicRoute>
              <RouteErrorBoundary>
                <RegisterPage />
              </RouteErrorBoundary>
            </PublicRoute>
          }
        />

        <Route path="flights">
          <Route
            index
            element={
              <RouteErrorBoundary>
                <FlightSearchPage />
              </RouteErrorBoundary>
            }
          />
          <Route
            path=":id"
            element={
              <RouteErrorBoundary>
                <FlightDetailsPage />
              </RouteErrorBoundary>
            }
          />
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
  );
};

export default AppContent;

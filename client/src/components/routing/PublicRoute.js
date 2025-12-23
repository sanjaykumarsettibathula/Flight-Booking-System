import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// PublicRoute prevents authenticated users from accessing auth pages like login/register
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isAuthenticated) {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect") || "/";
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default PublicRoute;

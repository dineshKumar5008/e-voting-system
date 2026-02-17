import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ user, requireAdmin = false, children }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;



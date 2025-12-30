import React from "react";
import { Navigate } from "react-router-dom";
import { useContextElement } from "@/context/Context";

export default function ProtectedRoute({ children }) {
  const { auth } = useContextElement();

  // Check if user is authenticated (has token)
  if (!auth || !auth.token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if authenticated
  return children;
}


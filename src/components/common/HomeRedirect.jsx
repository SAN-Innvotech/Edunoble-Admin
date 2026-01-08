import React from "react";
import { Navigate } from "react-router-dom";
import { useContextElement } from "@/context/Context";
import LoginPage from "@/pages/others/login";

export default function HomeRedirect() {
  const { auth } = useContextElement();

  // If authenticated, redirect to dashboard
  if (auth && auth.token) {
    return <Navigate to="/dshb-papers" replace />;
  }

  // If not authenticated, show login page
  return <LoginPage />;
}


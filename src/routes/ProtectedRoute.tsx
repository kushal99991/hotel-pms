import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "hooks";
import { RouteList } from "config/sidebarmenu.config";
import Loader from "components/elements/Loader/Loader";

interface ProtectedRouteProps {
  route: RouteList;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ route }) => {
  const { isLoggedIn, users } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // When a token exists but user/session hasn't hydrated yet, wait instead of rendering Unauthorized

  if (isLoggedIn && !users) {
    return <Loader />;
  }

  return route.Component ? <route.Component /> : null;
};

export default ProtectedRoute;

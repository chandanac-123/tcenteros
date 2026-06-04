import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@store/authStore";

const PublicRoute = () => {
  const { accessToken, firstLogin } = useAuthStore();
  const location = useLocation();

  const allowedPublicRoutes = [
    "/reset-password",
  ];

  const isAllowedRoute = allowedPublicRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (accessToken && !firstLogin && !isAllowedRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
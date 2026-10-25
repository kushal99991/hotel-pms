import { PathRouteProps } from "react-router-dom";
import { bookingEngineMenuList, RouteList } from "config/sidebarmenu.config";
import { lazy } from "react";

const LoginPage = lazy(() => import("pages/login/page"));
const ForgotPasswordPage = lazy(() => import("pages/forgot-password/page"));
const ResetPasswordPage = lazy(() => import("pages/reset-password/page"));
export const PrivateRouteList: RouteList[] = bookingEngineMenuList;
export const PublicRouteList: PathRouteProps[] = [
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
];

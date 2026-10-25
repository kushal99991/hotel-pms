import React, { FC } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

import { PublicRouteList } from "routes";
import { useAuth } from "hooks";
import NotFound from "components/ui/NotFound/NotFound";
import HeaderContent from "components/ui/Layout/HeaderContent";
import { RouteList } from "config/sidebarmenu.config";
import ProtectedRoute from "routes/ProtectedRoute";
import Loader from "components/elements/Loader/Loader";

interface AuthenticateRouteProps {
  user: boolean;
  redirectPath?: string;
}

export const AuthenticateRoute: FC<AuthenticateRouteProps> = ({
  user,
  redirectPath = "/booking-engine/dashboard",
}) => {
  if (user) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

const App: FC = () => {
  const { isLoggedIn, filterMenuList: PrivateRouteList } = useAuth();

  const filterRoutesWithMenuBar = (routes: RouteList[]): RouteList[] => {
    return routes
      .filter((route) => route.showMenuBar)
      .map((route) => {
        if (route.subMenu && route.subMenu.length > 0) {
          return {
            ...route,
            subMenu: filterRoutesWithMenuBar(route.subMenu),
          };
        }
        return route;
      });
  };
  const filteredPrivateRoutes = filterRoutesWithMenuBar(PrivateRouteList);

  const renderSubMenuRoute = (
    subRoute: RouteList,
    subIndex: number
  ): React.ReactNode => {
    const { subMenu, ...rest } = subRoute;

    if (subMenu && subMenu.length > 0) {
      return subMenu.map((sub2Route, sub2Index) =>
        renderSubMenuRoute(sub2Route, sub2Index)
      );
    }
    return (
      <Route
        key={subIndex}
        path={rest.path}
        element={
          <React.Suspense fallback={<Loader />}>
            <ProtectedRoute route={rest} />
          </React.Suspense>
        }
      />
    );
  };
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/booking-engine/dashboard" replace />}
      />

      <Route element={<HeaderContent />}>
        <Route element={<AuthenticateRoute user={isLoggedIn} />}>
          {PublicRouteList.map((route, index) => (
            <Route key={index} path={route.path} {...route} />
          ))}
        </Route>
        {filteredPrivateRoutes.map((route) => {
          const { subMenu, ...rest } = route;

          return subMenu ? (
            subMenu
              .filter((a) => a.showMenuBar === true)
              .map((subRoute, subIndex) =>
                renderSubMenuRoute(subRoute, subIndex)
              )
          ) : (
            <Route
              key={rest.path}
              path={rest.path}
              element={
                <React.Suspense fallback={<Loader />}>
                  <ProtectedRoute route={rest} />
                </React.Suspense>
              }
            />
          );
        })}
        <Route path="*" Component={NotFound} />
      </Route>
    </Routes>
  );
};

export default App;

"use client";
import React from "react";
import Box from "@mui/material/Box";

import { APP_BAR_HEIGHT, LAYOUT_VALUES } from "constants/index";
import { bookingEngineMenuList, RouteList } from "config/sidebarmenu.config";

import PageHeader from "components/ui/Header/PageHeader";
import { useLocation } from "react-router-dom";
import { ReservationStatusEnum } from "constants/reservation";

const matchPath = (template: string, path: string): boolean => {
  const templateSegments = template.split("/");
  const pathSegments = path.split("/");

  if (templateSegments.length !== pathSegments.length) {
    return false;
  }

  return templateSegments.every((segment, index) => {
    return segment.startsWith(":") || segment === pathSegments[index];
  });
};

const findPageTitle = (path: string, menuList: RouteList[]): string => {
  for (const item of menuList) {
    if (matchPath(item?.path ?? "", path)) {
      if (
        item?.path?.includes(ReservationStatusEnum.NO_SHOW) ||
        item?.path?.includes(ReservationStatusEnum.RESERVED) ||
        item?.path?.includes(ReservationStatusEnum.CANCELED)
      ) {
        return "Reservation Report";
      }
      return item.menuTitle;
    }
    if (item.subMenu) {
      const subMenuTitle = findPageTitle(path, item.subMenu);
      if (subMenuTitle) {
        return subMenuTitle;
      }
    }
  }
  return ""; // Return an empty string if no match is found
};

const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const filterMenuWithShowSideBar = (routes: RouteList[]): RouteList[] => {
    return routes.map((route) => {
      if (route.subMenu && route.subMenu.length > 0) {
        return {
          ...route,
          subMenu: filterMenuWithShowSideBar(route.subMenu),
        };
      }
      return route;
    });
  };

  const filteredPrivateRoutes = filterMenuWithShowSideBar(
    bookingEngineMenuList
  );

  const currentPageTitle =
    findPageTitle(pathname, filteredPrivateRoutes) ||
    pathname?.split("/").pop();

  return (
    <Box
      component="main"
      sx={{
        padding: "2rem",
        paddingTop: `calc(${APP_BAR_HEIGHT}px + ${LAYOUT_VALUES.MAIN_PADDING})`,
        backgroundColor: "#FEFEFE",
      }}
    >
      <PageHeader title={currentPageTitle} />
      {children}
    </Box>
  );
};

export default MainContent;

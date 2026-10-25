import React, { useEffect, useState } from "react";
import { Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import useAuth from "hooks/useAuth";
import { RouteList as IMenuItem } from "config/sidebarmenu.config";

import MenuList from "./MenuList";
import { useLocation } from "react-router-dom";

const HeaderMenu: React.FC<{ openMenu: boolean }> = () => {
  const currentLocation = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { filterMenuList: bookingEngineMenuList } = useAuth();
  const [activePath, setActivePath] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const currentPath = currentLocation.pathname;

  const filterMenuWithShowSideBar = (routes: IMenuItem[]): IMenuItem[] => {
    return routes
      .filter((route) => route.isShowSidebar)
      .map((route) => {
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

  useEffect(() => {
    const targetRoute = currentPath;
    const routeHierarchy = findRouteHierarchy(
      filteredPrivateRoutes,
      targetRoute
    );
    const urlPaths = routeHierarchy?.map((a) => a?.path ?? "");
    setActivePath(urlPaths ?? []);
  }, [currentPath]);

  const findRouteHierarchy = (
    menu: IMenuItem[],
    targetPath: string,
    hierarchy: IMenuItem[] = []
  ): IMenuItem[] | null =>
    menu.reduce<IMenuItem[] | null>((found, item) => {
      if (found) return found; // Stop searching once found
      const newHierarchy = [...hierarchy, item];
      return item.path === targetPath
        ? newHierarchy
        : item.subMenu
          ? findRouteHierarchy(item.subMenu, targetPath, newHierarchy)
          : null;
    }, null);

  const handleActivePath = (_href: string) => {
    /* empty */
    // toggleSubMenu(href);
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ display: { xs: "block", lg: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{
              width: 400,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: 400,
                boxSizing: "border-box",
              },
              "& .MuiListItemButton-root": {
                padding: "20px 20px",
                border: "1px solid #D6D6D6",
              },
              "& .MuiAccordionSummary-content": {
                padding: "20px 20px",
                border: "1px solid #D6D6D6",
              },
              "& .MuiTypography-body1": {
                fontSize: "16px",
                fontWeight: "700",
                color: "#111111",
              },
              "&  .MuiPaper-root": {
                "&:before": {
                  height: "0px",
                },
                "&.Mui-expanded": {
                  margin: "0",
                },
              },
              "& .MuiAccordionDetails-root": {
                padding: "20px 20px 20px 20px",
              },
            }}
          >
            <MenuList
              menuItems={filteredPrivateRoutes}
              activePath={activePath}
              handleActivePath={handleActivePath}
            />
          </Drawer>
        </>
      ) : (
        <MenuList
          menuItems={filteredPrivateRoutes}
          activePath={activePath}
          handleActivePath={handleActivePath}
        />
      )}
    </>
  );
};

export default HeaderMenu;

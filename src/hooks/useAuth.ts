import { useAppDispatch, useAppSelector } from "store/hooks";
import { useCallback, useMemo } from "react";
import { RootState } from "store/store";
import { useWhoAmIMutation } from "services/authSlice";
import { logout, saveSession } from "store/slice/auth.slice";
import Cookies from "js-cookie";
import { appConfig } from "config/app.config";
import { useNavigate } from "react-router-dom";
import { bookingEngineMenuList, RouteList } from "config/sidebarmenu.config";
import { UserRole } from "constants/roles";
import Unauthorized from "pages/Unauthorized/Unauthorized";
import { useGetPropertiesQuery } from "services/propertySlice";
import { convertUtcToTimezone, getMoment } from "utils/helperFunctions/common";

const useAuth = () => {
  const users = useAppSelector((state: RootState) => state.auth.user);
  const statusList = useAppSelector((state: RootState) => state.statusList);
  const { data: properties } = useGetPropertiesQuery();

  const isLoggedIn = appConfig.getCookie(appConfig.tokenName);
  const dispatch = useAppDispatch();
  const [whoAmI] = useWhoAmIMutation();
  const Navigate = useNavigate();

  const onRefreshToken = useCallback(async (is_redirect: boolean = true) => {
    try {
      const response = await whoAmI();
      if (response.error) {
        return false;
      }
      dispatch(saveSession(response.data));

      if (is_redirect) {
        // Remove special redirect for HOUSEKEEPING (role id 7)
        Navigate("/booking-engine/dashboard");
      }
    } catch {
      /** empty */
    }
  }, []);

  const filterMenuByRoles = (
    menus: RouteList[],
    userRoles: string[]
  ): RouteList[] => {
    return menus.map((menu) => {
      // If the menu has a subMenu, filter the subMenu items
      if (menu.subMenu && menu.subMenu.length) {
        const filteredSubMenu = menu.subMenu.map((sub) => {
          const hasAccess =
            !sub.roles || sub.roles.some((role) => userRoles.includes(role));

          return {
            ...sub,
            Component: hasAccess ? sub.Component : Unauthorized,
            isShowSidebar: hasAccess && sub.isShowSidebar !== false,
          };
        });

        // Show parent menu if at least one submenu is accessible
        const isShowSidebar = filteredSubMenu.some((sub) => sub.isShowSidebar);

        return {
          ...menu,
          subMenu: filteredSubMenu,
          isShowSidebar: isShowSidebar,
        };
      }

      // For regular menu items
      const hasAccess =
        !menu.roles || menu.roles.some((role) => userRoles.includes(role));

      return {
        ...menu,
        Component: hasAccess ? menu.Component : Unauthorized,
        isShowSidebar: hasAccess && menu.isShowSidebar !== false,
      };
    });
  };

  const filterMenuList = useMemo(() => {
    // Get user role names
    const userRoles = users?.roles?.map((role) => role.name) ?? [];

    // Always allow access to User Profile for all users
    const allowedRoles = [...userRoles];

    // Only SUDO gets full access, ADMIN should still be filtered
    if (userRoles.includes(UserRole.SUDO)) {
      return bookingEngineMenuList;
    }

    // Filter menu based on user roles (including ADMIN)
    return filterMenuByRoles(bookingEngineMenuList, allowedRoles);
  }, [bookingEngineMenuList, users]);

  const handleLogout = useCallback(() => {
    Cookies.remove(appConfig.tokenName);
    dispatch(logout());
    setTimeout(() => {
      Navigate("/login");
    }, 1000);
  }, []);

  const changeProperty = useCallback(
    (propertyId: number | null) => {
      const selectedProperty = (properties?.data ?? []).find(
        (property) => property.id === propertyId
      );
      if (selectedProperty) {
        // dispatch(setDefaultProperty(selectedProperty));
      }
    },
    [properties]
  );
  const currentUser = users ?? null;
  const defaultProperty = (properties?.data ?? []).find(
    (a) => a.id === currentUser?.defaultPropertyId
  );
  const currentTimeZone = defaultProperty?.timezone ?? "America/Los_Angeles";

  const timezoneCurrentDate = useMemo(() => {
    const utcTimezoneDate = getMoment(null, currentTimeZone).format();
    const date = convertUtcToTimezone(utcTimezoneDate, currentTimeZone).format(
      `${appConfig.dateApiFormat} hh:mm:ss`
    );
    return date;
  }, [currentTimeZone]);

  return {
    users: users ?? null,
    isLoggedIn: Boolean(isLoggedIn),
    handleLogout,
    onRefreshToken,
    filterMenuList,
    properties: properties?.data ?? [],
    currentProperty: defaultProperty,
    currentTimeZone,
    changeProperty,
    statusList,
    timezoneCurrentDate,
  };
};

export default useAuth;

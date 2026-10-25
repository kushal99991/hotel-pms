import React, {
  useState,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAppTheme } from "theme/useAppTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "hooks";
import theme from "config/theme";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import AppBar from "@mui/material/AppBar";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { Badge, styled, Tooltip } from "@mui/material";
import exampleLogo from "assets/images/logo.png";
import HeaderMenu from "components/ui/Header/HeaderMenu";
import { APP_BAR_HEIGHT } from "constants/index";
import UserPropertyComponent from "./UserPropertyComponent";
import { useNotification } from "hooks/useNotification";
import { appConfig } from "config/app.config";

const PrimaryHeader: React.FC = () => {
  const { unreadCount, fetchNotifications, latestMessage, clearLatestMessage } =
    useNotification();
  const theme = useAppTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const { handleLogout, users, isLoggedIn } = useAuth();
  const Navigate = useNavigate();
  const location = useLocation();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [showIncomingNotification, setShowIncomingNotification] =
    useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(true);
  const [showPropertySwtich, setShowPropertySwtich] = useState(false);
  useEffect(() => {
    if (isLoggedIn) {
      const AUTH_PATHS = ["/login", "/forgot-password"];
      if (AUTH_PATHS.includes(window.location.pathname)) {
        Navigate("/booking-engine/dashboard");
      }
    }
  }, [isLoggedIn, Navigate]);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const domain = appConfig.getCookie(appConfig.domainName);
    const roomName = `${domain}-org-${users?.id}-property-${users?.defaultPropertyId}`;
    fetchNotifications({ room: roomName });
  }, [users?.defaultPropertyId]);

  useEffect(() => {
    if (latestMessage) {
      setShowIncomingNotification(true);
      const timeout = setTimeout(() => {
        setShowIncomingNotification(false);
        clearLatestMessage(); // reset the latest message
      }, 60000); // hide after 1 minute

      return () => clearTimeout(timeout);
    }
  }, [latestMessage, clearLatestMessage]);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = useCallback(
    (url: string) => {
      Navigate(`/booking-engine/${url}`);
    },
    [Navigate]
  );

  const isRootUser = (users?.userName ?? "").toLowerCase() === "root";
  const isSudoUser = (users?.roles ?? []).some(
    (r) => (r?.name ?? "").toLowerCase() === "sudo"
  );
  const canSwitchProperties =
    isRootUser || isSudoUser || (users?.propertyAccess ?? []).length > 0;

  const settings = [
    {
      label: "View Profile",
      onClick: () => handleMenuClick("user-profile"),
    },
    ...(canSwitchProperties
      ? [
          {
            label: "Switch Properties",
            onClick: () => setShowPropertySwtich(true),
          },
        ]
      : []),
    {
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const open = Boolean(anchorElUser);
  const userName = `${users?.firstName ?? ""} ${users?.lastName ?? ""}`;
  const initials = `${userName.charAt(0).toUpperCase()} ${users?.lastName?.charAt(0).toUpperCase()}`;
  return (
    <CustomAppBar color="primary">
      <ToolbarWrap>
        {/* Logo */}
        <PrimaryHeaderLogoWrap>
          <AuthHeaderLogo src={exampleLogo} alt="PMS Logo" />
        </PrimaryHeaderLogoWrap>

        {/* Desktop Menu */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            [theme.breakpoints.down("lg")]: { marginLeft: "auto" },
          }}
          ref={menuRef}
        >
          <HeaderMenu openMenu={openMenu} />
        </Box>
        {/* User */}
        <UserMenuWrap>
          {/* Notification Icon with Badge */}
          {location.pathname !== "/booking-engine/notification-alert" && (
            <NotificationButtonWrap
              onClick={() => Navigate(`/booking-engine/notification-alert`)}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                overlap="circular"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <NotificationsOutlinedIcon
                  sx={{ color: "white", fontSize: "30px" }}
                />
              </Badge>
            </NotificationButtonWrap>
          )}

          <Tooltip title="Open settings">
            <UserMenuButtonWrap
              disableRipple
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleOpenUserMenu}
            >
              <Avatar
                alt={userName}
                src={users?.profileImage ?? ""}
                sx={{ height: "38px", width: "38px", marginRight: "0" }}
                data-testid="user-profile-avatar"
              >
                {users?.profileImage ? null : (
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontSize: "11px" }}
                  >
                    {initials}
                  </Typography>
                )}
              </Avatar>
            </UserMenuButtonWrap>
          </Tooltip>
          <UserMenuDropdownWrap
            disableScrollLock
            anchorEl={anchorElUser}
            id="account-menu"
            open={open}
            onClose={handleCloseUserMenu}
            onClick={handleCloseUserMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {settings.map((setting, index) =>
              setting.onClick ? (
                <DropdownMenuItem
                  key={index.toString()}
                  onClick={setting.onClick}
                >
                  {setting.label}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={index.toString()}
                  onClick={handleCloseUserMenu}
                >
                  {setting.label}
                </DropdownMenuItem>
              )
            )}
          </UserMenuDropdownWrap>
        </UserMenuWrap>
      </ToolbarWrap>
      <UserPropertyComponent
        displayItem={showPropertySwtich}
        closeItem={() => setShowPropertySwtich(false)}
      />
      {showIncomingNotification && latestMessage && (
        <FadeInBanner>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "#111", marginBottom: "4px" }}
            >
              New Notification
            </Typography>
            <Typography variant="body2" sx={{ color: "#444", lineHeight: 1.4 }}>
              {latestMessage}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setShowIncomingNotification(false);
              clearLatestMessage();
            }}
            sx={{
              alignSelf: "flex-start",
              padding: 0,
              color: "#999",
              ":hover": { color: "#000" },
            }}
          >
            ✕
          </IconButton>
        </FadeInBanner>
      )}
    </CustomAppBar>
  );
};
export default PrimaryHeader;

const CustomAppBar = styled(AppBar)(() => ({
  padding: "0px 0",
  boxShadow: "none",
  position: "fixed",
  flexDirection: "row",
  top: "0",
  zIndex: "999",
  height: `${APP_BAR_HEIGHT}px`,
  overflow: "hidden",
}));

const NotificationButtonWrap = styled(IconButton)(() => ({
  padding: "0",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  backgroundColor: "#2e2e2e",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: "#3a3a3a",
  },
}));

const ToolbarWrap = styled(Toolbar)(() => ({
  justifyContent: "start",
  alignItems: "center",
  width: "100%",
  maxWidth: "100%",
  maxHeight: `${APP_BAR_HEIGHT}px !important`,
  padding: "0 20px !important",
}));

const PrimaryHeaderLogoWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const AuthHeaderLogo = styled(Avatar)(() => ({
  fontSize: "20px",
  fontWeight: "700",
  width: "45px",
  height: "45px",
  background: "white",
  marginRight: "25px",
}));

const UserMenuWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginLeft: "auto",
  [theme.breakpoints.down("lg")]: {
    marginLeft: "25px",
  },
}));

const UserMenuButtonWrap = styled(IconButton)(() => ({
  padding: "0",
  "& img": {
    border: "2px solid #ffffff",
    borderRadius: "50px",
  },
  [theme.breakpoints.down("md")]: {
    display: "inline-block",
  },
}));

const UserMenuDropdownWrap = styled(Menu)(() => ({
  "& .MuiPaper-root": {
    marginTop: "23px",
    minWidth: "160px",
    "@media (max-width: 899px)": {
      marginTop: "18px",
    },
  },
}));

const DropdownMenuItem = styled(MenuItem)(() => ({
  fontSize: "16px",
  fontWeight: "700",
  lineHeight: "1.5",
  color: "#111111",
  minHeight: "100%",
}));

const FadeInBanner = styled(Box)(() => ({
  position: "fixed",
  top: "80px", // below header
  right: "20px",
  width: "340px",
  backgroundColor: "#ffffff",
  borderLeft: "6px solid #1976d2", // Blue indicator
  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
  borderRadius: "8px",
  padding: "12px 16px",
  zIndex: 1300,
  animation: "slideIn 0.4s ease-in-out",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: "10px",
  "@keyframes slideIn": {
    from: {
      opacity: 0,
      transform: "translateX(100%)",
    },
    to: {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
}));

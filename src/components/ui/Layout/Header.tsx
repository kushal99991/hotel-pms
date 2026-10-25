import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import Logo from "assets/images/logo.png";

interface IHeaderProps {
  isOpen: boolean;
  drawerWidth: number;
}

const Header: React.FC<IHeaderProps> = ({ isOpen, drawerWidth }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        ...(isOpen && {
          marginLeft: drawerWidth,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }),
      }}
    >
      <Toolbar>
        {/* Left Section - Company Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={Logo}
            alt="Company Logo"
            height="64px"
            style={{ marginRight: "15px" }}
          />
          {/* <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onDrawer}
            sx={{ marginRight: '10px' }}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton> */}
        </Box>

        {/* Center Section - Search Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            marginLeft: "15px", // Margin between logo and search bar
          }}
        >
          <div style={{ position: "relative", flexGrow: 1 }}>
            <div
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                height: "100%",
                paddingLeft: "10px",
              }}
            >
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search..."
              style={{ paddingLeft: "40px", width: "100%" }}
              inputProps={{ "aria-label": "search" }}
            />
          </div>
        </Box>

        {/* Right Section - Profile Menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleProfileMenuOpen} color="inherit">
            <Avatar />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>My account</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

"use client";

import React, { useState, MouseEvent } from "react";
import theme from "config/theme";
import { RouteList as IMenuItem } from "config/sidebarmenu.config";
import { styled } from "@mui/material/styles";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  Menu,
  Link,
  Box,
} from "@mui/material";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface CustomListItemButton {
  level: number;
  isActive?: boolean;
}

interface MenuListItemProps {
  href: string;
  label: string;
  subMenuItems?: IMenuItem[];
  level?: number;
  activePath: string[];

  handleActivePath: (href: string, uniqueKey?: string) => void;
  menuItems: IMenuItem[];
}

const MenuListItem: React.FC<MenuListItemProps> = ({
  href,
  label,
  subMenuItems,
  level = 0,
  activePath,
  handleActivePath,
  menuItems,
}) => {
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const uniqueKey = `${href}`;
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const isActive = activePath.includes(href) || openSubMenus[uniqueKey];
  const shouldHighlight = isActive || hovered;

  const toggleSubMenu = (path: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (!isMobile) {
      if (level > 0 && anchorEl !== event.currentTarget) {
        setAnchorEl(event.currentTarget);
      }
      if (level === 0) {
        if (subMenuItems && subMenuItems.length > 0 && level === 0) {
          if (anchorEl !== event.currentTarget) {
            setAnchorEl(event.currentTarget);
          }
        }
      }
    }
  };
  const handleMouseEnter = () => {
    setHovered(true);
  };
  const handleMouseOut = (event: MouseEvent<HTMLElement>) => {
    if (subMenuItems && subMenuItems.length > 0) {
      if (anchorEl === event.currentTarget || level === 0) {
        setAnchorEl(null);
      }
    } else {
      setAnchorEl(null);
    }
    setHovered(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setHovered(false);
  };
  const renderContent = () => (
    <StyledListItemButton
      disableRipple
      data-testid="menu-item"
      level={level}
      isActive={shouldHighlight}
      onClick={handleClick}
    >
      <ListItemText sx={{ margin: "0" }} primary={label} />
      {subMenuItems && subMenuItems.length > 0 && level > 0 && (
        <ListItemIcon>
          {openSubMenus[uniqueKey] ? (
            <KeyboardArrowDownIcon />
          ) : (
            <KeyboardArrowRight />
          )}
        </ListItemIcon>
      )}
    </StyledListItemButton>
  );

  const renderContentMobile = () => (
    <StyledListItemButton
      disableRipple
      data-testid="menu-item"
      level={level}
      isActive={shouldHighlight || level === 0}
      onClick={handleClick}
    >
      <ListItemText
        sx={{ margin: "0" }}
        primaryTypographyProps={{
          fontWeight: shouldHighlight ? "700" : "400",
        }}
        primary={label}
      />
      {subMenuItems && subMenuItems.length > 0 && level > 0 && (
        <ListItemIcon>
          {openSubMenus[uniqueKey] ? (
            <KeyboardArrowDownIcon />
          ) : (
            <KeyboardArrowRight />
          )}
        </ListItemIcon>
      )}
    </StyledListItemButton>
  );

  return (
    <>
      {isMobile ? (
        subMenuItems && subMenuItems.length > 0 ? (
          <Accordion
            expanded={openSubMenus[uniqueKey] || false}
            onChange={() => toggleSubMenu(uniqueKey)}
            sx={{
              borderRadius: "0",
              boxShadow: "none",
              backgroundColor: shouldHighlight ? "#FFFFFF" : "",
            }}
          >
            <StyledAccordionSummary>
              <Typography sx={{ fontWeight: shouldHighlight ? "700" : "400" }}>
                {label}
              </Typography>
              <ListItemIcon sx={{ marginLeft: "auto", justifyContent: "end" }}>
                {openSubMenus[uniqueKey] ? (
                  <KeyboardArrowDownIcon />
                ) : (
                  <KeyboardArrowRight />
                )}
              </ListItemIcon>
            </StyledAccordionSummary>
            <AccordionDetails>
              {subMenuItems.map((subItem, index) => (
                <MenuListItem
                  key={index}
                  href={subItem?.path ?? ""}
                  label={subItem?.menuTitle ?? ""}
                  subMenuItems={(subItem.subMenu ?? []).filter(
                    (a) => a?.isShowSidebar
                  )}
                  level={level + 1}
                  activePath={activePath}
                  handleActivePath={handleActivePath}
                  menuItems={menuItems}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        ) : (
          <StyledLink href={href}>{renderContentMobile()}</StyledLink>
        )
      ) : (
        <Box
          component="div"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseOut}
          mr="5px"
        >
          <StyledLink href={href}>{renderContent()}</StyledLink>
          {subMenuItems && Boolean(anchorEl) && (
            <StyledMenu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal:
                  level === 0 ? "left" : level === 1 ? "right" : "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal:
                  level === 0 ? "left" : level === 1 ? "left" : "right",
              }}
              sx={{
                zIndex: level + 6,
              }}
            >
              {subMenuItems.map((subItem, index) => (
                <MenuListItem
                  key={index}
                  href={subItem?.path ?? ""}
                  label={subItem?.menuTitle ?? ""}
                  subMenuItems={subItem.subMenu}
                  level={level + 1}
                  activePath={activePath}
                  handleActivePath={handleActivePath}
                  menuItems={menuItems}
                />
              ))}
            </StyledMenu>
          )}
        </Box>
      )}
    </>
  );
};

export default MenuListItem;

const StyledLink = styled(Link)({
  color: "inherit",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "none",
  },
});

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<CustomListItemButton>(({ theme, level, isActive }) => ({
  backgroundColor: isActive ? "#FFFFFF" : "",
  color: isActive || level > 0 ? "#222222" : "rgba(255,255,255,0.5)",
  width: "auto",
  height: "49px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: level === 0 ? "35px 20px" : "20px 20px",
  "&:hover": {
    backgroundColor: isActive ? "#FFFFFF" : "#F5F5F5",
    color: "#222222",
    "& .MuiListItemText-primary": {
      color: "#222222",
    },
  },
  "& .MuiListItemText-primary": {
    fontSize: "16px",
    fontWeight: level === 0 ? "700" : isActive ? "700" : "400",
    lineHeight: "1",
    color: isActive
      ? "#222222"
      : level === 0
        ? "rgba(255,255,255,0.5)"
        : "#111111",
  },
  [theme.breakpoints.down("xl")]: {
    padding: level === 0 ? "35px 6px" : "20px 6px",
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)({
  padding: "0",
  minHeight: "0px",
  "& .MuiAccordionSummary-content": {
    margin: "0 !important",
    alignItems: "center",
  },
  "& svg": {
    fill: "#111111",
    width: "16px",
    height: "16px",
  },
});

const StyledMenu = styled(Menu)({
  "& .MuiMenu-paper": {
    border: "1px solid #D6D6D6",
    borderRadius: "0",
    boxShadow: "0 20px 20px 0 rgba(0, 0, 0, 0.20)",
  },
  "& .MuiMenu-list": {
    padding: "0",
    minWidth: "230px",
  },
  "& .MuiListItemButton-root": {
    background: "#ffffff",
    padding: "20px",
    borderBottom: "1px solid #D6D6D6",
    "&:hover": {
      backgroundColor: "#F5F5F5",
    },
  },
});

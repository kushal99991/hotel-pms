import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Hotel } from "@mui/icons-material";

export const Navigation = () => {
  const [reportsAnchorEl, setReportsAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const handleReportsClick = (event: React.MouseEvent<HTMLElement>) => {
    setReportsAnchorEl(event.currentTarget);
  };

  const handleReportsClose = () => {
    setReportsAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "white", color: "text.primary" }}>
      <Toolbar>
        <IconButton
          component={RouterLink}
          to="/"
          sx={{ mr: 2 }}
          color="inherit"
        >
          <Hotel />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Grand Hotel
        </Typography>

        <Button color="inherit" component={RouterLink} to="/">
          Dashboard
        </Button>

        <Button color="inherit" onClick={handleReportsClick}>
          Reports
        </Button>

        <Menu
          anchorEl={reportsAnchorEl}
          open={Boolean(reportsAnchorEl)}
          onClose={handleReportsClose}
        >
          <MenuItem
            component={RouterLink}
            to="/reports/guests"
            onClick={handleReportsClose}
          >
            Guest In House By Room
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/reports/arrivals"
            onClick={handleReportsClose}
          >
            Arrivals
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/reports/departures"
            onClick={handleReportsClose}
          >
            Departures
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/reports/market-segments"
            onClick={handleReportsClose}
          >
            Market Segment Performance
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/reports/tax"
            onClick={handleReportsClose}
          >
            Tax Report
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/reports/ledger"
            onClick={handleReportsClose}
          >
            General Ledger Report
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

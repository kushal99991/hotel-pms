import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  InputBase,
  Button,
  Grid,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import HomeIcon from "@mui/icons-material/Home";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Brightness3Icon from "@mui/icons-material/Brightness3";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import ArrivalReports from "./arrival-report/page";
import ReportDashboard from "./reports-dashboard/page";
import DailyRevenueReport from "./departure-report/page";
import GeneralLedger from "./expected-arrival-report/page";
import MarketSegmentReport from "./in-house-report/page";
import OccupancyForecast from "./occupancy-forecast/page";
import RoomRateAuditReport from "./room-status-detail/page";

const reportTabs = [
  {
    title: "Daily Revenue Report",
    subtitle: "Past Daily Revenue reporting",
    component: <DailyRevenueReport />,
  },
  {
    title: "General Ledger",
    subtitle: "Overall Financial Report",
    component: <GeneralLedger />,
  },
  {
    title: "Market Segment Report",
    subtitle: "Market Segment Booking Activities",
    component: <MarketSegmentReport />,
  },
  {
    title: "Occupancy Forecast",
    subtitle: "Occupancy Outlook with Daily, weekly and monthly filter",
    component: <OccupancyForecast />,
  },
  {
    title: "Room Rate Audit Report",
    subtitle: "List of Room Rates by segment, type and booking trend",
    component: <RoomRateAuditReport />,
  },
];

const menuItems = [
  { text: "Front Office", icon: <HomeIcon />, component: <ReportDashboard /> },
  { text: "Rooms", icon: <MeetingRoomIcon />, component: <ArrivalReports /> },
  {
    text: "Maintenance",
    icon: <EngineeringIcon />,
    component: <ArrivalReports />,
  },
  { text: "Sales", icon: <PointOfSaleIcon />, component: <ArrivalReports /> },
  {
    text: "Accounting",
    icon: <AccountBalanceIcon />,
    component: <ArrivalReports />,
  },
  {
    text: "Revenue Management",
    icon: <TrendingUpIcon />,
    component: null,
    subTabs: reportTabs,
  },
  {
    text: "Night Audit",
    icon: <Brightness3Icon />,
    component: <ArrivalReports />,
  },
  {
    text: "Administration",
    icon: <AdminPanelSettingsIcon />,
    component: <ArrivalReports />,
  },
];

const ReportPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [subTabIndex, setSubTabIndex] = useState(0);

  const handleMenuClick = (index: number) => {
    if (menuItems[index].subTabs) {
      setExpandedIndex(expandedIndex === index ? null : index);
      setTabIndex(index);
    } else {
      setExpandedIndex(null);
      setTabIndex(index);
    }
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        md={3}
        sx={{ height: "100vh", overflowY: "auto", p: 2 }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SearchIcon />
          <InputBase placeholder="Search" fullWidth sx={{ fontSize: 14 }} />
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={600} fontSize={15} mb={1}>
            Quick Actions
          </Typography>
          <Button
            size="small"
            startIcon={<PrintIcon />}
            sx={{ textTransform: "none", mb: 0.5, fontSize: 13 }}
          >
            Print Downtime Report
          </Button>
          <Button
            size="small"
            startIcon={<PrintIcon />}
            sx={{ textTransform: "none", fontSize: 13 }}
          >
            Print Rooms Status Summary
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          {menuItems.map((item, index) => (
            <Box key={index}>
              <Button
                fullWidth
                onClick={() => handleMenuClick(index)}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  mb: 0.5,
                  fontWeight: tabIndex === index ? "bold" : 500,
                  color: "text.primary",
                  backgroundColor:
                    tabIndex === index ? "#e0e0e0" : "transparent",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                  px: 1.5,
                  py: 1,
                  fontSize: 14,
                }}
                startIcon={
                  <Box display="flex" alignItems="center" gap={1}>
                    {item.icon}
                    <Typography fontWeight="bold" fontSize={14}>
                      {item.text}
                    </Typography>
                  </Box>
                }
                endIcon={
                  item.subTabs ? (
                    expandedIndex === index ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )
                  ) : (
                    <ChevronRightIcon fontSize="small" />
                  )
                }
              />

              {item.subTabs && (
                <Collapse
                  in={expandedIndex === index}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box pl={4}>
                    {item.subTabs.map((tab, subIndex) => (
                      <Button
                        key={subIndex}
                        onClick={() => setSubTabIndex(subIndex)}
                        fullWidth
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          fontSize: 13,
                          color:
                            subTabIndex === subIndex
                              ? "primary.main"
                              : "text.secondary",
                          mb: 0.5,
                        }}
                      >
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-start"
                        >
                          <Typography fontWeight={600} fontSize={13}>
                            {tab.title}
                          </Typography>
                          <Typography fontSize={11} color="text.secondary">
                            {tab.subtitle}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </Box>
                </Collapse>
              )}
            </Box>
          ))}
        </Box>
      </Grid>

      <Grid item xs={12} md={9} sx={{ height: "100vh", p: 0 }}>
        <Box sx={{ height: "100%", width: "100%", overflowY: "auto", p: 2 }}>
          {menuItems[tabIndex].subTabs
            ? menuItems[tabIndex].subTabs?.[subTabIndex]?.component
            : menuItems[tabIndex].component}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ReportPage;

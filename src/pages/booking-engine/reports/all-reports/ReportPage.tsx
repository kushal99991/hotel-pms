import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  InputBase,
  Button,
  Collapse,
  Paper,
  CircularProgress,
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
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import FrontOfficeReports from "./FrontOfficeReports";
import RoomsReports from "./RoomsReports";
import MaintenanceReports from "./MaintenanceReports";
import SalesReports from "./SalesReports";
import AccountingReports from "./AccountingReports";
import RevenueManagementReports from "./RevenueManagementReports";
import NightAuditReports from "./NightAuditReports";
import AdministrationReports from "./AdministrationReports";

// Revenue Management Sub-reports
import DailyRevenueReport from "./revenue-management/DailyRevenueReport";
import GeneralLedger from "./revenue-management/GeneralLedger";
import MarketSegmentReport from "./revenue-management/MarketSegmentReport";
import OccupancyForecast from "./revenue-management/OccupancyForecast";
import RoomRateAuditReport from "./revenue-management/RoomRateAuditReport";
import DemographicTrendReport from "./revenue-management/GuestDemographicDashboard";
import OccupancyForecastReport from "pages/booking-engine/reports/occupancy-forecast/page";

// Front Office Sub-reports
import ArrivalReports from "pages/booking-engine/reports/arrival-report/page";
import ExpectedArrivalReports from "pages/booking-engine/reports/expected-arrival-report/page";
import DepartureReports from "pages/booking-engine/reports/departure-report/page";
import InHouseReports from "pages/booking-engine/reports/in-house-report/page";
import CancellationReport from "pages/booking-engine/reports/cancelation-report/page";
import ReportReservation from "pages/booking-engine/reports/reservation/page";
import ComingSoon from "components/elements/ComingSoon";
import useAuth from "hooks/useAuth";
import { downloadPDF } from "utils/downloadPDF";
import { useLazyGetPaymentsQuery } from "services/paymentsSlice";
import useSnackbar from "hooks/useSnackbar";
import { getCurrentRoom } from "utils/reservations";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import { IReservationResponse } from "types/reservationTypes";
import CashierReport from "../cashier-report/page";
import { appConfig } from "config/app.config";

// Housekeeping Sub-reports
import ExpectedDepartures from "pages/booking-engine/reports/expected-departures-reports/page";
import ReportRoomStatusSummary from "pages/booking-engine/reports/room-status-summary/page";
import ReportRoomStatusDetail from "pages/booking-engine/reports/room-status-detail/page";
import HousekeepingMaintenanceReport from "pages/booking-engine/reports/housekeeping-report/maintenance-report/page";

// Accounting Sub-reports
import HighBalanceReport from "pages/booking-engine/reports/high-balance-report/page";
import AgingReport from "pages/booking-engine/reports/direct-billing/aging-report/page";
import RoomExpectedDeparturesReport from "pages/booking-engine/reports/expected-departures-reports/page";
import useGeneralLedger from "hooks/useGeneralLedger";
import CompRoomReport from "pages/booking-engine/reports/comp-room-report/page";

// Reservation Report wrappers with pre-filled status
const NoShowReservationReport = () => (
  <ReportReservation defaultStatus="NO_SHOW" />
);
const ReservedReservationReport = () => (
  <ReportReservation defaultStatus="RESERVED" />
);
const CanceledReservationReport = () => (
  <ReportReservation defaultStatus="CANCELED" />
);

const revenueSubReports = [
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
    subTabs: [
      {
        title: "Dashboard",
        subtitle: "Occupancy metrics, forecasts, and segment analysis",
        component: <OccupancyForecast />,
      },
      {
        title: "Occupancy Forecast Report",
        subtitle: "Detailed occupancy forecast reporting and analysis",
        component: <OccupancyForecastReport />,
      },
    ],
  },
  {
    title: "Room Rate Audit Report",
    subtitle: "List of Room Rates by segment, type and booking trend",
    component: <RoomRateAuditReport />,
  },
  {
    title: "Guest Demographic Trend Dashboard",
    subtitle: "Visual of guest demographic trend",
    component: <DemographicTrendReport />,
  },
];

const frontOfficeSubMenu = [
  {
    title: "Dashboard",
    subtitle: "Front Office Dahsboard",
    component: <FrontOfficeReports />,
  },
  {
    title: "Arrival Report",
    subtitle: "Arriving guest for selected date",
    component: <ArrivalReports />,
  },
  {
    title: "Expected Arrivals",
    subtitle: "Expected arriving guests for selected date",
    component: <ExpectedArrivalReports />,
  },
  {
    title: "In-House Report",
    subtitle: "In-House guest for selected date",
    component: <InHouseReports />,
  },
  {
    title: "Expected Departure Report",
    subtitle: "Guest Expected to depart today(Today)",
    component: <RoomExpectedDeparturesReport />,
  },
  {
    title: "Departure Report",
    subtitle: "Departed guests for selected date",
    component: <DepartureReports />,
  },
  {
    title: "Late Check-out Report",
    subtitle: "Guest Schedule to check-out late",
    component: <ComingSoon />,
  },
  {
    title: "Cancellation Report",
    subtitle: "Cancelled reservations",
    component: <CancellationReport />,
  },
  {
    title: "Reservation Report",
    subtitle: "Reservation status reports",
    component: <ReportReservation />,
    subTabs: [
      {
        title: "No Show (DNA)",
        subtitle: "No show reservations",
        component: <NoShowReservationReport />,
      },
      {
        title: "Reserved",
        subtitle: "Reserved status reservations",
        component: <ReservedReservationReport />,
      },
      {
        title: "Canceled",
        subtitle: "Canceled reservations",
        component: <CanceledReservationReport />,
      },
    ],
  },
  {
    title: "Rooms On Wait Report",
    subtitle: "Rooms pending to be ready for arrived guests",
    component: <ComingSoon />,
  },
  {
    title: "Advance Deposit Report",
    subtitle: "Collected Advance Deposite report",
    component: <ComingSoon />,
  },
  {
    title: "Cancelled Advance Deposit Report",
    subtitle: "Cancelled collected deposits",
    component: <ComingSoon />,
  },
  {
    title: "Method Of Payment Report(Today)",
    subtitle: "Reservations method of pay review and folios balance reporting",
    component: <ComingSoon />,
  },
  {
    // Intentionally moved under Accounting section
  },
  {
    title: "Cashier Report",
    subtitle: "Detailed summary of cashier transactions",
    component: <CashierReport />,
  },
];

const housekeepingSubMenu = [
  {
    title: "Expected Departures",
    subtitle: "Guest Expected to depart today(Today)",
    component: <ExpectedDepartures />,
  },
  {
    title: "Room Status Summary",
    subtitle: "Summary of room status for selected date",
    component: <ReportRoomStatusSummary />,
  },
  {
    title: "Room Status Detail",
    subtitle: "Detailed view of room status for selected date",
    component: <ReportRoomStatusDetail />,
  },
  {
    title: "Maintenance Report",
    subtitle: "Maintenance activities and room maintenance status",
    component: <HousekeepingMaintenanceReport />,
  },
];

const accountingSubMenu = [
  {
    title: "Dashboard",
    subtitle: "Accounting Dashboard",
    component: <AccountingReports />,
  },
  {
    title: "Comp Room Report",
    subtitle: "Rooms with Comp or Zero Rates",
    component: <CompRoomReport />,
  },
  {
    title: "Cashier Report",
    subtitle: "Detailed summary of cashier transactions",
    component: <CashierReport />,
  },
  {
    title: "High Balance Report",
    subtitle: "Accounts with high outstanding balances",
    component: <HighBalanceReport />,
  },
  {
    title: "Direct Billing",
    subtitle: "Direct billing reports and account analysis",
    component: <AgingReport />,
    subTabs: [
      {
        title: "Aging Report",
        subtitle: "Account aging analysis and outstanding receivables",
        component: <AgingReport />,
      },
    ],
  },
];

const menuItems = [
  {
    text: "Front Office",
    icon: <HomeIcon />,
    component: <FrontOfficeReports />,
    subTabs: frontOfficeSubMenu,
  },
  { text: "Rooms", icon: <MeetingRoomIcon />, component: <RoomsReports /> },
  {
    text: "Maintenance",
    icon: <EngineeringIcon />,
    component: <MaintenanceReports />,
  },
  {
    text: "Sales",
    icon: <PointOfSaleIcon />,
    component: <SalesReports />,
    subTabs: [
      {
        title: "Dashboard",
        subtitle: "Sales Dashboard - Revenue and Booking Performance Analytics",
        component: <SalesReports />,
      },
      {
        title: "Sales Report",
        subtitle: "Detailed sales reporting and analysis",
        component: <ComingSoon />,
      },
    ],
  },
  {
    text: "Accounting",
    icon: <AccountBalanceIcon />,
    component: <AccountingReports />,
    subTabs: accountingSubMenu,
  },
  {
    text: "Revenue Management",
    icon: <TrendingUpIcon />,
    component: <RevenueManagementReports />,
    subTabs: revenueSubReports,
  },
  {
    text: "Night Audit",
    icon: <Brightness3Icon sx={{ transform: "rotate(145deg)" }} />,
    component: <NightAuditReports />,
  },
  {
    text: "Housekeeping",
    icon: <CleaningServicesIcon />,
    component: null, // No direct component for Housekeeping, submenus will be handled by subTabs
    subTabs: housekeepingSubMenu,
  },
  {
    text: "Administration",
    icon: <AdminPanelSettingsIcon />,
    component: <AdministrationReports />,
  },
];

const ReportPage: React.FC = () => {
  const { mockRevenueData } = useGeneralLedger();
  const [getPayments] = useLazyGetPaymentsQuery();
  const { openSnackbar } = useSnackbar();
  const { users, properties, currentTimeZone } = useAuth();
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );
  const [tabIndex, setTabIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [subTabIndex, setSubTabIndex] = useState(0);
  const [nestedExpanded, setNestedExpanded] = useState<number | null>(null);
  const [nestedSubIndex, setNestedSubIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleMenuClick = (index: number) => {
    if (menuItems[index].subTabs) {
      setExpandedIndex(expandedIndex === index ? null : index);
      setTabIndex(index);
    } else {
      setExpandedIndex(null);
      setTabIndex(index);
    }
  };

  const handleSubTabClick = (subIndex: number) => {
    setSubTabIndex(subIndex);
    setNestedExpanded(null); // Reset nested when switching main subtabs
  };

  const handleNestedToggle = (subIndex: number) => {
    setNestedExpanded(nestedExpanded === subIndex ? null : subIndex);
  };

  const handleCashierReportDownload = async () => {
    const response = await getPayments({
      property_id: users?.defaultPropertyId,
    });

    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }

    const data = response?.data ?? [];

    const headers = [
      "Payment Method",
      "Date",
      "Folio ID",
      "Room Number",
      "Balance",
      "Note",
    ];

    const rows = data.map((payment) => {
      const paymentMethodObj = payment?.payment_method;
      const paymentType = paymentMethodObj?.payment_type;
      const brand = paymentMethodObj?.brand ?? "-";

      // Determine the tender_type
      let tenderType = "";
      if (paymentType === "CREDIT_DEBIT_CARD") {
        tenderType = brand;
      } else {
        tenderType = paymentType ?? "-";
      }

      // Format created_at with property timezone
      const localDate = convertUtcToTimezone(
        payment.created_at,
        currentTimeZone
      ).format(
        `${appConfig.displayDateFormat} ${appConfig.dateTimeOfDayFormat}`
      );
      const reservations = (payment?.reservation ??
        null) as IReservationResponse | null;

      const rooms = getCurrentRoom(reservations);
      const roomNumber = rooms?.room_number ?? "-";

      return [
        tenderType,
        localDate,
        payment?.folio_id ?? "-",
        roomNumber,
        `$${Number(payment?.amount ?? 0).toFixed(2)}`,
        payment?.description || "-",
      ];
    });

    await downloadPDF({
      title: "Cashier Summary Report",
      subtitle: "Detailed summary of cashier transactions",
      columns: headers,
      data: rows,
      generatedBy: `${users?.firstName} ${users?.lastName}`,
      logoUrl: currentProperty?.logo || undefined,
    });
  };

  const handleGeneralLedgerPDF = async () => {
    const headers = [
      "Posting Code",
      "Today",
      "Month To Date",
      "Year To Date",
      "Last Year MTD",
      "Last Year YTD",
    ];

    const finalRows = mockRevenueData.map((row) => {
      return [
        row.name,
        `$${row.today.toLocaleString()}`,
        `$${row.month_to_date.toLocaleString()}`,
        `$${row.year_to_date.toLocaleString()}`,
        `$${row.last_year_mtd.toLocaleString()}`,
        `$${row.last_year_to_date.toLocaleString()}`,
      ];
    });

    await downloadPDF({
      title: "General Ledger Report",
      subtitle: `Overall Financial Report ${mockRevenueData.length} posting codes`,
      columns: headers,
      data: finalRows,
      generatedBy: `${users?.firstName} ${users?.lastName}`,
      logoUrl: currentProperty?.logo || undefined,
      orientation: "landscape",
    });
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const currentMainTab = menuItems[tabIndex];

      if (
        currentMainTab?.text === "Front Office" ||
        currentMainTab?.text === "Accounting"
      ) {
        await handleCashierReportDownload();
      }
      if (currentMainTab?.text === "Revenue Management") {
        await handleGeneralLedgerPDF();
      }
    } catch {
      openSnackbar("Something went wrong while downloading", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 150px)",
        bgcolor: "#f5f5f5",
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={2}
        sx={{
          width: 320,
          minHeight: "100vh",
          overflowY: "auto",
          bgcolor: "white",
          borderRadius: 0,
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            color="primary"
            sx={{ mb: 2 }}
          >
            Reports
          </Typography>

          {/* Search */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mb={3}
            sx={{
              bgcolor: "#f8f9fa",
              borderRadius: 1,
              px: 2,
              py: 1,
            }}
          >
            <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <InputBase placeholder="Search" fullWidth sx={{ fontSize: 14 }} />
          </Box>

          {/* Quick Actions */}
          <Box mb={3}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              fontSize={14}
              mb={1}
              color="text.primary"
            >
              ⚡ Quick Actions
            </Typography>
            <Button
              size="small"
              startIcon={
                isDownloading ? (
                  <CircularProgress size={14} />
                ) : (
                  <PrintIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                textTransform: "none",
                mb: 0.5,
                fontSize: 12,
                color: "text.secondary",
                justifyContent: "flex-start",
                width: "100%",
                opacity: isDownloading ? 0.6 : 1,
                pointerEvents: isDownloading ? "none" : "auto",
              }}
              disabled={isDownloading}
              onClick={handleDownloadReport}
            >
              {isDownloading ? "Downloading..." : "Print Downtime Report"}
            </Button>

            <Button
              size="small"
              startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontSize: 12,
                color: "text.secondary",
                justifyContent: "flex-start",
                width: "100%",
              }}
            >
              Print Rooms Status Summary
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Menu Items */}
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
                    color: tabIndex === index ? "primary.main" : "text.primary",
                    backgroundColor:
                      tabIndex === index ? "primary.50" : "transparent",
                    "&:hover": {
                      backgroundColor:
                        tabIndex === index ? "primary.100" : "#f0f0f0",
                    },
                    px: 1.5,
                    py: 1.2,
                    fontSize: 14,
                    borderRadius: 1,
                    fontWeight: tabIndex === index ? 600 : 500,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    {React.cloneElement(item.icon, {
                      sx: {
                        fontSize: 20,
                        color:
                          tabIndex === index
                            ? "primary.main"
                            : "text.secondary",
                        ...item.icon.props.sx,
                      },
                    })}
                    <Typography fontWeight="inherit" fontSize={14}>
                      {item.text}
                    </Typography>
                  </Box>
                  {item.subTabs ? (
                    expandedIndex === index ? (
                      <ExpandMoreIcon fontSize="small" />
                    ) : (
                      <ChevronRightIcon fontSize="small" />
                    )
                  ) : (
                    <ChevronRightIcon fontSize="small" />
                  )}
                </Button>

                {item.subTabs && (
                  <Collapse
                    in={expandedIndex === index}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box pl={3} py={1}>
                      {item.subTabs.map((tab, subIndex) => (
                        <Box key={subIndex}>
                          <Button
                            onClick={() => {
                              handleSubTabClick(subIndex);
                              if ((tab as any).subTabs) {
                                handleNestedToggle(subIndex);
                              }
                            }}
                            fullWidth
                            sx={{
                              justifyContent: "space-between",
                              textTransform: "none",
                              fontSize: 13,
                              color:
                                subTabIndex === subIndex
                                  ? "primary.main"
                                  : "text.secondary",
                              backgroundColor:
                                subTabIndex === subIndex
                                  ? "primary.50"
                                  : "transparent",
                              "&:hover": {
                                backgroundColor:
                                  subTabIndex === subIndex
                                    ? "primary.100"
                                    : "#f8f9fa",
                              },
                              mb: 0.5,
                              borderRadius: 1,
                              py: 1,
                            }}
                          >
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="flex-start"
                              sx={{ flex: 1 }}
                            >
                              <Typography
                                fontWeight={
                                  subTabIndex === subIndex ? 600 : 500
                                }
                                fontSize={13}
                                sx={{ textAlign: "left" }}
                              >
                                {tab.title}
                              </Typography>
                              <Typography
                                fontSize={11}
                                color="text.secondary"
                                sx={{ textAlign: "left", mt: 0.2 }}
                              >
                                {tab.subtitle}
                              </Typography>
                            </Box>
                            {(tab as any).subTabs && (
                              <ChevronRightIcon
                                fontSize="small"
                                sx={{
                                  transform:
                                    nestedExpanded === subIndex
                                      ? "rotate(90deg)"
                                      : "rotate(0deg)",
                                  transition: "transform 0.2s",
                                }}
                              />
                            )}
                          </Button>

                          {(tab as any).subTabs && (
                            <Collapse
                              in={nestedExpanded === subIndex}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box pl={3}>
                                {(tab as any).subTabs.map(
                                  (nestedTab: any, nestedIndex: number) => (
                                    <Button
                                      key={nestedIndex}
                                      onClick={() => {
                                        setNestedSubIndex(nestedIndex);
                                        // Ensure parent submenu is selected and expanded
                                        setSubTabIndex(subIndex);
                                        setNestedExpanded(subIndex);
                                      }}
                                      fullWidth
                                      sx={{
                                        justifyContent: "flex-start",
                                        textTransform: "none",
                                        fontSize: 12,
                                        color:
                                          nestedSubIndex === nestedIndex &&
                                          nestedExpanded === subIndex
                                            ? "primary.main"
                                            : "text.secondary",
                                        backgroundColor:
                                          nestedSubIndex === nestedIndex &&
                                          nestedExpanded === subIndex
                                            ? "primary.50"
                                            : "transparent",
                                        mb: 0.5,
                                        borderRadius: 1,
                                        py: 0.5,
                                      }}
                                    >
                                      {nestedTab.title}
                                    </Button>
                                  )
                                )}
                              </Box>
                            </Collapse>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, height: "100vh", overflow: "auto" }}>
        <Box sx={{ p: 3 }}>
          {menuItems[tabIndex].subTabs
            ? (menuItems[tabIndex].subTabs?.[subTabIndex] as any)?.subTabs &&
              nestedExpanded === subTabIndex
              ? (menuItems[tabIndex].subTabs?.[subTabIndex] as any)?.subTabs?.[
                  nestedSubIndex
                ]?.component
              : menuItems[tabIndex].subTabs?.[subTabIndex]?.component
            : menuItems[tabIndex].component}
        </Box>
      </Box>
    </Box>
  );
};

export default ReportPage;

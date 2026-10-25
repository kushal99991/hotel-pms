import { useEffect, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import ComingSoon from "components/elements/ComingSoon";
import SalesDashboard from "./SalesDashboard";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SalesGroups from "./SalesGroups";
import { useLocation, useNavigate } from "react-router-dom";
import SalesRooming from "./SalesRooming";

const Page: React.FC = () => {
  const location = useLocation();
  const Navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<number>(0);

  useEffect(() => {
    switch (location.pathname) {
      case "/booking-engine/sales/dashboard":
        setSelectedTab(0);
        break;
      case "/booking-engine/sales/group":
        setSelectedTab(1);
        break;
      case "/booking-engine/sales/rooming-list":
        setSelectedTab(2);
        break;
      case "/booking-engine/sales/banquet":
        setSelectedTab(3);
        break;
      default:
        setSelectedTab(0);
        break;
    }
  }, [location.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        Navigate("/booking-engine/sales/dashboard");
        break;
      case 1:
        Navigate("/booking-engine/sales/group");
        break;
      case 2:
        Navigate("/booking-engine/sales/rooming-list");
        break;
      case 3:
        Navigate("/booking-engine/sales/banquet");
        break;

      default:
        setSelectedTab(newValue);
        break;
    }
  };
  const renderTabs = () => {
    switch (selectedTab) {
      case 0:
        return <SalesDashboard />;
      case 1:
        return <SalesGroups />;
      case 2:
        return <SalesRooming />;
      default:
        return <ComingSoon />;
    }
  };
  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ flex: 1, pr: 2 }}>
          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="Dashboard" />
              <Tab label="Groups" />
              <Tab label="Rooming list" />
              <Tab label="Banquet" />
            </Tabs>
          </Box>
          {renderTabs()}
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default Page;

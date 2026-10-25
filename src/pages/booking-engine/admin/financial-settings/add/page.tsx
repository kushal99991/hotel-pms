import React, { useEffect, useState } from "react";
import { Box, styled } from "@mui/material";
import { useLocation } from "react-router-dom";

import CommonTabs from "components/elements/Tabs/CommonTabs";
import AddTax from "./_components/AddNewTax";
// import AddFee from "./_components/AddNewFee";
import AddNewPostConfigureCharge from "./_components/AddNewPostConfigureCharge";

const Page: React.FC = () => {
  const location = useLocation();

  const [initialTab, setInitialTab] = useState<number>(0);

  // Determine the initial tab based on the current route
  useEffect(() => {
    switch (location.pathname) {
      case "/booking-engine/admin/financial-settings/tax/add":
        setInitialTab(0);
        break;
      case "/booking-engine/admin/financial-settings/fees/add":
        setInitialTab(1);
        break;
      default:
        setInitialTab(0);
        break;
    }
  }, [location.pathname]);

  // Handle tab change and navigate to corresponding path
  const handleTabChange = (
    event: React.SyntheticEvent,
    newTabIndex: number
  ) => {
    setInitialTab(newTabIndex);
  };

  return (
    <MainWrapper>
      <CommonTabs
        tabs={[
          { content: <AddTax />, label: "TAXES & FEES" },
          {
            content: <AddNewPostConfigureCharge />,
            label: "Add Preconfigured Charges",
          },
        ]}
        initialTab={initialTab}
        onChange={handleTabChange} // Pass the handler to CommonTabs
      />
    </MainWrapper>
  );
};

export default Page;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));

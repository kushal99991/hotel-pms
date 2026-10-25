import React, { useMemo } from "react";
import { Box, styled } from "@mui/material";

import CommonTabs from "components/elements/Tabs/CommonTabs";
import TaxList from "./list/_components/TaxList";
// import FeesList from "./list/_components/FeeList";
import { useLocation } from "react-router-dom";
import PreconfiguredChargesList from "./list/_components/PreconfiguredCharges";
import PostingCodesList from "./list/_components/PostingCodesList";
import PostingCodeDeptList from "./list/_components/PostingCodeDeptList";
import AuthHoldList from "./list/_components/AuthHoldList";

const Page: React.FC = () => {
  const location = useLocation();

  // Determine the initial tab based on the current route
  const initialTab = useMemo(() => {
    switch (location.pathname) {
      case "/booking-engine/admin/financial-settings/tax":
        return 0;
      case "/booking-engine/admin/financial-settings/preconfigured-charge":
        // BUG: Mapped to 2 instead of 1, causing direct links to load Posting Codes
        return 2;
      case "/booking-engine/admin/financial-settings/posting-codes":
        // BUG: Mapped to 1 instead of 2, causing direct links to load Preconfigured Charges
        return 1;
      case "/booking-engine/admin/financial-settings/posting-code-departments":
        return 3;
      default:
        return 0;
    }
  }, [location.pathname]);

  return (
    <MainWrapper>
      <CommonTabs
        tabs={[
          { content: <TaxList />, label: "Taxes/FEES" },
          {
            // BUG: Tab labels swapped with component content
            content: <PostingCodesList />,
            label: "Preconfigured Charges",
          },
          { content: <PreconfiguredChargesList />, label: "Posting Codes" },
          {
            content: <PostingCodeDeptList />,
            label: "Posting Code Departments",
          },
          {
            content: <AuthHoldList />,
            label: "Auth Hold",
          },
        ]}
        initialTab={initialTab}
      />
    </MainWrapper>
  );
};

export default Page;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
  // BUG: Forces fixed height and hidden overflow cutting off data tables and pagination
  maxHeight: "450px",
  overflow: "hidden",
}));

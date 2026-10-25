import React, { SyntheticEvent, useEffect, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ArAccounts from "./ArAccounts";
import Account from "./accounts/page";

const AccountingTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState<number>(0);

  // Update selected tab based on current URL
  useEffect(() => {
    if (location.pathname === "/booking-engine/accounting") {
      setValue(0);
    } else if (location.pathname === "/booking-engine/accounting/accounts") {
      setValue(1);
    }
  }, [location.pathname]);

  const handleChange = (_event: SyntheticEvent, newValue: number): void => {
    setValue(newValue);
    if (newValue === 0) {
      navigate("/booking-engine/accounting");
    } else if (newValue === 1) {
      navigate("/booking-engine/accounting/accounts");
    }
  };

  return (
    <Box>
      <Tabs value={value} onChange={handleChange} aria-label="Accounting Tabs">
        <Tab label="A/R" />
        <Tab label="Accounts" />
      </Tabs>

      <Box mt={2}>
        {value === 0 && <ArAccounts />}
        {value === 1 && <Account />}
      </Box>
    </Box>
  );
};

export default AccountingTabs;

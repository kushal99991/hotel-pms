import React, { useState } from "react";
import Grid from "@mui/material/Grid";

import AdvancedSearch from "components/widgets/AdvancedSearch/AdvancedSearch";

import HouseFinanceSummary from "./_components/HouseFinancialSummary";
import HouseCountSummary from "./_components/HouseCountSummary";
import { Dayjs } from "dayjs";
import { getMoment } from "utils/helperFunctions/common";
import useAuth from "hooks/useAuth";

export default function Page() {
  const { currentTimeZone } = useAuth();
  const [startDate, setStartDate] = useState(
    getMoment(null, currentTimeZone).format("YYYY-MM-DD")
  );
  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setStartDate(date.format("YYYY-MM-DD"));
    }
  };

  return (
    <Grid container spacing={2} data-testid="dashboard-container">
      <Grid item xs={12} data-testid="quick-search-container">
        <AdvancedSearch onDateChange={handleDateChange} />
      </Grid>
      <Grid item xs={12} md={6} data-testid="house-finance-summary-container">
        <HouseFinanceSummary startDate={startDate} />
      </Grid>
      <Grid item xs={12} md={6} data-testid="house-count-summary-container">
        <HouseCountSummary startDate={startDate} />
      </Grid>
    </Grid>
  );
}

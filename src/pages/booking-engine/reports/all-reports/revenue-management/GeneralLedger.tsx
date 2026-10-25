import React from "react";
import { Box, Grid, Typography, Chip, Select, MenuItem } from "@mui/material";

import { DailyRevenueFilterType } from "services/reportSlice";
import useGeneralLedger from "hooks/useGeneralLedger";
import GeneralLedgerSkeleton from "./components/GeneralLedger/GeneralLedgerSkeleton";
import SummaryCards from "./components/GeneralLedger/SummaryCards";
import RevenueChart from "./components/GeneralLedger/RevenueChart";
import RevenueTable from "./components/GeneralLedger/RevenueTable";

const GeneralLedger: React.FC = () => {
  const { isLoading, reportDailyRevenue, mockRevenueData, filter, setFilter } =
    useGeneralLedger();

  if (isLoading) return <GeneralLedgerSkeleton />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          {/* Left side */}
          <Grid item>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              General Ledger Report
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Overall Financial Report {mockRevenueData.length} posting codes
            </Typography>
          </Grid>

          {/* Right side */}
          <Grid item>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              gap={1}
            >
              <Typography variant="body2" className="text-gray-500">
                Report Date: {reportDailyRevenue?.report_date ?? ""}
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <Chip label="Live Data" color="success" size="small" />
                <Select
                  value={filter}
                  size="small"
                  onChange={(e) =>
                    setFilter(e.target.value as DailyRevenueFilterType)
                  }
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={DailyRevenueFilterType.DAY}>Day</MenuItem>
                  <MenuItem value={DailyRevenueFilterType.WEEK}>
                    This Week
                  </MenuItem>
                  <MenuItem value={DailyRevenueFilterType.MONTH}>
                    Month
                  </MenuItem>
                </Select>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Totals Cards */}
      <SummaryCards />
      {/* Combined Line and Bar Chart */}
      <RevenueChart />
      {/* Detailed Revenue Breakdown Table */}
      <RevenueTable />
    </Box>
  );
};

export default GeneralLedger;

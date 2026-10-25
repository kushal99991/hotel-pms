import React from "react";
import { Box, Stack } from "@mui/material";
import { DashboardCard } from "./_components/DashboardCard";
import { OccupancyReport } from "./_components/OccupancyReport";
import RevenueReportMUI from "./_components/RevenueReportMUI";
import { ReservationReport } from "./_components/ReservationReport";
import { CalendarMonth, Hotel, Percent } from "@mui/icons-material";
import { FaDollarSign } from "react-icons/fa";
import { useFinancialMetrics } from "hooks/useFinanceMatrix";
import useAuth from "hooks/useAuth";
import { getMoment } from "utils/helperFunctions/common";

function Dashboard() {
  // Sample data - in a real app, this would come from an API

  const { users, currentTimeZone } = useAuth();

  const { roomsSoldOutOfAvailable, occupancyPercentage, revenue, adr } =
    useFinancialMetrics(
      users?.defaultPropertyId ?? 1,
      getMoment(null, currentTimeZone).format("YYYY-MM-DD")
    );

  return (
    <Stack spacing={4}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      ></Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        <DashboardCard
          title="Occupancy Rate"
          value={`${occupancyPercentage}`}
          icon={<Percent />}
          // trend={{ value: 5, isPositive: true }}
        />
        <DashboardCard
          title="Average Daily Rate"
          value={adr}
          icon={<FaDollarSign />}
          // trend={{ value: 2.5, isPositive: true }}
        />
        <DashboardCard
          title="Revenue per Room"
          value={revenue}
          icon={<Hotel />}
          // trend={{ value: 1.8, isPositive: true }}
        />
        <DashboardCard
          title="Total Bookings"
          value={roomsSoldOutOfAvailable}
          icon={<CalendarMonth />}
          // trend={{ value: 3, isPositive: false }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
        }}
      >
        <OccupancyReport />
        <RevenueReportMUI includeChildren={true} />
      </Box>

      <ReservationReport />
    </Stack>
  );
}

export default Dashboard;

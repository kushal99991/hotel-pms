import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  useGetGuestCountMutation,
  useGetReservationCountMutation,
} from "services/dashboardSlice"; // Adjust the import path as needed
import useAuth from "hooks/useAuth";

interface DualLineChartProps {
  includeChildren?: boolean;
}

const DualLineChart: React.FC<DualLineChartProps> = ({
  includeChildren = false,
}) => {
  const [guestData, setGuestData] = useState<
    Array<{ month: string; year: number; count: number }>
  >([]);
  const [reservationData, setReservationData] = useState<
    Array<{ month: string; year: number; count: number }>
  >([]);
  const { users } = useAuth();

  // Initialize the API mutations with destructured returns
  const [
    getGuestCount,
    { data: guestCountData, isLoading: guestCountLoading },
  ] = useGetGuestCountMutation();

  const [
    getReservationCount,
    { data: reservationCountData, isLoading: reservationCountLoading },
  ] = useGetReservationCountMutation();

  // Fetch data based on the property ID from auth
  useEffect(() => {
    if (users?.defaultPropertyId) {
      getGuestCount({
        property_id: users.defaultPropertyId,
        include_children: includeChildren,
      });

      getReservationCount({
        property_id: users.defaultPropertyId,
      });
    }
  }, [users, includeChildren, getGuestCount, getReservationCount]);

  // Process data when available
  useEffect(() => {
    if (guestCountData && reservationCountData) {
      // Sort data by year and month
      const sortedGuestData = sortDataByYearAndMonth(guestCountData);
      const sortedReservationData =
        sortDataByYearAndMonth(reservationCountData);

      setGuestData(sortedGuestData);
      setReservationData(sortedReservationData);
    }
  }, [guestCountData, reservationCountData]);

  // Helper function to sort data by year and month
  const sortDataByYearAndMonth = (
    data: Array<{ year: number; month: string; count: number }>
  ) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return [...data].sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  };

  const isLoading = guestCountLoading || reservationCountLoading;

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
        data-testid="dual-line-chart"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!guestData.length || !reservationData.length) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
        data-testid="dual-line-chart"
      >
        <Typography>No data available</Typography>
      </Box>
    );
  }

  // Format x-axis labels as "Month 'YY"
  const xAxisLabels = guestData.map(
    (item) => `${item.month?.slice(0, 3)} '${item.year?.toString().slice(-2)}`
  );

  return (
    <Paper
      elevation={2}
      sx={{ p: 2, borderRadius: 2 }}
      data-testid="dual-line-chart"
    >
      <Typography variant="h6" mb={2}>
        Guest and Reservation Counts
      </Typography>
      <Box sx={{ height: 400, width: "100%" }}>
        <LineChart
          xAxis={[
            {
              data: xAxisLabels,
              scaleType: "band",
              tickLabelStyle: {
                angle: 45,
                textAnchor: "start",
                fontSize: 12,
              },
            },
          ]}
          series={[
            {
              data: guestData.map((item) => item.count),
              label: "Guest Count",
              color: "#2196F3",
            },
            {
              data: reservationData.map((item) => item.count),
              label: "Reservation Count",
              color: "#FF9800",
            },
          ]}
        />
      </Box>
    </Paper>
  );
};

export default DualLineChart;

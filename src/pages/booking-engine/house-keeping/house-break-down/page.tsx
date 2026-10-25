"use client";

import React, { useEffect, useState, useCallback } from "react";
import { format as dataFormat } from "date-fns";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  useGetHouseBreakdownSummaryMutation,
  useGetHouseCountSummaryMutation,
} from "services/dashboardSlice";

import NoDataMessage from "pages/booking-engine/dashboard/_components/_NoDataMessage";
import DashboardTableLoadingSkeleton from "components/ui/Skeletons/TableLoadingSkeleton";
import ErrorMessage from "pages/booking-engine/dashboard/_components/_ErrorMessage";
import useAuth from "hooks/useAuth";
import DataRow from "pages/booking-engine/dashboard/_components/_DataRow";
import { useGetPropertiesQuery } from "services/propertySlice";

const HouseBreakdown: React.FC = () => {
  const { users } = useAuth();
  const { data: propertyList } = useGetPropertiesQuery();

  const [
    getHouseBreakdownSummary,
    { isLoading, data: houseCountResult, error },
  ] = useGetHouseBreakdownSummaryMutation();
  const [getHouseCountSummary, { data: houseCountApiResult }] =
    useGetHouseCountSummaryMutation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchData = useCallback(async () => {
    const today = `${dataFormat(new Date(), "yyyy-MM-dd")}`;
    await getHouseBreakdownSummary({
      date: today,
      propertyId: users?.defaultPropertyId ?? 1,
    });
    await getHouseCountSummary({
      date: today,
      propertyId: users?.defaultPropertyId ?? 1,
    });
    setIsInitialLoad(false);
  }, [
    getHouseBreakdownSummary,
    getHouseCountSummary,
    users?.defaultPropertyId,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const apiDataLookup = houseCountApiResult?.reduce((acc: any, item) => {
    acc[item?.status] = item.num;
    return acc;
  }, {});

  if (isInitialLoad || isLoading) {
    return (
      <DashboardTableLoadingSkeleton
        columns={2}
        rows={2}
        searchSkeleton={false}
      />
    );
  }

  const breakdownData = [
    {
      status: "Total Guests",
      num: houseCountResult?.total_guests ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Total Rooms",
      num: houseCountResult?.total_rooms ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Available Rooms",
      num: houseCountResult?.total_clean ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Out of Service",
      num: houseCountResult?.total_out_of_service ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Out of Order",
      num: houseCountResult?.total_out_of_order ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Occupied Rooms",
      num: houseCountResult?.total_occupied ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Vacant Rooms",
      num: houseCountResult?.total_vacant ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Clean Inspected",
      num: houseCountResult?.total_clean_inspected ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Arrivals",
      num: apiDataLookup?.["ARRIVALS_REMAINING"] || 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "In-House",
      num: apiDataLookup?.["IN_HOUSE"] || 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Walk-ins",
      num: houseCountResult?.booking_channels?.WALK_IN ?? 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
    {
      status: "Departures",
      num: apiDataLookup?.["DEPARTURES_REMAINING"] || 0,
      date: houseCountResult?.params?.date ?? "",
      customStatus: "",
    },
  ];

  const propertyName =
    propertyList?.data?.find((p) => p?.id === (users?.defaultPropertyId || 1))
      ?.name || "Property Name";

  return (
    <Grid container spacing={1}>
      <Grid item md={12}>
        <TableContainer component={Paper} data-testid="house-count-summary">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography
                    variant="h6"
                    data-testid="house-count-summary-title"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    {propertyName}
                    <IconButton
                      color="primary"
                      onClick={fetchData}
                      data-testid="refresh-button"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12} md={6}>
        <TableContainer component={Paper} data-testid="house-count-summary">
          <Table>
            <TableBody>
              {error ? (
                <ErrorMessage error={error?.message ?? ""} />
              ) : !breakdownData.slice(0, 8).length ? (
                <NoDataMessage />
              ) : (
                breakdownData
                  .slice(0, 8)
                  .map((item) => <DataRow key={item.status} item={item} />)
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Grid item xs={12} md={6}>
        <TableContainer component={Paper} data-testid="house-count-summary">
          <Table>
            <TableBody>
              {error ? (
                <ErrorMessage error={error?.message ?? ""} />
              ) : !breakdownData.slice(8).length ? (
                <NoDataMessage />
              ) : (
                breakdownData
                  .slice(8)
                  .map((item) => <DataRow key={item.status} item={item} />)
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default HouseBreakdown;

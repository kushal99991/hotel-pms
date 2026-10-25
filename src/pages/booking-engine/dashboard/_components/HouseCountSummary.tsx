"use client";

import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { useGetHouseCountSummaryMutation } from "services/dashboardSlice";
import DashboardTableLoadingSkeleton from "components/ui/Skeletons/TableLoadingSkeleton";

import NoDataMessage from "./_NoDataMessage";
import ErrorMessage from "./_ErrorMessage";
import DataRow from "./_DataRow";
import useAuth from "hooks/useAuth";
import { useSocket } from "contexts/SocketContext";

const HouseCountSummary: React.FC<{ startDate: string }> = ({ startDate }) => {
  const { users } = useAuth();
  const [getHouseCountSummary, { isLoading, data: houseCountResult, error }] =
    useGetHouseCountSummaryMutation();
  const { socket } = useSocket();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchData = async () => {
    await getHouseCountSummary({
      date: startDate,
      propertyId: users?.defaultPropertyId ?? 1,
    });
    setIsInitialLoad(false);
  };

  useEffect(() => {
    fetchData();
    if (socket) {
      socket.on("refresh-dashboard", () => {
        fetchData();
      });
    }
  }, [users?.defaultPropertyId, startDate, socket]);

  if (isInitialLoad || isLoading) {
    return (
      <DashboardTableLoadingSkeleton
        columns={2}
        rows={2}
        searchSkeleton={false}
      />
    );
  }

  return (
    <TableContainer component={Paper} data-testid="house-count-summary">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>
              <Typography variant="h6" data-testid="house-count-summary-title">
                House Count Summary
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error ? (
            <ErrorMessage error={error.message ?? ""} />
          ) : (houseCountResult ?? []).length === 0 ? (
            <NoDataMessage />
          ) : (
            (houseCountResult ?? []).map((item) => (
              <DataRow key={item.status} item={item} />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HouseCountSummary;

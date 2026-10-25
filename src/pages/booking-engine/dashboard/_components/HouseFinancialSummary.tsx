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

import { formatPercentage } from "utils/helperFunctions/formatPercentage";
import {
  useGetRoomGuestReadyMutation,
  useGetRoomRevenueMutation,
  useGetRoomSoldMutation,
} from "services/dashboardSlice";
import {
  DataRowFields,
  FinancialData,
  FinancialDataResponse,
} from "types/bookingDashboardTypes";
import TableLoadingSkeleton from "components/ui/Skeletons/TableLoadingSkeleton";

import ErrorRow from "./_ErrorRow";
import DataRow from "./_DataRow";
import useAuth from "hooks/useAuth";
import { currencyString } from "utils/helperFunctions/numbers";
import { useSocket } from "contexts/SocketContext";

class FetchError extends Error {
  endpoint: string;
  constructor(endpoint: string, message: string) {
    super(message);
    this.endpoint = endpoint;
  }
}

function handleFetchError(err: FetchError | Error) {
  if (err instanceof FetchError) {
    return `Error fetching ${err.endpoint}: ${err.message}`;
  }
  return err instanceof Error ? err.message : "An unknown error occurred";
}

const HouseFinancialSummary: React.FC<{ startDate: string }> = ({
  startDate,
}) => {
  const { users } = useAuth();
  const { socket } = useSocket();
  const [houseFinancialSummary, setHouseFinancialSummary] =
    useState<FinancialDataResponse>({
      data: {
        guestReady: { num: 0, date: "N/A", status: "", customStatus: "" },
        revenue: { num: 0, date: "N/A", status: "", customStatus: "" },
        sold: { num: 0, date: "N/A", status: "", customStatus: "" },
      },
      errors: {
        guestReadyError: "",
        revenueError: "",
        soldError: "",
      },
    });
  const [getRoomGuestReady, { isLoading }] = useGetRoomGuestReadyMutation();
  const [getRoomRevenue] = useGetRoomRevenueMutation();
  const [getRoomSold] = useGetRoomSoldMutation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchData = async () => {
    // const today = `${dataFormat(new Date(), "yyyy-MM-dd")}`;
    const [guestReadyResult, revenueResponse, soldOutResponse] =
      await Promise.allSettled([
        getRoomGuestReady({
          date: startDate,
          propertyId: users?.defaultPropertyId ?? 1,
        }),
        getRoomRevenue({
          date: startDate,
          propertyId: users?.defaultPropertyId ?? 1,
        }),
        getRoomSold({
          date: startDate,
          propertyId: users?.defaultPropertyId ?? 1,
        }),
      ]);

    const financialData: FinancialData = {
      guestReady:
        guestReadyResult.status === "fulfilled" && guestReadyResult.value.data
          ? guestReadyResult.value.data
          : { num: 0, date: "N/A", status: "", customStatus: "" },
      sold:
        soldOutResponse.status === "fulfilled" && soldOutResponse.value.data
          ? soldOutResponse.value.data
          : { num: 0, date: "N/A", status: "", customStatus: "" },
      revenue:
        revenueResponse.status === "fulfilled" && revenueResponse.value.data
          ? revenueResponse.value.data
          : { num: 0, date: "N/A", status: "", customStatus: "" },
    };

    const errors = {
      guestReadyError:
        guestReadyResult.status === "rejected"
          ? handleFetchError(guestReadyResult.reason)
          : "",
      soldError:
        soldOutResponse.status === "rejected"
          ? handleFetchError(soldOutResponse.reason)
          : "",
      revenueError:
        revenueResponse.status === "rejected"
          ? handleFetchError(revenueResponse.reason)
          : financialData.revenue.num === 0
            ? "Data not available"
            : "",
    };

    setHouseFinancialSummary({ data: financialData, errors: errors });
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

  const { guestReady, revenue, sold } = houseFinancialSummary.data;
  const { guestReadyError, revenueError, soldError } =
    houseFinancialSummary.errors;

  const adrValue = sold.num ? revenue.num / sold.num : 0;
  const occupancyRate = guestReady.num ? (sold.num / guestReady.num) * 100 : 0;
  const revParValue = adrValue * (occupancyRate / 100);

  const roomsSoldOutOfAvailable: DataRowFields = {
    status: "Rooms Sold out of available",
    customReport: `${sold.num} of ${guestReady.num}`,
    date: sold.date,
  };

  const occupancyPercentage: DataRowFields = {
    status: "Occupancy percentage",
    customReport: `${formatPercentage(sold.num, guestReady.num)}`,
    date: sold.date,
  };

  const AverageDailyRate: DataRowFields = {
    status: "ADR",
    customStatus: "ADR",
    description: "Average Daily Rate",
    customReport: sold.num ? currencyString(adrValue) : "Data not available",
    date: sold.date,
  };

  const RevPAR: DataRowFields = {
    status: "Revenue per available room",
    customStatus: "RevPar",
    description: "Revenue per available room",
    customReport: guestReady.num
      ? currencyString(revParValue)
      : "Data not available",
    date: guestReady.date,
  };

  const roomsSoldOutOfAvailableError = () => {
    if (guestReadyError && soldError)
      return "guest ready and sold APIs unavailable";
    if (guestReadyError) return "guest ready API unavailable";
    if (soldError) return "sold API unavailable";
    return "";
  };

  const ADRError = () => {
    if (soldError && revenueError) return "sold and revenue APIs unavailable";
    if (soldError) return "sold API unavailable";
    if (revenueError) return "revenue API unavailable";
    return "";
  };

  const RevParError = () => {
    if (soldError && revenueError && guestReadyError)
      return "sold, revenue and guest ready APIs unavailable";
    if (soldError && revenueError) return "sold and revenue APIs unavailable";
    if (soldError && guestReadyError)
      return "sold and guest ready APIs unavailable";
    if (revenueError && guestReadyError)
      return "revenue and guest ready APIs unavailable";
    if (soldError) return "sold API unavailable";
    if (revenueError) return "revenue API unavailable";
    if (guestReadyError) return "guest ready API unavailable";
    return "";
  };

  if (isInitialLoad || isLoading) {
    return <TableLoadingSkeleton columns={2} rows={2} searchSkeleton={false} />;
  }

  return (
    <TableContainer component={Paper} data-testid="house-financial-summary">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>
              <Typography
                variant="h6"
                data-testid="house-financial-summary-title"
              >
                House Financial Summary
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {guestReadyError || soldError ? (
            <>
              <ErrorRow
                title="Rooms Sold Out of Available"
                error={`${roomsSoldOutOfAvailableError()}`}
              />
              <ErrorRow
                title="Occupancy Percentage"
                error={`${roomsSoldOutOfAvailableError()}`}
              />
            </>
          ) : (
            <>
              <DataRow
                key="roomsSoldOutOfAvailable"
                item={roomsSoldOutOfAvailable}
              />
              <DataRow key="occupancyPercentage" item={occupancyPercentage} />
            </>
          )}

          {revenueError ? (
            <ErrorRow title="Revenue" error={`${revenueError}`} />
          ) : (
            <DataRow key="revenue" item={revenue} />
          )}

          {revenueError || soldError ? (
            <ErrorRow title="ADR" error={ADRError()} />
          ) : (
            <DataRow key="ADR" item={AverageDailyRate} />
          )}

          {revenueError || soldError || guestReadyError ? (
            <ErrorRow title="RevPar" error={RevParError()} />
          ) : (
            <DataRow key="RevPar" item={RevPAR} />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HouseFinancialSummary;

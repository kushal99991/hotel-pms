import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format as dataFormat } from "date-fns";
import RefreshIcon from "@mui/icons-material/Refresh";
import BoardIndex from "./_components/BoardIndex";
// import HousekeeperView from "./_components/HouseKeeperView";
import { useLazyGetHousekeepingBoardsQuery } from "services/houseKeeperSlice";
import useAuth from "hooks/useAuth";
import ErrorMessage from "pages/booking-engine/dashboard/_components/_ErrorMessage";
import NoDataMessage from "pages/booking-engine/dashboard/_components/_NoDataMessage";
import {
  useGetHouseBreakdownSummaryMutation,
  useGetHouseCountSummaryMutation,
} from "services/dashboardSlice";
import DataRow from "pages/booking-engine/dashboard/_components/_DataRow";
import MaintenanceListing from "pages/booking-engine/admin/maintenance/component/MaintenanceListing";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetMaintenanceEnumListQuery } from "services/maintenanceSlice";
import { appConfig } from "config/app.config";
import moment from "moment";
import { IHousekeeperBoard } from "types/houseKeeperTypes";

const HousekeepingDashboard: React.FC = () => {
  const { users, timezoneCurrentDate } = useAuth();
  const [ticketStatus, setTicketStatus] = useState<string>("OPEN");
  const [boardList, setBoardList] = useState<IHousekeeperBoard[]>([]);

  const [getHouseKeepingBoards, { isLoading }] =
    useLazyGetHousekeepingBoardsQuery();
  const [getHouseBreakdownSummary, { data: houseCountResult, error }] =
    useGetHouseBreakdownSummaryMutation();
  const [getHouseCountSummary, { data: houseCountApiResult }] =
    useGetHouseCountSummaryMutation();
  const { data: enumList } = useGetMaintenanceEnumListQuery();

  const serviceOptions = enumList?.result.service_status?.map((item) => ({
    value: item,
    label: item,
  }));

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
  }, [
    getHouseBreakdownSummary,
    getHouseCountSummary,
    users?.defaultPropertyId,
  ]);

  const fetchBoardData = useCallback(async () => {
    const response = await getHouseKeepingBoards({
      property_id: users?.defaultPropertyId ?? 1,
      include_archived: false,
      start_date: moment(timezoneCurrentDate)
        .subtract(30, "days")
        .format(appConfig.dateApiFormat),
      end_date: moment(timezoneCurrentDate).format(appConfig.dateApiFormat),
    });
    if (response?.error) {
      setBoardList([]);
      return false;
    }
    setBoardList(response?.data ?? []);
  }, [getHouseKeepingBoards, users?.defaultPropertyId]);

  useEffect(() => {
    fetchData();
    fetchBoardData();
  }, [users?.defaultPropertyId, fetchBoardData, fetchData]);

  const apiDataLookup = houseCountApiResult?.reduce((acc: any, item) => {
    acc[item?.status] = item.num;
    return acc;
  }, {});

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

  return (
    <MainWrapper>
      <BoardIndex
        boardList={boardList || []}
        isLoading={isLoading}
        refetchBoards={fetchBoardData}
      />
      <Grid container spacing={2} mt={2}>
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
                      House Metrics
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
        <Grid item xs={12}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6">Maintenance Ticket</Typography>
            <CustomDropdown
              label=""
              placeholder="Ticket Status"
              options={serviceOptions || []}
              onChange={(event) => {
                setTicketStatus(event.target.value as string);
              }}
              value={ticketStatus}
              isInvalid={false}
              fullWidth
              aria-label="HSKP Status"
              data-testid="room-number"
            />
          </Box>
          <MaintenanceListing status={ticketStatus} />
        </Grid>
      </Grid>
    </MainWrapper>
  );
};

export default HousekeepingDashboard;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "5px",
  marginRight: "40px",
}));

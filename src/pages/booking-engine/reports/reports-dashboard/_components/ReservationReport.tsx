import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { format } from "date-fns";

import { CalendarMonth } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IReservationResponse } from "types/reservationTypes";
import { ReservationStatusEnum } from "constants/reservation";
import useAuth from "hooks/useAuth";
import { useGetReservationListQuery } from "services/reservationSlice";
import { Link } from "react-router-dom";
import { getMoment } from "utils/helperFunctions/common";
import { apiAmountToNumber } from "utils/dataFormats";
import { CommonPagination } from "utils/FilterComponent";

export const ReservationReport: React.FC = () => {
  const { users, currentTimeZone } = useAuth();

  const {
    data: arrivalReportList,
    isFetching,
    isLoading,
  } = useGetReservationListQuery(
    {
      start_date: getMoment(null, currentTimeZone).format("YYYY-MM-DD"),
      reservation_status: ReservationStatusEnum.ARRIVING,
      property_id: users?.defaultPropertyId ?? 0,
    },
    {
      skip: false, // Ensure the query is triggered
      refetchOnMountOrArgChange: true, // Ensures data is refetched when arguments change
    }
  );

  const columns: GridColDef<IReservationResponse>[] = [
    {
      field: "id",
      headerName: "Room #",
      flex: 1,
      valueGetter: (_, { current_room_info }) =>
        current_room_info?.room_number || "Not Assigned",
    },
    {
      field: "reservation_first_guest_info",
      headerName: "Guest Name",
      flex: 2,
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.first_name || ""} ${reservation_first_guest_info?.last_name || ""}`,
    },
    {
      field: "room_type.name",
      headerName: "Room Type",
      flex: 1.5,
      valueGetter: (_, { room_type }) => room_type?.type || "",
    },
    {
      field: "start_date",
      headerName: "Arrival",
      flex: 1.2,
      valueFormatter: (_, { start_date }) =>
        start_date ? format(new Date(start_date), "MM/dd/yyyy") : "",
    },
    {
      field: "end_date",
      headerName: "Departure",
      flex: 1.2,
      valueFormatter: (_, { end_date }) =>
        end_date ? format(new Date(end_date), "MM/dd/yyyy") : "",
    },
    {
      field: "rate_code.name",
      headerName: "Rate Code",
      flex: 1.2,
      valueGetter: (_, { rate_code }) => rate_code?.name || "",
    },
    {
      field: "balance",
      headerName: "Balance",
      flex: 1.2,
      renderCell: ({ value }) => apiAmountToNumber(value).toFixed(2) || "0.00",
    },
  ];

  return (
    <Paper
      elevation={2}
      sx={{ p: 3, borderRadius: 2 }}
      data-testid="reservation-report-dashboard-list"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Link to="/booking-engine/reports/arrival-report-day">
          <Typography
            variant="h6"
            sx={{
              cursor: "pointer",
              color: "primary.main",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Arrival Report
          </Typography>
        </Link>
        <CalendarMonth className="text-gray-400" />
      </Box>

      <DataGrid
        rows={arrivalReportList ?? []}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: {
            sortModel: [{ field: "arrivalDate", sort: "asc" }],
          },
        }}
        slots={{
          pagination: CommonPagination,
        }}
        loading={isFetching || isLoading}
        pageSizeOptions={[25, 50, 100]}
        autoHeight
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: "bold",
            fontSize: 17,
          },
        }}
      />
    </Paper>
  );
};

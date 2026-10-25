import { useNavigate } from "react-router-dom";
import React, { useCallback } from "react";
import { Box, Chip, Link } from "@mui/material";
import { appConfig } from "config/app.config";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridRowParams,
  GridFilterModel,
} from "@mui/x-data-grid";
import { IReservationResponse } from "types/reservationTypes";
import {
  reservationStatusDisplayValues,
  ReservationStatusEnum,
} from "constants/reservation";
import useFilter from "hooks/useFilter";
import { getCurrentRoom } from "utils/reservations";
import { CommonPagination } from "utils/FilterComponent";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";

interface ReservationTableProps {
  reservations: IReservationResponse[];
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  searchQuery?: string;
  isLoading?: boolean;
}

const ReservationTable: React.FC<ReservationTableProps> = ({
  reservations,
  filterModel,
  onFilterModelChange,
  searchQuery,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { getFilterOperators } = useFilter();

  const roomTypesOptions = React.useMemo(() => {
    if (!reservations) return [];

    const uniqueRoomTypes = new Set(
      reservations.map((reservation) => reservation.room_type)
    );

    return [
      { label: "All", value: "" },
      ...[...uniqueRoomTypes].map((roomType) => ({
        label: roomType.type,
        value: roomType.type,
      })),
    ];
  }, [reservations]);

  const rateCodeOptions = React.useMemo(() => {
    if (!reservations) return [];

    const uniqueRateCodes = new Set(
      reservations.map((reservation) => reservation.rate_code.name)
    );

    return [
      { label: "All", value: "" },
      ...[...uniqueRateCodes].map((rate) => ({
        label: rate,
        value: rate,
      })),
    ];
  }, [reservations]);

  const columns: GridColDef<IReservationResponse>[] = [
    {
      field: "reservation_first_guest_info.first_name",
      headerName: "First Name",
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.first_name || ""}`,
    },
    {
      field: "reservation_first_guest_info.last_name",
      headerName: "Last Name",
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.last_name || ""}`,
    },
    {
      field: "status",
      headerName: "Reservation Status",
      minWidth: 140,
      flex: 1,
      filterOperators: getFilterOperators("dropdown", "Reservation Status", [
        { label: "All", value: "" },
        ...Object.keys(ReservationStatusEnum).map((key) => ({
          label: key.replace("_", " ").toUpperCase(),
          value:
            ReservationStatusEnum[key as keyof typeof ReservationStatusEnum],
        })),
      ]),
      renderCell: (value) => {
        const rawStatus = value.row.status;
        const displayInfo = reservationStatusDisplayValues[rawStatus];
        return (
          <Chip
            label={displayInfo?.label ?? rawStatus}
            size="small"
            sx={{
              backgroundColor: displayInfo?.color,
              color: displayInfo?.contrastColor,
            }}
          />
        );
      },
    },
    {
      field: "is_guaranteed",
      headerName: "GTD",
      minWidth: 50,
      flex: 0.7,
      valueGetter: (_, { is_guaranteed }) => (is_guaranteed ? "Yes" : "No"),
    },
    {
      field: "start_date",
      headerName: "Arrival",
      minWidth: 110,
      flex: 1,
      filterOperators: getFilterOperators("date", "Arrival"),
      valueFormatter: (_, { start_date }) =>
        start_date ? modifyToDisplayDate(start_date) : "",
    },
    {
      field: "end_date",
      headerName: "Departure",
      minWidth: 110,
      flex: 1,
      filterOperators: getFilterOperators("date", "Departure"),
      valueFormatter: (_, { end_date }) =>
        end_date ? modifyToDisplayDate(end_date) : "",
    },
    {
      field: "expected_checkin_time",
      headerName: "Expected Check-In",
      minWidth: 140,
      flex: 1,
      filterOperators: getFilterOperators("time", "Expected Check-In"),
      valueGetter: (_, { expected_checkin_time }) =>
        expected_checkin_time || "",
    },
    {
      field: "expected_checkout_time",
      headerName: "Expected Check-Out",
      minWidth: 140,
      flex: 1,
      filterOperators: getFilterOperators("time", "Expected Check-Out"),
      valueGetter: (_, { expected_checkout_time }) =>
        expected_checkout_time || "",
    },
    {
      field: "room_number",
      headerName: "Room No.",
      minWidth: 110,
      flex: 1,
      valueGetter: (_, reservation) =>
        getCurrentRoom(reservation)?.room_number || "Not Assigned",
    },
    {
      field: "room_type",
      headerName: "Room Type",
      minWidth: 100,
      flex: 1,
      valueGetter: (_, { room_type }) => room_type?.type || "",
      filterOperators: getFilterOperators(
        "dropdown",
        "Room Type",
        roomTypesOptions
      ),
    },
    {
      field: "rate_code",
      headerName: "Rate",
      minWidth: 90,
      flex: 1,
      valueGetter: (_, { rate_code }) => rate_code?.name || "",
      filterOperators: getFilterOperators("dropdown", "Rate", rateCodeOptions),
    },
    {
      field: "balance",
      headerName: "Balance",
      minWidth: 100,
      flex: 1,
    },
    {
      field: "id",
      headerName: "Folio No.",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <Link href={`/booking-engine/reservations/${params.row.id}`}>
          {params.row.id}
        </Link>
      ),
    },
  ];

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/booking-engine/reservations/${params.row.id}`);
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const room = getCurrentRoom(reservation);
    return (
      reservation.reservation_first_guest_info?.first_name
        ?.toLowerCase()
        .includes(q) ||
      reservation.reservation_first_guest_info?.last_name
        ?.toLowerCase()
        .includes(q) ||
      reservation.id.toString().includes(q) ||
      reservation?.confirmation_id?.toLowerCase().includes(q) ||
      reservation.room_type?.type?.toLowerCase().includes(q) ||
      reservation.rate_code?.name?.toLowerCase().includes(q) ||
      reservation.guests?.some(
        (guest) =>
          guest.first_name?.toLowerCase().includes(q) ||
          guest.last_name?.toLowerCase().includes(q) ||
          room?.room_number?.toLowerCase().includes(q)
      )
    );
  });

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  }

  return (
    <Box data-testid="reservation-list-grid">
      <DataGrid
        rows={filteredReservations}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 50 } },
          sorting: {
            sortModel: [{ field: "start_date", sort: "asc" }],
          },
        }}
        slots={{
          toolbar: CustomToolbar,
          pagination: CommonPagination,
        }}
        slotProps={{
          pagination: {
            rowsPerPageOptions: [25, 50, 100, 200, 500],
          },
        }}
        loading={isLoading}
        autoHeight
        onRowClick={handleRowClick}
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        sx={{
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: "bold",
            fontSize: 14,
            textAlign: "center",
            backgroundColor: "#eeeeee",
          },
          "& .MuiDataGrid-columnHeader": {
            textAlign: "center",
            backgroundColor: "#eeeeee",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            textAlign: "center",
            width: "100%",
          },
          "& .MuiDataGrid-cell": {
            textAlign: "center",
          },
          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
          },
        }}
      />
    </Box>
  );
};

export default ReservationTable;

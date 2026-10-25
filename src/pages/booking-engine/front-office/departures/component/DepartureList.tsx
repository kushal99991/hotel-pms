import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "hooks";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, Button, Chip, Grid, Link } from "@mui/material";
import SearchInput from "components/elements/SearchInput/SearchInput";
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
import { useGetReservationListQuery } from "services/reservationSlice";
import {
  reservationStatusDisplayValues,
  ReservationStatusEnum,
} from "constants/reservation";
import { useSocket } from "contexts/SocketContext";
import useFilter from "hooks/useFilter";
import { convertUtcToTimezone, getMoment } from "utils/helperFunctions/common";
import { getCurrentRoom } from "utils/reservations";
import { CommonPagination } from "utils/FilterComponent";

const DepartureList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { users, currentTimeZone } = useAuth();
  const { getFilterOperators } = useFilter();

  const iniSelectedDate = searchParams.get("selected_date");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllSelected, setShowAllSelected] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    iniSelectedDate && dayjs(iniSelectedDate).isValid()
      ? dayjs(iniSelectedDate)
      : dayjs(getMoment(null, currentTimeZone).format("YYYY-MM-DD"))
  );

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const { socket } = useSocket();

  const filterParams = React.useMemo(() => {
    const filters: Record<string, any> = {};

    filterModel.items.forEach((item) => {
      if (item.field && item.value) {
        filters[item.field] = item.value;
      }
    });

    return filters;
  }, [filterModel]);

  const {
    data: reservationListData,
    isFetching,
    isLoading,
    refetch,
  } = useGetReservationListQuery(
    {
      property_id: users?.defaultPropertyId ?? 0,
      end_date: selectedDate?.format("YYYY-MM-DD"),
      reservation_status: ReservationStatusEnum?.DEPARTING,
      ...filterParams,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  const reservationList = reservationListData?.filter(
    (row) => row.status != "CANCELED"
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    onRefresh();
    if (socket) {
      socket.on("refresh-dashboard", () => {
        onRefresh();
      });
    }
  }, [socket]);

  const roomTypesOptions = React.useMemo(() => {
    if (!reservationList) return [];

    const uniqueRoomTypes = new Set(
      reservationList.map((reservation) => reservation.room_type)
    );

    return [
      { label: "All", value: "" },
      ...[...uniqueRoomTypes].map((roomType) => ({
        label: roomType.type,
        value: roomType.type,
      })),
    ];
  }, [reservationList]);

  const rateCodeOptions = React.useMemo(() => {
    if (!reservationList) return [];

    const uniqueRateCodes = new Set(
      reservationList.map((reservation) => reservation.rate_code.name)
    );

    return [
      { label: "All", value: "" },
      ...[...uniqueRateCodes].map((rate) => ({
        label: rate,
        value: rate,
      })),
    ];
  }, [reservationList]);

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
          ></Chip>
        );
      },
    },
    {
      field: "is_guaranteed",
      headerName: "GTD",
      minWidth: 45,
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
        start_date ? dayjs(start_date).format(appConfig.displayDateFormat) : "",
    },
    {
      field: "end_date",
      headerName: "Departure",
      minWidth: 110,
      flex: 1,
      filterOperators: getFilterOperators("date", "Departure"),
      valueFormatter: (_, { end_date }) =>
        end_date ? dayjs(end_date).format(appConfig.displayDateFormat) : "",
    },
    {
      field: "expected_checkin_time",
      headerName: "Expected Check-In",
      minWidth: 140,
      flex: 1,
      filterOperators: getFilterOperators("time", "Expected Check-In"),
      valueGetter: (_, { start_date, expected_checkin_time }) =>
        expected_checkin_time
          ? convertUtcToTimezone(
              new Date(start_date + " " + expected_checkin_time),
              currentTimeZone
            ).format(appConfig.dateApiTimeOfDayFormat)
          : "",
    },
    {
      field: "expected_checkout_time",
      headerName: "Expected Check-Out",
      minWidth: 140,
      flex: 1,
      filterOperators: getFilterOperators("time", "Expected Check-Out"),
      valueGetter: (_, { end_date, expected_checkout_time }) =>
        expected_checkout_time
          ? convertUtcToTimezone(
              new Date(end_date + " " + expected_checkout_time),
              currentTimeZone
            ).format(appConfig.dateApiTimeOfDayFormat)
          : "",
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

  const handleSearchInputChange = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      setShowAllSelected(false);
    }
  };
  const handleShowAllToggle = () => {
    if (showAllSelected) {
      setSelectedDate(
        dayjs(getMoment(null, currentTimeZone).format("YYYY-MM-DD"))
      );
    } else {
      setSelectedDate(null);
    }
    setShowAllSelected(!showAllSelected);
  };

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/booking-engine/reservations/${params.row.id}`);
  };

  const filteredReservations = reservationList?.filter((reservation) => {
    if (!searchQuery) return true;
    const room = getCurrentRoom(reservation);
    return (
      reservation.reservation_first_guest_info?.first_name
        ?.toLowerCase()
        .includes(searchQuery) ||
      reservation.reservation_first_guest_info?.last_name
        ?.toLowerCase()
        .includes(searchQuery) ||
      reservation.id.toString().includes(searchQuery) ||
      reservation?.confirmation_id?.toLowerCase().includes(searchQuery) ||
      reservation.room_type?.type?.toLowerCase().includes(searchQuery) ||
      reservation.rate_code?.name?.toLowerCase().includes(searchQuery) ||
      reservation.guests?.some(
        (guest) =>
          guest.first_name?.toLowerCase().includes(searchQuery) ||
          guest.last_name?.toLowerCase().includes(searchQuery) ||
          room?.room_number?.toLowerCase().includes(searchQuery)
      )
    );
  });

  const handleFilterChange = (model: GridFilterModel) => {
    setFilterModel(model);
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box my={2} mt={2} data-testid="advanced-search-container">
        <Grid container justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <SearchInput onSearch={handleSearchInputChange} size="small" />
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
            >
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                format={appConfig.displayDateFormat}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: (theme) => ({
                      [theme.breakpoints.only("sm")]: {
                        marginTop: "16px",
                      },
                    }),
                  },
                }}
              />
              <Button
                variant={showAllSelected ? "contained" : "outlined"}
                size="large"
                fullWidth
                onClick={handleShowAllToggle}
              >
                {showAllSelected ? "Back to Date" : "Show All"}
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box mt={2}>
          <DataGrid
            rows={filteredReservations ?? []}
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
            loading={isFetching || isLoading}
            pageSizeOptions={[25, 50, 100, 200, 500]}
            autoHeight
            onRowClick={handleRowClick}
            onFilterModelChange={handleFilterChange}
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
      </Box>
    </LocalizationProvider>
  );
};

export default DepartureList;

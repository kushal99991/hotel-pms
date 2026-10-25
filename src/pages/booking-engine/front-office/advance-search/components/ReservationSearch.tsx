import { useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Box,
  ButtonProps,
  Chip,
  Link,
  TablePagination,
  useMediaQuery,
} from "@mui/material";
import { appConfig } from "config/app.config";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridRowParams,
  GridFilterModel,
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridPrintExportMenuItem,
  GridCsvExportOptions,
  GridPrintExportOptions,
} from "@mui/x-data-grid";
import { IReservationResponse } from "types/reservationTypes";
import { useGetReservationListQuery } from "services/reservationSlice";
import {
  reservationStatusDisplayValues,
  ReservationStatusEnum,
} from "constants/reservation";
import { useSocket } from "contexts/SocketContext";
import useFilter from "hooks/useFilter";
import useAuth from "hooks/useAuth";
import { getCurrentRoom } from "utils/reservations";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import { CommonPagination } from "utils/FilterComponent";
import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";

interface IReservationSearchProps {
  filterModel: GridFilterModel;
  setFilterModel: (values: React.SetStateAction<GridFilterModel>) => void;
}

const ReservationSearch: React.FC<IReservationSearchProps> = ({
  filterModel,
  setFilterModel,
}) => {
  const { users, currentTimeZone } = useAuth();
  const navigate = useNavigate();
  const { getFilterOperators } = useFilter();
  const { socket } = useSocket();
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
  }>({
    page: 0,
    pageSize: 10,
  });

  const filterParams = React.useMemo(() => {
    const filters: Record<string, any> = {};

    filterModel.items.forEach((item) => {
      if (item.field && item.value) {
        filters[item.field] = item.value;
      }
    });
    if (users?.defaultPropertyId) {
      filters["property_id"] = users.defaultPropertyId;
    }

    return filters;
  }, [filterModel, users?.defaultPropertyId]);

  const {
    data: reservationList,
    isFetching,
    isLoading,
    refetch,
  } = useGetReservationListQuery(
    {
      ...filterParams,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );
  const paginatedReservations = useMemo(() => {
    if (pagination.pageSize > -1) {
      return (reservationList ?? []).slice(
        pagination.page * pagination.pageSize,
        (pagination.page + 1) * pagination.pageSize
      );
    }
    return reservationList ?? [];
  }, [reservationList, pagination]);

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

  // Media Query for responsive design
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const columns: GridColDef<IReservationResponse>[] = [
    {
      field: "reservation_first_guest_info.first_name",
      headerName: "First Name",
      flex: 1,
      minWidth: 100,
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.first_name || ""}`,
    },
    {
      field: "guests.last_name",
      headerName: "Last Name",
      flex: 1,
      minWidth: 100,
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.last_name || ""}`,
    },
    {
      field: "status",
      headerName: "Reservation Status",
      flex: 1,
      minWidth: 160,
      filterOperators: getFilterOperators("dropdown", "Reservation Status", [
        { label: "All", value: "" },
        ...Object.keys(ReservationStatusEnum).map((key) => ({
          label: key.replace("_", " ").toUpperCase(),
          value:
            ReservationStatusEnum[key as keyof typeof ReservationStatusEnum],
        })),
      ]),
      renderCell: (value) => {
        const row = value.row;
        const rawStatus = row?.status;
        const displayInfo = reservationStatusDisplayValues[rawStatus];
        const vip =
          row?.reservation_holder_info?.vip ||
          row?.reservation_first_guest_info?.vip ||
          row?.guests?.some((g) => g.vip);
        const incognito = Boolean((row as any)?.incognito);

        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            gap={1}
            sx={{
              height: "100%",
              py: 0.5,
              width: "100%",
              flexWrap: "nowrap",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Chip
              label={displayInfo?.label ?? rawStatus}
              size="small"
              sx={{
                backgroundColor: displayInfo?.color,
                color: displayInfo?.contrastColor,
                maxWidth: "100%",
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              sx={{ flex: "0 0 auto", whiteSpace: "nowrap" }}
            >
              {vip && (
                <DynamicIcon name="RiVipCrown2Fill" size={14} color="black" />
              )}
              {incognito && (
                <DynamicIcon name="BsIncognito" size={14} color="black" />
              )}
            </Box>
          </Box>
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
      flex: 1,
      minWidth: 100,
      filterOperators: getFilterOperators("date", "Arrival"),
      valueFormatter: (_, { start_date }) =>
        start_date ? dayjs(start_date).format(appConfig.displayDateFormat) : "",
    },
    {
      field: "end_date",
      headerName: "Departure",
      flex: 1,
      minWidth: 100,
      filterOperators: getFilterOperators("date", "Departure"),
      valueFormatter: (_, { end_date }) =>
        end_date ? dayjs(end_date).format(appConfig.displayDateFormat) : "",
    },
    {
      field: "expected_checkin_time",
      headerName: "Expected Check-In",
      flex: 1,
      minWidth: 150,
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
      flex: 1,
      minWidth: 150,
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
      flex: 1,
      minWidth: 100,
      valueGetter: (_, reservation) =>
        getCurrentRoom(reservation)?.room_number || "Not Assigned",
    },
    {
      field: "room_type",
      headerName: "Room Type",
      flex: 1,
      minWidth: 100,
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
      flex: 1,
      valueGetter: (_, { rate_code }) => rate_code?.name || "",
      filterOperators: getFilterOperators("dropdown", "Rate", rateCodeOptions),
    },
    {
      field: "group",
      headerName: "Group Code",
      minWidth: 120,
      flex: 1,
      renderCell: (params) =>
        params.row.group?.id ? (
          <Link
            component="button"
            onClick={(event) => {
              event.stopPropagation();
              navigate(
                `/booking-engine/sales/group-detail/${params.row.group?.id}`
              );
            }}
          >
            {params.row.group.group_code}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      field: "balance",
      headerName: "Balance",
      flex: 1,
      minWidth: 80,
      align: "right",
    },
    {
      field: "confirmation_id",
      headerName: "Confirmation",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "id",
      headerName: "Folio No.",
      flex: 1,
      minWidth: 100,
      align: "right",
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

  const handleFilterChange = (model: GridFilterModel) => {
    setFilterModel(model);
  };

  const csvOptions: GridCsvExportOptions = {
    fileName: "custom_reservation_list",
    allColumns: true,
  };
  const printOptions: GridPrintExportOptions = {
    fileName: "custom_reservation_list",
    allColumns: true,
    hideFooter: true,
    hideToolbar: true,
    pageStyle: "A3",
  };

  const CustomExportButton = (props: ButtonProps) => (
    <GridToolbarExportContainer {...props}>
      <GridCsvExportMenuItem options={csvOptions} />
      <GridPrintExportMenuItem options={printOptions} />
    </GridToolbarExportContainer>
  );

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <CustomExportButton />
      </GridToolbarContainer>
    );
  };

  const CustomFooter = () => {
    return (
      <TablePagination
        component="div"
        count={reservationList?.length ?? 0}
        page={pagination.page}
        showFirstButton
        onPageChange={(_, newPage) =>
          setPagination({ ...pagination, page: newPage })
        }
        rowsPerPage={pagination.pageSize}
        rowsPerPageOptions={[{ label: "All", value: -1 }, 10, 25, 50, 100, 500]}
        onRowsPerPageChange={(
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          setPagination({
            ...pagination,
            pageSize: parseInt(event.target.value, 10),
            page: 0,
          });
        }}
        color="primary"
        sx={{ marginTop: 2, display: "flex", justifyContent: "flex-end" }}
      />
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box my={2}>
        <DataGrid
          rows={paginatedReservations ?? []}
          columns={columns}
          initialState={{
            sorting: {
              sortModel: [{ field: "start_date", sort: "asc" }],
            },
          }}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter,
            pagination: CommonPagination,
          }}
          loading={isFetching || isLoading}
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
            // Add responsive styles
            width: isSmallScreen ? "100%" : "auto",
            overflowX: "auto",
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ReservationSearch;

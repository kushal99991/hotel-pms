import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  Chip,
  TablePagination,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";
import exampleLogo from "assets/images/logo.png";

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useGetReservationListQuery } from "services/reservationSlice";
import {
  IReservationFilter,
  IReservationResponse,
} from "types/reservationTypes";
import { useGetRoomListQuery } from "services/roomSlice";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useParams } from "react-router-dom";
import {
  reservationStatusDisplayValues,
  ReservationStatusEnum,
} from "constants/reservation";
import { getCheckOutTime, getCurrentRoom } from "utils/reservations";
import { CommonPagination } from "utils/FilterComponent";

interface ReservationReportProps {
  defaultStatus?: string;
}

const ReservationReport = ({ defaultStatus }: ReservationReportProps = {}) => {
  const { users, properties, currentTimeZone } = useAuth();
  const params = useParams();
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );

  const [filters, setFilters] = useState<IReservationFilter>({
    floor: "",
    room_type: "",
    wing: "",
    start_date: "",
    end_date: "",
    property_id: users?.defaultPropertyId ?? 0,
    reservation_status: (params?.reservation_status ||
      defaultStatus) as ReservationStatusEnum,
  });
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
  }>({
    page: 0,
    pageSize: 10,
  });

  const [wingOptions, setWingOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [floorOptions, setFloorOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const {
    data: reservationList,
    isFetching,
    isLoading,
  } = useGetReservationListQuery(filters, {
    skip: false,
    refetchOnMountOrArgChange: true,
  });
  const paginatedReservations = useMemo(() => {
    if (pagination.pageSize > -1) {
      return (reservationList ?? []).slice(
        pagination.page * pagination.pageSize,
        (pagination.page + 1) * pagination.pageSize
      );
    }
    return reservationList ?? [];
  }, [reservationList, pagination]);

  const { data: roomList } = useGetRoomListQuery({
    offset: pagination.page,
    property_id: users?.defaultPropertyId ?? 0,
  });
  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  useEffect(() => {
    getRoomTypeByPropertyId({
      propertyId: users?.defaultPropertyId ?? 0,
    });
  }, [users?.defaultPropertyId]);

  const roomTypeOptions = [
    { label: "All", value: "" },
    ...(roomTypeList ?? []).map((room) => ({
      label: room.type,
      value: room.type,
    })),
  ];

  useEffect(() => {
    // Gather unique floors from roomList
    if (roomList?.length) {
      const uniqueFloors = Array.from(
        new Set(roomList.map((room) => String(room.floor)))
      ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const floorDropdownOptions = uniqueFloors.map((floor) => ({
        value: floor,
        label: floor,
      }));

      // Set the floor options with "All" included
      setFloorOptions([{ value: "", label: "All" }, ...floorDropdownOptions]);

      const uniqueWings = Array.from(
        new Set(
          roomList
            .map((room) => room.wing)
            .filter((wing): wing is string => !!wing)
        ) // Filter out undefined values
      ).sort();

      const wingDropdownOptions = uniqueWings.map((wing) => ({
        value: wing,
        label: wing,
      }));

      // Set the wing options with "All" included
      setWingOptions([{ value: "", label: "All" }, ...wingDropdownOptions]);
    }
  }, [roomList]);

  const clearPagination = () => {
    setPagination({
      page: 0,
      pageSize: 10,
    });
  };

  // Handle start date change
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFilters((prev) => ({
        ...prev,
        start_date: date.format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        start_date: "",
      }));
    }
    clearPagination();
  };

  // Handle end date change
  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFilters((prev) => ({
        ...prev,
        end_date: date.format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        end_date: "",
      }));
    }
    clearPagination();
  };

  const columns: GridColDef<IReservationResponse>[] = [
    {
      field: "id",
      headerName: "Room #",
      flex: 1,
      minWidth: 80,
      valueGetter: (_, row) => getCurrentRoom(row)?.room_number ?? "Not Assign",
    }, // Direct key
    {
      field: "room_type.name",
      headerName: "Room Type",
      flex: 1,
      minWidth: 80,
      valueGetter: (_, { room_type }) => room_type?.type || "",
    },
    {
      field: "wing",
      headerName: "Wing",
      flex: 1,
      minWidth: 80,
      valueGetter: (_, { current_room_info }) => current_room_info?.wing || "-",
    }, // No match, kept as is
    {
      field: "floorLevel",
      headerName: "Floor",
      flex: 1,
      minWidth: 80,
      valueGetter: (_, { current_room_info }) =>
        current_room_info?.floor || "-",
    }, // No match, kept as is
    {
      field: "reservation_first_guest_info",
      headerName: "Guest Name",
      flex: 1,
      minWidth: 80,
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.first_name || ""} ${reservation_first_guest_info?.last_name || ""}`,
    },
    {
      field: "start_date",
      headerName: "Arrival",
      flex: 1,
      minWidth: 100,
      valueFormatter: (_, { start_date }) =>
        start_date ? format(new Date(start_date), "MM/dd/yyyy") : "",
    },
    {
      field: "end_date",
      headerName: "Departure",
      flex: 1,
      minWidth: 100,
      valueFormatter: (_, { end_date }) =>
        end_date ? format(new Date(end_date), "MM/dd/yyyy") : "",
    },
    {
      field: "expected_checkout_time",
      headerName: "Time",
      flex: 1,
      minWidth: 100,
      valueGetter: (_, rows) => getCheckOutTime(rows, currentTimeZone),
    },
    {
      field: "adults", // No match, kept as is
      headerName: "Adults",
      flex: 1,
      width: 20,
    },
    {
      field: "children_count",
      headerName: "Children",
      flex: 1,
      width: 20,
    },
    {
      field: "rate_code.name",
      headerName: "Rate Code",
      flex: 1,
      minWidth: 80,
      valueGetter: (_, { rate_code }) => rate_code?.name || "",
    },
    {
      field: "booking_channel",
      headerName: "Source",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "status",
      headerName: "Reservation Status",
      flex: 1,
      minWidth: 80,
      renderCell: ({ value }) => {
        const rawStatus = value;
        const displayInfo =
          reservationStatusDisplayValues[rawStatus as ReservationStatusEnum];
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
      field: "balance",
      headerName: "Outstanding",
      flex: 1,
      minWidth: 80,
      renderCell: ({ value }) => (
        <Typography
          sx={{
            color: Number(value ?? "0") > 0 ? "error.main" : "success.main",
          }}
        >
          ${Number(value ?? "0").toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      field: "special_requests",
      headerName: "Special Requests",
      flex: 1,
      minWidth: 80,
    },
  ];

  const convertImageUrlToBase64 = (imageUrl: string): Promise<string> => {
    return fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => {
        /** empty catch error */
        throw new Error("Failed to load image");
      });
  };

  async function isValidImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return (
        response.ok &&
        /image\/*/.test(response.headers.get("Content-Type") ?? "")
      );
    } catch {
      return false;
    }
  }

  const exportPDF = async () => {
    const doc = new jsPDF();
    let title = "Reservation Report";
    if (params?.reservation_status) {
      switch (params.reservation_status.toUpperCase()) {
        case "NO_SHOW":
          title = "No Show Reservation Report";
          break;
        case "RESERVED":
          title = "Reserved Reservation Report";
          break;
        case "CANCELED":
          title = "Canceled Reservation Report";
          break;
      }
    }

    const subtitle =
      filters.start_date && filters.end_date
        ? `Period: ${format(new Date(filters.start_date), "MM/dd/yyyy")} to ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
        : filters.start_date
          ? `Period: From ${format(new Date(filters.start_date), "MM/dd/yyyy")}`
          : filters.end_date
            ? `Period: Until ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
            : "Period: ";

    const timestamp = `Generated on: ${format(new Date(), "PPpp")}`;
    const generatedBy = `Generator By : ${users?.firstName} ${users?.lastName}`;
    let imageUrl = exampleLogo;
    imageUrl = currentProperty?.logo ?? imageUrl;

    // Extract the file extension from the image URL
    if (imageUrl) {
      const isValid = await isValidImageUrl(imageUrl);

      const x = 10;
      const y = 10;
      const size = 40;
      const radius = size / 2;
      let imagebase64Image = await convertImageUrlToBase64(exampleLogo);
      let imageExtension = "PNG";
      if (isValid) {
        const base64Image = await convertImageUrlToBase64(imageUrl);
        const extension = imageUrl?.split(".")?.pop()?.toLowerCase() ?? "PNG";

        if (extension.toUpperCase() !== "AVIF") {
          imagebase64Image = base64Image;
          imageExtension = extension.toUpperCase();
        }
      }
      doc.setFillColor(255, 255, 255);
      doc.ellipse(x + radius, y + radius, radius, radius, "F");
      doc.addImage(
        "data:image/png;base64," + imagebase64Image,
        imageExtension,
        x,
        y,
        size,
        size,
        undefined,
        "FAST"
      );
    }

    // Add title and subtitle
    const textX = 120;
    let textY = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, textX, textY);
    textY += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(subtitle, textX, textY);
    textY += 7;
    doc.text(timestamp, textX, textY);
    textY += 7;

    doc.text(generatedBy, textX, textY);
    textY += 30;

    // Table headers and data
    const headers = [
      "Room",
      "Type",
      "Wing",
      "Guest",
      "Arrival",
      "Time",
      "Departure",
      "Guests",
      "Status",
      "Balance",
      "Requests",
    ]; // Essential columns
    const tableData = (reservationList ?? []).map(
      (row: IReservationResponse) => [
        row.current_room_info?.room_number || "",
        row.room_type?.type || "",
        row.current_room_info?.wing || "",
        `${row.reservation_first_guest_info?.first_name || ""} ${row.reservation_first_guest_info?.last_name || ""}`,
        row.start_date ? format(new Date(row.start_date), "MM/dd/yyyy") : "",
        row.expected_checkout_time || "",
        row.end_date ? format(new Date(row.end_date), "MM/dd/yyyy") : "",
        `${row.children_count || 0}`,
        row.status || "",
        "$0.00",
        row.special_requests || "",
      ]
    );

    // Add table to the PDF
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: textY,
      styles: { fontSize: 8 },
      margin: { top: 50 },
    });

    // Save the file
    doc.save(`reservation_${params?.reservation_status}.pdf`);
  };

  const exportExcel = () => {
    const headers = columns.map((col) => col.headerName).join(",");
    const rows = (reservationList ?? [])
      .map((row: IReservationResponse) => [
        row.current_room_info?.room_number || "",
        row.room_type?.type || "",
        row.current_room_info?.wing || "",
        row.current_room_info?.floor || "",
        `${row.reservation_first_guest_info?.first_name || ""} ${row.reservation_first_guest_info?.last_name || ""}`,
        row.start_date ? format(new Date(row.start_date), "MM/dd/yyyy") : "",
        row.expected_checkout_time || "",
        row.end_date ? format(new Date(row.end_date), "MM/dd/yyyy") : "",
        `${row.children_count || 0}`,
        `${row.children_count || 0}`,
        row.rate_code?.name || "",
        row.booking_channel || "",
        "Paid",
        "$0.00",
        row.special_requests || "",
      ])
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reservation_${params?.reservation_status}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const reservationStatusOptions = [
    ...Object.values(ReservationStatusEnum)
      .filter((status) => !["DEPARTED", "ARRIVAL", "in_house"].includes(status))
      .map((status) => ({
        label: status.replace(/_/g, " "),
        value: status,
      })),
  ];

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
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
    <Box
      sx={{
        "@media print": {
          margin: 0,
          padding: "20px",
        },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          "@media print": {
            boxShadow: "none",
          },
        }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                {filters.start_date && filters.end_date
                  ? `Period: ${format(new Date(filters.start_date), "MM/dd/yyyy")} to ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
                  : filters.start_date
                    ? `Period: From ${format(new Date(filters.start_date), "MM/dd/yyyy")}`
                    : filters.end_date
                      ? `Period: Until ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
                      : "Period: "}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Generated on: {format(new Date(), "PPpp")}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                "@media print": {
                  display: "none",
                },
              }}
            >
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportPDF}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<FaTable />}
                onClick={exportExcel}
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintOutlined />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Stack>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} paddingRight={4}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={filters.start_date ? dayjs(filters.start_date) : null}
                  onChange={handleStartDateChange}
                  maxDate={
                    filters.end_date ? dayjs(filters.end_date) : undefined
                  }
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Start Date",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={filters.end_date ? dayjs(filters.end_date) : null}
                  onChange={handleEndDateChange}
                  format="YYYY-MM-DD"
                  minDate={
                    filters.start_date ? dayjs(filters.start_date) : undefined
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          <Grid container spacing={2} paddingRight={4}>
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Room Type"
                placeholder="Room Type"
                options={roomTypeOptions || []}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    room_type: event.target.value as string,
                  }));
                  clearPagination();
                }}
                value={filters?.room_type}
                isInvalid={false}
                fullWidth
                aria-label="HSKP Status"
                data-testid="room-number"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Wing"
                placeholder="Select Wing"
                options={wingOptions || []}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    wing: event.target.value as string,
                  }));
                  clearPagination();
                }}
                value={filters?.wing}
                fullWidth
                aria-label="Wing"
                data-testid="wing-dropdown"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Floor"
                placeholder="Floor"
                options={floorOptions}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    floor: event.target.value as string,
                  }));
                  clearPagination();
                }}
                value={filters?.floor}
                isInvalid={false}
                fullWidth
                aria-label="HSKP Status"
                data-testid="room-number"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Reservation Status"
                placeholder="Reservation Status"
                options={reservationStatusOptions}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    reservation_status: event.target.value as string,
                  }));
                  clearPagination();
                }}
                value={filters?.reservation_status}
                isInvalid={false}
                fullWidth
                aria-label="Reservation Status"
                data-testid="reservation-status"
              />
            </Grid>
          </Grid>

          <Box>
            <DataGrid
              rows={paginatedReservations ?? []}
              columns={columns}
              initialState={{
                sorting: {
                  sortModel: [{ field: "arrivalDate", sort: "asc" }],
                },
              }}
              slots={{
                toolbar: CustomToolbar,
                footer: CustomFooter,
                pagination: CommonPagination,
              }}
              loading={isFetching || isLoading}
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  fontWeight: "bold",
                  fontSize: 17,
                },
              }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ReservationReport;

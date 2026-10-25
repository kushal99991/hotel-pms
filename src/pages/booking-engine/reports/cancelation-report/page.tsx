import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  Chip,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";

import { jsPDF } from "jspdf";
import { Moment } from "moment";
import "jspdf-autotable";
import { useGetReservationListQuery } from "services/reservationSlice";
import { IReservationResponse } from "types/reservationTypes";
import { useGetRoomListQuery } from "services/roomSlice";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { ReservationStatusEnum } from "constants/reservation";
import { getMoment } from "utils/helperFunctions/common";
import { getCurrentRoom } from "utils/reservations";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";
import { appConfig } from "config/app.config";
import { apiAmountToNumber } from "utils/dataFormats";
import { CommonPagination } from "utils/FilterComponent";

const CancelReport = () => {
  const { users, currentTimeZone } = useAuth();
  const [floor, setFloor] = useState<string>("");
  const [roomType, setRoomType] = useState<string>("");
  const [wingOptions, setWingOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [wing, setWing] = useState<string>("");
  const [startDate, setStartDate] = useState<Moment | undefined>(
    getMoment(null, currentTimeZone)
  );
  const [endDate, setEndDate] = useState<Moment | undefined>(undefined);

  const [floorOptions, setFloorOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const {
    data: arrivalReportList,
    isFetching,
    isLoading,
  } = useGetReservationListQuery(
    {
      floor: floor,
      room_type: roomType,
      start_date: startDate?.format(appConfig.dateApiFormat),
      end_date: endDate ? endDate?.format(appConfig.dateApiFormat) : "",
      wing: wing,
      reservation_status: ReservationStatusEnum.CANCELED,
      property_id: users?.defaultPropertyId ?? 0,
    },
    {
      skip: false, // Ensure the query is triggered
      refetchOnMountOrArgChange: true, // Ensures data is refetched when arguments change
    }
  );

  const { data: roomList } = useGetRoomListQuery({
    limit: 500,
    offset: 0,
    property_id: users?.defaultPropertyId ?? 0,
  });
  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();
  const generatedOnDate = getMoment(null, currentTimeZone).format(
    "MMM DD, YYYY,  hh:mm:ss A"
  );

  useEffect(() => {
    getRoomTypeByPropertyId({
      propertyId: users?.defaultPropertyId ?? 1,
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

  // Handle start date change
  const handleStartDateChange = (date: Moment | null) => {
    if (date) {
      setStartDate(date);
    } else {
      setStartDate(undefined); // Reset if no date is selected
    }
  };

  // Handle end date change
  const handleEndDateChange = (date: Moment | null) => {
    if (date) {
      setEndDate(date);
    } else {
      setEndDate(undefined); // Reset if no date is selected
    }
  };

  const columns: GridColDef<IReservationResponse>[] = [
    {
      field: "id",
      headerName: "Room #",
      width: 100,
      valueGetter: (_, reservation) =>
        getCurrentRoom(reservation)?.room_number || "",
    }, // Direct key
    {
      field: "room_type.name",
      headerName: "Room Type",
      width: 130,
      valueGetter: (_, { room_type }) => room_type?.type || "",
    },
    {
      field: "wing",
      headerName: "Wing",
      width: 100,
      valueGetter: (_, reservation) => getCurrentRoom(reservation)?.wing || "",
    }, // No match, kept as is
    {
      field: "floorLevel",
      headerName: "Floor",
      width: 100,
      valueGetter: (_, reservation) => getCurrentRoom(reservation)?.floor || "",
    }, // No match, kept as is
    {
      field: "reservation_holder_info",
      headerName: "Guest Name",
      width: 180,
      valueGetter: (_, { reservation_holder_info }) =>
        `${reservation_holder_info?.first_name || ""} ${reservation_holder_info?.last_name || ""}`,
    },
    {
      field: "start_date",
      headerName: "Arrival",
      width: 110,
      valueFormatter: (_, { start_date }) =>
        start_date ? modifyToDisplayDate(start_date) : "",
    },
    {
      field: "expected_checkout_time",
      headerName: "Time",
      width: 100,
      valueGetter: (_, { expected_checkin_time }) =>
        expected_checkin_time || "",
    },
    {
      field: "end_date",
      headerName: "Departure",
      width: 110,
      valueFormatter: (_, { end_date }) =>
        end_date ? modifyToDisplayDate(end_date) : "",
    },
    {
      field: "adults", // No match, kept as is
      headerName: "Adults",
      width: 100,
    },
    {
      field: "children_count",
      headerName: "Children",
      width: 100,
    },
    {
      field: "rate_code.name",
      headerName: "Rate Code",
      width: 110,
      valueGetter: (_, { rate_code }) => rate_code?.name || "",
    },
    {
      field: "booking_channel",
      headerName: "Source",
      width: 130,
    },
    {
      field: "status",
      headerName: "Billing Status",
      width: 130,
      renderCell: ({ value }) => (
        <Chip
          label={value || ""}
          color={value === "Paid" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "balance",
      headerName: "Outstanding",
      width: 120,
      renderCell: ({ value }) => (
        <Typography
          sx={{
            color: value > 0 ? "error.main" : "success.main",
          }}
        >
          ${apiAmountToNumber(value).toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      field: "special_requests",
      headerName: "Special Requests",
      width: 200,
    },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = "Arrivals Report";
    const subtitle =
      startDate && endDate
        ? `Period: ${startDate.format(appConfig.displayDateFormat)} to ${endDate.format(appConfig.displayDateFormat)}`
        : startDate
          ? `Period: From ${startDate.format(appConfig.displayDateFormat)}`
          : endDate
            ? `Period: Until ${endDate.format(appConfig.displayDateFormat)}`
            : "Period: ";

    const timestamp = `Generated on: ${generatedOnDate}`;

    // Add title and subtitle
    doc.setFontSize(20);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 30);
    doc.text(timestamp, 14, 40);

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
    const tableData = arrivalReportList?.map((row: IReservationResponse) => {
      const room = getCurrentRoom(row);
      return [
        room?.room_number || "",
        row.room_type?.type || "",
        room?.wing || "",
        `${row.reservation_holder_info?.first_name || ""} ${row.reservation_holder_info?.last_name || ""}`,
        row.start_date ? modifyToDisplayDate(row.start_date) : "",
        row.expected_checkout_time || "",
        row.end_date ? modifyToDisplayDate(row.end_date) : "",
        `${row.children_count || 0}`,
        row.status || "",
        "$0.00",
        row.special_requests || "",
      ];
    });

    // Add table to the PDF
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      margin: { top: 50 },
    });

    // Save the file
    doc.save("arrivals-report.pdf");
  };

  const exportExcel = () => {
    const headers = columns.map((col) => col.headerName).join(",");
    const rows = arrivalReportList
      ?.map((row: IReservationResponse) => {
        const room = getCurrentRoom(row);
        return [
          room?.room_number || "",
          row.room_type?.type || "",
          room?.wing || "",
          room?.floor || "",
          `${row.reservation_holder_info?.first_name || ""} ${row.reservation_holder_info?.last_name || ""}`,
          row.start_date ? modifyToDisplayDate(row.start_date) : "",
          row.expected_checkout_time || "",
          row.end_date ? modifyToDisplayDate(row.end_date) : "",
          `${row.children_count || 0}`,
          `${row.children_count || 0}`,
          row.rate_code?.name || "",
          row.booking_channel || "",
          "Paid",
          "$0.00",
          row.special_requests || "",
        ];
      })
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "arrivals-report.csv";
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
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
                {startDate && endDate
                  ? `Period: ${startDate.format(appConfig.displayDateFormat)} to ${endDate.format(appConfig.displayDateFormat)}`
                  : startDate
                    ? `Period: From ${startDate.format(appConfig.displayDateFormat)}`
                    : endDate
                      ? `Period: Until ${endDate.format(appConfig.displayDateFormat)}`
                      : "Period: "}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Generated on: {generatedOnDate}
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

          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Grid container spacing={2} paddingRight={4}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate ? startDate : null}
                  onChange={handleStartDateChange}
                  maxDate={endDate ? endDate : undefined} // Disable start date if end date is selected
                  format={appConfig.displayDateFormat}
                  timezone={currentTimeZone}
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
                  value={endDate}
                  onChange={handleEndDateChange}
                  format={appConfig.displayDateFormat}
                  minDate={startDate}
                  timezone={currentTimeZone}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "End Date",
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
                  setRoomType(event.target.value as string);
                }}
                value={roomType}
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
                onChange={(event) => setWing(event.target.value as string)}
                value={wing}
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
                  setFloor(event.target.value as string);
                }}
                value={floor}
                isInvalid={false}
                fullWidth
                aria-label="HSKP Status"
                data-testid="room-number"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Billing Status"
                placeholder="Floor"
                options={floorOptions}
                onChange={(event) => {
                  setFloor(event.target.value as string);
                }}
                value={floor}
                isInvalid={false}
                fullWidth
                aria-label="HSKP Status"
                data-testid="room-number"
              />
            </Grid>
          </Grid>

          <Box>
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
                toolbar: CustomToolbar,
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
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CancelReport;

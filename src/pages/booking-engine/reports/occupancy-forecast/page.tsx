import React, { useState, useMemo, useRef } from "react";
import { format } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";
import exampleLogo from "assets/images/logo.png";

import { jsPDF } from "jspdf";
import { useReactToPrint } from "react-to-print";
import "jspdf-autotable";
import { useGetReservationListQuery } from "services/reservationSlice";
import { IReservationFilter } from "types/reservationTypes";
import { useGetRoomListQuery } from "services/roomSlice";
import useAuth from "hooks/useAuth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { IOccupancyForecastReport } from "types/roomSliceTypes";
import moment from "moment";
import { IRoomStatus } from "constants/room";
import { ReservationStatusEnum } from "constants/reservation";
import { paginationlabelDisplayedRows } from "utils/common";

type DateRangeTypes = "month" | "day" | "3month" | "6month" | "year";

const OccupancyForecastReport = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const pageStyle = `
  @page {
    size: A2 landscape;
    margin: 20mm;
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;
  const { users, properties } = useAuth();
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );
  const [selectedRange, setSelectedRange] = useState<DateRangeTypes>("month");
  const [filters, setFilters] = useState<IReservationFilter>({
    floor: "",
    room_type: "",
    wing: "",
    start_date: moment().format("YYYY-MM-DD"),
    end_date: moment().endOf("month").format("YYYY-MM-DD"),
    property_id: users?.defaultPropertyId ?? 0,
  });

  const {
    data: reservationList,
    isFetching,
    isLoading,
  } = useGetReservationListQuery(filters, {
    skip: false,
    refetchOnMountOrArgChange: true,
  });

  const { data: roomList } = useGetRoomListQuery({
    offset: 0,
    property_id: users?.defaultPropertyId ?? 0,
  });

  const calculateEndDate = (startDate: dayjs.Dayjs, range: DateRangeTypes) => {
    if (!startDate) return null;
    switch (range) {
      case "day":
        return startDate;
      case "month":
        return startDate.endOf("month");
      case "3month":
        return startDate.add(3, "months").endOf("month");
      case "6month":
        return startDate.add(6, "months").endOf("month");
      case "year":
        return startDate.endOf("year");
      default:
        return startDate;
    }
  };

  // Handle start date change
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const newEndDate = calculateEndDate(
        dayjs(filters.start_date),
        selectedRange
      );
      setFilters((prev) => ({
        ...prev,
        start_date: date.format("YYYY-MM-DD"),
        end_date: newEndDate ? newEndDate.format("YYYY-MM-DD") : "",
      }));
    }
  };

  // Ensure filters contain valid dates before processing
  const today = moment(filters.start_date);
  const endDate = moment(filters.end_date);

  const daysToShow = endDate.diff(today, "days") + 1;

  const dateRange = Array.from({ length: daysToShow }, (_, i) => {
    const date = today.clone().add(i, "days");
    return {
      field: `date_${date.format("YYYY-MM-DD")}`,
      flex: 1,
      minWidth: 100,
      renderHeader: () => {
        return (
          <Box
            display="flex"
            alignItems="center"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography>{date.format("ddd")}</Typography>
            <Typography>{date.format("MMM DD")}</Typography>
          </Box>
        );
      },
      renderCell: (params: GridRenderCellParams<IOccupancyForecastReport>) =>
        `${params?.value ?? "0"}`,
    };
  });
  const columns: GridColDef<IOccupancyForecastReport>[] = [
    {
      field: "name",
      headerName: "",
      flex: 1,
      minWidth: 200,
    },
    ...dateRange,
  ];

  const getDateWiseCounts = (date: string) => {
    const totalRooms = roomList?.length || 0;
    const occupiedRooms =
      reservationList?.filter(
        (res) =>
          moment(res.start_date).isSameOrBefore(date, "day") &&
          moment(res.end_date).isAfter(date, "day")
      ).length || 0;

    const nonGroupDepartures =
      reservationList?.filter(
        (res) =>
          res.group &&
          res.group.reservations.length === 1 &&
          moment(res.end_date).isSame(date, "day")
      ).length || 0;

    const groupDepartures =
      reservationList?.filter(
        (res) =>
          res.group &&
          res.group.reservations.some((r) => r.id !== res.id) &&
          moment(res.end_date).isSame(date, "day")
      ).length || 0;

    const dayUseDepartures =
      reservationList?.filter(
        (res) =>
          moment(res.start_date).isSame(date, "day") &&
          moment(res.end_date).isSame(date, "day")
      ).length || 0;

    const nonGroupArrivals =
      reservationList?.filter(
        (res) =>
          res.group &&
          res.group.reservations.length === 1 &&
          moment(res.start_date).isSame(date, "day")
      ).length || 0;

    const groupArrivals =
      reservationList?.filter(
        (res) =>
          res.group &&
          res.group.reservations.some((r) => r.id !== res.id) &&
          moment(res.start_date).isSame(date, "day")
      ).length || 0;

    const dayUseArrivals =
      reservationList?.filter(
        (res) =>
          moment(res.start_date).isSame(date, "day") &&
          moment(res.end_date).isSame(date, "day")
      ).length || 0;

    const outOfOrder =
      (roomList ?? []).filter((a) => a.frontdesk_status === IRoomStatus.OOO)
        ?.length ?? 0;

    const off =
      (roomList ?? []).filter((a) => a.frontdesk_status === IRoomStatus.OOS)
        ?.length ?? 0;

    const noOfReserveReservation =
      reservationList?.filter(
        (res) =>
          moment(res.start_date).isSameOrBefore(date, "day") &&
          moment(res.end_date).isAfter(date, "day") &&
          res.status === ReservationStatusEnum.RESERVED
      ).length || 0;

    return {
      totalRooms,
      occupiedRooms,
      nonGroupDepartures,
      groupDepartures,
      dayUseDepartures,
      nonGroupArrivals,
      groupArrivals,
      dayUseArrivals,
      outOfOrder,
      off,
      noOfReserveReservation,
    };
  };

  const filterRoomList = useMemo(() => {
    return [
      {
        name: "Total Rooms",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).totalRooms,
          ])
        ),
      },
      {
        name: "- OOO",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).outOfOrder,
          ])
        ),
      },
      {
        name: "- OOS",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).off,
          ])
        ),
      },
      {
        name: "Room Occupied",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).occupiedRooms,
          ])
        ),
      },
      {
        name: "- Non-Group Departures",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).nonGroupDepartures,
          ])
        ),
      },
      {
        name: "- Group Departures",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).groupDepartures,
          ])
        ),
      },
      {
        name: "- Day Use Departures",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).dayUseDepartures,
          ])
        ),
      },
      {
        name: "+ Non-Group Arrivals",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).nonGroupArrivals,
          ])
        ),
      },
      {
        name: "+ Group Arrivals",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).groupArrivals,
          ])
        ),
      },
      {
        name: " Day Use Arrivals",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).dayUseArrivals,
          ])
        ),
      },
      {
        name: "Net In House",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).groupDepartures,
          ])
        ),
      },
      {
        name: "+ Estimated Pickup",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).groupDepartures,
          ])
        ),
      },
      {
        name: "+ Excess committed",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).groupDepartures,
          ])
        ),
      },
      {
        name: "+ Excess wholemaster Rooms",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).groupDepartures,
          ])
        ),
      },
      {
        name: "Net Rooms Reserved ",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", ""))
              .noOfReserveReservation,
          ])
        ),
      },
      {
        name: "Net Rooms Available",
        ...Object.fromEntries(
          dateRange.map(({ field }) => [
            field,
            getDateWiseCounts(field.replace("date_", "")).groupDepartures,
          ])
        ),
      },
    ];
  }, [filters, roomList, reservationList]);

  const handleChange = (event: SelectChangeEvent<DateRangeTypes>) => {
    const value = event.target.value as DateRangeTypes;
    setSelectedRange(value);
    const newEndDate = calculateEndDate(dayjs(filters.start_date), value);
    setFilters((prev) => ({
      ...prev,
      end_date: newEndDate ? newEndDate.format("YYYY-MM-DD") : "",
    }));
  };

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
    const title = "Occupancy Forecast Report";
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

    // 🔹 Legend Section (BEFORE TABLE)
    const legendStartY = textY; // Start legend right below metadata
    doc.setFontSize(10);
    doc.text("Legend:", 10, legendStartY);
    doc.setFontSize(8);

    const legends = ["OOO = Out of Order", "OOS = Out of Service"];

    legends.forEach((text, index) => {
      doc.text(text, 10, legendStartY + (index + 1) * 5);
    });

    // 🔹 Adjust Table Position (After Legend)
    const tableStartY = legendStartY + legends.length * 5 + 10;

    // Shortened Table Headers
    const headers = [
      "Date",
      "Total Rooms",
      "Occupied Rooms",
      "Non Group Departures",
      "Group Departures",
      "Day Use Departures",
      "Non Group Arrivals",
      "Group Arrivals",
      "Day Use Arrivals",
      "OOO",
      "OOS",
      "Reserved Rooms",
      "Net Rooms Available",
    ];

    const rows = dateRange.map(({ field }) => {
      const date = field.replace("date_", ""); // Extract date
      const counts = getDateWiseCounts(date);

      return [
        format(new Date(date), "MM/dd/yyyy"),
        counts.totalRooms,
        counts.occupiedRooms,
        counts.nonGroupDepartures,
        counts.groupDepartures,
        counts.dayUseDepartures,
        counts.nonGroupArrivals,
        counts.groupArrivals,
        counts.dayUseArrivals,
        counts.outOfOrder,
        counts.off,
        counts.noOfReserveReservation,
        counts.totalRooms - counts.occupiedRooms, // Net Rooms Available
      ];
    });

    // Add Table
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: tableStartY,
      styles: { fontSize: 8 },
      margin: { top: 10, left: 5, right: 5 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 15 },
        2: { cellWidth: 18 },
        3: { cellWidth: 18 },
        4: { cellWidth: 18 },
        5: { cellWidth: 16 },
        6: { cellWidth: 16 },
        7: { cellWidth: 16 },
        8: { cellWidth: 16 },
        9: { cellWidth: 12 },
        10: { cellWidth: 12 },
        11: { cellWidth: 16 },
        12: { cellWidth: 16 },
      },
    });

    doc.save("occupancy-forecast.pdf");
  };

  // const exportPDF = async () => {
  //   const doc = new jsPDF();
  //   const title = "Room Status Detail Report";
  //   const subtitle =
  //     filters.start_date && filters.end_date
  //       ? `Period: ${format(new Date(filters.start_date), "MM/dd/yyyy")} to ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
  //       : filters.start_date
  //         ? `Period: From ${format(new Date(filters.start_date), "MM/dd/yyyy")}`
  //         : filters.end_date
  //           ? `Period: Until ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
  //           : "Period: ";

  //   const timestamp = `Generated on: ${format(new Date(), "PPpp")}`;
  //   const generatedBy = `Generator By : ${users?.firstName} ${users?.lastName}`;
  //   let imageUrl = exampleLogo;
  //   imageUrl = currentProperty?.logo ?? imageUrl;

  //   // Extract the file extension from the image URL
  //   if (imageUrl) {
  //     const isValid = await isValidImageUrl(imageUrl);

  //     const x = 10;
  //     const y = 10;
  //     const size = 40;
  //     const radius = size / 2;
  //     let imagebase64Image = await convertImageUrlToBase64(exampleLogo);
  //     let imageExtension = "PNG";
  //     if (isValid) {
  //       const base64Image = await convertImageUrlToBase64(imageUrl);
  //       const extension = imageUrl?.split(".")?.pop()?.toLowerCase() ?? "PNG";

  //       if (extension.toUpperCase() !== "AVIF") {
  //         imagebase64Image = base64Image;
  //         imageExtension = extension.toUpperCase();
  //       }
  //     }
  //     doc.setFillColor(255, 255, 255);
  //     doc.ellipse(x + radius, y + radius, radius, radius, "F");
  //     doc.addImage(
  //       "data:image/png;base64," + imagebase64Image,
  //       imageExtension,
  //       x,
  //       y,
  //       size,
  //       size,
  //       undefined,
  //       "FAST"
  //     );
  //   }

  //   // Add title and subtitle
  //   const textX = 120;
  //   let textY = 20;
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(14);
  //   doc.text(title, textX, textY);
  //   textY += 7;

  //   doc.setFont("helvetica", "normal");
  //   doc.setFontSize(12);
  //   doc.text(subtitle, textX, textY);
  //   textY += 7;
  //   doc.text(timestamp, textX, textY);
  //   textY += 7;

  //   doc.text(generatedBy, textX, textY);
  //   textY += 30;

  //   // Table headers and data
  //   const headers = columns.map((col) => col.field.replace(/^date_/, ""));
  //   const rows = (filterRoomList ?? []).map((row: IOccupancyForecastReport) => {
  //     const dateColumns = Object.keys(row)
  //       .filter((key): key is `date_${string}` => key.startsWith("date_"))
  //       .map((key) => row[key as keyof IOccupancyForecastReport] ?? "");
  //     return [row.name.trim() || "", ...dateColumns];
  //   });

  //   // Add table to the PDF
  //   (doc as T).autoTable({
  //     head: [headers],
  //     body: rows,
  //     startY: textY,
  //     styles: { fontSize: 8 },
  //     margin: { top: 50 },
  //     columnStyles: {
  //       0: { cellWidth: 40 },
  //     },
  //   });

  //   // Save the file
  //   doc.save("occupancy-forecast.pdf");
  // };

  const exportExcel = () => {
    const headers = columns.map((col) => col.field.replace(/^date_/, ""));
    const rows = (filterRoomList ?? [])
      .map((row: IOccupancyForecastReport) => {
        const dateColumns = Object.keys(row)
          .filter((key): key is `date_${string}` => key.startsWith("date_"))
          .map((key) => row[key as keyof IOccupancyForecastReport] ?? "");
        const cleanName = row.name.replace(/[+-]/g, "");
        return [cleanName || "", ...dateColumns].join(",");
      })
      .join("\n");
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "occupancy-forecast.csv";
    link.click();
  };

  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle,
  });

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
        ref={contentRef}
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
                onClick={() => reactToPrintFn()}
              >
                Print
              </Button>
            </Stack>
          </Box>
        </Stack>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={5}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={filters.start_date ? dayjs(filters.start_date) : null}
                onChange={handleStartDateChange}
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={5}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date"
                value={filters.end_date ? dayjs(filters.end_date) : null}
                onChange={handleStartDateChange}
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    disabled: true,
                  },
                }}
                disableOpenPicker={true}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl>
              <Select
                value={selectedRange}
                onChange={handleChange}
                displayEmpty
                size="small"
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="3month">3 Months</MenuItem>
                <MenuItem value="6month">6 Months</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box mt={3}>
          <DataGrid
            getRowId={(row) => row.name}
            rows={filterRoomList}
            columns={columns}
            initialState={{
              sorting: {
                sortModel: [{ field: "arrivalDate", sort: "asc" }],
              },
            }}
            slots={{
              toolbar: CustomToolbar,
              pagination: null,
            }}
            slotProps={{
              pagination: {
                labelDisplayedRows: paginationlabelDisplayedRows,
              },
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
      </Paper>
    </Box>
  );
};

export default OccupancyForecastReport;

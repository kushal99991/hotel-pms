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
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  ReservationStatusEnum,
  reservationStatusDisplayValues,
} from "constants/reservation";
import { getMoment } from "utils/helperFunctions/common";
import { getCurrentRoom } from "utils/reservations";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";
import { appConfig } from "config/app.config";
import exampleLogo from "assets/images/logo.png";
import useCustomStatus from "hooks/useCustomStatus";
import { CommonPagination } from "utils/FilterComponent";

export interface BasicReservationReportFilter {
  roomType?: string;
  reservation_status?: ReservationStatusEnum;
  startDate?: Moment | undefined;
  endDate?: Moment | undefined;
}

interface BasicReservationReportProps {
  title: string;
  fileTitle: string;
  defaultFilter?: BasicReservationReportFilter;
  minDate?: Moment;
}

const BasicReservationReport: React.FC<BasicReservationReportProps> = ({
  title,
  fileTitle,
  defaultFilter = {} as BasicReservationReportFilter,
  minDate,
}) => {
  const { users, properties, currentTimeZone } = useAuth();
  const { reservationStatusOptions } = useCustomStatus();
  const reservationStatusOptionsWithColors = reservationStatusOptions.map(
    (option) => {
      const statusInfo =
        reservationStatusDisplayValues[option.value as ReservationStatusEnum];
      return {
        ...option,
        icon: statusInfo ? (
          <Chip
            size="small"
            label={option.label}
            sx={{
              backgroundColor: statusInfo.color,
              color: statusInfo.contrastColor ?? "#000",
              pointerEvents: "none",
            }}
          />
        ) : undefined,
        label: "",
      };
    }
  );
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );
  const [filter, setFilters] = useState<BasicReservationReportFilter>({
    roomType: defaultFilter.roomType ?? "",
    reservation_status:
      defaultFilter.reservation_status ?? ReservationStatusEnum.ARRIVING,
    startDate: defaultFilter.startDate,
    endDate: defaultFilter.endDate,
  });

  const {
    data: arrivalReportList,
    isFetching,
    isLoading,
  } = useGetReservationListQuery(
    {
      room_type: filter?.roomType,
      start_date: filter?.startDate?.format(appConfig.dateApiFormat),
      end_date: filter?.endDate
        ? filter.endDate.format(appConfig.dateApiFormat)
        : "",
      reservation_status: filter.reservation_status,
      property_id: users?.defaultPropertyId ?? 0,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();
  const generatedOnDate = getMoment(null, currentTimeZone).format(
    "MMM DD, YYYY,  hh:mm:ss A"
  );

  useEffect(() => {
    getRoomTypeByPropertyId({
      propertyId: users?.defaultPropertyId ?? 1,
    });
  }, [users?.defaultPropertyId, getRoomTypeByPropertyId]);

  const roomTypeOptions = [
    { label: "All", value: "" },
    ...(roomTypeList ?? []).map((room) => ({
      label: room.type,
      value: room.type,
    })),
  ];

  const handleStartDateChange = (date: Moment | null) => {
    if (date) {
      setFilters((prev) => ({ ...prev, startDate: date }));
    } else {
      setFilters((prev) => ({ ...prev, startDate: undefined }));
    }
  };

  const handleEndDateChange = (date: Moment | null) => {
    if (date) {
      setFilters((prev) => ({ ...prev, endDate: date }));
    } else {
      setFilters((prev) => ({ ...prev, endDate: undefined }));
    }
  };

  const columns: GridColDef<IReservationResponse>[] = [
    {
      field: "reservation_first_guest_info",
      headerName: "Guest Name",
      flex: 1.5,
      minWidth: 150,
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.last_name || ""}, ${reservation_first_guest_info?.first_name || ""}`,
    },
    {
      field: "start_date",
      headerName: "Arrival Date",
      flex: 1.2,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      valueFormatter: (_, { start_date }) =>
        start_date ? modifyToDisplayDate(start_date) : "",
    },
    {
      field: "arrival_time",
      headerName: "Arrival Time",
      flex: 1.4,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { checkin_time, expected_checkin_time }) => {
        if (checkin_time) return checkin_time;
        return expected_checkin_time
          ? `${expected_checkin_time} (expected)`
          : "";
      },
    },
    {
      field: "end_date",
      headerName: "Departure Date",
      flex: 1.2,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      valueFormatter: (_, { end_date }) =>
        end_date ? modifyToDisplayDate(end_date) : "",
    },
    {
      field: "departure_time",
      headerName: "Departure Time",
      flex: 1.4,
      minWidth: 220,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { checkout_time, expected_checkout_time }) => {
        if (checkout_time) return checkout_time;
        return expected_checkout_time
          ? `${expected_checkout_time} (expected)`
          : "";
      },
    },
    {
      field: "id",
      headerName: "Room Number",
      flex: 1,
      minWidth: 130,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, reservation) =>
        getCurrentRoom(reservation)?.room_number || "",
    },
    {
      field: "room_type.name",
      headerName: "Room Type",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { room_type }) => room_type?.type || "",
    },
    {
      field: "adults_children",
      headerName: "Adt. / Child",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) =>
        `${row.adults_count ?? 0}/${row.children_count ?? 0}`,
    },
    {
      field: "rate_code.name",
      headerName: "Rate Code",
      flex: 0.8,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { rate_code }) => rate_code?.name || "",
    },
    {
      field: "group_code",
      headerName: "Group Code",
      flex: 0.8,
      minWidth: 130,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { group }) => group?.group_code || "",
    },
    {
      field: "special_requests",
      headerName: "Special Request / Comment",
      flex: 1.7,
      minWidth: 250,
    },
  ];

  function genFileName() {
    const reportFilePrefix = fileTitle ?? "reservation-report";
    const datePart = getMoment(null, currentProperty?.timezone).format(
      appConfig.displayDateFormat
    );
    return `${reportFilePrefix}_${datePart}`.toLowerCase().replace(/\s+/g, "-");
  }

  const convertImageToGrayscaleBase64 = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
        const base64 = canvas.toDataURL("image/png").split(",")[1];
        resolve(base64);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
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
    const doc = new jsPDF("l");
    const reportTitle = title ?? "Reservation Report";
    const propertyTodayMoment = getMoment(null, currentTimeZone);
    const subtitle =
      filter?.startDate && filter?.endDate
        ? `Period: ${filter.startDate.format(appConfig.displayDateFormat)} to ${filter.endDate.format(appConfig.displayDateFormat)}`
        : filter?.startDate
          ? `Period: From ${filter.startDate.format(appConfig.displayDateFormat)}`
          : filter?.endDate
            ? `Period: Until ${filter.endDate.format(appConfig.displayDateFormat)}`
            : `Period: ${propertyTodayMoment.format(appConfig.dateDayMonth)}`;

    const timestamp = `Generated on: ${propertyTodayMoment.format(appConfig.displayDateWithTimeFormat)}`;
    const generatedBy = `Generated by : ${users?.firstName} ${users?.lastName}`;
    let imageUrl = exampleLogo;
    imageUrl = currentProperty?.logo ?? imageUrl;

    // Extract the file extension from the image URL
    if (imageUrl) {
      const isValid = await isValidImageUrl(imageUrl);

      const x = 10;
      const y = 15;
      const size = 30;
      const radius = size / 2;

      // Try to convert to grayscale, fallback to regular if it fails
      let imagebase64Image: string;
      try {
        if (isValid) {
          imagebase64Image = await convertImageToGrayscaleBase64(imageUrl);
        } else {
          imagebase64Image =
            await convertImageToGrayscaleBase64(exampleLogo);
        }
      } catch {
        // Fallback to regular base64 if grayscale conversion fails
        imagebase64Image = await convertImageUrlToBase64(
          isValid ? imageUrl : exampleLogo
        );
      }

      doc.setFillColor(255, 255, 255);
      doc.ellipse(x + radius, y + radius, radius, radius, "F");
      doc.addImage(
        "data:image/png;base64," + imagebase64Image,
        "PNG",
        x,
        y,
        size,
        size,
        undefined,
        "FAST"
      );
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const textX = pageWidth - 14;
    let textY = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(reportTitle, textX, textY, { align: "right" });
    textY += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(subtitle, textX, textY, { align: "right" });
    textY += 7;
    doc.text(timestamp, textX, textY, { align: "right" });
    textY += 7;

    doc.text(generatedBy, textX, textY, { align: "right" });
    textY += 15;

    const headers = [
      "Guest Name",
      "Arrival",
      "Arr Time",
      "Departure",
      "Dep Time",
      "Room #",
      "Type",
      "Adt. / Child",
      "Rate",
      "Group",
      "Requests",
    ];
    const tableData = arrivalReportList?.map((row: IReservationResponse) => {
      const room = getCurrentRoom(row);
      return [
        `${row.reservation_first_guest_info?.last_name || ""}, ${row.reservation_first_guest_info?.first_name || ""}`,
        row.start_date ? modifyToDisplayDate(row.start_date) : "",
        row.checkin_time ||
          (row.expected_checkin_time
            ? `${row.expected_checkin_time} (expected)`
            : ""),
        row.end_date ? modifyToDisplayDate(row.end_date) : "",
        row.checkout_time ||
          (row.expected_checkout_time
            ? `${row.expected_checkout_time} (expected)`
            : ""),
        room?.room_number || "",
        row.room_type?.type || "",
        `${row.adults_count ?? 0}/${row.children_count ?? 0}`,
        row.rate_code?.name || "",
        row.group?.group_code || "",
        row.special_requests || "",
      ];
    });

    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: textY,
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0], // Black text
        fontStyle: "bold",
        lineWidth: 0.75,
        lineColor: [0, 0, 0], // Black border
      },
      margin: { top: 50 },
      alternateRowStyles: {
        fillColor: [252, 252, 252], // Very minimal gray to save ink
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1,
      didParseCell: (data: any) => {
        const centeredColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        if (centeredColumns.includes(data.column.index)) {
          data.cell.styles.halign = "center";
        }
      },
      didDrawCell: (data: any) => {
        const { cell, doc: pdfDoc, section, row } = data;
        if (section === "head") {
          pdfDoc.setDrawColor(0, 0, 0);
          pdfDoc.setLineWidth(0.5);
          // Top border
          pdfDoc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
          // Bottom border
          pdfDoc.line(
            cell.x,
            cell.y + cell.height,
            cell.x + cell.width,
            cell.y + cell.height
          );
        }
        // Redraw thick border at first body row top (same line as header bottom)
        // to prevent the thin body border (0.1) from overwriting the thick header bottom (0.75)
        if (section === "body" && row.index === 0) {
          pdfDoc.setDrawColor(0, 0, 0);
          pdfDoc.setLineWidth(0.5);
          pdfDoc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
        }
      },
    });

    doc.save(`${genFileName()}.pdf`);
  };

  const exportExcel = () => {
    const headers = [
      "Guest Name",
      "Arrival Date",
      "Expected Arrival Time",
      "Departure Date",
      "Expected Departure Time",
      "Room Number",
      "Room Type",
      "Adt. / Child",
      "Rate Code",
      "Group Code",
      "Special Request / Comment",
    ].join(",");

    const rows = arrivalReportList
      ?.map((row: IReservationResponse) => {
        const room = getCurrentRoom(row);
        return [
          `"${row.reservation_first_guest_info?.last_name || ""}, ${row.reservation_first_guest_info?.first_name || ""}"`,
          row.start_date ? modifyToDisplayDate(row.start_date) : "",
          row.checkin_time ||
            (row.expected_checkin_time
              ? `${row.expected_checkin_time} (expected)`
              : ""),
          row.end_date ? modifyToDisplayDate(row.end_date) : "",
          row.checkout_time ||
            (row.expected_checkout_time
              ? `${row.expected_checkout_time} (expected)`
              : ""),
          room?.room_number || "",
          row.room_type?.type || "",
          `${row.adults_count ?? 0}/${row.children_count ?? 0}`,
          row.rate_code?.name || "",
          row.group?.group_code || "",
          `"${(row.special_requests || "").replace(/"/g, '""')}"`,
        ].join(",");
      })
      .join("\n");

    const fileSlug = title.toLowerCase().replace(/\s+/g, "-");
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${genFileName()}.csv`;
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
                {filter?.startDate && filter?.endDate
                  ? `Period: ${filter.startDate.format(appConfig.displayDateFormat)} to ${filter.endDate.format(appConfig.displayDateFormat)}`
                  : filter?.startDate
                    ? `Period: From ${filter.startDate.format(appConfig.displayDateFormat)}`
                    : filter?.endDate
                      ? `Period: Until ${filter.endDate.format(appConfig.displayDateFormat)}`
                      : `Period: ${getMoment(null, currentTimeZone).format(appConfig.dateMonthDayYear)}`}
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
                  label="Arrival Date"
                  value={
                    filter?.startDate
                      ? filter.startDate
                      : getMoment(null, currentTimeZone)
                  }
                  onChange={handleStartDateChange}
                  minDate={minDate ?? getMoment(null, currentTimeZone)}
                  maxDate={filter?.endDate ? filter.endDate : undefined}
                  format={appConfig.displayDateFormat}
                  timezone={currentTimeZone}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Arrival Date",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Departure Date"
                  value={filter?.endDate}
                  onChange={handleEndDateChange}
                  format={appConfig.displayDateFormat}
                  minDate={
                    filter?.startDate ?? getMoment(null, currentTimeZone)
                  }
                  timezone={currentTimeZone}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Departure Date",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          <Grid container spacing={2} paddingRight={4}>
            <Grid item xs={12} md={2}>
              <CustomDropdown
                label="Room Type"
                placeholder="Room Type"
                options={roomTypeOptions || []}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    roomType: event.target.value as string,
                  }));
                }}
                value={filter?.roomType}
                isInvalid={false}
                fullWidth
                aria-label="Room Type"
                data-testid="room-type"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <CustomDropdown
                label="Reservation Status"
                placeholder="Reservation Status"
                options={reservationStatusOptionsWithColors}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    reservation_status: event.target
                      .value as ReservationStatusEnum,
                  }));
                }}
                value={filter.reservation_status}
                isInvalid={false}
                fullWidth
                aria-label="Reservation Status"
                data-testid="reservation-status"
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
                  sortModel: [{ field: "start_date", sort: "asc" }],
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
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },

                "& .MuiDataGrid-cell:focus-within": {
                  outline: "none",
                },
              }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BasicReservationReport;

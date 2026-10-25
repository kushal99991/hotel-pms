import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "hooks";
import { format } from "date-fns";
import {
  Box,
  Button,
  Chip,
  Link,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
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
import { getMoment } from "utils/helperFunctions/common";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";
import { getCurrentRoom } from "utils/reservations";
import exampleLogo from "assets/images/logo.png";
import { apiAmountToNumber } from "utils/dataFormats";
import { CommonPagination } from "utils/FilterComponent";

// Type declaration for jsPDF autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: { finalY: number };
  }
}

const HighBalanceReport: React.FC = () => {
  const navigate = useNavigate();
  const { users, currentTimeZone, properties } = useAuth();
  const { getFilterOperators } = useFilter();

  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );

  const [startDate] = useState<string>(
    getMoment(null, currentTimeZone).format()
  ); // store as string
  const [endDate] = useState<string>(""); // store as string

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const { socket } = useSocket();

  const generatedOnDate = getMoment(null, currentTimeZone).format(
    "MMM DD, YYYY,  HH:mm:ss A"
  );

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
    data: reservationListData = [],
    isFetching,
    isLoading,
    refetch,
  } = useGetReservationListQuery(
    {
      property_id: users?.defaultPropertyId ?? 0,
      start_date: getMoment(startDate, currentTimeZone).format(
        appConfig.dateApiFormat
      ),
      end_date: getMoment(endDate, currentTimeZone).format(
        appConfig.dateApiFormat
      ),
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

  const res = useMemo(() => {
    return {
      departureList: reservationList.filter(
        (a) =>
          a.status === ReservationStatusEnum.DEPARTING &&
          apiAmountToNumber(a.balance) > 0
      ),
      inHouseList: reservationList.filter(
        (a) =>
          a.status === ReservationStatusEnum.IN_HOUSE &&
          apiAmountToNumber(a.balance) > 0
      ),
    };
  }, [reservationList]);

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
    try {
      const doc = new jsPDF();
      const title = "High Balance Report";
      const subtitle =
        startDate && endDate
          ? `Period: ${getMoment(startDate, currentTimeZone).format(appConfig.displayDateFormat)} to ${getMoment(endDate, currentTimeZone).format(appConfig.displayDateFormat)}`
          : startDate
            ? `Period: From ${getMoment(startDate, currentTimeZone).format(appConfig.displayDateFormat)}`
            : endDate
              ? `Period: Until ${getMoment(endDate, currentTimeZone).format(appConfig.displayDateFormat)}`
              : "Period: ";

      const timestamp = `Generated on: ${generatedOnDate}`;
      const generatedBy = `Generator By : ${users?.firstName || ""} ${users?.lastName || ""}`;
      let imageUrl = exampleLogo;
      imageUrl = currentProperty?.logo ?? imageUrl;

      // Extract the file extension from the image URL
      if (imageUrl) {
        try {
          const isValid = await isValidImageUrl(imageUrl);

          const x = 10;
          const y = 10;
          const size = 40;
          const radius = size / 2;
          let imagebase64Image = await convertImageUrlToBase64(exampleLogo);
          let imageExtension = "PNG";

          if (isValid) {
            const base64Image = await convertImageUrlToBase64(imageUrl);
            const extension =
              imageUrl?.split(".")?.pop()?.toLowerCase() ?? "PNG";

            if (extension.toUpperCase() !== "AVIF") {
              imagebase64Image = base64Image;
              imageExtension = extension.toUpperCase();
            }
          }

          doc.setFillColor(255, 255, 255);
          doc.ellipse(x + radius, y + radius, radius, radius, "F");
          doc.addImage(
            imagebase64Image,
            imageExtension,
            x,
            y,
            size,
            size,
            undefined,
            "FAST"
          );
        } catch {
          /** empty catch error */
          // Continue without image
        }
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

      // In-House Guests Table (always include even if empty)
      const inHouseHeaders = [
        "First Name",
        "Last Name",
        "Status",
        "GTD",
        "Arrival",
        "Departure",
        "Room No.",
        "Room Type",
        "Rate",
        "Balance",
        "Folio No.",
      ];

      const inHouseTableData = res.inHouseList.map((reservation) => [
        reservation.reservation_first_guest_info?.first_name || "",
        reservation.reservation_first_guest_info?.last_name || "",
        reservationStatusDisplayValues[reservation.status]?.label ||
          reservation.status,
        reservation.is_guaranteed ? "Yes" : "No",
        reservation.start_date
          ? modifyToDisplayDate(reservation.start_date)
          : "",
        reservation.end_date ? modifyToDisplayDate(reservation.end_date) : "",
        getCurrentRoom(reservation)?.room_number || "Not Assigned",
        reservation.room_type?.type || "",
        reservation.rate_code?.name || "",
        apiAmountToNumber(reservation.balance).toFixed(2),
        reservation.id.toString(),
      ]);

      // Add In-House table title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`In-House Guests with High Balance`, 15, textY);
      textY += 8;

      // Add In-House table
      doc.autoTable({
        head: [inHouseHeaders],
        body:
          inHouseTableData.length > 0
            ? inHouseTableData
            : [["No records found", "", "", "", "", "", "", "", "", "", ""]],
        startY: textY,
        styles: { fontSize: 8 },
        margin: { top: 50 },
      });

      textY = doc.lastAutoTable.finalY + 15;

      // Departing Guests Table (always include even if empty)
      const departureHeaders = [
        "First Name",
        "Last Name",
        "Status",
        "GTD",
        "Arrival",
        "Departure",
        "Room No.",
        "Room Type",
        "Rate",
        "Balance",
        "Folio No.",
      ];

      const departureTableData = res.departureList.map((reservation) => [
        reservation.reservation_first_guest_info?.first_name || "",
        reservation.reservation_first_guest_info?.last_name || "",
        reservationStatusDisplayValues[reservation.status]?.label ||
          reservation.status,
        reservation.is_guaranteed ? "Yes" : "No",
        reservation.start_date
          ? modifyToDisplayDate(reservation.start_date)
          : "",
        reservation.end_date ? modifyToDisplayDate(reservation.end_date) : "",
        getCurrentRoom(reservation)?.room_number || "Not Assigned",
        reservation.room_type?.type || "",
        reservation.rate_code?.name || "",
        apiAmountToNumber(reservation.balance).toFixed(2),
        reservation.id.toString(),
      ]);

      // Add Departing table title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Departing Guests with High Balance`, 15, textY);
      textY += 8;

      // Add Departing table
      doc.autoTable({
        head: [departureHeaders],
        body:
          departureTableData.length > 0
            ? departureTableData
            : [["No records found", "", "", "", "", "", "", "", "", "", ""]],
        startY: textY,
        styles: { fontSize: 8 },
        margin: { top: 50 },
      });

      // Save the file
      doc.save(`high-balance-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch {
      alert("An error occurred while generating the PDF. Please try again.");
    }
  };

  const exportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Define column headers once
      const headers = [
        "First Name",
        "Last Name",
        "Reservation Status",
        "GTD",
        "Arrival",
        "Departure",
        "Room No.",
        "Room Type",
        "Rate",
        "Balance",
        "Folio No.",
      ];

      const columnWidths = [
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 18 }, // Reservation Status
        { wch: 8 }, // GTD
        { wch: 12 }, // Arrival
        { wch: 12 }, // Departure
        { wch: 10 }, // Room No.
        { wch: 15 }, // Room Type
        { wch: 12 }, // Rate
        { wch: 10 }, // Balance
        { wch: 12 }, // Folio No.
      ];

      const createSheetData = (dataList: any[]) => {
        if (dataList.length > 0) {
          // Map real data rows
          return dataList.map((reservation) => ({
            "First Name":
              reservation.reservation_first_guest_info?.first_name || "",
            "Last Name":
              reservation.reservation_first_guest_info?.last_name || "",
            "Reservation Status":
              reservationStatusDisplayValues[
                reservation.status as ReservationStatusEnum
              ]?.label || reservation.status,
            GTD: reservation.is_guaranteed ? "Yes" : "No",
            Arrival: reservation.start_date
              ? modifyToDisplayDate(reservation.start_date)
              : "",
            Departure: reservation.end_date
              ? modifyToDisplayDate(reservation.end_date)
              : "",
            "Room No.":
              getCurrentRoom(reservation)?.room_number || "Not Assigned",
            "Room Type": reservation.room_type?.type || "",
            Rate: reservation.rate_code?.name || "",
            Balance: (reservation.balance || 0).toFixed(2),
            "Folio No.": reservation.id.toString(),
          }));
        } else {
          // Create "No data found" row under headers
          const emptyRow = headers.map((_, index) =>
            index === Math.floor(headers.length / 2) ? "No data found" : ""
          );
          return [Object.fromEntries(headers.map((h, i) => [h, emptyRow[i]]))];
        }
      };

      // In-House Sheet
      const inHouseData = createSheetData(res.inHouseList);
      const wsInHouse = XLSX.utils.json_to_sheet(inHouseData, {
        header: headers,
      });
      wsInHouse["!cols"] = columnWidths;
      XLSX.utils.book_append_sheet(wb, wsInHouse, "In-House Guests");

      // Departing Sheet
      const departureData = createSheetData(res.departureList);
      const wsDeparture = XLSX.utils.json_to_sheet(departureData, {
        header: headers,
      });
      wsDeparture["!cols"] = columnWidths;
      XLSX.utils.book_append_sheet(wb, wsDeparture, "Departing Guests");

      // Write file
      XLSX.writeFile(
        wb,
        `high-balance-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );
    } catch {
      alert(
        "An error occurred while generating the Excel file. Please try again."
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns: GridColDef<IReservationResponse>[] = [
    {
      field: "reservation_first_guest_info.first_name",
      headerName: "First Name",
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.first_name || ""}`,
    },
    {
      field: "reservation_first_guest_info.last_name",
      headerName: "Last Name",
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.last_name || ""}`,
    },
    {
      field: "status",
      headerName: "Reservation Status",
      minWidth: 140,
      flex: 1,
      headerAlign: "center",
      align: "center",
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
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { is_guaranteed }) => (is_guaranteed ? "Yes" : "No"),
    },
    {
      field: "start_date",
      headerName: "Arrival",
      minWidth: 110,
      flex: 1,
      headerAlign: "center",
      align: "center",
      filterOperators: getFilterOperators("date", "Arrival"),
      valueFormatter: (_, { start_date }) =>
        start_date ? modifyToDisplayDate(start_date) : "",
    },
    {
      field: "end_date",
      headerName: "Departure",
      minWidth: 110,
      flex: 1,
      headerAlign: "center",
      align: "center",
      filterOperators: getFilterOperators("date", "Departure"),
      valueFormatter: (_, { end_date }) =>
        end_date ? modifyToDisplayDate(end_date) : "",
    },
    {
      field: "room_number",
      headerName: "Room No.",
      minWidth: 110,
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, reservation) =>
        getCurrentRoom(reservation)?.room_number || "Not Assigned",
    },
    {
      field: "room_type",
      headerName: "Room Type",
      minWidth: 100,
      flex: 1,
      headerAlign: "center",
      align: "center",
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
      headerAlign: "center",
      align: "center",
      valueGetter: (_, { rate_code }) => rate_code?.name || "",
      filterOperators: getFilterOperators("dropdown", "Rate", rateCodeOptions),
    },
    {
      field: "balance",
      headerName: "Balance",
      minWidth: 100,
      flex: 1,
      headerAlign: "center",
      align: "right",
      valueGetter: (_, { balance }) => balance || 0,
      valueFormatter: (value) => {
        const numericValue =
          typeof value === "number" ? value : parseFloat(value) || 0;
        return numericValue.toFixed(2);
      },
    },
    {
      field: "id",
      headerName: "Folio No.",
      minWidth: 100,
      flex: 1,
      headerAlign: "center",
      align: "center",
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
              <Typography variant="h5" component="h1" gutterBottom>
                High Balance Report
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {startDate && endDate
                  ? `Period: ${getMoment(startDate, currentTimeZone).format(appConfig.displayDateFormat)} to ${getMoment(endDate, currentTimeZone).format(appConfig.displayDateFormat)}`
                  : startDate
                    ? `Period: From ${getMoment(startDate, currentTimeZone).format(appConfig.displayDateFormat)}`
                    : endDate
                      ? `Period: Until ${getMoment(endDate, currentTimeZone).format(appConfig.displayDateFormat)}`
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

          {/* In-House Guests with High Balance */}
          <Box mb={4}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{
                fontWeight: "600",
                color: "text.primary",
                fontSize: "1rem",
                marginLeft: 1,
                marginBottom: 2,
              }}
            >
              In-House Guests with High Balance
            </Typography>
            <DataGrid
              rows={res.inHouseList ?? []}
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
                  backgroundColor: "#eeeeee",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#eeeeee",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-row:hover": {
                  cursor: "pointer",
                },
              }}
            />
          </Box>

          {/* Departing Guests with High Balance */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{
                fontWeight: "600",
                color: "text.primary",
                fontSize: "1rem",
                marginLeft: 1,
                marginBottom: 2,
              }}
            >
              Departing Guests with High Balance
            </Typography>
            <DataGrid
              rows={res.departureList ?? []}
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
                  backgroundColor: "#eeeeee",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#eeeeee",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-row:hover": {
                  cursor: "pointer",
                },
              }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HighBalanceReport;

import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { Moment } from "moment-timezone";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useGetCompReservationsMutation } from "services/dashboardSlice";
import { useAuth } from "hooks";
import { ICompReservation } from "types/bookingDashboardTypes";
import { CommonPagination } from "utils/FilterComponent";
import { appConfig } from "config/app.config";
import { getMoment } from "utils/helperFunctions/common";

const CompRoomReport: React.FC = () => {
  const { users, currentTimeZone } = useAuth();
  const [startDate, setStartDate] = useState<string>(
    getMoment(null, currentTimeZone).format(appConfig.dateApiFormat)
  );
  const [endDate, setEndDate] = useState<string>("");
  const [fetchCompReservations, { data = [], isLoading }] =
    useGetCompReservationsMutation();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      fetchCompReservations({
        property_id: users.defaultPropertyId,
        arrival_date: startDate,
        departure_date: endDate,
      });
    }
  }, [users?.defaultPropertyId, startDate, endDate, fetchCompReservations]);

  const columns: GridColDef<ICompReservation>[] = useMemo(
    () => [
      { field: "first_name", headerName: "First Name", flex: 1, minWidth: 120 },
      { field: "last_name", headerName: "Last Name", flex: 1, minWidth: 120 },
      {
        field: "reservation_status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "arrival_date",
        headerName: "Arrival",
        flex: 1,
        minWidth: 120,
        valueGetter: (_, row) => row.arrival_date ?? "",
      },
      {
        field: "departure_date",
        headerName: "Departure",
        flex: 1,
        minWidth: 120,
        valueGetter: (_, row) => row.departure_date ?? "",
      },
      {
        field: "room_number",
        headerName: "Room No.",
        flex: 1,
        minWidth: 100,
        valueGetter: (_, row) => row.room_number ?? "-",
      },
      { field: "rate_code", headerName: "Rate Code", flex: 1, minWidth: 110 },
      {
        field: "rate_amount",
        headerName: "Rate Amount",
        flex: 1,
        minWidth: 110,
        align: "right",
        headerAlign: "center",
        valueGetter: (_, row) => row.rate_amount ?? 0,
        valueFormatter: (value) => Number(value ?? 0).toFixed(2),
      },
      {
        field: "reservation_id",
        headerName: "Reservation ID",
        flex: 1,
        minWidth: 130,
      },
    ],
    []
  );

  const exportPDF = async () => {
    const doc = new jsPDF();
    const title = "Comp Room Report";
    const subtitle = endDate
      ? `Date Range: ${getMoment(startDate, currentTimeZone).format(appConfig.displayDateFormat)} - ${getMoment(endDate, currentTimeZone).format(appConfig.displayDateFormat)}`
      : `Date: ${getMoment(startDate, currentTimeZone).format(appConfig.displayDateFormat)}`;
    const generatedOn = `Generated on: ${getMoment(null, currentTimeZone).format("MMM DD, YYYY,  HH:mm:ss A")}`;

    // Title block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, 15, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(subtitle, 15, 28);
    doc.text(generatedOn, 15, 36);

    const headers = [
      "First Name",
      "Last Name",
      "Status",
      "Arrival",
      "Departure",
      "Room No.",
      "Rate Code",
      "Rate Amount",
      "Reservation ID",
    ];

    const rows = (data as ICompReservation[]).map((row) => [
      row.first_name ?? "",
      row.last_name ?? "",
      row.reservation_status ?? "",
      row.arrival_date ?? "",
      row.departure_date ?? "",
      row.room_number ?? "-",
      row.rate_code ?? "",
      Number(row.rate_amount ?? 0).toFixed(2),
      String(row.reservation_id ?? ""),
    ]);

    // Table
    doc.autoTable({
      head: [headers],
      body:
        rows.length > 0
          ? rows
          : [["No records found", "", "", "", "", "", "", "", ""]],
      startY: 44,
      styles: { fontSize: 8 },
      margin: { top: 50 },
    });

    const fileName = endDate
      ? `comp-room-report-${getMoment(startDate, currentTimeZone).format("yyyy-MM-dd")}_to_${getMoment(endDate, currentTimeZone).format("yyyy-MM-dd")}.pdf`
      : `comp-room-report-${getMoment(startDate, currentTimeZone).format("yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headers = [
      "First Name",
      "Last Name",
      "Status",
      "Arrival",
      "Departure",
      "Room No.",
      "Rate Code",
      "Rate Amount",
      "Reservation ID",
    ];

    const columnWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 16 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
    ];

    const rows = (data as ICompReservation[]).map((row) => ({
      "First Name": row.first_name ?? "",
      "Last Name": row.last_name ?? "",
      Status: row.reservation_status ?? "",
      Arrival: row.arrival_date ?? "",
      Departure: row.departure_date ?? "",
      "Room No.": row.room_number ?? "-",
      "Rate Code": row.rate_code ?? "",
      "Rate Amount": Number(row.rate_amount ?? 0).toFixed(2),
      "Reservation ID": String(row.reservation_id ?? ""),
    }));

    const sheet = XLSX.utils.json_to_sheet(
      rows.length > 0
        ? rows
        : [
            Object.fromEntries(
              headers.map((h, i) => [h, i === 0 ? "No records found" : ""])
            ),
          ],
      {
        header: headers,
      }
    );
    (sheet as any)["!cols"] = columnWidths;
    XLSX.utils.book_append_sheet(wb, sheet, "Comp Room Report");

    const fileName = endDate
      ? `comp-room-report-${getMoment(startDate, currentTimeZone).format("yyyy-MM-dd")}_to_${getMoment(endDate, currentTimeZone).format("yyyy-MM-dd")}.xlsx`
      : `comp-room-report-${getMoment(startDate, currentTimeZone).format("yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          "@media print": { boxShadow: "none" },
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" component="h1">
              Comp Room Report
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ "@media print": { display: "none" } }}
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
            <Grid container paddingRight={4} spacing={2}>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={
                    startDate ? moment.tz(startDate, currentTimeZone) : null
                  }
                  onChange={(value: Moment | null) => {
                    if (!value) return;
                    setStartDate(
                      moment(value)
                        .tz(currentTimeZone)
                        .format(appConfig.dateApiFormat)
                    );
                  }}
                  format={appConfig.displayDateFormat}
                  timezone={currentTimeZone}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Select Start Date",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate ? moment.tz(endDate, currentTimeZone) : null}
                  onChange={(value: Moment | null) => {
                    if (!value) return;
                    setEndDate(
                      moment(value)
                        .tz(currentTimeZone)
                        .format(appConfig.dateApiFormat)
                    );
                  }}
                  format={appConfig.displayDateFormat}
                  timezone={currentTimeZone}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Select End Date",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>

          <DataGrid
            rows={data as ICompReservation[]}
            getRowId={(row) => row.reservation_id}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 50 } },
            }}
            pageSizeOptions={[25, 50, 100, 200, 500]}
            loading={isLoading}
            autoHeight
            slots={{ pagination: CommonPagination }}
            sx={{
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                fontWeight: "bold",
                fontSize: 14,
                backgroundColor: "#eeeeee",
              },
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export default CompRoomReport;

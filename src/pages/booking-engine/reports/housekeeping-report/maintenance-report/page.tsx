import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNavigate } from "react-router-dom";
import useAuth from "hooks/useAuth";
import {
  useGetMaintenanceEnumListQuery,
  useGetMaintenanceListMutation,
} from "services/maintenanceSlice";
import { IMaintenanceType } from "types/maintenanceTypes";
import { formatToDisplayDate } from "utils/helperFunctions/dateFormat";
import { truncateStr } from "utils/helperFunctions/strings";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { CommonPagination } from "utils/FilterComponent";

const MaintenanceListing = () => {
  const navigate = useNavigate();
  const { users } = useAuth();
  const propertyID = users?.defaultPropertyId ?? 1;

  // Filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const [getMaintenanceList, { data: maintenanceList, isLoading }] =
    useGetMaintenanceListMutation();

  const { data: enumList } = useGetMaintenanceEnumListQuery();

  const statusOptions = enumList?.result.service_status?.map((item) => ({
    value: item,
    label: item,
  }));

  // Handle start date change
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setStartDate(date.format("YYYY-MM-DD"));
    } else {
      setStartDate("");
    }
  };

  // Handle end date change
  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setEndDate(date.format("YYYY-MM-DD"));
    } else {
      setEndDate("");
    }
  };

  // Handle service types change (multiple selection)
  const handleServiceTypesChange = (event: any) => {
    const value = event.target.value as string[];
    setSelectedStatuses(value);
  };

  useEffect(() => {
    // Fetch maintenance list with filters
    getMaintenanceList({
      //   ticket_status: ticketStatus,
      property_id: propertyID,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      service_status:
        selectedStatuses.length > 0 ? selectedStatuses.join(",") : undefined,
    });
  }, [startDate, endDate, selectedStatuses, propertyID]);

  const columns: GridColDef<IMaintenanceType>[] = [
    { field: "service_code", headerName: "Service Code", flex: 1.5 },
    { field: "service_status", headerName: "Status", flex: 1 },
    {
      field: "room",
      headerName: "Room",
      flex: 1,
      valueGetter: (_, raw) => raw?.room?.room_number ?? "N/A",
    },
    { field: "service_subject", headerName: "Description", flex: 2 },
    {
      field: "assigned_to",
      headerName: "Assigned",
      flex: 2,
      valueGetter: (_, raw) =>
        truncateStr(
          `${raw?.assigned_to_user?.first_name ?? ""} ${raw?.assigned_to_user?.last_name ?? "N/A"}`
        ),
    },
    {
      field: "assigned_by",
      headerName: "Created By",
      flex: 2,
      valueGetter: (_, raw) =>
        truncateStr(
          `${raw?.assigned_by_user?.first_name ?? ""} ${raw?.assigned_by_user?.last_name ?? "N/A"}`
        ),
    },
    {
      field: "created_at",
      headerName: "Created",
      flex: 1.5,
      valueGetter: (_, raw) =>
        raw.created_at ? formatToDisplayDate(new Date(raw.created_at)) : "",
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="View">
          <IconButton
            onClick={() =>
              navigate(
                `/booking-engine/rooms/maintenance/view/${params.row.id}`
              )
            }
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const title = "Maintenance Report";
    const subtitle =
      startDate && endDate
        ? `Period: ${format(new Date(startDate), "MM/dd/yyyy")} to ${format(new Date(endDate), "MM/dd/yyyy")}`
        : startDate
          ? `Period: From ${format(new Date(startDate), "MM/dd/yyyy")}`
          : endDate
            ? `Period: Until ${format(new Date(endDate), "MM/dd/yyyy")}`
            : "Period: All";

    const statusText = `Status: ${selectedStatuses ? selectedStatuses.join(", ") : "All"}`;
    const timestamp = `Generated on: ${format(new Date(), "PPpp")}`;

    // Add title and subtitle
    doc.setFontSize(20);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 30);
    doc.text(statusText, 14, 40);
    doc.text(timestamp, 14, 50);

    // Table headers and data
    const headers = [
      "Service Code",
      "Status",
      "Room",
      "Description",
      "Assigned To",
      "Created By",
      "Created Date",
    ];

    const tableData = maintenanceList?.map((row: IMaintenanceType) => [
      row.service_code || "",
      row.service_status || "",
      row.room?.room_number || "N/A",
      row.service_subject || "",
      `${row.assigned_to_user?.first_name || ""} ${row.assigned_to_user?.last_name || "N/A"}`,
      `${row.assigned_by_user?.first_name || ""} ${row.assigned_by_user?.last_name || "N/A"}`,
      row.created_at ? format(new Date(row.created_at), "MM/dd/yyyy") : "",
    ]);

    // Add table to the PDF
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8 },
      margin: { top: 60 },
    });

    // Save the file
    doc.save("maintenance-report.pdf");
  };

  // Export to Excel
  const exportExcel = () => {
    const headers = columns
      .filter((col) => col.field !== "actions") // Exclude action column
      .map((col) => col.headerName)
      .join(",");

    const rows = maintenanceList
      ?.map((row: IMaintenanceType) => [
        `"${row.service_code || ""}"`,
        `"${row.service_status || ""}"`,
        `"${row.room?.room_number || "N/A"}"`,
        `"${row.service_subject || ""}"`,
        `"${(row.assigned_to_user?.first_name || "") + " " + (row.assigned_to_user?.last_name || "N/A")}"`,
        `"${(row.assigned_by_user?.first_name || "") + " " + (row.assigned_by_user?.last_name || "N/A")}"`,
        `"${row.created_at ? format(new Date(row.created_at), "MM/dd/yyyy") : ""}"`,
      ])
      .map((row) => row.join(","))
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "maintenance-report.csv";
    link.click();
  };

  // Handle print
  const handlePrint = () => {
    window.print();
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
              <Typography variant="h5">Maintenance Report</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {startDate && endDate
                  ? `Period: ${format(new Date(startDate), "MM/dd/yyyy")} to ${format(new Date(endDate), "MM/dd/yyyy")}`
                  : startDate
                    ? `Period: From ${format(new Date(startDate), "MM/dd/yyyy")}`
                    : endDate
                      ? `Period: Until ${format(new Date(endDate), "MM/dd/yyyy")}`
                      : "Period: All"}
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

          {/* Filter controls */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} paddingRight={4}>
              <Grid item xs={12} md={4} mt={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate ? dayjs(startDate) : null}
                  onChange={handleStartDateChange}
                  maxDate={endDate ? dayjs(endDate) : undefined}
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4} mt={3}>
                <DatePicker
                  label="End Date"
                  value={endDate ? dayjs(endDate) : null}
                  onChange={handleEndDateChange}
                  format="YYYY-MM-DD"
                  minDate={startDate ? dayjs(startDate) : undefined}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <CustomDropdown
                  label="Ticket Status"
                  placeholder="Select Status"
                  options={statusOptions || []}
                  onChange={handleServiceTypesChange}
                  value={selectedStatuses} // Pass the array directly, not joined as a string
                  isInvalid={false}
                  fullWidth
                  sx={{ height: "41px", mt: "2px" }}
                  multiple={true} // Explicitly set to true
                  aria-label="Service Types"
                  data-testid="service-types"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>

          {/* Data Grid */}
          <Box sx={{ width: "100%", mt: 2 }}>
            <DataGrid
              getRowId={(row) => row.id}
              rows={maintenanceList ?? []}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              slots={{
                pagination: CommonPagination,
              }}
              autoHeight={true}
              loading={isLoading}
              pageSizeOptions={[5, 10, 25, 50]}
              checkboxSelection={false}
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  fontWeight: "bold",
                  fontSize: 17,
                },
                "@media print": {
                  "& .MuiDataGrid-main": {
                    width: "100%",
                  },
                },
              }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default MaintenanceListing;

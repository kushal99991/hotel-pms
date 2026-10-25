import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from "@mui/material";
import useAdmistrationReports from "hooks/useAdmistrationReports";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import useAuth from "hooks/useAuth";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IHistory } from "types/historyTypes";
import { CommonPagination } from "utils/FilterComponent";

// const userActivity = [
//   {
//     user: "John Manager",
//     role: "Manager",
//     lastLogin: "2023-06-13 08:30",
//     actions: 145,
//     status: "Active",
//   },
//   {
//     user: "Sarah Receptionist",
//     role: "Front Desk",
//     lastLogin: "2023-06-13 09:15",
//     actions: 98,
//     status: "Active",
//   },
//   {
//     user: "Mike Auditor",
//     role: "Night Audit",
//     lastLogin: "2023-06-13 01:45",
//     actions: 67,
//     status: "Active",
//   },
//   {
//     user: "Lisa Supervisor",
//     role: "Supervisor",
//     lastLogin: "2023-06-12 16:20",
//     actions: 23,
//     status: "Inactive",
//   },
// ];

// const systemMetrics = [
//   { metric: "Database Performance", value: 95, status: "Excellent" },
//   { metric: "Server Response Time", value: 88, status: "Good" },
//   { metric: "Storage Usage", value: 72, status: "Normal" },
//   { metric: "Network Connectivity", value: 99, status: "Excellent" },
// ];
const actionColorMap: Record<
  string,
  "success" | "info" | "warning" | "error" | "default"
> = {
  create: "success",
  update: "info",
  list: "default",
  view: "default",
  delete: "error",
};

const securityEvents = [
  {
    event: "Failed Login Attempt",
    user: "unknown@email.com",
    time: "2023-06-13 10:45",
    severity: "Medium",
  },
  {
    event: "Password Changed",
    user: "sarah.receptionist",
    time: "2023-06-13 09:30",
    severity: "Low",
  },
  {
    event: "Admin Access",
    user: "john.manager",
    time: "2023-06-13 08:15",
    severity: "Low",
  },
];

const AdministrationReports: React.FC = () => {
  const { currentTimeZone } = useAuth();
  const { userActivity, userList, systemPerformance } =
    useAdmistrationReports();

  const columns: GridColDef<IHistory>[] = [
    {
      field: "userName",
      headerName: "User",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight={600}>{params.row?.user?.user_name}</Typography>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography>
            {convertUtcToTimezone(
              params.row.created_at,
              currentTimeZone
            ).format("MM/DD/YYYY h:mm A")}
          </Typography>
        );
      },
    },
    {
      field: "detail",
      headerName: "Detail",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            textAlign: "center",
            whiteSpace: "normal", // allows wrapping
            wordBreak: "break-word", // breaks long words
            lineHeight: 1.4,
            width: "100%",
          }}
        >
          <Typography fontWeight={600} fontSize={13}>
            {params.row.details}
          </Typography>
        </Box>
      ),
    },
    {
      field: "action",
      headerName: "Status",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={actionColorMap[params.value] ?? "default"}
        />
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Administration Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          System Management and User Activity Overview
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Active Users
              </Typography>
              <Typography variant="h3" fontWeight={600} color="success.main">
                {userList.length}
              </Typography>
              <Typography variant="caption" color="success.main">
                +2 from yesterday
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                System Uptime
              </Typography>
              <Typography variant="h3" fontWeight={600} color="primary.main">
                99.8%
              </Typography>
              <Typography variant="caption" color="success.main">
                30 days average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Security Alerts
              </Typography>
              <Typography variant="h3" fontWeight={600} color="warning.main">
                3
              </Typography>
              <Typography variant="caption" color="warning.main">
                1 medium, 2 low
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Data Backup Status
              </Typography>
              <Typography variant="h3" fontWeight={600} color="success.main">
                OK
              </Typography>
              <Typography variant="caption" color="success.main">
                Last: 2 hours ago
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Activity */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                User Activity Summary
              </Typography>
              <DataGrid
                rows={userActivity}
                columns={columns}
                autoHeight
                getRowHeight={() => "auto"}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 5, page: 0 },
                  },
                }}
                slots={{
                  pagination: CommonPagination,
                }}
                sx={{
                  "& .MuiDataGrid-columnHeaders": { bgcolor: "grey.100" },
                  border: 0,
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* System Performance */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                System Performance
              </Typography>
              {systemPerformance.map((metric, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {metric.metric}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {metric.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metric.value}
                    color={
                      metric.status === "Excellent"
                        ? "success"
                        : metric.status === "Good"
                          ? "info"
                          : metric.status === "Low"
                            ? "warning"
                            : "primary"
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Status: {metric.status}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Events */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Security Events
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event Type</TableCell>
                      <TableCell>User/Source</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell align="center">Severity</TableCell>
                      <TableCell align="center">Action Required</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityEvents.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {event.event}
                          </Typography>
                        </TableCell>
                        <TableCell>{event.user}</TableCell>
                        <TableCell>{event.time}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={event.severity}
                            size="small"
                            color={
                              event.severity === "High"
                                ? "error"
                                : event.severity === "Medium"
                                  ? "warning"
                                  : "success"
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              event.severity === "Medium" ? "Monitor" : "None"
                            }
                            size="small"
                            variant="outlined"
                            color={
                              event.severity === "Medium"
                                ? "warning"
                                : "default"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdministrationReports;

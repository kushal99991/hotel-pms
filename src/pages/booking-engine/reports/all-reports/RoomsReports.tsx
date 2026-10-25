import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IRoomStatusDetail, useRoomReports } from "hooks/useRoomReports";
import { IRoomStatus } from "constants/room";
import { CommonPagination } from "utils/FilterComponent";

/** ---------- Skeleton  ---------- */
const RoomsReportsSkeleton: React.FC = () => (
  <Box>
    {/* Header placeholders */}
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="text" width={240} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={320} height={24} />
    </Box>

    {/* Summary-card placeholders */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[...Array(5)].map((_, idx) => (
        <Grid item xs={12} md={2.4} key={idx}>
          <Card elevation={2}>
            <CardContent>
              <Skeleton variant="rectangular" height={48} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    <Grid container spacing={3}>
      {/* DataGrid skeleton */}
      <Grid item xs={12} md={8}>
        <Skeleton variant="rectangular" height={420} />
      </Grid>

      {/* Maintenance-box placeholders */}
      <Grid item xs={12} md={4}>
        <Card elevation={2} sx={{ height: "100%" }}>
          <CardContent>
            <Skeleton variant="text" width={260} height={28} sx={{ mb: 2 }} />
            {[...Array(3)].map((_, idx) => (
              <Skeleton
                key={idx}
                variant="rectangular"
                height={90}
                sx={{ mb: 2, borderRadius: 1 }}
              />
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

const RoomsReports: React.FC = () => {
  const { matricsData, roomStatusDetailList, maintenanceRequests, isLoading } =
    useRoomReports();

  const columns: GridColDef[] = [
    {
      field: "room",
      headerName: "Room",
      flex: 0.5,
      renderCell: ({ value }: GridRenderCellParams<IRoomStatusDetail>) => (
        <Typography fontWeight={600}>{value}</Typography>
      ),
    },
    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: ({ value }: GridRenderCellParams<IRoomStatusDetail>) => {
        return (
          <Chip
            label={value}
            size="small"
            color={
              value === IRoomStatus.VC || value === IRoomStatus.OC
                ? "success"
                : value === IRoomStatus.OD || value === IRoomStatus.VD
                  ? "warning"
                  : value === IRoomStatus.VCI
                    ? "info"
                    : "error"
            }
          />
        );
      },
    },
    {
      field: "maintenance",
      headerName: "Maintenance",
      flex: 1,
      renderCell: ({ value }: GridRenderCellParams<IRoomStatusDetail>) =>
        value !== "None" ? (
          <Chip label={value} size="small" color="error" />
        ) : (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        ),
    },
    { field: "guest", headerName: "Guest", flex: 1 },
  ];

  const rows = roomStatusDetailList.map((r, idx) => ({ id: idx, ...r }));

  if (isLoading) return <RoomsReportsSkeleton />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Rooms Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Room Status and Maintenance Overview
        </Typography>
      </Box>

      {/* Room status summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: "Clean Rooms",
            color: "success.main",
            value: matricsData.cleanRoom,
          },
          {
            label: "Dirty Rooms",
            color: "warning.main",
            value: matricsData.dirtyRoom,
          },
          {
            label: "Inspected",
            color: "info.main",
            value: matricsData.inspected,
          },
          {
            label: "Out of Order",
            color: "error.main",
            value: matricsData.OOO,
          },
          {
            label: "Total Rooms",
            color: "primary.main",
            value: matricsData.totalRooms,
          },
        ].map(({ label, color, value }) => (
          <Grid item xs={12} md={2.4} key={label}>
            <Card elevation={2}>
              <CardContent>
                <Typography color={color} variant="h3" fontWeight={600}>
                  {value}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* -------- DataGrid -------- */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="h6" fontWeight={600} sx={{ p: 2 }}>
                Room Status Details
              </Typography>
              <DataGrid
                rows={rows}
                columns={columns}
                autoHeight
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

        {/* -------- Maintenance requests -------- */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Active Maintenance Requests
              </Typography>
              {maintenanceRequests.map((req, i) => (
                <Box
                  key={i}
                  sx={{ mb: 2, p: 2, bgcolor: "#f8f9fa", borderRadius: 1 }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Room {req.room}
                    </Typography>
                    <Chip
                      label={req.priority}
                      size="small"
                      color={
                        req.priority === "Critical"
                          ? "error"
                          : req.priority === "High"
                            ? "warning"
                            : "default"
                      }
                    />
                  </Box>
                  <Typography variant="body2" mb={1}>
                    {req.issue}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={1}
                  >
                    Reported: {req.reported}
                  </Typography>
                  <Chip
                    label={req.status}
                    size="small"
                    variant="outlined"
                    color={
                      req.status === "IN_PROGRESS"
                        ? "info"
                        : req.status === "Assigned"
                          ? "success"
                          : "default"
                    }
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomsReports;

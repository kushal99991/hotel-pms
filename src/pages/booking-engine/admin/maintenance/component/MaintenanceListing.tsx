import { Box, IconButton, Tooltip } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import useAuth from "hooks/useAuth";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useGetMaintenanceListMutation } from "services/maintenanceSlice";
import { IMaintenanceType } from "types/maintenanceTypes";
import { truncateStr } from "utils/helperFunctions/strings";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import { appConfig } from "config/app.config";
import { CommonPagination } from "utils/FilterComponent";

const MaintenanceListing: React.FC<{ status?: string }> = ({ status }) => {
  const Navigate = useNavigate();
  const { users, currentTimeZone } = useAuth();

  const propertyID = users?.defaultPropertyId ?? 0;

  const [getMaintenanceList, { data: maintenanceList, isLoading }] =
    useGetMaintenanceListMutation();

  useEffect(() => {
    getMaintenanceList({
      ticket_status: status === "ALL" ? "" : (status ?? "OPEN"),
      property_id: propertyID,
    });
  }, [status]);

  const columns: GridColDef<IMaintenanceType>[] = [
    { field: "service_code", headerName: "Service Code", width: 160 },
    { field: "service_status", headerName: "Status", width: 100 },
    {
      field: "room",
      headerName: "Room",
      width: 100,
      valueGetter: (_, raw) => raw?.room?.room_number ?? "N/A",
    },
    { field: "service_subject", headerName: "Description", width: 250 },
    {
      field: "assigned_to",
      headerName: "Assigned",
      width: 200,
      valueGetter: (_, raw) =>
        truncateStr(
          `${raw?.assigned_to_user?.first_name ?? ""} ${raw?.assigned_to_user?.last_name ?? "N/A"}`
        ),
    },
    {
      field: "assigned_by",
      headerName: "Created By",
      width: 200,
      valueGetter: (_, raw) =>
        truncateStr(
          `${raw?.assigned_by_user?.first_name ?? ""} ${raw?.assigned_by_user?.last_name ?? "N?A"}`
        ),
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueGetter: (_, raw) =>
        raw.created_at
          ? convertUtcToTimezone(raw.created_at, currentTimeZone).format(
              appConfig.displayDateWithTimeFormat
            )
          : "",
    },
    {
      field: "actions",
      headerName: "Action",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="View">
          <IconButton
            onClick={() =>
              Navigate(
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
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  };
  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        getRowId={(row) => row.id}
        rows={maintenanceList ?? []}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        autoHeight={true}
        loading={isLoading}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection={false}
        slots={{
          toolbar: CustomToolbar,
          pagination: CommonPagination,
        }}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: "bold",
            fontSize: 17,
          },
        }}
      />
    </Box>
  );
};

export default MaintenanceListing;

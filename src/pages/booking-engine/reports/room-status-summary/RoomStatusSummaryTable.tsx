import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ReservationStatusEnum } from "constants/reservation";
import { RoomSummaryItem, RoomStats, StatusInfo } from "types/metricsTypes";

interface RoomStatusSummaryTableProps {
  rooms?: RoomSummaryItem[];
  roomStats?: RoomStats;
}

function isDeparting(room: RoomSummaryItem) {
  return room.reservation_status === ReservationStatusEnum.DEPARTING;
}

function findStatusInfo(
  statusCode: string,
  statusInfoList: StatusInfo[]
): StatusInfo | undefined {
  return statusInfoList.find((info) => info.name === statusCode);
}

function StatusCell({
  statusCode,
  statusInfoList,
}: {
  statusCode: string;
  statusInfoList: StatusInfo[];
}) {
  const info = findStatusInfo(statusCode, statusInfoList);
  return (
    <Typography
      component="span"
      sx={{ color: info?.color_code ?? "inherit", fontWeight: "bold" }}
    >
      {info?.full_name ?? statusCode}
    </Typography>
  );
}

function buildColumns(
  roomStats?: RoomStats
): GridColDef<RoomSummaryItem & { id: string }>[] {
  return [
    {
      field: "room_number",
      headerName: "Room Number",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => (
        <span>{`${row.room_number}${isDeparting(row) ? "*" : ""}`}</span>
      ),
    },
    {
      field: "room_type",
      headerName: "Room Type",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "housekeeping_status",
      headerName: "Housekeeping Status",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => (
        <StatusCell
          statusCode={row.housekeeping_status}
          statusInfoList={roomStats?.housekeeping_info ?? []}
        />
      ),
    },
    {
      field: "frontdesk_status",
      headerName: "Front Desk Status",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => (
        <StatusCell
          statusCode={row.frontdesk_status}
          statusInfoList={roomStats?.frontdesk_info ?? []}
        />
      ),
    },
  ];
}

function RoomStatusSummaryTable({
  rooms,
  roomStats,
}: RoomStatusSummaryTableProps) {
  const rows = rooms
    ? rooms?.map((room) => ({ ...room, id: room.room_number }))
    : [];
  const columns = buildColumns(roomStats);
  const hasDepartingRooms = rooms?.some(isDeparting);

  return (
    <Box>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        hideFooter
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: "bold",
            fontSize: 17,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "transparent",
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
        }}
      />
      {hasDepartingRooms && (
        <Typography
          variant="caption"
          sx={{ mt: 1, display: "block", fontStyle: "italic" }}
        >
          *Room is expected to depart today
        </Typography>
      )}
    </Box>
  );
}

export default RoomStatusSummaryTable;

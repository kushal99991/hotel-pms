import moment, { Moment } from "moment";
import { Box, Chip, Stack, Typography, Divider } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";
import { BoardWithTotals } from "types/ui/housekeepingReports";
import { ITask } from "types/houseKeeperTypes";

interface BoardTableProps {
  board: BoardWithTotals;
  index: number;
}

interface BoardRow {
  id: number;
  room_number: string;
  room_type: string;
  housekeeping_status: string;
  frontdesk_status: string;
  start_date: string;
  checkin_time: string;
  end_date: string;
  checkout_time: string;
  service_type: string;
  credits: number;
}

function taskToRow(task: ITask): BoardRow {
  const reservation = (task.room as any)?.reservation ?? null;

  const checkin =
    reservation?.checkin_time ?? reservation?.expected_checkin_time ?? null;
  const checkout =
    reservation?.checkout_time ?? reservation?.expected_checkout_time ?? null;

  return {
    id: task.id,
    room_number: (task.room as any)?.room_number ?? "—",
    room_type: (task.room as any)?.room_type?.type ?? "—",
    housekeeping_status: task.room?.housekeeping_status ?? "—",
    frontdesk_status: task.room?.frontdesk_status ?? "—",
    start_date: modifyToDisplayDate(
      (task.room as any)?.reservation?.start_date
    ),
    checkin_time: checkin ? moment(checkin, "HH:mm:ssZ").format("HHmm") : "—",
    end_date: modifyToDisplayDate((task.room as any)?.reservation?.end_date),
    checkout_time: checkout
      ? moment(checkout, "HH:mm:ssZ").format("HHmm")
      : "—",
    service_type: task.service_credits?.service_type ?? "—",
    credits: task.credits ?? 0,
  };
}

const columns: GridColDef<BoardRow>[] = [
  {
    field: "room_number",
    headerName: "Room",
    flex: 1,
    minWidth: 70,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "room_type",
    headerName: "Type",
    flex: 1,
    minWidth: 70,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "housekeeping_status",
    headerName: "HK",
    flex: 1,
    minWidth: 70,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "frontdesk_status",
    headerName: "FD",
    flex: 1,
    minWidth: 70,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "start_date",
    headerName: "Arrival",
    flex: 1.2,
    minWidth: 90,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "checkin_time",
    headerName: "Checkin",
    flex: 1,
    minWidth: 70,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "end_date",
    headerName: "Departure",
    flex: 1.2,
    minWidth: 90,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "checkout_time",
    headerName: "Checkout",
    flex: 1,
    minWidth: 70,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "service_type",
    headerName: "Service Type",
    flex: 1.5,
    minWidth: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "credits",
    headerName: "Credits",
    flex: 1,
    minWidth: 70,
    type: "number",
    align: "center",
    headerAlign: "center",
  },
];

function BoardTable({ board, index }: BoardTableProps) {
  const rows = board.tasks.map(taskToRow);
  const housekeeperName = `${board.housekeeper.first_name} ${board.housekeeper.last_name}`;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          px: 2,
          py: 1,
          bgcolor: "grey.100",
          borderLeft: "3px solid",
          borderColor: "primary.main",
          borderRadius: "2px 0 0 2px",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
          Board {index + 1}
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Typography variant="subtitle2" color="text.primary">
          {housekeeperName}
        </Typography>
        <Box sx={{ ml: "auto !important" }}>
          <Chip
            label={`${board.totalCredits} credits`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Stack>

      <DataGrid<BoardRow>
        rows={rows}
        columns={columns}
        autoHeight
        hideFooter
        disableRowSelectionOnClick
        disableColumnMenu
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          "& .MuiDataGrid-row:hover": { bgcolor: "transparent" },
          "& .MuiDataGrid-cell:focus": { outline: "none" },
          "& .MuiDataGrid-cell:focus-within": { outline: "none" },
          "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
          "& .MuiDataGrid-columnHeader:focus-within": { outline: "none" },
          "& .MuiDataGrid-row.Mui-selected": { bgcolor: "transparent" },
          "& .MuiDataGrid-row.Mui-selected:hover": { bgcolor: "transparent" },
        }}
        onRowClick={() => {}}
        isRowSelectable={() => false}
        getCellClassName={() => "no-focus-cell"}
      />
    </Box>
  );
}

export default BoardTable;

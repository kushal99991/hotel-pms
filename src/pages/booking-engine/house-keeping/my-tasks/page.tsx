import React, { useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import {
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import {
  useGetMyTaskQuery,
  useStartHousekeepingTaskMutation,
  useStopHousekeepingTaskMutation,
} from "services/houseKeeperSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { ITask } from "types/houseKeeperTypes";
import moment from "moment";
import useCustomStatus from "hooks/useCustomStatus";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import useAuth from "hooks/useAuth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { appConfig } from "config/app.config";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import LiveTimer from "./LiveTimer";
import useSnackbar from "hooks/useSnackbar";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import { CommonPagination } from "utils/FilterComponent";

const MyTask: React.FC = () => {
  const { currentTimeZone, users } = useAuth();
  const { statuses } = useCustomStatus();
  const { openSnackbar } = useSnackbar();

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openCompleteModal, setOpenCompleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHKStatus, setSelectedHKStatus] = useState(""); // Store dropdown value
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const {
    data: myTasks = [],
    isLoading,
    refetch,
  } = useGetMyTaskQuery(
    {
      date: selectedDate ?? undefined,
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [startTask] = useStartHousekeepingTaskMutation();
  const [stopHousekeepingTask] = useStopHousekeepingTaskMutation();

  const handleOpenAssignModal = (taskId: number) => {
    setSelectedTaskId(taskId); // Set the selected task ID
    setOpenAssignModal(true); // Open the modal
  };
  const handleCloseAssignModal = () => {
    setSelectedHKStatus(""); // Reset the dropdown value
    setSelectedTaskId(null); // Reset the task ID
    setOpenAssignModal(false); // Close the modal
  };

  const handleCompleteModal = (taskId: number) => {
    setSelectedTaskId(taskId); // Set the selected task ID
    setOpenCompleteModal(true); // Open the modal
  };
  const handleCloseCompleteModal = () => {
    setSelectedHKStatus(""); // Reset the dropdown value
    setSelectedTaskId(null); // Reset the task ID
    setOpenCompleteModal(false); // Close the modal
  };

  const HKOptions = [
    ...Object.keys(statuses.HousekeepingApplicableEnum ?? {}).map((key) => ({
      value: key,
      label: statuses.HousekeepingApplicableEnum![key],
    })),
  ];

  const handleUpdateStatus = async () => {
    if (!selectedHKStatus) {
      openSnackbar("Please select status!", "error");
      return;
    }

    const response = await stopHousekeepingTask({
      id: Number(selectedTaskId),
      housekeeping_status: selectedHKStatus,
    });

    if (response.error) {
      openSnackbar(response.error as string, "error");
      return;
    }

    handleCloseAssignModal();
    refetch(); // Optionally refetch tasks to update the UI
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return { backgroundColor: "#cce5ff", color: "#004085" }; // Light blue for start
      case "IN_PROGRESS":
        return { backgroundColor: "#fff3cd", color: "#856404" }; // Light yellow for in progress
      case "COMPLETED":
        return { backgroundColor: "#d4edda", color: "#155724" }; // Light green for completed
      default:
        return {};
    }
  };

  // ExpandableCell Component
  const ExpandableCell: React.FC<{ text: string; maxLength?: number }> = ({
    text,
    maxLength = 50, // Default max length for truncation
  }) => {
    const [expanded, setExpanded] = useState(false);

    const isLongText = text.length > maxLength;

    return (
      <div
        style={{
          whiteSpace: expanded ? "normal" : "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: isLongText ? "pointer" : "default",
        }}
        onClick={() => isLongText && setExpanded(!expanded)}
        title={!expanded && isLongText ? "Click to expand" : ""}
      >
        {expanded || !isLongText ? text : `${text.slice(0, maxLength)}...`}
        {!expanded && isLongText && (
          <span style={{ color: "blue", marginLeft: "5px" }}>
            Click to expand
          </span>
        )}
      </div>
    );
  };

  const handleStartTask = async (id: number) => {
    const response = await startTask({ id: Number(id) });
    if (response.error) {
      openSnackbar(response.error as string, "error");
      return;
    } else {
      refetch();
      handleCloseCompleteModal();
    }
  };

  const handleDateChange = (newDate: dayjs.Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate.format("YYYY-MM-DD")); // Format date as string for the API
    } else {
      setSelectedDate(null); // Reset filter if date is cleared
    }
  };

  const columns: GridColDef<ITask>[] = [
    { field: "priority", headerName: "Priority", flex: 1, minWidth: 100 },
    {
      field: "room_number",
      headerName: "Room Number",
      flex: 1,
      minWidth: 130,
      valueGetter: (_, raw) => raw?.room?.room_number ?? "",
    },
    { field: "credits", headerName: "Credits", flex: 1, minWidth: 100 },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => <ExpandableCell text={row.notes || ""} />,
    },
    {
      field: "housekeeping_status",
      headerName: "HK Status",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, raw) => raw?.room?.housekeeping_status ?? "",
    },
    {
      field: "front_status",
      headerName: "FD Status",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, raw) => raw?.room?.frontdesk_status ?? "",
    },
    {
      field: "duration",
      headerName: "Duration",
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => {
        if (row.status === "IN_PROGRESS" && row.start_time) {
          return (
            <LiveTimer
              startTime={row.start_time}
              endTime={row.end_time}
              timeZone={currentTimeZone}
            />
          );
        }

        if (row.start_time) {
          const start = convertUtcToTimezone(row.start_time, currentTimeZone);
          const end = convertUtcToTimezone(row.end_time, currentTimeZone);

          const duration = moment.duration(end.diff(start));
          const hours = Math.floor(duration.asHours());
          const minutes = Math.floor(duration.minutes());

          return (
            <Typography variant="body2">{`${hours}h ${minutes}m`}</Typography>
          );
        }

        return "-";
      },
    },

    { field: "created_at", headerName: "Created At", flex: 1, minWidth: 100 },
    {
      field: "actions",
      headerName: "Task Action",
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Button
          size="medium"
          style={{
            ...getStatusStyle(row.status),
            fontWeight: "bold",
            margin: 10,
            alignContent: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            if (row.status === "PENDING") {
              handleStartTask(row.id);
            } else if (row.status === "IN_PROGRESS") {
              handleOpenAssignModal(row.id); // Open dialog for IN_PROGRESS status
            } else if (row.status === "COMPLETED") {
              handleCompleteModal(row.id);
            }
          }}
        >
          {row.status == "PENDING" ? "START" : row.status}{" "}
          {/* Status is displayed as-is from the backend */}
        </Button>
      ),
    },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );

  return (
    <Box sx={{ height: "80vh", width: "100%" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container alignItems="center" spacing={2} mb={2}>
          <Grid item xs={12} md={7}></Grid>
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Select Date"
              value={selectedDate ? dayjs(selectedDate) : null} // Convert string to Dayjs for DatePicker
              onChange={handleDateChange}
              format={appConfig.displayDateFormat}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: (theme) => ({
                    [theme.breakpoints.only("sm")]: {
                      marginTop: "16px",
                    },
                  }),
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <PrimaryButton
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              onClick={() => {
                setSelectedDate(null); // Reset date to empty
                refetch();
              }}
              label="Reset"
              isLoading={isLoading}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
      <DataGrid
        getRowId={(row) => row.id}
        rows={myTasks}
        columns={columns}
        loading={isLoading}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        autoHeight={true}
        getRowHeight={() => "auto"}
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
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center", // Center-align all cells
            minHeight: 30,
          },
        }}
      />
      <Dialog
        fullWidth
        maxWidth="sm"
        open={openAssignModal}
        onClose={handleCloseAssignModal}
      >
        <DialogTitle>Complete Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <CustomDropdown
                label="Please Select an Updated Housekeeping Status for the Room"
                placeholder="Housekeeping Status"
                options={HKOptions}
                onChange={(event) => {
                  setSelectedHKStatus(event.target.value as string);
                }}
                value={selectedHKStatus}
                fullWidth
                aria-label="Housekeeping Status"
                data-testid="room-number"
                helperText={
                  !selectedHKStatus
                    ? "Please select status!"
                    : "Please select status!!"
                }
              />
              {}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAssignModal} color="primary">
            Cancel
          </Button>
          <PrimaryButton
            label="Complete"
            isLoading={isLoading}
            loadingText="Loading...."
            onClick={handleUpdateStatus}
          />
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={openCompleteModal}
        title={`Restart task?`}
        description={`Are you sure you want to restart the task for the room?`}
        buttons={[
          { label: "Cancel", onClick: handleCloseCompleteModal },
          {
            label: isLoading ? "Loading..." : "Restart",
            onClick: () => handleStartTask(Number(selectedTaskId)),
          },
        ]}
        onClose={handleCloseCompleteModal}
      />
    </Box>
  );
};

export default MyTask;

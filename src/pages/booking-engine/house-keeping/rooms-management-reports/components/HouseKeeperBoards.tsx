import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import styled from "@emotion/styled";
import { Box } from "@mui/system";
import { INewRoomNumberList } from "types/roomSliceTypes";
import { useDrop } from "react-dnd";
import { Control, Controller, UseFormSetError } from "react-hook-form";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetDepartmentByIdQuery } from "services/departmentSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useGetServiceCreditsQuery,
  useUpdateHousekeepingBoardMutation,
  useUpdateHousekeepingTaskByIdMutation,
  useDeleteHousekeepingTaskByIdMutation,
} from "services/houseKeeperSlice";
import EditIcon from "@mui/icons-material/Edit";
import useAuth from "hooks/useAuth";
import HousekeeperRoomStatusCode from "components/widgets/HousekeeperStatus/HousekeeperStatus";
import { useGetRoomListByPropertyIdQuery } from "services/roomSlice";

interface FormData {
  shift_id: number;
  date: string;
  housekeeper_id: number;
  rooms: number[];
}

interface HousekeeperBoardsProps {
  index: number;
  housekeeperIdNo?: number;
  rooms: INewRoomNumberList[];
  control: Control<any>;
  setSuccessMessage?: (message: string | null) => void;
  setError?: UseFormSetError<FormData>;
  onChange: (index: number, updatedRows: INewRoomNumberList[]) => void;
  refetchBoard?: () => void;
  selectedHousekeepers?: number[];
  onHousekeeperSelect?: (housekeeperId: number) => void;
  onMoveAcrossBoards?: (
    sourceBoardIndex: number,
    fromIndex: number,
    destinationBoardIndex: number,
    toIndex: number
  ) => void;
}

const HousekeeperBoards: React.FC<HousekeeperBoardsProps> = ({
  index,
  rooms,
  control,
  onChange,
  setSuccessMessage,
  setError,
  refetchBoard,
  housekeeperIdNo,
  selectedHousekeepers = [],
  onHousekeeperSelect,
  onMoveAcrossBoards,
}) => {
  const { users } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<INewRoomNumberList | null>(
    null
  );

  const housekeeperId = rooms?.[0]?.housekeeperId ?? housekeeperIdNo;
  const propertyID = rooms?.[0]?.property_id;
  const boardID = rooms?.[0]?.boardId;

  const [updateHousekeepingBoard] = useUpdateHousekeepingBoardMutation();
  const [updateTask] = useUpdateHousekeepingTaskByIdMutation();
  const [deleteTask] = useDeleteHousekeepingTaskByIdMutation();

  const { refetch: refetchRoomList } = useGetRoomListByPropertyIdQuery({
    id: users?.defaultPropertyId ?? 1, // you can replace this with the appropriate roomTypeId if needed
  });
  const { data: departmentList, refetch } = useGetDepartmentByIdQuery({
    id: "7",
    default_property_id: users?.defaultPropertyId ?? 1,
  });

  const { data: serviceList } = useGetServiceCreditsQuery({
    property_id: users?.defaultPropertyId ?? 1,
  });

  const serviceOptions = serviceList?.map((service) => ({
    label: service.service_type, // service_type as label
    value: service.id, // id as value
  }));

  const serviceOptionsList = serviceList?.map((service) => ({
    label: service.service_type, // service_type as label
    value: service.id.toString(), // id as value
  }));

  const [rowData, setRowData] = useState<INewRoomNumberList[]>(rooms);
  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setRowData(rooms);
  }, [rooms]);

  const handleRemoveRow = async (rowId: number) => {
    const row = rowData.find((r) => r.id === rowId);

    if (housekeeperId && row?.taskId) {
      // Use the delete API
      const response = await deleteTask({ id: Number(row.taskId) });

      if ("error" in response) {
        setError?.(
          "root",
          { message: response.error as string },
          { shouldFocus: true }
        );
        setSuccessMessage?.(null);
        return;
      }

      // After successful deletion
      setSuccessMessage?.("Task deleted successfully!");
      refetchBoard?.();
    }

    const updatedRows = rowData.filter((r) => r.id !== rowId);
    setRowData(updatedRows);
    onChange(index, updatedRows);
  };

  const handleEditClick = (row: INewRoomNumberList) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveDialog = async () => {
    if (!selectedRow) return;

    if (boardID && selectedRow.taskId) {
      const response = await updateTask({
        id: Number(selectedRow.taskId),
        board_id: Number(boardID),
        credits: selectedRow.suggested_service?.credits,
        notes: selectedRow.notes,
        service_credit_id: selectedRow.suggested_service?.id,
      });

      if ("error" in response) {
        setError?.(
          "root",
          { message: response.error as string },
          { shouldFocus: true }
        );
        setSuccessMessage?.(null);
        return;
      }

      setSuccessMessage?.("Task updated successfully!");
      refetchBoard?.();
    }

    const updatedRows = rowData.map((row) =>
      row.id === selectedRow.id ? selectedRow : row
    );

    setRowData(updatedRows);
    onChange(index, updatedRows);
    setOpenDialog(false);
  };

  const handleStatusChange = async (rowId: number) => {
    refetchBoard?.();
    refetchRoomList?.();
  };

  const columns: Column<INewRoomNumberList>[] = [
    {
      field: "roomNumber",
      label: "Room",
      align: "center",
    },
    {
      field: "suggested_service", // Use renderCell to display and edit values from suggested_service
      label: "Service",
      align: "center",
      isOnChange: true,
      renderCell: (value: INewRoomNumberList) => {
        const selectedOption = serviceOptions?.find(
          (option) => option.value === value.suggested_service?.id
        );
        return selectedOption?.label ?? "";
      },
    },

    {
      field: "credit",
      label: "Credits",
      align: "center",
      isOnChange: false,
      renderCell: (row) =>
        row.suggested_service?.credits !== undefined
          ? row.suggested_service.credits?.toFixed(1)
          : "N/A",
    },
    {
      field: "housekeeping_status",
      label: "HK",
      align: "center",
      renderCell: (row) => (
        <HousekeeperRoomStatusCode
          status={row.housekeeping_status}
          rowData={row}
          valueFlag={true}
          statusChange={() => handleStatusChange(row.id)}
          width={80}
        />
      ),
    },
    {
      field: "frontdesk_status",
      label: "FD",
      align: "center",
    },
    {
      field: "reservation",
      label: "Checkout Time",
      align: "center",
      renderCell: (row) =>
        row.reservation?.expected_checkout_time
          ? `${row.reservation.expected_checkout_time}`
          : "",
    },
    {
      field: "id",
      label: "Action",
      align: "center",
      renderCell: (row) => {
        return (
          <>
            <IconButton
              onClick={() => handleEditClick(row)}
              aria-label="edit"
              color="primary"
            >
              <EditIcon />
            </IconButton>

            <IconButton
              onClick={() => handleRemoveRow(row.id)}
              aria-label="delete"
              color="primary"
            >
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  const footerComponent = (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        justifyContent: "flex-start",
        gap: 2,
        width: "100%",
      }}
    >
      <Typography variant="body2">Total Rooms: {rowData?.length}</Typography>
      <Typography variant="body2">
        Total Credits:{" "}
        {rowData.length > 0
          ? parseFloat(
            rowData
              .reduce(
                (total, { suggested_service }) =>
                  total + (suggested_service?.credits || 0),
                0
              )
              .toFixed(1)
          )
          : 0}
      </Typography>
    </Box>
  );
  const dndType = "hk-room";

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: dndType,
      drop: (item: { sourceBoardIndex: number; index: number }) => {
        if (
          typeof item?.sourceBoardIndex === "number" &&
          typeof item?.index === "number" &&
          item.sourceBoardIndex !== index
        ) {
          onMoveAcrossBoards?.(
            item.sourceBoardIndex,
            item.index,
            index,
            rowData.length
          );
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [index, rowData.length, onMoveAcrossBoards]
  );

  return (
    <StyledPaper elevation={3}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Typography variant="h6">Board {index + 1}</Typography>
        <Controller
          name={`boards[${index}].housekeeper_id`}
          control={control}
          defaultValue={housekeeperId ?? ""}
          rules={{ required: "Housekeeper is required" }}
          render={({
            field: { onChange, value },
            fieldState: { invalid, error },
          }) => {
            const handleChange = async (event: any) => {
              const selectedValue = event.target.value;

              // Call the default onChange handler from react-hook-form
              onChange(selectedValue);

              // Call the onHousekeeperSelect callback if provided
              if (onHousekeeperSelect && selectedValue) {
                onHousekeeperSelect(Number(selectedValue));
              }

              // Trigger the update API
              if (selectedValue && propertyID && boardID) {
                const response = await updateHousekeepingBoard({
                  id: boardID,
                  housekeeper_id: Number(selectedValue),
                  property_id: propertyID,
                });

                if (!response.error) {
                  setSuccessMessage?.("Housekeeper updated successfully!");
                } else {
                  setError?.(
                    "root",
                    { message: response.error as string },
                    { shouldFocus: true }
                  );
                }
              }
            };

            // Filter out already selected housekeepers from options
            const filteredOptions = (departmentList?.data?.users ?? [])
              .filter((user: any) => {
                // Include the user if:
                // 1. It's the currently selected housekeeper for this board
                // 2. It's not selected in any other board
                return (
                  user?.id?.toString() === value ||
                  !selectedHousekeepers.includes(Number(user?.id))
                );
              })
              .map((user: any) => ({
                label: user?.first_name,
                value: user?.id?.toString(),
              }));

            return (
              <CustomDropdownMain
                label={
                  housekeeperId ? "Update Housekeeper" : "Select Housekeeper"
                }
                placeholder={
                  housekeeperId ? "Update Housekeeper" : "Select Housekeeper"
                }
                onChange={handleChange}
                value={value}
                isInvalid={invalid}
                helperText={error?.message ?? ""}
                options={filteredOptions}
                fullWidth
                aria-label="housekeeperId"
                data-testid="housekeeperId"
              />
            );
          }}
        />
      </Box>

      <Box
        ref={dropRef as unknown as React.Ref<HTMLDivElement>}
        sx={{ outline: isOver ? "2px dashed #90caf9" : "none" }}
      >
        <DataTable
          columns={columns}
          data={rowData}
          isLoading={false}
          isPaginationAllowed={false}
          renderFooter={() => footerComponent}
          isDrggable={true}
          maxHeight={375}
          dndType={dndType}
          boardIndex={index}
          onMoveAcrossBoards={onMoveAcrossBoards}
        />
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Room {selectedRow?.roomNumber} Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {!boardID && (
              <Grid item xs={12}>
                <CustomDropdown
                  label="Service"
                  value={selectedRow?.suggested_service?.id || ""}
                  onChange={(e) => {
                    setSelectedRow(
                      (prev) =>
                        prev && prev.suggested_service
                          ? {
                            ...prev,
                            suggested_service: {
                              ...prev.suggested_service,
                              id: Number(e.target.value), // Update the ID
                              service_type:
                                serviceOptionsList?.find(
                                  (option) => option.value === e.target.value
                                )?.label || "",
                              description: prev.suggested_service.description, // Keep the existing value
                            },
                          }
                          : prev // Return the previous state unchanged
                    );
                  }}
                  fullWidth
                  options={
                    serviceOptionsList?.filter((option) => {
                      const matchingService = serviceList?.find(
                        (service) => service.id.toString() === option.value
                      );
                      // Filter options based on the room type ID of the selected row
                      // Check if the service's room_type_id matches the selected row's roomTypeId
                      return (
                        matchingService?.room_type?.id ===
                        selectedRow?.roomTypeId
                      );
                    }) ?? []
                  }
                />
              </Grid>
            )}
            <Grid item xs={12} mt={1}>
              <TextField
                label="Credits"
                type="number"
                fullWidth
                value={
                  selectedRow?.suggested_service?.credits !== undefined &&
                    selectedRow?.suggested_service?.credits !== null
                    ? selectedRow?.suggested_service?.credits.toString() // Convert to string for controlled input
                    : "" // Default to empty string for undefined or null
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const numericValue = parseFloat(inputValue);

                  // Prevent leading zeros by ensuring the value is properly handled
                  setSelectedRow((prev) =>
                    prev && prev.suggested_service
                      ? {
                        ...prev,
                        suggested_service: {
                          ...prev.suggested_service,
                          credits: inputValue === "" ? 0 : numericValue, // Allow empty input for clearing
                          service_type:
                            serviceOptionsList?.find(
                              (option) => option.value === inputValue
                            )?.label || "",
                          description: prev.suggested_service.description,
                        },
                      }
                      : prev
                  );
                }}
                onBlur={() => {
                  // Cleanup leading zeros when input loses focus
                  setSelectedRow((prev) =>
                    prev && prev.suggested_service
                      ? {
                        ...prev,
                        suggested_service: {
                          ...prev.suggested_service,
                          credits:
                            prev.suggested_service.credits === undefined
                              ? 0
                              : parseFloat(
                                prev.suggested_service.credits.toString()
                              ), // Remove leading zeros
                        },
                      }
                      : prev
                  );
                }}
              />
            </Grid>
            {boardID && (
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  value={selectedRow?.notes}
                  onChange={(e) => {
                    setSelectedRow((prev) =>
                      prev
                        ? {
                          ...prev,
                          notes: e.target.value,
                        }
                        : prev
                    );
                  }}
                  margin="normal"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveDialog}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default HousekeeperBoards;

const StyledPaper = styled(Paper)(() => ({
  padding: "15px",
  border: "2px",
  borderColor: "black",
}));

const CustomDropdownMain = styled(CustomDropdown)(() => ({
  marginBottom: "10px",
  alignItems: "flex-start",
}));

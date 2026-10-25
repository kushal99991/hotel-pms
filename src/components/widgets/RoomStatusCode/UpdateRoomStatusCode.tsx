import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  FormControl,
  Snackbar,
  TextField,
} from "@mui/material";
import { ICustomRoomStatus } from "constants/room";
import { useUpdateRoomStatusMutation } from "services/roomSlice";
import { IHouseRoomNumberList } from "types/houseKeeperTypes";
import useCustomStatus from "hooks/useCustomStatus";
import { AutocompleteChangeReason } from "@mui/material/useAutocomplete";

interface UpdateRoomStatusCodeProps {
  status: string; // Example: "DND,PET"
  rowData: IHouseRoomNumberList;
  statusChange?: () => void;
  valueFlag?: boolean;
  width?: number;
}

interface CustomOption {
  value: ICustomRoomStatus;
  displayValue: string;
  color: string;
}

const UpdateRoomStatusCode: React.FC<UpdateRoomStatusCodeProps> = ({
  status,
  rowData,
  statusChange,
  width,
}) => {
  const { roomStatus } = useCustomStatus();
  const [updateRoomStatus] = useUpdateRoomStatusMutation();
  const [error, setError] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<CustomOption[]>([]);

  // Parse initial status string into CustomOption array
  useEffect(() => {
    if (status) {
      const statusArray = status.split(",");

      const initialSelectedStatuses = statusArray.map((statusValue) => {
        const key = statusValue as ICustomRoomStatus;
        const { color, label } = roomStatus[key] ?? {
          color: "#000000",
          label: key,
        };
        return {
          value: key,
          displayValue: label,
          color,
        };
      });

      setSelectedStatuses(initialSelectedStatuses);
    } else {
      setSelectedStatuses([]);
    }
  }, [status, roomStatus]);

  // Handle status change
  const handleStatusChange = async (
    _event: React.SyntheticEvent,
    newValues: CustomOption[],
    _reason: AutocompleteChangeReason
  ) => {
    setSelectedStatuses(newValues);
    const newStatus = newValues.map((option) => option.value);

    const payload = {
      room_status: newStatus,
      frontdesk_status: rowData.frontdesk_status,
      id: [Number(rowData.id)],
    };

    const response = await updateRoomStatus(payload);
    if (!response.error && statusChange) {
      statusChange();
    } else {
      setError(response.error as string);
    }
  };

  const availableOptions: CustomOption[] = Object.keys(roomStatus)
    .filter(
      (status) =>
        !selectedStatuses.some((selected) => selected.value === status)
    )
    .map((status) => {
      const key = status as ICustomRoomStatus;
      const { color, label } = roomStatus[key] ?? {
        color: "#000000",
        label: key,
      };
      return {
        value: key,
        displayValue: label,
        color,
      };
    });

  return (
    <Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert onClose={() => setError("")} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <FormControl sx={{ width: width ?? 300 }} size="small">
        <Autocomplete
          multiple
          id="room-status-tags"
          options={availableOptions}
          value={selectedStatuses}
          getOptionLabel={(option) => option.displayValue}
          filterSelectedOptions
          onChange={handleStatusChange}
          renderOption={(props, option) => (
            <li {...props}>
              <span style={{ color: option.color }}>{option.displayValue}</span>
            </li>
          )}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.value}
                label={option.value}
                size="small"
                sx={{
                  color: option.color,
                  fontWeight: "bold",
                }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Room Status"
              placeholder="Select status"
            />
          )}
        />
      </FormControl>
    </Box>
  );
};

export default UpdateRoomStatusCode;

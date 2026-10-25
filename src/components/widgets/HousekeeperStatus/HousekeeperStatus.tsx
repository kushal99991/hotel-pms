import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
} from "@mui/material";
import RoomStatusCode from "components/widgets/RoomStatusCode/RoomStatusCode";
import { FrontdeskStatusEnum, IRoomStatus } from "constants/room";
import { IHouseRoomNumberList } from "types/houseKeeperTypes";
import { useUpdateRoomStatusMutation } from "services/roomSlice";
import useCustomStatus from "hooks/useCustomStatus";

interface EditableRoomStatusCodeProps {
  status: IRoomStatus;
  rowData: IHouseRoomNumberList;
  statusChange?: () => void;
  valueFlag?: boolean;
  width?: number;
}

const EditableRoomStatusCode: React.FC<EditableRoomStatusCodeProps> = ({
  status,
  rowData,
  statusChange,
  valueFlag = false,
  width,
}) => {
  const [updateRoomStatus] = useUpdateRoomStatusMutation();
  const { statuses } = useCustomStatus();

  const statusList = useMemo(() => {
    const fdStatus =
      rowData.frontdesk_status as keyof typeof FrontdeskStatusEnum;
    const hkStatus = status;

    switch (fdStatus) {
      case "OCC":
        return [...new Set([hkStatus, "OD", "OC", "IP"])] as IRoomStatus[];
      case "VAC":
        return [
          ...new Set([hkStatus, "VD", "VC", "VCI", "PUP", "IP"]),
        ] as IRoomStatus[];
      case "OOO":
        return [...new Set([hkStatus, "VD", "VC", "PUP"])] as IRoomStatus[];
      case "OOS":
        return [...new Set([hkStatus, "VD", "VC", "PUP"])] as IRoomStatus[];
      default:
        return Object.keys(
          statuses?.HousekeepingStatusEnum || {}
        ) as IRoomStatus[];
    }
  }, [rowData.frontdesk_status, statuses?.HousekeepingStatusEnum]);

  const [error, setError] = useState<string>("");

  // Handle status change
  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value as IRoomStatus;
    const payload = {
      housekeeping_status: newStatus,
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

  // Define the options for the Select dropdown
  // Use the filtered statusList to create options
  const options = statusList.map((key) => ({
    label: <RoomStatusCode status={key} />,
    value: key,
  }));

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
      <FormControl sx={{ width: width ?? 250 }} size="small">
        <Select value={status} onChange={handleStatusChange} size="small">
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {valueFlag ? option.value : option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default EditableRoomStatusCode;

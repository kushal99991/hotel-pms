import React, { useState, useEffect } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  styled,
  //   Typography,
} from "@mui/material";
import { ICustomRoomStatus, IRoomStatus } from "constants/room";
import { getCurrentRoom } from "utils/reservations";
import { IReservationResponse } from "types/reservationTypes";
import UpdateRoomStatusCode from "components/widgets/RoomStatusCode/UpdateRoomStatusCode";
import { IHouseRoomNumberList } from "types/houseKeeperTypes";
import useCustomStatus from "hooks/useCustomStatus";

// Create a styled component that targets the label in the dialog when dropdown is focused/open
const StyledDialogContent = styled(DialogContent)(`
  & .MuiInputLabel-root {
    transition: margin-top 0.2s;
  }
  & .Mui-focused .MuiInputLabel-root,
  & .MuiAutocomplete-focused .MuiInputLabel-root,
  & .MuiAutocomplete-endAdornment[aria-expanded="true"] ~ .MuiInputLabel-root,
  & .MuiAutocomplete-popupOpen .MuiInputLabel-root,
  & .MuiInputLabel-shrink {
    margin-top: 5px;
  }
`);

interface DisplayRoomStatusProps {
  details: IReservationResponse | null;
  onRefresh?: () => void;
}

// Status colors mapping (same as in UpdateRoomStatusCode and CustomRoomStatusCode)
// const statusColors: Record<
//   ICustomRoomStatus,
//   { color: string; label: string }
// > = {
//   [ICustomRoomStatus.RDY]: { color: "#008827", label: "Room is Ready" },
//   [ICustomRoomStatus.RFS]: { color: "#F08080", label: "Refuse Service" },
//   [ICustomRoomStatus.USF]: { color: "#F08080", label: "Unsafe to Enter" },
//   [ICustomRoomStatus.DND]: { color: "#DAA520", label: "Do Not Disturb" },
//   [ICustomRoomStatus.PET]: { color: "#205eda", label: "Pet in room" },
//   [ICustomRoomStatus.DO]: {
//     color: "#e40d15",
//     label: "Due Out (Expected Departure)",
//   },
//   [ICustomRoomStatus.LCO]: { color: "#2e5a92", label: "Late Check Out" },
//   [ICustomRoomStatus.ED]: { color: "#f50903", label: "Early Departure" },
// };

// Helper function to combine room statuses from linking array if present
// const combineRoomStatuses = (
//   statusLinks?: { room_status: string }[]
// ): string | undefined => {
//   if (!statusLinks || statusLinks.length === 0) return undefined;

//   // Convert array of status objects to comma-separated string without extra spaces
//   return statusLinks
//     .map((link) => link?.room_status?.trim()) // Trim any whitespace from individual statuses
//     .join(","); // Join without space after comma
// };

const DisplayRoomStatus: React.FC<DisplayRoomStatusProps> = ({
  details,
  onRefresh,
}) => {
  const { roomStatus } = useCustomStatus();
  const [open, setOpen] = useState(false);
  const [roomStatusList, setRoomStatusList] = useState<string[]>([]);

  const currentRoom = getCurrentRoom(details);

  useEffect(() => {
    const roomStatuses = (currentRoom as T)?.room_status_linking ?? [];
    const statusString = roomStatuses
      .map((a: T) => a.room_status?.trim())
      .join(",");
    if (statusString) {
      const roomStatusArray = statusString.split(",").filter(Boolean);
      setRoomStatusList(roomStatusArray);
    } else {
      setRoomStatusList([]);
    }
    // let statusString = "";

    // // Check if room has room_status_linking property
    // if ((currentRoom as any)?.room_status_linking?.length > 0) {
    //   const linkedStatus = combineRoomStatuses(
    //     (currentRoom as any).room_status_linking
    //   );
    //   if (linkedStatus) {
    //     statusString = linkedStatus;
    //   }
    // }
    // // Check if room has direct room_status property as fallback
    // else if (currentRoom?.room_status) {
    //   statusString = currentRoom?.room_status?.trim();
    // }

    // if (statusString) {
    //   setRoomStatusList(statusString.split(",").filter(Boolean));
    // } else {
    //   setRoomStatusList([]);
    // }
  }, [currentRoom]);

  if (!currentRoom) {
    return null;
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleStatusChange = () => {
    if (onRefresh) {
      onRefresh();
    }
    handleClose();
  };

  // Convert the current room to the format expected by UpdateRoomStatusCode
  const roomDataForUpdate = currentRoom
    ? ({
        id: currentRoom.id,
        roomNumber: currentRoom.room_number,
        roomTypeId: currentRoom.room_type_id,
        frontdesk_status: currentRoom.frontdesk_status,
        state: "",
        status: currentRoom.frontdesk_status as IRoomStatus,
        room_status: roomStatusList.join(",") as ICustomRoomStatus,
      } as IHouseRoomNumberList)
    : null;

  return (
    <Box>
      <Box
        display="flex"
        flexWrap="wrap"
        gap={0.5}
        sx={{ cursor: "pointer" }}
        onClick={handleOpen}
        data-testid="room-status-chips"
      >
        {roomStatusList.length > 0 ? (
          roomStatusList.map((status, index) => {
            const statusInfo = roomStatus[status as ICustomRoomStatus];
            return (
              <Chip
                key={index}
                label={statusInfo?.label}
                size="small"
                sx={{
                  color: statusInfo?.color || "black",
                  fontWeight: "bold",
                }}
              />
            );
          })
        ) : (
          // Show clickable area but no chips if no statuses
          <Box
            sx={{
              height: "24px",
              fontSize: "12px",
              color: "#666",
              display: "flex",
              alignItems: "center",
            }}
          >
            Click to add room status
          </Box>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Room Status</DialogTitle>
        <StyledDialogContent>
          {roomDataForUpdate && (
            <UpdateRoomStatusCode
              status={roomStatusList.join(",")}
              rowData={roomDataForUpdate}
              statusChange={handleStatusChange}
              width={350}
            />
          )}
        </StyledDialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            sx={{
              fontSize: "16px",
              padding: "12px 30px",
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DisplayRoomStatus;

import React from "react";
import { Box, Typography } from "@mui/material";
import { ICustomRoomStatus } from "constants/room";

// Define a mapping of statuses to their respective color codes and labels
const statusColors: Record<
  ICustomRoomStatus,
  { color: string; label: string }
> = {
  [ICustomRoomStatus.RDY]: { color: "#008827", label: "Room is Ready" },
  [ICustomRoomStatus.RFS]: { color: "#F08080", label: "Refuse Service" },
  [ICustomRoomStatus.USF]: { color: "#F08080", label: "Unsafe to Enter" },
  [ICustomRoomStatus.DND]: { color: "#DAA520", label: "Do Not Disturb" },
  [ICustomRoomStatus.PET]: { color: "#205eda", label: "Pet in room" },
  [ICustomRoomStatus.DO]: {
    color: "#e40d15",
    label: "Due Out (Expected Departure)",
  },
  [ICustomRoomStatus.LCO]: { color: "#2e5a92", label: "Late Check Out" },
  [ICustomRoomStatus.ED]: { color: "#f50903", label: "Early Departure" },
};

// Component that sets the color according to the room status
interface CustomRoomStatusCodeProps {
  status: ICustomRoomStatus;
}

const CustomRoomStatusCode: React.FC<CustomRoomStatusCodeProps> = ({
  status,
}) => {
  // Get the color and label for the provided status, or default to black if not found
  const { color, label } = statusColors[status] || {
    color: "black",
    label: status,
  };

  return (
    <Box>
      <Typography style={{ color: color, fontWeight: "bold" }}>
        {label}
      </Typography>
    </Box>
  );
};

export default CustomRoomStatusCode;

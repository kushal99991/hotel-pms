import React from "react";
import { Box, Typography } from "@mui/material";
import { IRoomStatus } from "constants/room";

// Define a mapping of statuses to their respective color codes and labels
export const statusColors: Record<
  IRoomStatus,
  { color: string; label: string }
> = {
  [IRoomStatus.VC]: { color: "#f4c029", label: "Vacant Clean" },
  [IRoomStatus.VAC]: { color: "#f4c029", label: "Vacant" },
  [IRoomStatus.OCC]: { color: "#f4c029", label: "Occupied" },
  [IRoomStatus.VCI]: { color: "#59a03e", label: "Vacant Clean Inspected" },
  [IRoomStatus.VD]: { color: "#e30e0c", label: "Vacant Dirty" },
  [IRoomStatus.OOO]: { color: "#e40911", label: "Out of Order" },
  [IRoomStatus.OOS]: { color: "#e90c15", label: "Out of Service" },
  [IRoomStatus.PUP]: { color: "#f40a07", label: "Pick Up" },
  [IRoomStatus.NS]: { color: "#f0c229", label: "No Show" },
  [IRoomStatus.OC]: { color: "#315785", label: "Occupied Clean" },
  [IRoomStatus.OD]: { color: "#265780", label: "Occupied Dirty" },
  [IRoomStatus.DND]: { color: "#8D8687", label: "DO NOT DISTURB" },
  [IRoomStatus.IP]: { color: "#FF6347", label: "In Progress" },
  [IRoomStatus.OFF]: { color: "#e90c15", label: "Off Mark" },
};

// Component that sets the color according to the room status
interface RoomStatusCodeProps {
  status: IRoomStatus;
  customColor?: string;
}

const RoomStatusCode: React.FC<RoomStatusCodeProps> = ({
  status,
  customColor,
}) => {
  // Get the color and label for the provided status, or default to black if not found
  const { color, label } = statusColors[status] || {
    color: "black",
    label: status,
  };

  return (
    <Box>
      <Typography style={{ color: customColor || color, fontWeight: "bold" }}>
        {label}
      </Typography>
    </Box>
  );
};

export default RoomStatusCode;

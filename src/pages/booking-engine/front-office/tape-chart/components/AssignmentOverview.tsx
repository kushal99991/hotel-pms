import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { reservationStatusDisplayValues } from "constants/reservation";

export const statusChips: Record<
  string,
  {
    label: string;
    color: string;
    contrastColor?: string;
    icon?: string;
  }
> = {
  IN_HOUSE: reservationStatusDisplayValues["IN_HOUSE"],
  RESERVED: reservationStatusDisplayValues["RESERVED"],
  ARRIVAL: reservationStatusDisplayValues["ARRIVING"],
  DEPARTED: reservationStatusDisplayValues["DEPARTED"],
  DEPARTING: reservationStatusDisplayValues["DEPARTING"],
  NO_SHOW: reservationStatusDisplayValues["NO_SHOW"],
  CANCELED: reservationStatusDisplayValues["CANCELED"],
  COMPLETED: reservationStatusDisplayValues["COMPLETED"],
  OOO: {
    label: "Out of Order",
    color: "#E0E0E0", // Gray (neutral for blocked)
    contrastColor: "#000000",
  },
  OOS: {
    label: "Out of Service",
    color: "#E0E0E0", // Gray (neutral for blocked)
    contrastColor: "#000000",
  },
  OM: {
    label: "Off Market",
    color: "#E0E0E0", // Gray (neutral for blocked)
    contrastColor: "#000000",
  },
};

const AssignmentOverview: React.FC = () => {
  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Overview
      </Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", mb: 3 }}>
        {Object.entries(statusChips).map(([key, { color, label }]) => (
          <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: color,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="body2">{label}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default AssignmentOverview;

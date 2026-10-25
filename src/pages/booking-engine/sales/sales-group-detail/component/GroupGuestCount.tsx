import React from "react";
import { Typography, Box } from "@mui/material";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import Label from "components/elements/Label/Label";

const GroupGuestCount: React.FC = () => {
  const { selectedGroup } = useSalesDashboardContext();
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Occupancy:</Label>
        <Typography>{selectedGroup?.rooms_booked ?? 0} Adults</Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Children:</Label>
        <Typography>0</Typography>
      </Box>
    </Box>
  );
};

export default GroupGuestCount;

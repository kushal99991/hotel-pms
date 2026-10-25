import React from "react";
import { Chip } from "@mui/material";
import {
  ReservationStatusEnum,
  StatusDisplayInfo,
  reservationStatusDisplayValues,
} from "constants/reservation";

interface ReservationStatusChipProps {
  status?: ReservationStatusEnum;
}

const ReservationStatusChip: React.FC<ReservationStatusChipProps> = ({
  status,
}) => {
  let displayInfo: StatusDisplayInfo = {
    label: "",
    color: "",
    contrastColor: "",
  };
  if (status) {
    displayInfo = reservationStatusDisplayValues[status];
  }
  return (
    <Chip
      label={displayInfo?.label ?? status}
      size="small"
      sx={{
        backgroundColor: displayInfo?.color,
        color: displayInfo?.contrastColor,
      }}
    ></Chip>
  );
};

export default ReservationStatusChip;

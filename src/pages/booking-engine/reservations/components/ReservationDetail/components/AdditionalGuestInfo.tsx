import { Box, Typography } from "@mui/material";
import Label from "components/elements/Label/Label";
import React from "react";
import { IReservationStayDetailsResponse } from "types/reservationTypes";

interface IAdditionalGuestInfoProps {
  item: IReservationStayDetailsResponse;
  index: number;
}

const AdditionalGuestInfo: React.FC<IAdditionalGuestInfoProps> = ({
  item,
  index,
}) => {
  return (
    <Box key={index.toString()}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Occupancy:</Label>
        <Typography>{item.price ?? ""}</Typography>
      </Box>
    </Box>
  );
};

export default AdditionalGuestInfo;

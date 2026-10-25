import { Box, Typography } from "@mui/material";
import Label from "components/elements/Label/Label";
import React from "react";
import { IGuestResponse } from "types/reservationTypes";

interface IGuestInfoProps {
  item: IGuestResponse;
  index: number;
}

const GuestInfo: React.FC<IGuestInfoProps> = ({ item, index }) => {
  return (
    <Box key={index.toString()}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Name:</Label>
        <Typography>
          {item?.first_name ?? ""} {item?.last_name ?? ""}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Email:</Label>
        <Typography>{item.email}</Typography>
      </Box>
    </Box>
  );
};

export default GuestInfo;

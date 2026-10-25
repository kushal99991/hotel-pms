import React from "react";
import { Box, Typography } from "@mui/material";

export interface IDetailRowProps {
  label: string;
  value: string | React.ReactNode;
  fontWeightNormal?: boolean;
}

const DetailRow: React.FC<IDetailRowProps> = ({
  label,
  value,
  fontWeightNormal,
}) => (
  <Box display="flex" justifyContent="space-between" mb={1}>
    <Typography variant="body1" fontWeight={fontWeightNormal ? "" : "bold"}>
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

export default DetailRow;

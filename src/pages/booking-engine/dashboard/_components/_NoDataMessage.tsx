import React from "react";
import { TableCell, Typography } from "@mui/material";

import StyledTableRow from "./_StyleTableRow";

const NoDataMessage: React.FC = () => (
  <StyledTableRow data-testid="house-count-row-no-data">
    <TableCell colSpan={2} data-testid="house-count-summary-empty">
      <Typography variant="body1">No data available</Typography>
    </TableCell>
  </StyledTableRow>
);

export default NoDataMessage;

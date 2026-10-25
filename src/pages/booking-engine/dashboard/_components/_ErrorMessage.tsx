import React from "react";
import { TableCell, Typography } from "@mui/material";

import StyledTableRow from "./_StyleTableRow";

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <StyledTableRow data-testid="house-count-row-no-data">
    <TableCell colSpan={2} data-testid="house-count-summary-error">
      <Typography variant="body1" fontWeight={500} color="error">
        Error: {error}
      </Typography>
    </TableCell>
  </StyledTableRow>
);

export default ErrorMessage;

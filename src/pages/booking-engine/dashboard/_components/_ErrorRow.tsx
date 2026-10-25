import React from "react";
import { TableCell } from "@mui/material";

import StyledTableRow from "./_StyleTableRow";

const ErrorRow: React.FC<{ title: string; error: string }> = ({
  title,
  error,
}) => (
  <StyledTableRow data-testid={`error-row-${title}`} color="error">
    <TableCell colSpan={2} data-testid={`error-cell-${title}`}>
      {title}
    </TableCell>
    <TableCell colSpan={2} align="right" data-testid={`error-cell-${title}`}>
      {error}
    </TableCell>
  </StyledTableRow>
);

export default ErrorRow;

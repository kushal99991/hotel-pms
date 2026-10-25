import React from "react";
import { Skeleton, TableCell, TableRow } from "@mui/material";

const SkeletonRow: React.FC = () => (
  <TableRow>
    <TableCell>
      <Skeleton variant="text" width="80%" height={24} data-testid="skeleton" />
    </TableCell>
    <TableCell align="right">
      <Skeleton variant="text" width="60%" height={24} data-testid="skeleton" />
    </TableCell>
  </TableRow>
);

export default SkeletonRow;

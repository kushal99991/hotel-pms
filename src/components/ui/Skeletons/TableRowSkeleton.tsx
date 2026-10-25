import React from "react";
import { Skeleton, TableCell, TableRow } from "@mui/material";

const TableSkeletonRow: React.FC<{ columns: number }> = ({ columns }) => (
  <TableRow>
    {[...Array(columns)].map((_, index) => (
      <TableCell key={index}>
        <Skeleton data-testid="loading-skeleton-text" variant="text" />
      </TableCell>
    ))}
  </TableRow>
);

export default TableSkeletonRow;

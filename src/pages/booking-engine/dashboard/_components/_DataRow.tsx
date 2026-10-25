import React from "react";
import { IconButton, TableCell, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

import { toCapitalCase } from "utils/helperFunctions/capitalCase";
import { DataRowFields } from "types/bookingDashboardTypes";

import StyledTableRow from "./_StyleTableRow";

interface DataRowProps {
  item: DataRowFields;
}

const DataRow: React.FC<DataRowProps> = ({ item }) => (
  <StyledTableRow data-testid={`${item.status}-row`}>
    <TableCell colSpan={2}>
      <span data-testid={`${item.status}-title`}>
        {item.customStatus
          ? item.customStatus
          : item.status.includes("OOS") || item.status.includes("OOO")
            ? item.status
                .split("_")
                .map((word) =>
                  word.toUpperCase() === "OOS" || word.toUpperCase() === "OOO"
                    ? word.toUpperCase()
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")
            : toCapitalCase(item.status)}
      </span>
      {item.description && (
        <Tooltip title={item.description} placement="right">
          <IconButton
            size="small"
            sx={{ marginLeft: 1 }}
            data-testid={`info-icon-${item.status}`}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </TableCell>
    <TableCell
      colSpan={2}
      align="right"
      data-testid={`${item.status}-datum-point`}
    >
      {item.customReport ?? item.num}
    </TableCell>
  </StyledTableRow>
);

export default DataRow;

import React from "react";
import { TableCell, TableRow, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { IRate } from "types/rateTypes";

interface RateRowProps {
  rate: IRate;
  index: number;
  handleEditClick: (_index: number) => void;
  isEditing: boolean;
}

const RateRow: React.FC<RateRowProps> = ({
  rate,
  index,
  handleEditClick,
  isEditing,
}) => {
  return (
    <TableRow>
      <TableCell>{rate.name}</TableCell>
      <TableCell>{rate.code}</TableCell>
      <TableCell>{rate.description}</TableCell>
      <TableCell>{rate.status}</TableCell>
      <TableCell>
        <Tooltip title="Edit">
          <IconButton
            onClick={() => handleEditClick(index)}
            disabled={isEditing}
          >
            <EditIcon color={isEditing ? "disabled" : "primary"} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default RateRow;

import React from "react";
import {
  TableCell,
  TableRow,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface AddRateRowProps {
  newRate: {
    name: string;
    code: string;
    description: string;
    status: string;
  };
  errors: { [key: string]: string };
  handleNewRateChange: (_event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveNewRate: () => void;
  handleCancelNewRate: () => void;
  isSaveDisabled: boolean;
}

const AddRateRow: React.FC<AddRateRowProps> = ({
  newRate,
  errors,
  handleNewRateChange,
  handleSaveNewRate,
  handleCancelNewRate,
  isSaveDisabled,
}) => {
  return (
    <TableRow>
      <TableCell>
        <TextField
          variant="outlined"
          size="small"
          name="name"
          value={newRate.name}
          onChange={handleNewRateChange}
          placeholder="Name"
          fullWidth
          error={!!errors.name}
          helperText={errors.name}
        />
      </TableCell>
      <TableCell>
        <TextField
          variant="outlined"
          size="small"
          name="code"
          value={newRate.code}
          onChange={handleNewRateChange}
          placeholder="Code"
          fullWidth
          error={!!errors.code}
          helperText={errors.code}
        />
      </TableCell>
      <TableCell>
        <TextField
          variant="outlined"
          size="small"
          name="description"
          value={newRate.description}
          onChange={handleNewRateChange}
          placeholder="Description"
          fullWidth
          error={!!errors.description}
          helperText={errors.description}
        />
      </TableCell>
      <TableCell>
        <RadioGroup
          row
          name="status"
          value={newRate.status}
          onChange={handleNewRateChange}
        >
          <FormControlLabel value="Active" control={<Radio />} label="Active" />
          <FormControlLabel
            value="Inactive"
            control={<Radio />}
            label="Inactive"
          />
        </RadioGroup>
      </TableCell>
      <TableCell>
        <Tooltip title="Save">
          <IconButton
            color="primary"
            onClick={handleSaveNewRate}
            disabled={isSaveDisabled}
          >
            <SaveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancel">
          <IconButton color="secondary" onClick={handleCancelNewRate}>
            <CancelIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default AddRateRow;

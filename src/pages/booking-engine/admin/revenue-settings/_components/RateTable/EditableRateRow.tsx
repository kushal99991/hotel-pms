import React from "react";
import {
  TableCell,
  TableRow,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  IconButton,
  styled,
  TextareaAutosize,
  Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import { IRate } from "types/rateTypes";

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: "100%",
  padding: "8px",
  fontSize: "14px",
  borderRadius: "4px",
  border: `1px solid ${theme.palette.divider}`,
  "&:focus": {
    borderColor: theme.palette.primary.main,
  },
}));

interface EditableRateRowProps {
  rate: IRate;
  index: number;
  handleEditRateChange: (
    _event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    _index: number
  ) => void;
  handleStatusChange: (
    _event: React.ChangeEvent<HTMLInputElement>,
    _index: number
  ) => void;
  handleSaveEditRate: (_index: number) => void;
  handleCancelEditRate: () => void;
  errors: { [key: string]: string };
  isNewRate?: boolean;
}

const EditableRateRow: React.FC<EditableRateRowProps> = ({
  rate,
  index,
  handleEditRateChange,
  handleStatusChange,
  handleSaveEditRate,
  handleCancelEditRate,
  errors,
  isNewRate = false,
}) => {
  return (
    <TableRow>
      <TableCell>
        <TextField
          name="name"
          value={rate.name}
          onChange={(event) => handleEditRateChange(event, index)}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          name="code"
          value={rate.code}
          onChange={(event) => handleEditRateChange(event, index)}
          error={!!errors.code}
          helperText={errors.code}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <StyledTextarea
          name="description"
          value={rate.description}
          onChange={(event) =>
            handleEditRateChange(
              event as React.ChangeEvent<HTMLTextAreaElement>,
              index
            )
          }
          minRows={3}
          placeholder="Description"
        />
        {errors.description && (
          <Box color="error.main">{errors.description}</Box>
        )}
      </TableCell>
      <TableCell>
        <RadioGroup
          row
          name="status"
          value={rate.status}
          onChange={(event) => handleStatusChange(event, index)}
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
            onClick={() => handleSaveEditRate(index)}
            disabled={
              isNewRate && (!rate.name || !rate.code || !rate.description)
            }
          >
            <SaveIcon color="success" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancel">
          <IconButton onClick={handleCancelEditRate}>
            <CancelIcon color="error" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default EditableRateRow;

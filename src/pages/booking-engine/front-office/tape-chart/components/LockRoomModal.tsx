import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import useAuth from "hooks/useAuth";
import { Room } from "types/reservationTypes";
import { useCreateRoomBlockMutation } from "services/roomSlice";
import { ICreateRoomBlockRequest } from "types/houseKeeperTypes";
import useSnackbar from "hooks/useSnackbar";
import { useTapeChartContext } from "contexts/TapeChartContext";
import moment from "moment";

interface ILockRoomModal {
  open: boolean;
  date: string | null;
  room: Room;
  onClose: () => void;
}

const LockRoomModal: React.FC<ILockRoomModal> = ({
  open,
  date,
  room,
  onClose,
}) => {
  const { users } = useAuth();
  const { openSnackbar } = useSnackbar();
  const { onLoadingData } = useTapeChartContext();

  const [touched, setTouched] = useState(false);
  const [createRoomBlock, { isLoading }] = useCreateRoomBlockMutation();

  const [form, setForm] = useState({
    startDate: date ? moment(date).toDate() : null,
    endDate: date ? moment(date).toDate() : null,
    reason: "",
    status: "OOO",
  });

  useEffect(() => {
    if (open) {
      const defaultDate = date ? moment(date).toDate() : null;
      setForm({
        startDate: defaultDate,
        endDate: defaultDate,
        reason: "",
        status: "OOO",
      });
      setTouched(false);
    }
  }, [open, date]);

  const handleSave = async () => {
    setTouched(true);

    const { startDate, endDate, reason, status } = form;

    if (!startDate || !endDate || !reason.trim()) return;

    const payload: ICreateRoomBlockRequest = {
      start_date: moment(startDate).format("YYYY-MM-DD"),
      end_date: moment(endDate).format("YYYY-MM-DD"),
      property_id: users?.defaultPropertyId ?? 0,
      reason: reason.trim(),
      status,
      room_id: room?.id?.toString() ?? "",
    };

    const response = await createRoomBlock(payload);
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return;
    }

    openSnackbar("The room has been locked successfully.", "success");
    onLoadingData();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography component="span" variant="h6" fontWeight={600}>
          Block Room
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" gap={2} mt={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={form.startDate}
              disablePast
              onChange={(newDate) =>
                setForm((prev) => ({ ...prev, startDate: newDate }))
              }
              format="yyyy-MM-dd"
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: touched && !form.startDate,
                  helperText:
                    touched && !form.startDate ? "Start date is required" : "",
                },
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={form.endDate}
              minDate={form.startDate ?? undefined}
              onChange={(newDate) =>
                setForm((prev) => ({ ...prev, endDate: newDate }))
              }
              format="yyyy-MM-dd"
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: touched && !form.endDate,
                  helperText:
                    touched && !form.endDate ? "End date is required" : "",
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        <FormControl fullWidth margin="normal">
          <InputLabel id="block-status-label">Block Status</InputLabel>
          <Select
            labelId="block-status-label"
            value={form.status}
            label="Block Status"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <MenuItem value="OOO">
              Out Of Order - Temporarily unavailable
            </MenuItem>
            <MenuItem value="OOS">
              Out Of Service - Extended maintenance
            </MenuItem>
            <MenuItem value="OFF">Off Market - Business reasons</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Reason"
          placeholder="Enter reason"
          multiline
          rows={3}
          fullWidth
          value={form.reason}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, reason: e.target.value }))
          }
          variant="outlined"
          sx={{ marginTop: 2 }}
          error={touched && !form.reason.trim()}
          helperText={
            touched && !form.reason.trim() ? "Reason is required" : ""
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading}>
          {isLoading ? "Loading..." : "Lock Room"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LockRoomModal;

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  FormControl,
  OutlinedInput,
  Alert,
} from "@mui/material";
import { useUpdateInventoryIntervalsMutation } from "services/inventorySlice";
import {
  InventoryItem,
  UpdateInventoryIntervalBody,
} from "types/inventoryTypes";
import { IRateCodeListResponse } from "types/roomRateTypes";
import { IRoomTypeInventory, IRoomTypes } from "types/roomTypes";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";

interface InventoryFormData {
  [rate_code_id: number]: number | null;
}

interface InventoryByDate {
  [date: string]: {
    [room_type_id: number]: number;
  };
}

interface InventoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (message?: string) => void;
  inventoryData: InventoryItem[];
  selectedDate: string;
  roomTypeId: number;
  overbookAmount?: number;
  roomTypes?: IRoomTypes[];
  rateCodes?: IRateCodeListResponse[];
  overallInventory?: IRoomTypeInventory[];
}

const InventoryAllocationDialog: React.FC<InventoryDialogProps> = ({
  open,
  onClose,
  onSuccess,
  inventoryData,
  selectedDate,
  roomTypeId,
  overbookAmount,
  roomTypes,
  rateCodes,
  overallInventory,
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [totalError, setTotalError] = useState<string>("");
  const [updateError, setUpdateError] = useState<string>("");
  const [updateInventory, { isLoading: isUpdating }] =
    useUpdateInventoryIntervalsMutation();

  const filteredItems = useMemo(() => {
    const filteredData = inventoryData.filter(
      (item) => item.room_type_id === roomTypeId && item.date === selectedDate
    );
    const sortedByRateName = filteredData.sort((itemA, itemB) => {
      const aRateName = rateCodes?.find(
        (code) => code.id === itemA.rate_code_id
      )?.name;
      const bRateName = rateCodes?.find(
        (code) => code.id === itemB.rate_code_id
      )?.name;
      if (!aRateName && bRateName) {
        return 1;
      }
      if (aRateName && !bRateName) {
        return -1;
      }
      if (aRateName === bRateName) {
        return 0;
      }
      if (aRateName! < bRateName!) {
        return -1;
      } else if (bRateName! > aRateName!) {
        return 1;
      }
      return 0;
    });
    return sortedByRateName;
  }, [inventoryData, selectedDate, roomTypeId]);

  const totalAvailable = useMemo(() => {
    return filteredItems.reduce(
      (prevMax, item) => Math.max(prevMax, item.overall_inventory_count),
      0
    );
  }, [filteredItems]);

  const inventoryByDate = useMemo(() => {
    return (overallInventory ?? []).reduce((agg, item: IRoomTypeInventory) => {
      const { date, roomTypeId, availableCount } = item;

      if (!agg[date]) {
        agg[date] = {};
      }

      agg[date][roomTypeId] = availableCount;

      return agg;
    }, {} as InventoryByDate);
  }, [overallInventory]);

  const totalAllocated = useMemo(() => {
    return Object.values(formData).reduce((sum, value) => {
      return sum + (value || 0);
    }, 0);
  }, [formData]);

  useEffect(() => {
    if (!open) return;

    const initialFormData: InventoryFormData = {};
    filteredItems.forEach((item) => {
      initialFormData[item.rate_code_id] = item?.block_count ?? null;
    });

    setFormData(initialFormData);
    setErrors({});
    setTotalError("");
  }, [open, filteredItems]);

  useEffect(() => {
    if (overbookAmount !== undefined) {
      const maxAllowed = totalAvailable + overbookAmount;
      if (totalAllocated > maxAllowed) {
        setTotalError(
          `Total allocation cannot exceed ${maxAllowed}. (${totalAvailable} (available) + ${overbookAmount} (overbook))`
        );
      } else {
        setTotalError("");
      }
    }
  }, [totalAllocated, totalAvailable, overbookAmount]);

  const handleChange = (rateCodeId: number, value: string) => {
    const numValue = value === "" ? null : parseInt(value, 10);

    if (value !== "" && (isNaN(numValue!) || numValue! < 0)) {
      setErrors({
        ...errors,
        [rateCodeId]: "Must be a positive number",
      });
      return;
    }

    setErrors({
      ...errors,
      [rateCodeId]: "",
    });

    setFormData({
      ...formData,
      [rateCodeId]: numValue,
    });
  };

  const handleSubmit = async () => {
    const payload: UpdateInventoryIntervalBody = {
      intervals: [],
    };

    Object.keys(formData).forEach((rateCodeIdStr) => {
      const rateCodeId = parseInt(rateCodeIdStr, 10);
      const allocatedValue = formData[rateCodeId];

      // Skip if value is null
      if (allocatedValue === null) {
        return;
      }

      const originalItem = filteredItems.find(
        (item) => item.rate_code_id === rateCodeId
      );

      if (originalItem) {
        payload.intervals.push({
          start_date: selectedDate,
          end_date: selectedDate,
          rate_code_id: rateCodeId,
          room_type_id: roomTypeId,
          available_count: allocatedValue,
        });
      }
    });

    const response = await updateInventory(payload);
    if (!response.error) {
      setFormData({});
      onSuccess?.();
    } else {
      setUpdateError(response.error as string);
    }
  };

  const hasErrors =
    Object.values(errors).some((error) => error !== "") || totalError !== "";
  const roomTypeAbbr = roomTypes?.find((type) => type.id === roomTypeId)?.type;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Allocate Inventory</DialogTitle>

      <DialogContent dividers>
        <Grid container>
          <Grid item xs={6}>
            <Typography variant="body1" gutterBottom>
              {`Room Type: ${roomTypeAbbr ?? roomTypeId}`}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="body1" gutterBottom>
              {`Date: ${modifyToDisplayDate(selectedDate)}`}
            </Typography>
          </Grid>
        </Grid>

        {overbookAmount !== undefined && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Available: {totalAvailable} Overbook allowed: {overbookAmount} | Max
            total: {totalAvailable + overbookAmount}
          </Typography>
        )}

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {filteredItems.map((item) => {
            const rateCodeName = rateCodes?.find(
              (code) => code.id === item.rate_code_id
            )?.name;
            return (
              <Grid item xs={12} key={item.rate_code_id}>
                <FormControl fullWidth variant="outlined">
                  <Box display="flex" alignItems="center">
                    <Box
                      flex={1}
                      display="flex"
                      justifyContent="flex-end"
                      pr={3}
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      <Typography
                        component="div"
                        sx={{ minWidth: "100px", textAlign: "center" }}
                      >
                        {rateCodeName ?? item.rate_code_id}
                      </Typography>
                    </Box>
                    <Box
                      flex="1"
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-start"
                    >
                      <OutlinedInput
                        id={`rate-${item.rate_code_id}`}
                        type="number"
                        value={formData[item.rate_code_id] ?? ""}
                        onChange={(e) =>
                          handleChange(item.rate_code_id, e.target.value)
                        }
                        error={!!errors[item.rate_code_id]}
                        inputProps={{
                          min: 0,
                          step: 1,
                        }}
                        size="small"
                        sx={{
                          width: "70px",
                        }}
                      />
                      <Typography component="div" sx={{ ml: 1 }}>
                        /{inventoryByDate[selectedDate]?.[roomTypeId]}
                      </Typography>
                    </Box>
                  </Box>
                  {errors[item.rate_code_id] && (
                    <Typography color="error" variant="caption">
                      {errors[item.rate_code_id]}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            );
          })}
        </Grid>

        {totalError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {totalError}
          </Alert>
        )}
        {updateError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {updateError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={hasErrors || isUpdating}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryAllocationDialog;

import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  TextField,
  Button,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { IReservationResponse } from "types/reservationTypes";
import { ReservationStatusEnum } from "constants/reservation";
import { useUpdatePerNightRatesMutation } from "services/reservationSlice";
import { useGetLatestNightAuditQuery } from "services/nightAuditSlice";
import Label from "components/elements/Label/Label";
import { pluralValue } from "utils/helperFunctions/common";
import useAuth from "hooks/useAuth";
interface EditableRate {
  date: string;
  rate: string | number;
  originalRate: string;
  disabled?: boolean;
}

const RateDetails: React.FC<{
  details: IReservationResponse | null;
  onRefresh?: () => void;
}> = ({ details, onRefresh }) => {
  const { users, currentTimeZone } = useAuth();
  const [showADR, setShowADR] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editableRates, setEditableRates] = useState<EditableRate[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Helper to check if reservation status disables rate editing
  const disabledStatuses = [
    ReservationStatusEnum.CANCELED,
    ReservationStatusEnum.NO_SHOW,
    ReservationStatusEnum.DEPARTING,
    ReservationStatusEnum.DEPARTED,
  ];
  const isStatusDisabled = details?.status
    ? disabledStatuses.includes(details.status)
    : false;

  const [updatePerNightRates, { isLoading: isUpdating }] =
    useUpdatePerNightRatesMutation();

  // Get the latest night audit date to determine which dates can be edited
  const { data: nightAuditData } = useGetLatestNightAuditQuery({
    property_id: users?.defaultPropertyId ?? 1,
  });

  // Initialize editable rates when dialog opens
  useEffect(() => {
    if (openDialog && details?.reservation_stay_details && currentTimeZone) {
      // Check if reservation status disables all rate editing
      const isReservationStatusDisabled = isStatusDisabled;

      const rates = details.reservation_stay_details.map((detail) => {
        // Use string comparison to avoid timezone conversion issues
        const rateDateString = moment(detail.date).format("YYYY-MM-DD");
        const nightAuditDateString = nightAuditData?.audit_date
          ? moment(nightAuditData.audit_date).format("YYYY-MM-DD")
          : null;

        const isDateDisabled = nightAuditDateString
          ? rateDateString < nightAuditDateString
          : false;

        const isDisabled = isReservationStatusDisabled || isDateDisabled;
        return {
          date: detail.date.toString(),
          rate: parseFloat(detail.nightly_rate || "0").toFixed(2),
          originalRate: parseFloat(detail.nightly_rate || "0").toFixed(2),
          disabled: isDisabled,
        };
      });
      setEditableRates(rates);
      setHasChanges(false);
    }
  }, [openDialog, details, isStatusDisabled, currentTimeZone, nightAuditData]);

  // Calculate ADR from current rates (either original or edited)
  const calculateADR = (rates?: EditableRate[]) => {
    const ratesToUse =
      rates ||
      details?.reservation_stay_details?.map((detail) => ({
        date: detail.date.toString(),
        rate: parseFloat(detail.nightly_rate || "0").toFixed(2),
        originalRate: parseFloat(detail.nightly_rate || "0").toFixed(2),
        disabled: false, // Default to enabled for calculation
      })) ||
      [];

    if (!ratesToUse.length) return "0.00";

    const total = ratesToUse.reduce((sum, rate) => {
      const numericRate =
        typeof rate.rate === "string" ? parseFloat(rate.rate) : rate.rate;
      return sum + (isNaN(numericRate) ? 0 : numericRate);
    }, 0);

    return (total / ratesToUse.length).toFixed(2);
  };

  // Handle rate change
  const handleRateChange = (index: number, newRate: string) => {
    // Remove leading zeros and handle backspace properly
    let cleanedRate = newRate.replace(/^0+(?=\d)/, "");
    if (cleanedRate === "") cleanedRate = "0";

    const updatedRates = editableRates.map((rate, i) =>
      i === index ? { ...rate, rate: cleanedRate } : rate
    );

    setEditableRates(updatedRates);

    // Check if there are any changes (only for enabled fields)
    const hasAnyChanges = updatedRates.some(
      (rate) =>
        !rate.disabled &&
        parseFloat(rate.rate.toString()) !== parseFloat(rate.originalRate)
    );
    setHasChanges(hasAnyChanges);
  };

  // Handle save
  const handleSave = async () => {
    if (!details?.id || !hasChanges) return;

    // Only send changed rates for enabled fields
    const ratesToUpdate = editableRates
      .filter(
        (rate) =>
          !rate.disabled &&
          parseFloat(rate.rate.toString()) !== parseFloat(rate.originalRate)
      )
      .map((rate) => ({
        date: rate.date,
        rate: parseFloat(rate.rate.toString()),
      }));

    if (ratesToUpdate.length === 0) {
      handleCloseDialog();
      return;
    }

    try {
      await updatePerNightRates({
        reservation_id: details.id,
        rates_to_update: ratesToUpdate,
      }).unwrap();

      handleCloseDialog();
      onRefresh?.();
    } catch {
      /** empty catch error */
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditableRates([]);
    setHasChanges(false);
    setOpenDialog(false);
  };

  // Open/Close Dialog Handlers
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setEditableRates([]);
    setHasChanges(false);
    setOpenDialog(false);
  };

  // Handle TextField focus
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  // Render ADR
  const renderADR = () => (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography fontWeight="bold">ADR:</Typography>
      <Typography fontWeight="bold">${calculateADR()}</Typography>
    </Box>
  );

  return (
    <>
      {/* Date Range with Nightly Rates Link */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>
          {`${pluralValue(moment(details?.end_date).diff(moment(details?.start_date), "days"), "Night", "Nights")}:`}
        </Label>
        <Box display={"flex"} gap={1}>
          <Typography>
            {`${moment(details?.start_date).format("MMM DD")} - ${moment(details?.end_date).format("MMM DD")}`}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            {isStatusDisabled ? (
              <Typography
                sx={{
                  cursor: "not-allowed",
                  textTransform: "none",
                  color: "#999",
                }}
                title="Cannot edit rates for this reservation status"
              >
                View/Edit Nightly Rates
              </Typography>
            ) : (
              <Typography
                onClick={handleOpenDialog}
                sx={{
                  cursor: "pointer",
                  textTransform: "none",
                  textDecoration: "underline",
                  color: "#32A1AE",
                  "&:hover": {
                    color: "#228891",
                  },
                }}
              >
                View/Edit Nightly Rates
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Rate Code */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Rate: </Label>
        <Box display="flex" alignItems="center">
          <Typography fontWeight="bold">
            {details?.rate_code?.name || "Unknown"}
          </Typography>
        </Box>
      </Box>

      {/* Suppressed Rate Switch */}
      <Box>
        {details?.rate_code?.suppressed ? (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={showADR}
                  onChange={(e) => setShowADR(e.target.checked)}
                  color="primary"
                />
              }
              label="Show ADR"
            />
            {showADR && renderADR()}
          </>
        ) : (
          renderADR()
        )}
      </Box>

      {/* Editable Dialog Popup */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          View/Edit Nightly Rates
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              ADR: ${calculateADR(editableRates)}
            </Typography>
          </Box>
          {(nightAuditData?.audit_date || isStatusDisabled) && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                {isStatusDisabled ? (
                  "Note: Rates cannot be edited for reservations with status: Cancelled, No-show, Departing, or Departed."
                ) : nightAuditData?.audit_date ? (
                  <>
                    Note: Rates for dates before{" "}
                    {moment(nightAuditData.audit_date).format("MMM DD, YYYY")}{" "}
                    cannot be edited due to completed night audit.
                  </>
                ) : null}
              </Typography>
            </Box>
          )}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "50%", minWidth: 150 }}>
                    <Typography fontWeight="bold">Date</Typography>
                  </TableCell>
                  <TableCell
                    sx={{ width: "50%", minWidth: 120, textAlign: "center" }}
                  >
                    <Typography fontWeight="bold">Nightly Rate</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editableRates.map((rate, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ verticalAlign: "middle" }}>
                      {moment(rate.date).format("MMM DD, YYYY")}
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      {rate.disabled ? (
                        <Tooltip
                          title={
                            isStatusDisabled
                              ? "Cannot edit rates for reservations with status: Cancelled, No-show, Departing, or Departed"
                              : nightAuditData?.audit_date
                                ? `Cannot edit rates for dates before ${moment(nightAuditData.audit_date).format("MMM DD, YYYY")} (latest night audit date)`
                                : "Rate editing is disabled"
                          }
                          placement="top"
                        >
                          <span>
                            <TextField
                              size="small"
                              type="number"
                              value={rate.rate}
                              onChange={(e) =>
                                handleRateChange(index, e.target.value)
                              }
                              onFocus={handleFocus}
                              disabled={rate.disabled}
                              inputProps={{
                                min: 0,
                                step: "0.01",
                                style: { width: 100, textAlign: "center" },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& input": {
                                    textAlign: "center",
                                  },
                                },
                              }}
                            />
                          </span>
                        </Tooltip>
                      ) : (
                        <TextField
                          size="small"
                          type="number"
                          value={rate.rate}
                          onChange={(e) =>
                            handleRateChange(index, e.target.value)
                          }
                          onFocus={handleFocus}
                          disabled={rate.disabled}
                          inputProps={{
                            min: 0,
                            step: "0.01",
                            style: { width: 100, textAlign: "center" },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& input": {
                                textAlign: "center",
                              },
                            },
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={!hasChanges || isUpdating}
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RateDetails;

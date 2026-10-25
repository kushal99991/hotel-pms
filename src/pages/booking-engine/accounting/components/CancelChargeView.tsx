import React, { useState } from "react";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Typography,
  Alert,
} from "@mui/material";
import { useDeleteChargeMutation } from "services/paymentsSlice";
import { currencyString } from "utils/helperFunctions/numbers";
import { AccountModalViewProps } from "types/ui/accounting";
import { isAdjustment } from "utils/charges";
import { apiAmountToNumber } from "utils/dataFormats";

const CancelChargeView: React.FC<AccountModalViewProps> = ({
  account,
  additionalProps,
  onClose,
  onRefresh,
}) => {
  const [deleteCharge, { isLoading }] = useDeleteChargeMutation();
  const selectedCharge = account?.charges?.find(
    (c) => c.id === additionalProps?.selectedChargeId
  );
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRefundClick = async () => {
    if (!selectedCharge) {
      return;
    }
    const cancelResponse = await deleteCharge({
      charge_id: selectedCharge.id,
    });
    if (!cancelResponse?.error) {
      setSuccessMessage(
        `Cancelling charge successfully processed! Click below to close.`
      );
      onRefresh?.();
    } else if (cancelResponse.error) {
      setError(cancelResponse.error.toString());
    }
  };

  function handleCloseClick() {
    setError("");
    setSuccessMessage("");
    onClose?.();
  }

  let chargeIsAdjustment = false;
  if (selectedCharge) {
    chargeIsAdjustment = isAdjustment(selectedCharge, account?.charges ?? []);
  }
  const label = chargeIsAdjustment ? "ADJ" : "";
  return (
    <DialogContent>
      <Box>
        <Box>
          {error && (
            <Alert
              sx={{ mb: 2 }}
              severity="error"
              onClose={() => {
                setError("");
              }}
            >
              {`Error cancelling charge: ${error}.`}
            </Alert>
          )}
          <Box mb={3}>
            <Box mb={2}>
              <Box>
                <Typography fontWeight="bold">{`${label ? `${label} ` : ""}${selectedCharge?.posting_code.name.toLocaleUpperCase()} - ${selectedCharge?.posting_code.code}`}</Typography>
                <Box>
                  <Typography fontWeight="bold">Notes: </Typography>
                  <Typography>{selectedCharge?.description ?? ""}</Typography>
                </Box>
              </Box>
            </Box>
            <Typography component="span">{`Cancel the charge amount of `}</Typography>
            <Typography component="span" fontWeight="bold">
              {currencyString(apiAmountToNumber(selectedCharge?.amount))}
            </Typography>
            <Typography component="span">?</Typography>
          </Box>
        </Box>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
      </Box>
      <DialogActions
        sx={{ mt: 4, pb: 0, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={() => {
            handleCloseClick();
          }}
          color="primary"
        >
          Close
        </Button>
        <Button
          onClick={handleRefundClick}
          variant="contained"
          color="error"
          disabled={isLoading || !!successMessage}
        >
          {isLoading ? "Cancelling..." : "Cancel Charge"}
        </Button>
      </DialogActions>
    </DialogContent>
  );
};

export default CancelChargeView;

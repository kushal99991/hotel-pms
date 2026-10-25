import React, { useState } from "react";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Typography,
  Alert,
} from "@mui/material";
import { useRefundPaymentMutation } from "services/paymentsSlice";
import { PaymentRefundReasonEnum } from "constants/payments";
import { currencyString } from "utils/helperFunctions/numbers";
import { AccountModalViewProps } from "types/ui/accounting";
import { apiAmountToNumber, numberToTwoDecimals } from "utils/dataFormats";

const CancelPaymentModal: React.FC<AccountModalViewProps> = ({
  account,
  additionalProps,
  onClose,
}) => {
  const [refundPayment, { isLoading: refundLoading }] =
    useRefundPaymentMutation();
  const selectedPayment = account?.payments.find(
    (p) => p.id === additionalProps?.selectedPaymentId
  );
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRefundClick = async () => {
    if (!selectedPayment) {
      return;
    }
    const isFullRefund =
      selectedPayment.remaining_amount === selectedPayment.amount;
    const refundResponse = await refundPayment({
      amount: numberToTwoDecimals(
        apiAmountToNumber(selectedPayment.remaining_amount)
      ),
      description: `DB ${isFullRefund ? "REFUND" : "PARTIAL REFUND"} of ${selectedPayment.remaining_amount}`,
      reason: PaymentRefundReasonEnum.OTHER,
      paymentId: selectedPayment.id,
    });
    if (refundResponse?.data) {
      setSuccessMessage(
        `Cancelling payment amount of ${currencyString(apiAmountToNumber(selectedPayment.remaining_amount))} successfully processed! Click below to close.`
      );
    } else if (refundResponse.error) {
      setError(refundResponse.error.toString());
    }
  };

  function handleCloseClick(refresh?: boolean) {
    const wasSuccess = !!successMessage;
    setError("");
    setSuccessMessage("");
    onClose?.(refresh || wasSuccess);
  }

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
              {`Error cancelling payment: ${error}.`}
            </Alert>
          )}
          <Box mb={3}>
            <Typography component="span">{`Cancel the payment amount of `}</Typography>
            <Typography component="span" fontWeight="bold">
              {currencyString(
                apiAmountToNumber(selectedPayment?.remaining_amount)
              )}
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
        sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
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
          color="secondary"
          disabled={refundLoading || !!successMessage}
        >
          {refundLoading ? "Cancelling..." : "Cancel Payment"}
        </Button>
      </DialogActions>
    </DialogContent>
  );
};

export default CancelPaymentModal;

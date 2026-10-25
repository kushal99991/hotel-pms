import React, { useState, useEffect } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  InputAdornment,
  FormControlLabel,
  Radio,
  Typography,
  TextField,
  Alert,
} from "@mui/material";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useRefundPaymentMutation } from "services/paymentsSlice";
import { IPaymentResponse } from "types/payments";
import { PaymentRefundReasonEnum } from "constants/payments";
import { enumToReadable } from "utils/helperFunctions/strings";
import { currencyString } from "utils/helperFunctions/numbers";

interface PaymentRow extends IPaymentResponse {
  payment_amount?: number;
}

interface RefundPaymentModalProps {
  open: boolean;
  payment?: PaymentRow;
  onClose: (addSuccess?: boolean, refreshFolios?: boolean) => void;
  refreshData: () => void;
}

const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({
  open,
  payment,
  onClose,
  refreshData,
}) => {
  const [refundPayment, { isLoading: refundLoading }] =
    useRefundPaymentMutation();
  const [fullRefund, setFullRefund] = useState(true);
  const [partialRefund, setPartialRefund] = useState(false);
  const [invalidAmountMsg, setInvalidAmountMsg] = useState("");
  const [amount, setAmount] = useState(payment?.payment_amount ?? 0);
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState<PaymentRefundReasonEnum | "">("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setAmount(payment?.payment_amount ?? 0);
  }, [payment]);

  function onAmountChange(evt: any) {
    const maxAmount = payment?.payment_amount ?? 0;
    const amt = +evt.target.value;
    let invalidMsg = "";
    if (Number.isNaN(amt)) {
      invalidMsg = "Valid amount required";
    } else if (amt === 0) {
      invalidMsg = "Amount should be greater than 0";
    } else if (amt > maxAmount) {
      invalidMsg = "Cannot be greater than payment";
    }
    setError("");
    setInvalidAmountMsg(invalidMsg);
    setAmount(evt.target.value);
  }
  function handleFullRefundClick() {
    if (fullRefund) {
      setFullRefund(false);
      setPartialRefund(true);
    } else {
      setFullRefund(true);
      setPartialRefund(false);
    }
  }
  function handlePartialRefundClick() {
    if (partialRefund) {
      setFullRefund(true);
      setPartialRefund(false);
    } else {
      setFullRefund(false);
      setPartialRefund(true);
    }
  }
  function onDescriptionChange(evt: any) {
    setError("");
    setDescription(evt.target.value);
  }
  const handleRefundClick = async () => {
    const refundResponse = await refundPayment({
      amount,
      description,
      reason: reason || PaymentRefundReasonEnum.OTHER,
      paymentId: payment?.id ?? -1,
    });
    if (refundResponse?.data) {
      setSuccessMessage(
        `Refund for ${currencyString(amount)} successfully processed! Click below to close.`
      );
      refreshData();
    } else if (refundResponse.error) {
      setError(refundResponse.error.toString());
    }
  };

  function handleCloseClick(refresh?: boolean) {
    const wasSuccess = !!successMessage;
    setError("");
    setSuccessMessage("");
    setDescription("");
    setFullRefund(true);
    setPartialRefund(false);
    setInvalidAmountMsg("");
    setAmount(payment?.payment_amount ?? 0);
    onClose?.(refresh || wasSuccess);
  }

  function onReasonChange(evt: any) {
    const value = evt.target.value;
    setError("");
    setReason(value as PaymentRefundReasonEnum);
  }
  const reasonOptions = Object.keys(PaymentRefundReasonEnum).map((enumVal) => {
    return {
      label: enumToReadable(enumVal),
      value: enumVal,
    };
  });
  return (
    <Dialog
      open={open}
      onClose={() => handleCloseClick()}
      PaperProps={{ sx: { width: "400px" } }}
    >
      <Backdrop
        open={refundLoading}
        sx={{ background: "rgba(0,0,0,0.2)", zIndex: 200 }}
      >
        <CircularProgress size="5rem" color="secondary" />
      </Backdrop>
      <DialogTitle mb={1}>Refund Payment</DialogTitle>
      <DialogContent>
        <Box>
          {error && (
            <Alert
              sx={{ mb: 2 }}
              severity="error"
              onClose={() => {
                setError("");
              }}
            >
              {`Error refunding payment: ${error}.`}
            </Alert>
          )}
          <Box mb={3}>
            <Typography component="span">{`Refund this payment of `}</Typography>
            <Typography component="span" fontWeight="bold">
              {currencyString(payment?.payment_amount ?? 0)}
            </Typography>
            <Typography component="span">?</Typography>
          </Box>
          <CustomDropdown
            label={"Reason for Refund"}
            placeholder="Refund Reason"
            options={reasonOptions}
            onChange={onReasonChange}
            value={reason}
            defaultValue=""
            fullWidth
            aria-label="Reason to Refund"
            data-testid="refund-reason-dropdown"
          />
          <TextField
            multiline
            fullWidth
            rows={2}
            label="Description"
            placeholder="Add a description to the charge"
            onChange={onDescriptionChange}
            value={description}
            sx={{ mt: 3 }}
          />
          <Box textAlign="center" mt={3}>
            <FormControlLabel
              label="Full Refund"
              control={
                <Radio
                  size="medium"
                  onChange={handleFullRefundClick}
                  checked={fullRefund}
                />
              }
              sx={{ maxWidth: "75%" }}
            />
            <FormControlLabel
              label="Partial Refund"
              control={
                <Radio
                  size="medium"
                  onChange={handlePartialRefundClick}
                  checked={partialRefund}
                />
              }
              sx={{ maxWidth: "75%" }}
            />
          </Box>
          {partialRefund && (
            <Box
              mt={2}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography component="div">
                Enter an amount less than the total amount:{" "}
              </Typography>
              <TextField
                onChange={onAmountChange}
                error={!!invalidAmountMsg}
                helperText={invalidAmountMsg}
                placeholder="0.00"
                size="small"
                InputProps={{
                  sx: { maxWidth: "140px", mt: 1 },
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                FormHelperTextProps={{
                  sx: { marginRight: 0, textAlign: "right" },
                }}
                sx={{
                  pr: 2,
                  width: "100%",
                  alignItems: "center",
                  input: { textAlign: "right" },
                }}
              />
            </Box>
          )}
        </Box>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}{" "}
          </Alert>
        )}
      </DialogContent>
      <DialogActions
        sx={{ p: 3, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={() => {
            handleCloseClick();
          }}
          color="primary"
        >
          {successMessage ? "Close" : "Cancel"}
        </Button>
        <Button
          onClick={handleRefundClick}
          variant="contained"
          disabled={refundLoading || !!invalidAmountMsg || !!successMessage}
        >
          Refund Charge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundPaymentModal;

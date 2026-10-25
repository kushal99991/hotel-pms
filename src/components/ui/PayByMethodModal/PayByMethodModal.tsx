import React, { useState } from "react";
import {
  Alert,
  Backdrop,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMakePaymentMutation } from "services/paymentsSlice";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { PaymentCaptureTypeEnum } from "constants/payments";
import { PaymentTotalsData } from "../PaymentTotals/PaymentTotals";
import CardListItem from "../CardListItem/CardListItem";
import { currencyString } from "utils/helperFunctions/numbers";

interface PayByMethodModalProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  totals: PaymentTotalsData;
  title?: string;
  paymentMethod?: IPaymentMethodResponse;
  isPrimaryMethod: boolean;
  folioId: number;
  reservationId: number;
  immediatePayment?: boolean;
}

const PayByMethodModal: React.FC<PayByMethodModalProps> = ({
  open,
  onClose,
  title,
  totals,
  paymentMethod,
  reservationId,
  folioId,
  isPrimaryMethod,
  immediatePayment,
}) => {
  const [makePayment, { isLoading }] = useMakePaymentMutation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  async function callMakePayment() {
    const response = await makePayment({
      amount: totals?.balance,
      reservation_id: reservationId,
      payment_method_id: paymentMethod?.id,
      folio_id: folioId,
      capture_type: immediatePayment
        ? PaymentCaptureTypeEnum.IMMEDIATE
        : PaymentCaptureTypeEnum.IMMEDIATE, // TODO revisit when we need deferred
    });
    if (response.error) {
      setErrorMessage(
        `Error making payment: ${response.error.toString() ?? ""} Please try again.`
      );
    } else if (response.data) {
      const amount = response.data.amount;
      const messageString = amount
        ? `Payment for $${amount} successfully made!`
        : "Payment successful!";
      setSuccessMessage(`${messageString} Click below to close.`);
    }
  }

  function handleClose() {
    setSuccessMessage("");
    setErrorMessage("");
    onClose?.(!!successMessage);
  }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: "500px" } }}
    >
      <Backdrop
        open={isLoading}
        sx={{ background: "rgba(0,0,0,0.2)", zIndex: 200 }}
      >
        <CircularProgress size="5rem" color="secondary" />
      </Backdrop>
      <DialogTitle>{title ?? "Process Payment"}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Typography>{`Process the balance of ${currencyString(totals?.balance ?? 0)} with this card?`}</Typography>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item>
            <CardListItem
              paymentMethod={paymentMethod}
              primaryPaymentMap={{}}
            />
          </Grid>
          <Grid item>
            {isPrimaryMethod && (
              <Chip
                label="Primary"
                size="small"
                sx={{
                  ml: 2,
                  height: "20px",
                  fontSize: "0.75rem",
                  color: "success.light",
                  backgroundColor: "white",
                  borderColor: "success.light",
                  border: "1px solid",
                }}
              />
            )}
          </Grid>
          {!isPrimaryMethod && (
            <Typography
              fontStyle="italic"
              fontSize="0.875rem"
              sx={{ color: "warning.light" }}
            >
              {"* This is NOT the primary payment method for this folio."}
            </Typography>
          )}
        </Grid>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}{" "}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}{" "}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
        <Button variant="outlined" onClick={handleClose} sx={{ mt: 2 }}>
          Close
        </Button>
        <Button
          variant="contained"
          disabled={
            isLoading || !!successMessage || (totals?.balance ?? 0) <= 0
          }
          onClick={callMakePayment}
          sx={{ mt: 2 }}
        >
          {successMessage
            ? "Payment Complete"
            : `Pay ${currencyString(totals?.balance ?? 0)} with ${paymentMethod?.brand}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayByMethodModal;

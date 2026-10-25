import React, { useState, useEffect } from "react";
import { Alert, Box, Button, Backdrop, CircularProgress } from "@mui/material";
import { useMakePaymentMutation } from "services/paymentsSlice";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { IMakePaymentBody, PayByPaymentSettings } from "types/payments";
import { currencyString } from "utils/helperFunctions/numbers";
import { CompletionInformation } from "../StripePayment/StripePayment";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { numberToTwoDecimals } from "utils/dataFormats";
import { PaymentParent } from "types/ui/payments";
import { paymentApiIdFromParent } from "utils/payments";

export interface IPayWithNewSettings {
  disabled?: boolean;
  message?: string;
}

interface PayWithCashProps {
  amount?: number;
  paySettings?: PayByPaymentSettings;
  currentFolioId?: number;
  reservationId?: number;
  onClose?: (refreshData?: boolean) => void;
  onPaymentComplete?: () => void;
  onPaymentSuccess?: () => void;
  completeSettings?: CompletionInformation;
  cashMethod?: IPaymentMethodResponse;
  parent?: PaymentParent;
}

const PayWithCash: React.FC<PayWithCashProps> = ({
  amount,
  paySettings,
  currentFolioId,
  reservationId,
  onClose,
  onPaymentComplete,
  onPaymentSuccess,
  completeSettings,
  cashMethod,
  parent,
}) => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [makePayment, { isLoading }] = useMakePaymentMutation();
  const cashAvailable =
    cashMethod?.payment_type === PaymentMethodTypesEnum.CASH;

  useEffect(() => {
    if (!cashAvailable || !currentFolioId) {
      console.warn(
        "Payment method provided for Cash is not properly configured."
      );
    }
  }, [cashMethod, cashAvailable, currentFolioId]);

  async function callMakePayment() {
    let makePaymentBody: IMakePaymentBody = {
      amount: numberToTwoDecimals(amount ?? -1),
      payment_method_id: cashMethod?.id ?? -1,
      description: paySettings?.description ?? "",
      folio_id: currentFolioId,
      reservation_id:
        reservationId && reservationId > 0 ? reservationId : undefined,
    };
    if (parent) {
      const idBody = paymentApiIdFromParent(parent);
      makePaymentBody = {
        ...makePaymentBody,
        ...idBody,
      };
    }
    const response = await makePayment(makePaymentBody);
    if (response.error) {
      setErrorMessage(
        `Error making payment: ${response.error.toString() ?? ""} Please try again.`
      );
    } else if (response.data) {
      const amount = response.data.amount;
      const messageString = amount
        ? `Payment for $${amount} successfully made!`
        : "Payment successful!";
      let msg = `${messageString} Click below to close.`;
      if (completeSettings?.message) {
        msg = completeSettings.message;
      }
      setSuccessMessage(msg);
      onPaymentSuccess?.();
    }
  }

  function handleClose() {
    const needRefresh = !!successMessage;
    setErrorMessage("");
    setSuccessMessage("");
    onClose?.(needRefresh);
    if (needRefresh) {
      // payment completed successfully
      onPaymentComplete?.();
    }
  }
  return (
    <Box p={3}>
      <Backdrop
        open={isLoading}
        sx={{ background: "rgba(0,0,0,0.2)", zIndex: 200 }}
      >
        <CircularProgress size="5rem" color="secondary" />
      </Backdrop>
      <Box>
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
        {successMessage && (
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClose}
            sx={{ mt: 2 }}
          >
            {completeSettings?.buttonLabel ?? "Close"}
          </Button>
        )}
        {!successMessage && (
          <Button
            fullWidth
            variant="contained"
            disabled={isLoading || (amount ?? 0) <= 0 || !cashAvailable}
            onClick={callMakePayment}
            sx={{ mt: 2 }}
          >
            {cashAvailable
              ? `Pay ${currencyString(amount ?? 0)} with Cash`
              : "Cash unavailble at this time"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PayWithCash;

import React, { useState } from "react";
import { useMakePaymentMutation } from "services/paymentsSlice";
import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import AddDirectBillPay from "../AddDirectBillPay/AddDirectBillPay";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { PaymentTotalsData } from "../PaymentTotals/PaymentTotals";
import { PayByPaymentSettings } from "types/payments";
import { PaymentCaptureTypeEnum } from "constants/payments";
import { currencyString } from "utils/helperFunctions/numbers";
import { CompletionInformation } from "../StripePayment/StripePayment";
import { DirectBillPayButtonProps, PaymentParent } from "types/ui/payments";
import { numberToTwoDecimals } from "utils/dataFormats";
import {
  descriptionFromSettings,
  paymentApiIdFromParent,
} from "utils/payments";

interface DirectBillAttachAndPayProps {
  totalsData: PaymentTotalsData;
  reservationId: number;
  hideCancel?: boolean;
  onCancel?: () => void;
  onContinueClick?: (refreshData?: boolean) => void;
  paySettings?: PayByPaymentSettings;
  completeSettings?: CompletionInformation;
  attachOnly?: boolean;
  attachOnlySuccessLabel?: string;
  payButtonProps?: DirectBillPayButtonProps;
  manageDescription?: boolean;
  descriptionRequired?: boolean;
  onDescriptionChange?: (description?: string) => void;
  parent?: PaymentParent;
}

const DirectBillAttachAndPay: React.FC<DirectBillAttachAndPayProps> = ({
  attachOnly,
  onCancel,
  totalsData,
  hideCancel,
  reservationId,
  paySettings,
  completeSettings,
  onContinueClick,
  onDescriptionChange,
  manageDescription,
  descriptionRequired,
  attachOnlySuccessLabel,
  payButtonProps,
  parent,
}) => {
  const [createdMethod, setCreatedMethod] =
    useState<IPaymentMethodResponse | null>(null);
  const [view, setView] = useState<"ADD" | "PAY">("ADD");
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [makePayment] = useMakePaymentMutation();

  function handleMethodCreation(newMethod: IPaymentMethodResponse) {
    if (newMethod.id) {
      setCreatedMethod(newMethod);
    }
  }

  function handleContinue() {
    const needRefresh = !!successMessage;
    setErrorMsg("");
    setSuccessMessage("");
    setCreatedMethod(null);
    onContinueClick?.(needRefresh);
  }

  function handleSuccessClick() {
    if (attachOnly) {
      handleContinue();
      return;
    }
    setView("PAY");
  }

  function handleDescriptionChange(evt: any) {
    onDescriptionChange?.(evt.target.value.toString());
  }

  async function handlePayClick() {
    setPaymentLoading(true);
    const fullDescription = descriptionFromSettings(paySettings);
    let makePaymentBody = {
      amount: numberToTwoDecimals(totalsData?.balance ?? -1),
      reservation_id:
        reservationId && reservationId > 0 ? reservationId : undefined,
      payment_method_id: createdMethod?.id,
      description: fullDescription,
      // TODO revisit if we should default to immediate or not
      capture_type:
        paySettings?.capture_type ?? PaymentCaptureTypeEnum.IMMEDIATE,
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
      setErrorMsg(
        `Error making payment: ${response.error.toString() ?? ""} Please try again.`
      );
      setPaymentLoading(false);
    } else if (response.data) {
      setPaymentLoading(false);
      const amount = response.data.amount;
      const messageString = amount
        ? `Payment for $${amount} successfully made!`
        : "Payment successful!";
      const msg = `${messageString} ${completeSettings?.message ?? "Click below to close."}`;
      setSuccessMessage(msg);
    }
  }

  function handleCancelClick() {
    setView("ADD");
    setCreatedMethod(null);
    if (payButtonProps?.actions?.cancel) {
      payButtonProps?.actions?.cancel();
      return;
    }
    onCancel?.();
  }
  const noReservation = reservationId < 0;
  return (
    <Box>
      {view === "ADD" && (
        <AddDirectBillPay
          onMethodCreateSuccess={handleMethodCreation}
          onPaymentSuccessClick={handleSuccessClick}
          reservationId={reservationId}
          onSuccessLabel={
            attachOnly
              ? (attachOnlySuccessLabel ?? "Continue")
              : "Continue to Payment"
          }
          paymentLabel={attachOnly ? "" : "Attach Direct Billing Account"}
          paymentDisabled={noReservation}
          parent={parent}
        />
      )}
      {view === "PAY" && (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography
            variant="h5"
            p={3}
            pt={0}
            textAlign="center"
            fontSize="1.25rem"
          >{`Complete payment of ${currencyString(totalsData.balance)} with ${createdMethod?.direct_billing_account_name ?? "the newly attached"} account?`}</Typography>
          {manageDescription && (
            <TextField
              fullWidth
              label="Description"
              required={descriptionRequired}
              placeholder={`${descriptionRequired ? "REQUIRED -" : ""} Add any notes or a description to the payment`}
              onChange={handleDescriptionChange}
              value={paySettings?.description ?? ""}
              sx={{ mb: 3 }}
            />
          )}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          {!successMessage && (
            <Grid
              container
              sx={(theme) => ({
                [theme.breakpoints.only("xs")]: {
                  flexDirection: "column-reverse",
                },
              })}
            >
              {!hideCancel && (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={(theme) => ({
                    [theme.breakpoints.only("xs")]: {
                      textAlign: "center",
                      mt: 2,
                    },
                    [theme.breakpoints.up("sm")]: {
                      textAlign: "right",
                      pr: 8,
                    },
                  })}
                >
                  <Button
                    onClick={handleCancelClick}
                    color="secondary"
                    variant="outlined"
                  >
                    {payButtonProps?.buttonLabels?.cancel ?? "Cancel"}
                  </Button>
                </Grid>
              )}
              <Grid
                item
                xs={12}
                sm={hideCancel ? 12 : 6}
                textAlign={hideCancel ? "center" : "unset"}
                sx={(theme) => ({
                  [theme.breakpoints.only("xs")]: {
                    textAlign: "center",
                  },
                })}
              >
                <Button
                  onClick={handlePayClick}
                  disabled={paymentLoading || noReservation}
                  variant="contained"
                  color="secondary"
                >
                  {payButtonProps?.buttonLabels?.action ?? "Complete Payment"}
                </Button>
              </Grid>
            </Grid>
          )}
          {successMessage && (
            <Box textAlign="center">
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
              <Button onClick={handleContinue} variant="outlined">
                {completeSettings?.buttonLabel ?? "Continue"}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DirectBillAttachAndPay;

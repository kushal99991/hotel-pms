import React, { useState, useCallback, useEffect } from "react";
import {
  Divider,
  Box,
  ButtonGroup,
  Button,
  Fade,
  Alert,
  SxProps,
  Typography,
} from "@mui/material";
import { StripeError } from "@stripe/stripe-js";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CreditCardOffIcon from "@mui/icons-material/CreditCardOff";
import PaymentTotals, {
  PaymentTotalsData,
} from "../PaymentTotals/PaymentTotals";
import PayWithCash from "../PayWithCash/PayWithCash";
import {
  useStripeTerminal,
  TprocessPaymentResult,
  TterminalResponse,
  cardReaderStatus,
} from "hooks/useStripeCardReader";
import StripeWrapper from "components/stripe/StripeWrapper";
import StripeCardForm from "components/stripe/StripeCardForm";
import { SimpleIntent } from "types/payments";
import { StripeIntentEnum } from "constants/payments";
import DirectBillAttachAndPay from "../DirectBillAttachAndPay/DirectBillAttachAndPay";
import { PayByPaymentSettings } from "types/payments";
import { DirectBillPayButtonProps, PaymentParent } from "types/ui/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";

type PayOption = "Cash" | "Card" | "DirectBill";
export interface CompletionInformation {
  message: string;
  buttonLabel: string;
}

interface PaymentFormProps {
  stripeIntent: SimpleIntent;
  folioId?: number;
  totalsData: PaymentTotalsData;
  orientation?: "horizontal" | "vertical";
  paymentOption?: PayOption;
  paymentDisabled?: boolean;
  forceLoadingWait?: number;
  onCompleteClick?: () => void;
  onPaymentSuccess?: () => void;
  completeInformation?: CompletionInformation;
  boxSx?: SxProps;
  hideTotals?: boolean;
  cardOnly?: boolean;
  allowDirectBill?: boolean;
  onCancelClick?: () => void;
  cashMethod?: IPaymentMethodResponse;
  onInitializeError?: (event: {
    elementType: "payment";
    error: StripeError;
  }) => any;
  parent?: PaymentParent;
  // pass through to direct bill
  paySettings?: PayByPaymentSettings;
  reservationId?: number;
  directBillPayButtonProps?: DirectBillPayButtonProps;
  hideDirectBillCancel?: boolean;
}

const StripePayment: React.FC<PaymentFormProps> = ({
  cardOnly,
  allowDirectBill,
  directBillPayButtonProps,
  hideDirectBillCancel,
  stripeIntent,
  totalsData,
  orientation,
  paymentDisabled,
  forceLoadingWait,
  onCompleteClick,
  onPaymentSuccess,
  onInitializeError,
  completeInformation,
  boxSx,
  onCancelClick,
  hideTotals,
  paySettings,
  reservationId,
  cashMethod,
  folioId,
  parent,
}) => {
  const [terminalConnected, setTerminalConnected] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [readerStatus, setReaderStatus] = useState<string>("");
  const [readerError, setReaderError] = useState<string>("");
  const [showError, setShowError] = useState(false);
  const [terminalPaymentComplete, setTerminalPaymentComplete] = useState(false);
  const [currentOption, setCurrentOption] = useState<PayOption>("Card");
  const displayOrientation = orientation ?? "vertical";
  const { terminal, connectionStatus, connectToReader } = useStripeTerminal();
  const intent = stripeIntent ?? { client_secret: "", amount: 0 };
  const intentType = intent.object ?? StripeIntentEnum.PAYMENT;
  const handleOptionChange = (option: PayOption) => {
    return () => {
      if (currentOption === "Card") {
        connectTerminal();
      }
      setCurrentOption(option);
    };
  };

  async function connectTerminal() {
    setReaderError("");
    setShowError(false);
    // check if the terminal is initialized
    if (!terminal) {
      setReaderError("Terminal is not initialized.");
      return;
    }

    //connect to the card reader terminal
    setReaderStatus("Connecting to reader...");
    const readerErr = await connectToReader(terminal);
    setReaderStatus("");
    if (readerErr) {
      setReaderError(readerErr);
      setShowError(true);
    } else {
      setTerminalConnected(true);
    }
  }

  useEffect(() => {
    if (!terminal || readerError) {
      return;
    }
    const connect = async () => {
      await connectTerminal();
    };
    if (
      currentOption === "Card" &&
      connectionStatus !== cardReaderStatus.PRG &&
      connectionStatus !== cardReaderStatus.RDY
    ) {
      connect();
    }
  }, [connectionStatus, currentOption, readerError, terminal]);

  const handleTerminalPayment = useCallback(async () => {
    if (!terminal && paymentDisabled) {
      return;
    }
    setShowStripeForm(false);
    // Use Stripe Terminal SDK to process the payment
    // Note: the below payment intent client_secret is expired you will have to check the
    // new reservation response object to get the client_secret value and try it here.
    const intentClientId = stripeIntent?.client_secret ?? "";
    let methodResult;
    if (intentType === StripeIntentEnum.PAYMENT) {
      methodResult = (await terminal?.collectPaymentMethod(
        intentClientId
      )) as TterminalResponse;
    } else if (intentType === StripeIntentEnum.SETUP) {
      methodResult = (await terminal?.collectSetupIntentPaymentMethod(
        intentClientId,
        true
      )) as TterminalResponse;
    }

    if (!methodResult || methodResult?.error) {
      setReaderStatus(
        `Failed to collect payment method: ${methodResult?.error?.message ?? "No response from terminal"}`
      );
      return;
    }

    // Process the payment
    let processPaymentResult;
    if (intentType === StripeIntentEnum.PAYMENT) {
      processPaymentResult = (await terminal?.processPayment(
        methodResult.paymentIntent
      )) as TprocessPaymentResult;
    } else if (intentType === StripeIntentEnum.SETUP) {
      processPaymentResult = (await terminal?.confirmSetupIntent(
        methodResult.setupIntent
      )) as TprocessPaymentResult;
    }

    // handle the response success or failure
    if (processPaymentResult?.error) {
      setReaderStatus(`Payment failed: ${processPaymentResult.error.message}`);
    } else if (
      processPaymentResult?.paymentIntent ||
      processPaymentResult?.setupIntent
    ) {
      setTerminalPaymentComplete(true);
      onPaymentSuccess?.();
    }
  }, [terminal, connectionStatus, paymentDisabled]);

  function handleManualClick() {
    if (!stripeIntent?.client_secret) {
      console.error(
        "An invalid client secret was provided, cannot initialize payment form"
      );
      return;
    }
    setShowStripeForm(true);
  }
  function handleCloseError() {
    setShowError(false);
  }
  function getSuccessMessage(completedMessage: string) {
    if (intentType === StripeIntentEnum.PAYMENT) {
      return `Payment successfully charged. ${completedMessage}`;
    } else if (intentType === StripeIntentEnum.SETUP) {
      return `Payment information successfully collected. ${completedMessage}`;
    }
    return `Payment successful! ${completedMessage}`;
  }
  const completeButtonLabel = completeInformation?.buttonLabel ?? "Continue";
  const completeMessage =
    completeInformation?.message ?? "Click below to continue";
  return (
    <Box p={3} border={1} borderColor="grey.300" sx={boxSx}>
      {!hideTotals && <PaymentTotals data={totalsData} />}
      {displayOrientation === "vertical" && !hideTotals && (
        <Divider sx={{ my: 2 }} />
      )}
      <Box
        display="flex"
        justifyContent="space-between"
        mb={currentOption === "Card" ? 2 : 0}
      >
        <ButtonGroup
          variant="contained"
          aria-label="Basic button group"
          fullWidth
        >
          <Button
            variant={currentOption === "Card" ? "contained" : "outlined"}
            onClick={handleOptionChange("Card")}
          >
            Card
          </Button>
          {!cardOnly && (
            <Button
              variant={currentOption === "Cash" ? "contained" : "outlined"}
              onClick={handleOptionChange("Cash")}
            >
              Cash
            </Button>
          )}
          {allowDirectBill && (
            <Button
              variant={
                currentOption === "DirectBill" ? "contained" : "outlined"
              }
              onClick={handleOptionChange("DirectBill")}
            >
              Direct Bill
            </Button>
          )}
        </ButtonGroup>
      </Box>

      {currentOption === "DirectBill" && (
        <Box mt={2}>
          <DirectBillAttachAndPay
            totalsData={totalsData}
            onCancel={onCancelClick}
            reservationId={reservationId ?? -1}
            paySettings={paySettings}
            completeSettings={completeInformation}
            onContinueClick={onCompleteClick}
            payButtonProps={directBillPayButtonProps}
            hideCancel={hideDirectBillCancel}
            parent={parent}
          />
        </Box>
      )}

      {currentOption === "Cash" && (
        <Box mt={3} textAlign="center">
          <PayWithCash
            amount={totalsData.balance}
            onPaymentComplete={onCompleteClick}
            onPaymentSuccess={onPaymentSuccess}
            completeSettings={completeInformation}
            currentFolioId={folioId}
            paySettings={paySettings}
            cashMethod={cashMethod}
            reservationId={reservationId}
          />
        </Box>
      )}

      {currentOption === "Card" && (
        <Box mt={2}>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ width: "100%" }}
          >
            {connectionStatus === cardReaderStatus.RDY && (
              <CreditCardIcon style={{ color: "green" }} />
            )}
            {connectionStatus != cardReaderStatus.RDY && (
              <CreditCardOffIcon style={{ color: "red" }} />
            )}
            <Typography component="p">
              Card Reader:{" "}
              {connectionStatus === cardReaderStatus.RDY
                ? "Connected"
                : "Not Connected"}
            </Typography>
          </Box>
          {!showError && readerError && (
            <Typography
              sx={{
                cursor: "pointer",
                textTransform: "none",
                textDecoration: "underline",
                color: "secondary.main",
                pl: 4,
                "&:hover": {
                  color: "secondary.lighter",
                },
              }}
              onClick={connectTerminal}
            >
              Retry
            </Typography>
          )}
          {!!readerStatus.length && <span>{readerStatus}</span>}
          <Fade in={showError}>
            {showError ? (
              <Box>
                <Alert
                  severity="error"
                  onClose={handleCloseError}
                  sx={{ mt: 2 }}
                >
                  <div>{readerError}</div>
                  <Box display="flex" justifyContent="center">
                    <Button
                      variant="outlined"
                      onClick={connectTerminal}
                      sx={{ mt: 2 }}
                    >
                      Retry
                    </Button>
                  </Box>
                </Alert>
              </Box>
            ) : (
              <div />
            )}
          </Fade>
          <Fade in={terminalPaymentComplete}>
            {terminalPaymentComplete ? (
              <Box>
                <Alert severity="success" sx={{ mt: 2 }}>
                  <div>{getSuccessMessage(completeMessage)}</div>
                </Alert>
                <Box display="flex" justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={onCompleteClick}
                    sx={{ mt: 2 }}
                  >
                    {completeButtonLabel}
                  </Button>
                </Box>
              </Box>
            ) : (
              <div />
            )}
          </Fade>
          {!terminalPaymentComplete && (
            <>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  onClick={handleTerminalPayment}
                  variant="contained"
                  color="primary"
                  disabled={!terminalConnected || paymentDisabled}
                  sx={{ margin: "auto" }}
                >
                  {intentType === StripeIntentEnum.SETUP
                    ? "Collect card info from terminal"
                    : "Charge to terminal"}
                </Button>
              </Box>
              <Box mt={2} textAlign="center">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleManualClick}
                  disabled={paymentDisabled}
                >
                  {intentType === StripeIntentEnum.SETUP
                    ? "Collect card info manually"
                    : "Charge manually"}
                </Button>
                {showStripeForm && (
                  <StripeWrapper
                    intentClientSecret={intent.client_secret ?? ""}
                  >
                    <StripeCardForm
                      intentType={intentType as StripeIntentEnum}
                      amount={intent.amount}
                      returnUrl={`${window.location.origin}/booking-engine/dashboard`}
                      formatAmount={(amount) => `${(amount / 100).toFixed(2)}`}
                      forceLoadingWait={forceLoadingWait}
                      buttonTextWhenComplete={completeButtonLabel}
                      onCompleteClick={onCompleteClick}
                      onPaymentSuccess={onPaymentSuccess}
                      onInitializeError={onInitializeError}
                    />
                  </StripeWrapper>
                )}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StripePayment;

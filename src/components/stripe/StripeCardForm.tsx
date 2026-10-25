import React, { useState, FormEvent } from "react";
import { Button, Alert } from "@mui/material";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { StripeError } from "@stripe/stripe-js";
import { StripeIntentEnum } from "constants/payments";
import { wait } from "utils/common";

export interface StripeCardFormProps {
  amount: number;
  returnUrl: string;
  formatAmount?: (amount: number) => string;
  forceLoadingWait?: number;
  onCompleteClick?: () => void;
  buttonTextWhenComplete?: string;
  intentType: StripeIntentEnum;
  onPaymentSuccess?: () => void;
  onInitializeError?: (event: {
    elementType: "payment";
    error: StripeError;
  }) => any;
}

const StripeCardForm: React.FC<StripeCardFormProps> = ({
  amount,
  formatAmount,
  forceLoadingWait,
  returnUrl,
  onCompleteClick,
  onPaymentSuccess,
  onInitializeError,
  buttonTextWhenComplete,
  intentType,
}) => {
  const elements = useElements();
  const stripe = useStripe();
  const [error, setError] = useState<StripeError | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setError(null);
    if (!stripe || !elements) {
      return;
    }
    setLoading(true);
    let result;
    if (intentType === StripeIntentEnum.PAYMENT) {
      result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });
    } else if (intentType === StripeIntentEnum.SETUP) {
      result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });
    }
    if (result?.error) {
      setError(result.error);
    } else if (result) {
      if (forceLoadingWait && forceLoadingWait > 0) {
        await wait(forceLoadingWait);
      }
      setPaymentComplete(true);
      onPaymentSuccess?.();
    }
    setLoading(false);
  }

  function getAmount() {
    if (formatAmount) {
      return formatAmount(amount);
    }
    return amount;
  }

  function buttonText() {
    if (loading) {
      return "Processing payment...";
    }
    if (paymentComplete) {
      return buttonTextWhenComplete ?? "Continue";
    }
    if (intentType === StripeIntentEnum.SETUP) {
      return "Collect Card Information";
    }
    return `Charge $${getAmount()}`;
  }

  function genSuccessMessage() {
    if (intentType === StripeIntentEnum.SETUP) {
      return "Credit card information successfully saved";
    }
    return "Payment successfully charged, click below to continue";
  }

  function handleCompleteClick() {
    onCompleteClick?.();
  }
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement onLoadError={onInitializeError} />
      {!!error && (
        <Alert severity="error">
          {`There was an error processing the payment: ${error.message}`}
          {!!error.doc_url && (
            <a href={error.doc_url} target="_blank" rel="noreferrer">
              Click here to learn more.
            </a>
          )}
          <div>Please check values and try again.</div>
        </Alert>
      )}
      {paymentComplete && (
        <Alert severity="success">{genSuccessMessage()}</Alert>
      )}
      <Button
        fullWidth
        type={paymentComplete ? "button" : "submit"}
        onClick={paymentComplete ? handleCompleteClick : undefined}
        variant={paymentComplete ? "outlined" : "contained"}
        color="primary"
        disabled={!stripe || !elements || loading}
        sx={{ mt: 2 }}
      >
        {buttonText()}
      </Button>
    </form>
  );
};

export default StripeCardForm;

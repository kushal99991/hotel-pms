import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertColor,
  Box,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { CreditCard, RequestQuote, ArrowBack } from "@mui/icons-material";
import { PaymentTotalsData } from "../PaymentTotals/PaymentTotals";
import StripePayment, {
  CompletionInformation,
} from "../StripePayment/StripePayment";
import MethodTypeListItem from "../MethodTypeListItem/MethodTypeListItem";
import { SimpleIntent } from "types/payments";
import { IReservationResponse } from "types/reservationTypes";
import { useCreatePaymentAndPaymentMethodMutation } from "services/paymentsSlice";
import { StripeIntentEnum, defaultIntent } from "constants/payments";
import { PayByPaymentSettings } from "types/payments";
import { LCColors } from "theme/Colors";
import DirectBillAttachAndPay from "../DirectBillAttachAndPay/DirectBillAttachAndPay";
import { PayWithNewMethodViews } from "constants/paymentMethods";
import {
  descriptionFromSettings,
  paymentApiIdFromParent,
} from "utils/payments";
import { NewPaymentOption, PaymentParent } from "types/ui/payments";
import { NewPaymentOptions } from "constants/payments";

interface PayWithNewMethodProps {
  onBackClick?: () => void;
  noHeader?: boolean;
  allowDirectBill?: boolean;
  reservation?: IReservationResponse;
  paySettings: PayByPaymentSettings;
  newIntentNeeded?: () => boolean;
  availableMethodsFilter?: (methodOption: any[]) => any[];
  forceLoadingWait?: number;
  hideTotals?: boolean;
  onCompleteClick?: () => void;
  currentFolioId?: number;
  selectedView?: PayWithNewMethodViews;
  parent?: PaymentParent;
  // pass-through props to StripePayment
  paymentDisabled?: boolean;
  totalsData: PaymentTotalsData;
  onPaymentSuccess?: () => void;
  onStripePaymentComplete?: () => any;
  cardOnly?: boolean;
  completeInformation?: CompletionInformation;
  existingIntent?: SimpleIntent;
  // pass through to direct bill
  onDirectBillCancel?: () => void;
  manageDescription?: boolean;
  descriptionRequired?: boolean;
  onDescriptionChange?: (description?: string) => void;
}

const PayWithNewMethod: React.FC<PayWithNewMethodProps> = ({
  allowDirectBill,
  onBackClick,
  noHeader,
  cardOnly,
  totalsData,
  currentFolioId,
  onCompleteClick,
  onPaymentSuccess,
  onStripePaymentComplete,
  newIntentNeeded,
  availableMethodsFilter,
  forceLoadingWait,
  completeInformation,
  reservation,
  paySettings,
  hideTotals,
  existingIntent,
  onDirectBillCancel,
  selectedView,
  manageDescription,
  descriptionRequired,
  onDescriptionChange,
  parent,
}) => {
  const [currentMethod, setCurrentMethod] = useState<string>(
    allowDirectBill
      ? PayWithNewMethodViews.SELECTOR
      : PayWithNewMethodViews.CARD
  );
  const [stripeIntent, setStripeIntent] = useState<SimpleIntent | undefined>();
  const [alertData, setAlertData] = useState<{
    type: AlertColor;
    message: string;
    visible: boolean;
  }>({
    type: "success",
    message: "Getting ready to make a payment",
    visible: false,
  });
  const [
    createPaymentIntent,
    { isLoading, data: createData, error: createIntentError },
  ] = useCreatePaymentAndPaymentMethodMutation();

  useEffect(() => {
    if (selectedView && selectedView !== currentMethod) {
      setCurrentMethod(selectedView);
    }
  }, [selectedView]);

  async function createIntent() {
    setAlertData({
      type: "success",
      message: "Getting ready to make a payment",
      visible: true,
    });
    const targetFolioFromSettings = reservation?.folios?.find(
      (f) => f.type === paySettings.folio_type
    );
    const targetId = targetFolioFromSettings?.id ?? -1;
    const fullDescription = descriptionFromSettings(paySettings);
    let createIntentBody = {
      reservation_id: reservation?.id ?? undefined,
      capture_type: paySettings.capture_type,
      amount: totalsData.balance ?? 0,
      description: fullDescription,
      future_usage: paySettings.future_usage ?? false,
      folio_id: currentFolioId ?? targetId,
      folio_primary_method: paySettings?.make_primary_method ?? false,
    };
    if (parent) {
      const idBody = paymentApiIdFromParent(parent);
      createIntentBody = {
        ...createIntentBody,
        ...idBody,
      };
    }
    const response = await createPaymentIntent(createIntentBody);
    if (response.error) {
      setAlertData({
        type: "error",
        message: `An error occured in preparing to make the payment: "${response.error}" Please refresh the page and try again`,
        visible: true,
      });
    } else if (response.data) {
      const paymentResponse = response.data.pp_response;
      setStripeIntent({
        client_secret: paymentResponse?.client_secret ?? "",
        amount: paymentResponse?.amount ?? 0,
        object: paymentResponse?.object ?? StripeIntentEnum.PAYMENT,
      });
      setAlertData({ ...alertData, visible: false });
    }
  }

  useEffect(() => {
    const showStripe = currentMethod === PayWithNewMethodViews.CARD;
    if (createIntentError) {
      return;
    }
    if (!reservation || !showStripe || !parent?.id) {
      return;
    }
    if (existingIntent && existingIntent.client_secret) {
      return;
    }
    let needsNewIntent = !createData && !isLoading;
    if (newIntentNeeded) {
      needsNewIntent = newIntentNeeded();
    }
    if (needsNewIntent) {
      if (!createData && !isLoading) {
        createIntent();
      }
    }
  }, [
    reservation,
    newIntentNeeded,
    createData,
    currentMethod,
    isLoading,
    createIntentError,
    existingIntent,
    parent?.id,
  ]);

  function handleCreditClick() {
    setCurrentMethod(PayWithNewMethodViews.CARD);
  }

  function handleDBClick() {
    setCurrentMethod(PayWithNewMethodViews.DIRECT_BILL);
  }

  function makePaymentOptions() {
    let baseOptions: NewPaymentOption[] = [
      {
        type: NewPaymentOptions.CARD,
        label: "Pay with new Card",
        icon: CreditCard,
        iconColor: LCColors.darkBlue,
        onClick: handleCreditClick,
      },
      {
        type: NewPaymentOptions.DIRECT_BILL,
        label: "Add Direct Billing Account",
        icon: RequestQuote,
        iconColor: LCColors.darkRed,
        onClick: handleDBClick,
      },
    ];
    if (availableMethodsFilter) {
      baseOptions = availableMethodsFilter(baseOptions);
    }
    return baseOptions;
  }

  const intent =
    existingIntent && existingIntent.client_secret
      ? existingIntent
      : stripeIntent || defaultIntent;
  const paymentDisabled = !intent;
  const options = makePaymentOptions();
  return (
    <Box>
      {!noHeader && currentMethod === PayWithNewMethodViews.SELECTOR && (
        <Grid container alignItems="center">
          {onBackClick && (
            <Grid item>
              <IconButton aria-label="back" onClick={onBackClick}>
                <ArrowBack />
              </IconButton>
            </Grid>
          )}
          <Grid item>New Payment Method</Grid>
        </Grid>
      )}
      {alertData.visible && (
        <Alert severity={alertData.type} sx={{ mb: 2 }}>
          {alertData.message}
        </Alert>
      )}
      {currentMethod === PayWithNewMethodViews.SELECTOR && (
        <Box display="flex" flexDirection="column" mt={1}>
          {manageDescription && (
            <Box>
              <Typography
                fontSize="0.875rem"
                sx={{ color: "text.secondary", mb: 2 }}
              >
                Before choosing a new method, make any changes you need to the
                description or leave blank if no description is needed.
              </Typography>
              <TextField
                fullWidth
                label="Description"
                required={descriptionRequired}
                placeholder={`${descriptionRequired ? "REQUIRED -" : ""} Add any notes or a description to the payment`}
                onChange={(evt) => {
                  onDescriptionChange?.(evt.target.value);
                }}
                value={paySettings?.description ?? ""}
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          {options.map((opt: NewPaymentOption) => {
            return (
              <MethodTypeListItem
                key={opt.type}
                onClick={opt.onClick}
                icon={opt.icon}
                text={opt.label}
                iconColor={opt.iconColor}
              />
            );
          })}
        </Box>
      )}
      {currentMethod === PayWithNewMethodViews.CARD && (
        <StripePayment
          cardOnly={cardOnly}
          stripeIntent={intent}
          totalsData={totalsData}
          paymentDisabled={paymentDisabled}
          onCompleteClick={onStripePaymentComplete ?? onCompleteClick}
          onPaymentSuccess={onPaymentSuccess}
          completeInformation={completeInformation}
          forceLoadingWait={forceLoadingWait}
          hideTotals={hideTotals}
          paySettings={paySettings}
          parent={parent}
        />
      )}
      {currentMethod === PayWithNewMethodViews.DIRECT_BILL && (
        <DirectBillAttachAndPay
          totalsData={totalsData}
          onCancel={onDirectBillCancel}
          reservationId={reservation?.id ?? -1}
          paySettings={paySettings}
          onContinueClick={onCompleteClick}
          manageDescription={manageDescription}
          descriptionRequired={descriptionRequired}
          onDescriptionChange={onDescriptionChange}
          parent={parent}
        />
      )}
    </Box>
  );
};

export default PayWithNewMethod;

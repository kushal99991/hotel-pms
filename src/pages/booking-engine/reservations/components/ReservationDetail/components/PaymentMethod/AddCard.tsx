import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  AlertColor,
} from "@mui/material";
import { StripeError } from "@stripe/stripe-js";
import { ArrowBack } from "@mui/icons-material";
import {
  IPaymentMethodResponse,
  IReservationResponse,
} from "types/reservationTypes";
import {
  getFirstInvalidMethod,
  paymentApiIdFromParent,
  paymentMethodNeedsCard,
} from "utils/payments";
import { useCreatePaymentMethodMutation } from "services/paymentsSlice";
import StripePayment from "components/ui/StripePayment/StripePayment";
import { CreateMethodBody, ISimpleFolio, SimpleIntent } from "types/payments";
import { PaymentMethodType, StripeIntentEnum } from "constants/payments";
import { IFolioResponse } from "types/folios";
import { PaymentParent } from "types/ui/payments";

export interface AddCardProps {
  paymentMethods: IPaymentMethodResponse[];
  reservation?: IReservationResponse | null;
  onBackClick?: () => void;
  onComplete?: () => void;
  onCardAdded?: (addedCard?: IPaymentMethodResponse) => void;
  targetFolio?: IFolioResponse | ISimpleFolio;
  dbAccountId?: number;
  targetReservationId?: number;
  noHeader?: boolean;
  folios?: IFolioResponse[];
  parent?: PaymentParent;
}

const AddCard: React.FC<AddCardProps> = ({
  paymentMethods,
  onBackClick,
  onComplete,
  onCardAdded,
  reservation,
  folios,
  targetFolio,
  targetReservationId,
  dbAccountId,
  noHeader,
  parent,
}) => {
  const [stripeIntent, setStripeIntent] = useState<SimpleIntent | undefined>();
  const [alertData, setAlertData] = useState<{
    type: AlertColor;
    message: string;
    visible: boolean;
  }>({
    type: "success",
    message: "Preparing card creation data",
    visible: false,
  });
  const [createStripeIntent, { isLoading, data: createData }] =
    useCreatePaymentMethodMutation();

  async function createIntent() {
    setAlertData({
      type: "success",
      message: "Preparing card creation data",
      visible: true,
    });
    const allFolios = reservation?.folios
      ? reservation?.folios
      : (folios ?? []);
    let folioToAddTo = allFolios.find((f) => f.type === "A");
    if (targetFolio) {
      folioToAddTo = { ...targetFolio, charges: [], payments: [] };
    }
    let reservationId = reservation?.id;
    if (targetReservationId) {
      reservationId = targetReservationId;
    }
    let body: CreateMethodBody = {};
    if (reservationId) {
      body.reservation_id = reservationId;
    }
    if (folioToAddTo) {
      body.folio_id = folioToAddTo.id;
    }
    if (dbAccountId) {
      body.direct_billing_account_id = dbAccountId;
      body.payment_type = PaymentMethodType.DIRECT_BILLING_ACCOUNT;
    }
    if (parent) {
      const idBodyPart = paymentApiIdFromParent(parent);
      body = {
        ...body,
        ...idBodyPart,
      };
    }
    const response = await createStripeIntent(body);
    if (response.error) {
      setAlertData({
        type: "error",
        message: `An error occured in the card addition process: "${response.error}" Please try again`,
        visible: true,
      });
    } else if (response.data) {
      const paymentResponse = response.data.pp_response;
      setStripeIntent({
        client_secret: paymentResponse?.client_secret ?? "",
        amount: paymentResponse?.amount ?? 0,
        object: paymentResponse?.object ?? StripeIntentEnum.SETUP,
      });
      setAlertData({ ...alertData, visible: false });
    }
  }

  useEffect(() => {
    if (paymentMethods) {
      const firstInvalidMethod = getFirstInvalidMethod(paymentMethods);
      if (firstInvalidMethod) {
        const firstInvalidNeedsMethod =
          paymentMethodNeedsCard(firstInvalidMethod);
        if (firstInvalidNeedsMethod && !stripeIntent) {
          setStripeIntent({
            client_secret: firstInvalidMethod.pp_response?.client_secret ?? "",
            amount: 0,
            object:
              firstInvalidMethod.pp_response?.object ?? StripeIntentEnum.SETUP,
          });
          setAlertData({ ...alertData, visible: false });
        }
        return;
      }
      if (
        !firstInvalidMethod &&
        !createData &&
        !isLoading &&
        !(alertData.type === "error")
      ) {
        createIntent();
      }
    }
  }, [paymentMethods, createData, isLoading, alertData]);

  function handleAddSuccess() {
    onCardAdded?.(createData);
  }

  function handleInitalizeStripeError(event: {
    elementType: "payment";
    error: StripeError;
  }) {
    setAlertData({
      type: "error",
      message:
        event?.error?.message ??
        "There was an error setting up the card form. Refresh to try again.",
      visible: true,
    });
  }

  function handleTryAgain() {
    setAlertData({
      type: "success",
      message: "Preparing card creation data",
      visible: false,
    });
  }
  const disablePayment = isLoading || !stripeIntent?.client_secret;
  return (
    <Box>
      {!noHeader && (
        <Grid container alignItems="center">
          {onBackClick && (
            <Grid item>
              <IconButton aria-label="back" onClick={onBackClick}>
                <ArrowBack />
              </IconButton>
            </Grid>
          )}
          <Grid item>Add a card</Grid>
        </Grid>
      )}
      {alertData.visible && (
        <Alert severity={alertData.type} sx={{ mb: 2 }}>
          {alertData.message}
          {alertData.type === "error" && (
            // width of icon area in alert is 22px
            // padding right of container is 16px
            // combined is padding to center button on whole alert
            <Box textAlign="center" pr="38px">
              <Button
                variant="outlined"
                size="small"
                onClick={handleTryAgain}
                sx={{
                  mt: 2,
                }}
              >
                Try Again
              </Button>
            </Box>
          )}
        </Alert>
      )}
      <StripePayment
        cardOnly
        stripeIntent={
          stripeIntent ?? {
            client_secret: "",
            amount: 0,
            object: StripeIntentEnum.SETUP,
          }
        }
        paymentDisabled={disablePayment}
        totalsData={{ balance: 0 }}
        onCompleteClick={onComplete}
        onPaymentSuccess={handleAddSuccess}
        onInitializeError={handleInitalizeStripeError}
        hideTotals
      />
    </Box>
  );
};

export default AddCard;

import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Backdrop,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import PaymentTotals, {
  PaymentTotalsData,
} from "../PaymentTotals/PaymentTotals";
import { IFolioResponse } from "types/folios";
import { useMakePaymentMutation } from "services/paymentsSlice";
import { PaymentCaptureTypeEnum } from "constants/payments";
import {
  descriptionFromSettings,
  isValidMethod,
  paymentApiIdFromParent,
  primaryMethodsFromFolios,
} from "utils/payments";
import CardListItem from "../CardListItem/CardListItem";
import NoMethodOptions from "./NoMethodOptions/NoMethodOptions";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { IMakePaymentBody, PayByPaymentSettings } from "types/payments";
import { FolioTypes } from "constants/folios";
import { wait } from "utils/common";
import { CompletionInformation } from "../StripePayment/StripePayment";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { hasUserAddedMethods, isCheckType } from "utils/paymentMethods";
import { PaymentParent } from "types/ui/payments";

export interface IPayWithNewSettings {
  disabled?: boolean;
  message?: string;
}

interface PayWithMethodProps {
  descriptionRequired?: boolean;
  manageDescription?: boolean;
  totals?: PaymentTotalsData;
  hideTotals?: boolean;
  folios?: IFolioResponse[];
  paymentMethods?: IPaymentMethodResponse[];
  paySettings?: PayByPaymentSettings;
  payWithNewSettings?: IPayWithNewSettings;
  currentFolioId?: number;
  currentPaymentId?: number;
  reservationId: number;
  onPayWithNew?: (description?: string) => void;
  onClose?: (refreshData?: boolean) => void;
  onPaymentComplete?: () => void;
  onPaymentSuccess?: () => void;
  onPayWithNewCard?: () => void;
  onDescriptionChange?: (description?: string) => void;
  forceLoadingWait?: number;
  completeSettings?: CompletionInformation;
  hidePrimaryMessage?: boolean;
  parent?: PaymentParent;
}

const PayWithMethod: React.FC<PayWithMethodProps> = ({
  descriptionRequired,
  totals,
  folios,
  onPayWithNew,
  onPaymentComplete,
  onPayWithNewCard,
  onDescriptionChange,
  currentFolioId,
  currentPaymentId,
  forceLoadingWait,
  onClose,
  onPaymentSuccess,
  paymentMethods,
  paySettings,
  payWithNewSettings,
  completeSettings,
  reservationId,
  hideTotals,
  manageDescription,
  hidePrimaryMessage,
  parent,
}) => {
  const [showCardList, setShowCardList] = useState(false);
  const [loading, setLoading] = useState(false);
  const folioA = folios?.find((f) => f.type === FolioTypes.A);
  const reservationPayment =
    folioA?.primary_payment_method && folioA?.primary_payment_method.future_use
      ? folioA.primary_payment_method
      : getFallbackMethod(paymentMethods);
  const currentPaymentFromId = currentPaymentId
    ? paymentMethods?.find((pm) => pm.id === currentPaymentId)
    : undefined;
  const [currentPayment, setCurrentPayment] = useState<
    IPaymentMethodResponse | undefined
  >(currentPaymentFromId ?? reservationPayment);
  const primaryPaymentMap = primaryMethodsFromFolios(folios ?? []);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [makePayment] = useMakePaymentMutation();
  const currentFolio = folios?.find((f) => f.id === currentFolioId);
  const isPrimaryMethod = currentPayment
    ? currentPayment?.id === currentFolio?.primary_payment_method?.id
    : false;

  useEffect(() => {
    if (currentPaymentId && paymentMethods?.length && !currentPayment) {
      const currentPaymentFromId = paymentMethods?.find(
        (pm) => pm.id === currentPaymentId
      );
      if (currentPaymentFromId) {
        setCurrentPayment(currentPaymentFromId);
      }
    }
  }, [currentPaymentId, paymentMethods, currentPayment]);
  async function callMakePayment() {
    if (descriptionRequired && !paySettings?.description) {
      setDescriptionError(
        "You must provide a description before completing the payment"
      );
      return;
    }
    setLoading(true);
    const fullDescription = descriptionFromSettings(paySettings);
    let makePaymentBody: IMakePaymentBody = {
      amount: totals?.balance,
      payment_method_id: currentPayment?.id,
      description: fullDescription,
      capture_type:
        paySettings?.capture_type ?? PaymentCaptureTypeEnum.DEFERRED,
    };
    if (paySettings?.direct_billing_account_id) {
      makePaymentBody.direct_billing_account_id =
        paySettings.direct_billing_account_id;
    } else {
      makePaymentBody.reservation_id =
        reservationId && reservationId > 0 ? reservationId : undefined;
      makePaymentBody.folio_id = currentFolioId ?? folioA?.id;
    }
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
        `Error making payment: ${response.error.toString() ?? ""}`
      );
      setLoading(false);
    } else if (response.data) {
      if (forceLoadingWait && forceLoadingWait > 0) {
        await wait(forceLoadingWait);
      }
      setLoading(false);
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

  function handleDescriptionChange(evt: any) {
    setDescriptionError("");
    onDescriptionChange?.(evt.target.value.toString());
  }

  function getFallbackMethod(methods?: IPaymentMethodResponse[]) {
    const validMethods = methods?.filter((pm) => isValidMethod(pm));
    const hasAddedMethod = hasUserAddedMethods(validMethods);
    if (hasAddedMethod) {
      return methods?.find(
        (pm) =>
          pm.payment_type !== PaymentMethodTypesEnum.CHECK &&
          pm.payment_type !== PaymentMethodTypesEnum.CASH
      );
    }
  }

  function handleClose() {
    const needRefresh = !!successMessage;
    setErrorMessage("");
    setSuccessMessage("");
    onClose?.(needRefresh);
    if (needRefresh) {
      // payment copmleted successfully
      onPaymentComplete?.();
    }
  }

  function handlePaymentChange(paymentMethod: IPaymentMethodResponse) {
    return () => {
      setCurrentPayment(paymentMethod);
      setShowCardList(false);
    };
  }

  function handleDifferentCardClick() {
    setShowCardList(true);
  }

  function handleCloseCardList() {
    setShowCardList(false);
  }

  function genButtonLabel() {
    const stringAmount = (totals?.balance ?? 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    if (currentPayment?.direct_billing_account_id) {
      return `Charge ${stringAmount} to Direct Billing Account`;
    }
    let methodLabel = currentPayment?.brand;
    if (currentPayment?.payment_type === PaymentMethodTypesEnum.CASH) {
      methodLabel = "Cash";
    } else if (isCheckType(currentPayment?.payment_type)) {
      methodLabel = "Check";
    } else if (
      currentPayment?.payment_type === PaymentMethodTypesEnum.ACH_WIRE_TRANSFER
    ) {
      methodLabel = "ACH/Transfer";
    }
    return `Pay ${stringAmount} with ${methodLabel}`;
  }

  function isButtonDisabled() {
    return loading || (totals?.balance ?? 0) <= 0 || !currentPayment;
  }

  function isPayWithNewDisabled() {
    if (payWithNewSettings?.disabled != null) {
      return payWithNewSettings.disabled;
    }
    if (manageDescription && descriptionRequired && !paySettings?.description) {
      return true;
    }
    return payWithNewSettings?.disabled ?? false;
  }

  function payWithNewButtonMsg() {
    const messageFromProps = payWithNewSettings?.message ?? "";
    let descriptionMessage;
    if (manageDescription && descriptionRequired && !paySettings?.description) {
      descriptionMessage =
        "You must provide a payment description before paying with a new method. Go back and add a description.";
    }
    return `${messageFromProps}${descriptionMessage ? ` ${descriptionMessage}` : ""}`;
  }

  function handlePayWithNew() {
    onPayWithNew?.(paySettings?.description);
  }

  const validMethods = paymentMethods?.filter((pm) => isValidMethod(pm));
  const otherMethods = validMethods?.filter(
    (pm) => pm.id !== currentPayment?.id
  );
  const hasAddedMethod = hasUserAddedMethods(validMethods);
  const showDescriptionError =
    descriptionRequired && !paySettings?.description && descriptionError;
  const showAddNewDirect = !hasAddedMethod && !currentPayment;
  return (
    <Box p={3} border={1} borderColor="grey.300">
      <Backdrop
        open={loading}
        sx={{ background: "rgba(0,0,0,0.2)", zIndex: 200 }}
      >
        <CircularProgress size="5rem" color="secondary" />
      </Backdrop>
      <Box>
        {showCardList && (
          <Box>
            <Grid item>
              <IconButton aria-label="back" onClick={handleCloseCardList}>
                <ArrowBack />
              </IconButton>
              Choose a Method to Pay with
            </Grid>
            <Box mt={2}>
              <Box maxHeight={345} sx={{ overflowY: "scroll" }}>
                {(otherMethods ?? []).length < 1 && (
                  <Box textAlign="center" color="grey.700" px={3}>
                    You have no other payment methods available. Click the arrow
                    to go back or click below to pay with a new method.
                  </Box>
                )}
                {otherMethods?.map((pm) => {
                  let actionLabel = "Use this card";
                  if (pm.direct_billing_account_id) {
                    actionLabel = "Use this account";
                  } else if (
                    isCheckType(pm.payment_type) ||
                    pm.payment_type === PaymentMethodTypesEnum.CASH ||
                    pm.payment_type === PaymentMethodTypesEnum.ACH_WIRE_TRANSFER
                  ) {
                    actionLabel = "Use this method";
                  }
                  return (
                    <Grid
                      container
                      key={`paymentMethod-${pm.id}`}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        "&:first-of-type": {
                          borderTop: "1px solid",
                          borderColor: "grey.500",
                        },
                        borderBottom: "1px solid",
                        borderColor: "grey.500",
                      }}
                    >
                      <Grid item>
                        <CardListItem
                          key={pm.id}
                          paymentMethod={pm}
                          primaryPaymentMap={primaryPaymentMap}
                        />
                      </Grid>
                      <Grid item display="flex">
                        <Button
                          onClick={handlePaymentChange(pm)}
                          variant="text"
                          color="secondary"
                        >
                          {actionLabel}
                        </Button>
                      </Grid>
                    </Grid>
                  );
                })}
              </Box>
              <Box textAlign="center" mt={3}>
                <Button
                  onClick={handlePayWithNew}
                  variant="outlined"
                  startIcon={<Add />}
                  disabled={isPayWithNewDisabled()}
                >
                  Pay with a new payment method
                </Button>
                {payWithNewButtonMsg() && (
                  <Typography
                    fontStyle="italic"
                    variant="caption"
                    component="div"
                    sx={{ color: "grey.600", mt: 0.5 }}
                  >
                    {payWithNewButtonMsg()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
        {!showCardList && (
          <>
            {!hideTotals && <PaymentTotals data={totals ?? { balance: 0 }} />}
            {(hasAddedMethod || currentPayment) && (
              <Grid
                container
                justifyContent={currentPayment ? "space-between" : "center"}
              >
                {currentPayment && (
                  <Grid item>
                    <CardListItem
                      paymentMethod={currentPayment}
                      primaryPaymentMap={primaryPaymentMap}
                    />
                  </Grid>
                )}
                <Grid item display="flex">
                  <Button
                    color="secondary"
                    variant="text"
                    onClick={handleDifferentCardClick}
                  >
                    {currentPayment
                      ? "Use a different method"
                      : "Choose a payment method"}
                  </Button>
                </Grid>
              </Grid>
            )}
            {showAddNewDirect && (
              <NoMethodOptions
                validMethods={validMethods}
                onDescriptionChange={handleDescriptionChange}
                descriptionRequired={descriptionRequired}
                description={paySettings?.description}
                handleDifferentCardClick={handleDifferentCardClick}
                onPayWithNewCard={onPayWithNewCard}
                handlePayWithNew={handlePayWithNew}
                manageDescription={manageDescription}
              />
            )}
            {!showAddNewDirect && manageDescription && (
              <TextField
                fullWidth
                label="Description"
                required={descriptionRequired}
                placeholder={`${descriptionRequired ? "REQUIRED -" : ""} Add any notes or a description to the payment`}
                onChange={handleDescriptionChange}
                value={paySettings?.description ?? ""}
                sx={{ mt: 3 }}
              />
            )}
            {!hidePrimaryMessage && currentPaymentId && !isPrimaryMethod && (
              <Typography
                fontStyle="italic"
                fontSize="0.875rem"
                sx={{ color: "warning.light" }}
              >
                {"* This is NOT the primary payment method for this folio."}
              </Typography>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mt: 1, mb: 2 }}>
                {successMessage}{" "}
              </Alert>
            )}
            {errorMessage && (
              <Alert severity="error" sx={{ my: 1 }}>
                {errorMessage}{" "}
              </Alert>
            )}
            {showDescriptionError && (
              <Alert severity="error" sx={{ my: 1 }}>
                {descriptionError}{" "}
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
            {!successMessage && currentPayment && (
              <Button
                fullWidth
                variant="contained"
                disabled={isButtonDisabled()}
                onClick={callMakePayment}
                sx={{ mt: 2 }}
              >
                {genButtonLabel()}
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default PayWithMethod;

import React, { useContext, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Backdrop,
  CircularProgress,
  Grid,
  IconButton,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import PaymentTotals, {
  PaymentTotalsData,
} from "components/ui/PaymentTotals/PaymentTotals";
import { IFolioResponse } from "types/folios";
import { useMakePaymentMutation } from "services/paymentsSlice";
import { PaymentCaptureTypeEnum } from "constants/payments";
import {
  isActiveMethod,
  isValidMethod,
  primaryMethodsFromFolios,
} from "utils/payments";
import CardListItem from "components/ui/CardListItem/CardListItem";
import ReservationDetailsContext from "contexts/ReservationDetailsContext";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { PayByPaymentSettings } from "types/payments";
import { FolioTypes } from "constants/folios";
import { wait } from "utils/common";

interface ResPayWithMethodProps {
  totals?: PaymentTotalsData;
  hideTotals?: boolean;
  folios?: IFolioResponse[];
  paySettings?: PayByPaymentSettings;
  description?: string;
  currentFolioId?: number;
  onPayWithNew?: () => void;
  onClose?: (refreshData?: boolean) => void;
  forceLoadingWait?: number;
}

const ResPayWithMethod: React.FC<ResPayWithMethodProps> = ({
  totals,
  folios,
  onPayWithNew,
  currentFolioId,
  forceLoadingWait,
  onClose,
  description,
  hideTotals,
  paySettings,
}) => {
  const { viewState: detailsState, refreshReservation } = useContext(
    ReservationDetailsContext
  )!;
  const [showCardList, setShowCardList] = useState(false);
  const [loading, setLoading] = useState(false);
  const folioA = folios?.find((f) => f.type === FolioTypes.A);
  const reservationPayment = folioA?.primary_payment_method;
  const [currentPayment, setCurrentPayment] = useState<
    IPaymentMethodResponse | null | undefined
  >(reservationPayment);
  const primaryPaymentMap = primaryMethodsFromFolios(folios ?? []);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [makePayment] = useMakePaymentMutation();
  async function callMakePayment() {
    setLoading(true);
    const response = await makePayment({
      amount: totals?.balance,
      reservation_id: detailsState.reservation?.id,
      payment_method_id: currentPayment?.id,
      folio_id: currentFolioId ?? folioA?.id,
      description: description ?? "",
      capture_type:
        paySettings?.capture_type ?? PaymentCaptureTypeEnum.IMMEDIATE, // TODO revisit if default should be immediate
    });
    if (response.error) {
      setErrorMessage(
        `Error making payment: ${response.error.toString() ?? ""} Please try again.`
      );
    } else if (response.data) {
      if (forceLoadingWait && forceLoadingWait > 0) {
        await wait(forceLoadingWait);
      }
      setLoading(false);
      const amount = response.data.amount;
      const messageString = amount
        ? `Payment for $${amount} successfully made!`
        : "Payment successful!";
      setSuccessMessage(`${messageString} Click below to close.`);
      refreshReservation?.();
    }
  }

  function handleClose() {
    const needRefresh = !!successMessage;
    setErrorMessage("");
    setSuccessMessage("");
    onClose?.(needRefresh);
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
  const validMethods = detailsState?.reservation?.payment_methods
    ?.filter((pm) => isValidMethod(pm))
    ?.filter(isActiveMethod);
  const otherMethods = validMethods?.filter(
    (pm) => pm.id !== currentPayment?.id
  );
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
              {(otherMethods ?? []).length < 1 && (
                <Box textAlign="center" color="grey.700" px={3}>
                  You have no other payment methods available. Click the arrow
                  to go back or click below to pay with a new method.
                </Box>
              )}
              {otherMethods?.map((pm) => (
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
                      Use this card
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Box textAlign="center" mt={3}>
                <Button
                  onClick={onPayWithNew}
                  variant="outlined"
                  startIcon={<Add />}
                >
                  Pay with a new payment method
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        {!showCardList && (
          <>
            {!hideTotals && <PaymentTotals data={totals ?? { balance: 0 }} />}
            <Grid container justifyContent="space-between">
              <Grid item>
                <CardListItem
                  paymentMethod={currentPayment ?? undefined}
                  primaryPaymentMap={primaryPaymentMap}
                />
              </Grid>
              <Grid item display="flex">
                <Button
                  color="secondary"
                  variant="text"
                  onClick={handleDifferentCardClick}
                >
                  Use a different method
                </Button>
              </Grid>
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
            {successMessage && (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClose}
                sx={{ mt: 2 }}
              >
                Close
              </Button>
            )}
            {!successMessage && (
              <Button
                fullWidth
                variant="contained"
                disabled={loading || (totals?.balance ?? 0) <= 0}
                onClick={callMakePayment}
                sx={{ mt: 2 }}
              >
                {`Pay ${(totals?.balance ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD" })} with ${currentPayment?.brand}`}
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResPayWithMethod;

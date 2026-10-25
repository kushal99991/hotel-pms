import React, { useContext, useCallback } from "react";
import { CheckinState } from "types/reservationCheckIn";
import ReservationDetailsContext from "contexts/ReservationDetailsContext";
import { Alert, Box, Typography } from "@mui/material";
import { Payment } from "@mui/icons-material";
import PayByMethodOrStripe from "components/ui/PayByCardOrStripe/PayByMethodOrStripe";
import {
  PaymentCaptureTypeEnum,
  PaymentDescriptions,
} from "constants/payments";
import { FolioTypes } from "constants/folios";
import {
  incidentalPaymentPresentNotReady,
  incidentalPaymentPresent,
  isCompReservation,
  incidentalPaymentReady,
} from "utils/reservations";

interface IncidentalsStepProps {
  updateState?: React.Dispatch<React.SetStateAction<CheckinState>>;
}

// just static values for now so keep this outside the component so the reference doesn't
// change to avoid unnecessary re renders and intent creations
const incidentalsPaySettings = {
  capture_type: PaymentCaptureTypeEnum.DEFERRED,
  descriptionPrefix: PaymentDescriptions.INCIDENTALS,
  folio_type: FolioTypes.A,
  future_usage: true,
};

const IncidentalsStep: React.FC<IncidentalsStepProps> = () => {
  const { viewState: reservationViewState, refreshReservation } = useContext(
    ReservationDetailsContext
  )!;
  const compReservation = isCompReservation(reservationViewState.reservation);
  const needsNewPaymentIntent = useCallback(() => {
    if (!reservationViewState.reservation) {
      return false;
    }
    const incidentalPresent = incidentalPaymentPresent(
      reservationViewState.reservation
    );
    return !incidentalPresent;
  }, [reservationViewState.reservation]);

  function handlePaymentSuccess() {
    refreshReservation?.();
  }

  function showPaymentSuccess() {
    if (compReservation && reservationViewState.incidentalsCollected) {
      return incidentalPaymentReady(reservationViewState.reservation);
    }
    return reservationViewState.incidentalsCollected;
  }

  function showPaymentCollection() {
    let showPaymentCollection =
      !reservationViewState.incidentalsCollected && !incidentalPending;
    if (reservationViewState.reservationLoading) {
      return false;
    }
    if (compReservation) {
      showPaymentCollection = !incidentalPaymentReady(
        reservationViewState.reservation
      );
    }
    return showPaymentCollection;
  }

  const paymentAmountString =
    reservationViewState.charges?.incidentals_per_night ?? "0";
  const incidentalPayment = reservationViewState.reservation?.payments?.find(
    (p) => p.description.includes(PaymentDescriptions.INCIDENTALS)
  );
  const incidentalPending = incidentalPaymentPresentNotReady(
    reservationViewState.reservation
  );
  return (
    <Box>
      <Box>
        <Typography fontWeight="bold" mb={2}>
          {`Before the guest can check in, a temporary incidental charge of $${paymentAmountString} will be collected to cover any possible room damage. If no damage is incurred during their stay, the amount will be refunded back to the guest after check out.`}
        </Typography>
      </Box>
      {compReservation && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography>
            This reservation has a rate of COMP. You may collect incidentals but
            you do not need to in order to check in.
          </Typography>
        </Alert>
      )}
      {showPaymentSuccess() && (
        <Alert severity="success">
          <Typography>
            Incidentals have been collected, proceed with checkin
          </Typography>
        </Alert>
      )}
      {!reservationViewState.incidentalsCollected && incidentalPending && (
        <Alert severity="warning">
          <Typography>
            {`An incidental payment has been collected but is not done processing and currently has a status of: ${incidentalPayment?.status}. Try refreshing the page to check again.`}{" "}
          </Typography>
        </Alert>
      )}
      {reservationViewState.reservationLoading && (
        <Box textAlign="center">
          <Box
            sx={{
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& .swipe-pulse-icon": {
                clipPath: "inset(0 100% 0 0)",
                animation: "swipeRevealPulse 2.3s ease-in-out infinite",
              },
              "@keyframes swipeRevealPulse": {
                "0%": { clipPath: "inset(0 100% 0 0)", opacity: 0.4 },
                "30%": { clipPath: "inset(0 0% 0 0)", opacity: 1 },
                "50%": { clipPath: "inset(0 0% 0 0)", opacity: 0.6 },
                "70%": { clipPath: "inset(0 0% 0 0)", opacity: 1 },
                "100%": { clipPath: "inset(0 0% 0 100%)", opacity: 0.4 },
              },
            }}
          >
            <Payment
              className="swipe-pulse-icon"
              color="secondary"
              sx={{ fontSize: 80 }}
            />
          </Box>
          <Typography fontStyle="italic" sx={{ color: "grey.700" }}>
            Loading payment information
          </Typography>
        </Box>
      )}
      {showPaymentCollection() && (
        <PayByMethodOrStripe
          cardOnly
          manageDescription
          reservation={reservationViewState.reservation}
          paymentMethods={
            reservationViewState.reservation?.payment_methods ?? []
          }
          paySettings={incidentalsPaySettings}
          reservationLoading={false}
          newIntentNeeded={needsNewPaymentIntent}
          totalsData={{
            subtotal: +paymentAmountString,
            total: +paymentAmountString,
            balance: +paymentAmountString,
          }}
          folios={reservationViewState.reservation?.folios}
          onCompleteClick={handlePaymentSuccess}
          onPaymentSuccess={handlePaymentSuccess}
          completeInformation={{
            message:
              "Incidentals successfully processed, click below to continue",
            buttonLabel: "Continue Checking In",
          }}
          forceLoadingWait={2000}
        />
      )}
    </Box>
  );
};

export default IncidentalsStep;

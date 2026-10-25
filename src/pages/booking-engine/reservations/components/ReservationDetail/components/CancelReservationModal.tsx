import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import { folioTotalsFromRes } from "utils/reservations";
import FolioBalanceList from "./FolioBalanceList";
import StateListItem from "./CheckoutStateListItem";
import { useReservationDetails } from "contexts/ReservationDetailsContext";
import {
  CheckOutState as ReservationPaymentState,
  CheckOutStateKey as StateKey,
  CheckOutStateValue as StateValue,
  IReservationResponse,
} from "types/reservationTypes";
import PayByMethodOrStripe from "components/ui/PayByCardOrStripe/PayByMethodOrStripe";
import { CloseOutlined } from "@mui/icons-material";
import { useCancelReservationMutation } from "services/reservationSlice";
import { FolioTypes } from "constants/folios";
import {
  PaymentCaptureTypeEnum,
  PaymentDescriptions,
} from "constants/payments";

const CancelPaymentSettings = {
  capture_type: PaymentCaptureTypeEnum.IMMEDIATE,
  descriptionPrefix: PaymentDescriptions.SETTLE_AT_CANCEL,
  folio_type: FolioTypes.A,
  future_usage: true,
};

interface CancelReservationModalProps {
  open: boolean;
  onClose: () => void;
  onCancelSucess: () => void;
  reservation?: IReservationResponse | null;
  refreshReservation?: () => void;
}

const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  open,
  onClose,
  onCancelSucess,
  reservation,
  refreshReservation,
}) => {
  const theme = useTheme();
  const { viewState } = useReservationDetails();
  const [paymentState, setCancelState] = useState<ReservationPaymentState>({});
  const [cancelError, setCancelError] = useState<string>("");
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [cancelReservation, { isLoading }] = useCancelReservationMutation();
  const isComplete = Object.keys(paymentState).reduce(
    (allComplete: boolean, stateKey: string) => {
      if (!allComplete) {
        return false;
      }
      const stateVal = paymentState[stateKey as StateKey];
      return stateVal?.completed ?? false;
    },
    true
  );
  function getTotals(reservation?: IReservationResponse) {
    const totals = folioTotalsFromRes(reservation);
    return totals;
  }
  useEffect(() => {
    if (!reservation) {
      return;
    }
    const totals = getTotals(reservation);
    setShowPayment(false);
    setCancelState({
      refundOwed: {
        completed: totals.totalBalance >= 0,
        message: `The reservation has a negative balance: ${totals.totalBalance.toFixed(2)}`,
        hasMoreContent: true,
        showMoreByDefault: true,
        viewMoreContent: <FolioBalanceList folioTotals={totals} />,
      },
      balanceOwed: {
        completed: totals.totalBalance <= 0,
        message: `The reservation has an oustanding balance: ${totals.totalBalance.toFixed(2)}`,
        hasMoreContent: true,
        showMoreByDefault: true,
        viewMoreContent: <FolioBalanceList folioTotals={totals} />,
      },
    });
  }, [reservation]);

  async function handleCheckOut() {
    setCancelError("");
    if (reservation) {
      const checkOutResponse = await cancelReservation({ id: reservation?.id });
      if (checkOutResponse.data?.status) {
        onCancelSucess?.();
      } else if (checkOutResponse.error) {
        setCancelError(
          checkOutResponse.error.message ??
            "There was an error cancelling the reservation, please try again."
        );
      }
    }
  }

  function handlePaymentSuccess() {
    setShowPayment(false);
    refreshReservation?.();
  }

  function handleMakePayment() {
    setShowPayment(true);
  }

  function handleDialogClose() {
    if (isLoading) {
      return;
    }
    setCancelError("");
    onClose();
  }

  const balanceTotals = getTotals(reservation ?? undefined);
  function getContent() {
    if (isComplete) {
      return (
        <Typography>
          Are you sure you want to cancel this reservation?
        </Typography>
      );
    }
    return (
      <Box>
        <Alert severity="warning">
          <Typography fontWeight="bold" mb={1}>
            This reservation has a non zero balance and cannot be cancelled
            until the following is resolved:
          </Typography>
          <ul style={{ listStyleType: "disc", paddingLeft: "12px" }}>
            {Object.values(paymentState).map(
              (stateVal: StateValue, idx: number) => {
                if (!stateVal.completed) {
                  return (
                    <StateListItem
                      key={`cancelIncomplete_${idx}`}
                      stateItem={stateVal}
                    />
                  );
                }
                return null;
              }
            )}
          </ul>
        </Alert>
        {!paymentState.balanceOwed?.completed && !showPayment && (
          <Box
            mt={3}
            mx="auto"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Button variant="outlined" onClick={handleMakePayment}>
              Process Payment
            </Button>
            <Typography variant="caption" component="div" mt={2}>
              To view more details go to{" "}
              <Link
                to={`/booking-engine/reservations/folios/${reservation?.id}`}
                style={{
                  textDecoration: "underline",
                  color: theme.palette.secondary.main,
                }}
              >
                Manage Folios
              </Link>
            </Typography>
          </Box>
        )}
        {showPayment && (
          <Box mt={3}>
            <PayByMethodOrStripe
              cardOnly
              manageDescription
              reservation={reservation ?? undefined}
              paymentMethods={viewState?.paymentMethods ?? []}
              paySettings={CancelPaymentSettings}
              reservationLoading={false}
              totalsData={{
                subtotal: balanceTotals.totalBalance,
                total: balanceTotals.totalBalance,
                balance: balanceTotals.totalBalance,
              }}
              folios={reservation?.folios}
              onCompleteClick={handlePaymentSuccess}
              forceLoadingWait={1000}
              completeInformation={{
                buttonLabel: "Continue",
                message: "Payment complete, click below to continue",
              }}
            />
          </Box>
        )}
        {!paymentState.refundOwed?.completed && (
          <Box px={4} mt={3} display="flex" justifyContent="center">
            {"To resolve the negative balance go to "}
            <Link
              to={`/booking-engine/reservations/folios/${reservation?.id}`}
              style={{
                textDecoration: "underline",
                color: theme.palette.secondary.main,
                marginLeft: "4px",
              }}
            >
              Manage Folios
            </Link>
          </Box>
        )}
      </Box>
    );
  }
  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      PaperProps={{ sx: { width: "80%" } }}
    >
      <DialogTitle>
        Cancel Reservation
        <Button
          onClick={handleDialogClose}
          color="primary"
          sx={{ float: "right", minWidth: 0, marginRight: -1 }}
        >
          <CloseOutlined />
        </Button>
      </DialogTitle>
      <Box p={3} flex={1}>
        {getContent()}
      </Box>
      {cancelError && (
        <Alert severity="error">{`There was an error: ${cancelError}. Please try again`}</Alert>
      )}
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleDialogClose}>Close</Button>
        <Button
          onClick={handleCheckOut}
          variant="contained"
          color="error"
          sx={{ width: "112px" }}
          disabled={balanceTotals.totalBalance != 0}
        >
          {isLoading ? (
            <CircularProgress
              size={24.5}
              sx={{ "& .MuiCircularProgress-svg": { color: "white" } }}
            />
          ) : (
            "Cancel"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelReservationModal;

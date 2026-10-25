import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CheckOutState,
  CheckOutStateKey,
  CheckOutStateValue,
  IReservationResponse,
} from "types/reservationTypes";
import PayByMethodOrStripe from "components/ui/PayByCardOrStripe/PayByMethodOrStripe";
import { CloseOutlined } from "@mui/icons-material";
import { useCheckOutReservationMutation } from "services/reservationSlice";
import moment from "moment";
import { FolioTypes } from "constants/folios";
import {
  PaymentCaptureTypeEnum,
  PaymentDescriptions,
} from "constants/payments";
import { folioTotalsFromRes } from "utils/reservations";
import { TotalsByFolio } from "types/ui/payments";
import FolioBalanceList from "./FolioBalanceList";
import CheckoutStateListItem from "./CheckoutStateListItem";

const CheckoutPaySettings = {
  capture_type: PaymentCaptureTypeEnum.IMMEDIATE,
  descriptionPrefix: PaymentDescriptions.SETTLE_AT_CHECKOUT,
  folio_type: FolioTypes.A,
  future_usage: true,
};

interface CheckOutModalProps {
  open: boolean;
  onClose: () => void;
  onCheckOut: () => void;
  reservation?: IReservationResponse | null;
  refreshReservation?: () => void;
}

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  open,
  onClose,
  onCheckOut,
  reservation,
  refreshReservation,
}) => {
  const theme = useTheme();
  const [checkOutState, setCheckOutState] = useState<CheckOutState>({});
  const [checkOutError, setCheckOutError] = useState<string>("");
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [checkoutConfirmed, setCheckoutConfirmed] = useState(false);
  const [checkOut, { isLoading }] = useCheckOutReservationMutation();
  const isComplete = Object.keys(checkOutState).reduce(
    (allComplete: boolean, stateKey: string) => {
      if (!allComplete) {
        return false;
      }
      const stateVal = checkOutState[stateKey as CheckOutStateKey];
      return stateVal?.completed ?? false;
    },
    true
  );
  function getTotals(reservation?: IReservationResponse): TotalsByFolio {
    const totals = folioTotalsFromRes(reservation);
    return totals;
  }
  useEffect(() => {
    if (!reservation) {
      return;
    }
    const totals = getTotals(reservation);
    const momentNow = moment(new Date());
    const momentEndDate = moment(reservation.end_date);
    const isCorrectDate = momentNow.isSameOrAfter(momentEndDate, "day");
    setShowPayment(false);
    setCheckOutState({
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
      correctDate: {
        completed: isCorrectDate,
        message: "The reservation end date is after the current date",
      },
    });
  }, [reservation]);

  async function handleCheckOut() {
    setCheckOutError("");
    if (reservation) {
      const checkOutResponse = await checkOut({ id: reservation?.id });
      if (checkOutResponse.data?.status) {
        onCheckOut?.();
      } else if (checkOutResponse.error) {
        setCheckOutError(
          checkOutResponse.error.message ??
            "There was an error checking out, please try again."
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
    setCheckOutError("");
    onClose();
  }

  function handleVerifyCheckout() {
    setCheckoutConfirmed(!checkoutConfirmed);
  }
  const balanceTotals = getTotals(reservation ?? undefined);
  function getContent() {
    if (isComplete) {
      return "Everything looks good. Click below to complete guest checkout.";
    }
    return (
      <Box>
        <Alert severity="warning">
          <Typography fontWeight="bold" mb={1}>
            This reservation has the following issues:
          </Typography>
          <ul style={{ listStyleType: "disc", paddingLeft: "12px" }}>
            {Object.values(checkOutState).map(
              (stateVal: CheckOutStateValue, idx: number) => {
                if (!stateVal.completed) {
                  return (
                    <CheckoutStateListItem
                      key={`checkoutIncomplete_${idx}`}
                      stateItem={stateVal}
                    />
                  );
                }
                return null;
              }
            )}
          </ul>
        </Alert>
        {!checkOutState.balanceOwed?.completed && !showPayment && (
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
              paymentMethods={reservation?.payment_methods ?? []}
              paySettings={CheckoutPaySettings}
              reservationLoading={false}
              totalsData={{
                subtotal: balanceTotals.totalBalance,
                total: balanceTotals.totalBalance,
                balance: balanceTotals.totalBalance,
              }}
              folios={reservation?.folios}
              onCompleteClick={handlePaymentSuccess}
              forceLoadingWait={1000}
            />
          </Box>
        )}
        {!checkOutState.refundOwed?.completed && (
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
        <Box textAlign="center" mt={3}>
          <FormControlLabel
            label="Continue check out without resolving"
            control={
              <Checkbox
                size="medium"
                onChange={handleVerifyCheckout}
                checked={checkoutConfirmed}
              />
            }
            sx={{ maxWidth: "75%" }}
          />
        </Box>
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
        Check-Out
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
      {checkOutError && (
        <Alert severity="error">{`There was an error: ${checkOutError}. Please try again`}</Alert>
      )}
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button
          onClick={handleCheckOut}
          variant="contained"
          color="success"
          disabled={!(isComplete || checkoutConfirmed)}
          sx={{ width: "112px" }}
        >
          {isLoading ? (
            <CircularProgress
              size={24.5}
              sx={{ "& .MuiCircularProgress-svg": { color: "white" } }}
            />
          ) : (
            "Check Out"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckOutModal;

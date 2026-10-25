import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Tooltip,
  styled,
  useTheme,
} from "@mui/material";
// import useTheme from "@mui/material/styles/useTheme";
import {
  IPaymentMethodResponse,
  IReservationResponse,
} from "types/reservationTypes";
import { IPaymentResponse } from "types/payments";
import { IFolioResponse } from "types/folios";
import { getMethodDetailString } from "utils/reservations";
import {
  getFirstValidMethod,
  isValidMethod,
  stripePaymentIntentDuePresent,
} from "utils/payments";
import PaymentMethodModal from "./ReservationDetail/components/PaymentMethodModal";
import EditPaymentRoutingDialog from "./ReservationDetail/components/EditPaymentRoutingDialog";
import ReservationDetailsContext from "contexts/ReservationDetailsContext";
import useAuth from "hooks/useAuth";
import { FolioTypes } from "constants/folios";
import { useGetPostingCodeDepartmentGroupsQuery } from "services/postingCodeSlice";

const StyledChargesDiv = styled("div")(({ theme }) => ({
  ...theme.typography.body2,
  display: "flex",
  justifyContent: "space-between",
}));

interface PaymentSummaryProps {
  folios: IFolioResponse[];
  paymentMethods: IPaymentMethodResponse[];
  reservation: IReservationResponse | null;
  payments: IPaymentResponse[];
  onGoToCharges: (evt: any) => void;
  onPaymentClick?: () => void;
  onRefresh?: () => void;
}

interface ChargesRoutingSectionProps {
  reservation: IReservationResponse | null;
  onRefresh?: () => void;
}

function ChargesRoutingSection({ reservation, onRefresh }: ChargesRoutingSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const routing = reservation?.payment_routing;
  const routingText = routing
    ? `${routing.target_dept_group.name} - Folio ${routing.folio}`
    : "None specified";

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          Charges Routing
        </Typography>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          style={{cursor: "pointer"}}
        >
          <Typography variant="body2" sx={{ color: "secondary.main", textDecoration: "underline" }}>
            Edit
          </Typography>
        </button>
      </Box>
      <Box>
        <Typography variant="body2">
          {routingText}
        </Typography>
      </Box>
      <EditPaymentRoutingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        reservation={reservation}
        onSuccess={() => onRefresh?.()}
      />
    </Box>
  );
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  folios,
  paymentMethods,
  payments,
  onPaymentClick,
  onGoToCharges,
  reservation,
  onRefresh,
}) => {
  const theme = useTheme();
  const { users } = useAuth();
  const { viewState: detailsState } = useContext(ReservationDetailsContext)!;
  const { data: postingCodeDepartmentGroups } =
    useGetPostingCodeDepartmentGroupsQuery(
      { property_id: users?.defaultPropertyId },
      { skip: !users?.defaultPropertyId }
    );
  const [methodsOpen, setMethodsOpen] = useState(false);
  const noFolios = Object.keys(folios).length === 0;
  const folioA = folios.find((f) => f.type === FolioTypes.A);
  const firstUsabledMethod =
    folioA?.primary_payment_method ?? getFirstValidMethod(paymentMethods);
  const paymentMethod =
    firstUsabledMethod?.last4 || firstUsabledMethod?.direct_billing_account_id
      ? getMethodDetailString(firstUsabledMethod)
      : "No card information given";
  const validMethods = paymentMethods.filter(isValidMethod);
  const noPaymentMethods = paymentMethods.length < 0 || validMethods.length < 1;
  const expirationDate = firstUsabledMethod?.exp_year ?? "n/a";
  const totals = detailsState.outstandingTotals;
  const outstandingBalance = totals ? totals?.balance > 0 : false;
  function getEditButtonText() {
    const validPaymentMethods = paymentMethods.filter((pm) =>
      isValidMethod(pm)
    );
    if (validPaymentMethods.length === 0) {
      return "Add Payment Method";
    }
    return "Edit";
  }

  function getTooltipContent() {
    const noOutstandingBalance = totals ? totals?.balance <= 0 : false;
    if (noOutstandingBalance) {
      return "No outstanding balance to collect at this time";
    }
    const noActivePayments = !payments.length;
    if (noPaymentMethods && noActivePayments) {
      return "No payment methods added yet. Add a payment method to collect balance.";
    }
    return "";
  }

  function shouldDisableCollect() {
    if (!outstandingBalance) {
      return true;
    }
    const duePayments = payments?.filter(stripePaymentIntentDuePresent);
    if (noPaymentMethods && (duePayments ?? []).length < 1) {
      return true;
    }
    return false;
  }
  const collectDisabled = shouldDisableCollect();
  return (
    <Box
      sx={{
        display: "flex",
        overflow: "hidden",
        marginBottom: "-24px",
      }}
    >
      {noFolios && (
        <Box p={2}>
          <Typography>No folios are attached to this reservation</Typography>
        </Box>
      )}
      {!noFolios && (
        <>
          {/* Payment Details Column */}
          <Box sx={{ flex: 1, padding: 2 }}>
            <Typography variant="body1" fontWeight="bold" mb={1}>
              Payment
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="body2">{paymentMethod}</Typography>
                <Typography variant="body2">{`Exp Date: ${expirationDate}`}</Typography>
                <Typography variant="body2">{`Total Authorized Amt. $${(totals?.paidTotal ?? 0).toFixed(2)}`}</Typography>
              </Box>

              <ChargesRoutingSection reservation={reservation} onRefresh={onRefresh} />
            </Box>

            <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
              <Tooltip title={collectDisabled ? getTooltipContent() : ""}>
                <Box
                  sx={{
                    cursor: collectDisabled ? "help" : "pointer",
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    disabled={collectDisabled}
                    sx={{
                      backgroundColor: "secondary.main",
                      color: "#fff",
                    }}
                    onClick={onPaymentClick}
                  >
                    Collect Payment
                  </Button>
                </Box>
              </Tooltip>
              <Button
                variant="text"
                size="small"
                sx={{
                  color: "secondary.main",
                }}
                onClick={() => setMethodsOpen(true)}
              >
                {getEditButtonText()}
              </Button>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Charges Column */}
          <Box
            sx={{
              flex: 1,
              padding: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="body1" fontWeight="bold" mb={1}>
              Charges
            </Typography>
            <Box sx={{ pb: 1, borderBottom: "1px solid #D6D6D6" }}>
              <StyledChargesDiv>
                <button
                  type="button"
                  onClick={onGoToCharges}
                  style={{
                    textDecoration: "underline",
                    color: theme.palette.secondary.main,
                  }}
                >
                  Current Charges
                </button>
                <span>{(totals?.total ?? 0).toFixed(2)}</span>
              </StyledChargesDiv>
              <StyledChargesDiv>
                Payment / Deposits
                <span>{`${(totals?.paidTotal ?? 0) > 0 ? "- " : ""}${(totals?.paidTotal ?? 0).toFixed(2)}`}</span>
              </StyledChargesDiv>
              <StyledChargesDiv>
                Refund Amt.
                <span>0.00</span>
              </StyledChargesDiv>
            </Box>
            <Box pt={1}>
              <StyledChargesDiv>
                Current Balance
                <span>{`${totals?.balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}</span>
              </StyledChargesDiv>
            </Box>
          </Box>
        </>
      )}
      <PaymentMethodModal
        open={methodsOpen}
        onClose={() => setMethodsOpen(false)}
        paymentMethods={paymentMethods}
        reservation={reservation}
        folios={folios}
        refreshData={onRefresh}
      />
    </Box>
  );
};

export default PaymentSummary;

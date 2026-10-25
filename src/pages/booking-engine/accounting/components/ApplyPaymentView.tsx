import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { useTheme, lighten } from "@mui/material/styles";
import Label from "components/elements/Label/Label";
import SimplePaymentsTable from "./SimplePaymentsTable";
import { AccountModalViewProps } from "types/ui/accounting";
import SimpleFoliosTable from "./SimpleFoliosTable";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { DropdownOption } from "components/elements/Dropdown/Dropdown";

import { useSettleLCPaymentMutation } from "services/paymentsSlice";

import { getMethodDetailString } from "utils/reservations";
import { currencyString } from "utils/helperFunctions/numbers";

import { ReservationPaymentStatus } from "constants/payments";
import { IPaymentResponse, ISettleLCPaymentItem } from "types/payments";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { pluralValue } from "utils/helperFunctions/common";
import { apiAmountToNumber } from "utils/dataFormats";

const ROW_HEIGHT = 36;

const ApplyPaymentView: React.FC<AccountModalViewProps> = ({
  account,
  paymentMethods,
  additionalProps,
  onClose,
  setRefreshOnBackdrop,
}) => {
  const [statePayment, setStatePayment] = useState<IPaymentResponse | null>(
    null
  );
  const theme = useTheme();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [applyPayment, { isLoading: loading }] = useSettleLCPaymentMutation();
  const [folioIds, setFolioIds] = useState<GridRowSelectionModel>(
    additionalProps?.selectedResId ? [additionalProps.selectedResId] : []
  );

  let transactions = account?.lc_payments ?? [];
  const payments = account?.payments ?? [];
  let tablePayments: IPaymentResponse[] = [];
  const methods = paymentMethods ?? [];

  let selectedPayment: number | undefined,
    selectedReservation: number | undefined;
  if (additionalProps?.selectedPaymentId) {
    selectedPayment = additionalProps.selectedPaymentId;
  }
  if (statePayment) {
    selectedPayment = statePayment.id;
  }
  if (additionalProps?.selectedResId) {
    selectedReservation = additionalProps.selectedResId;
  }

  function handleCloseClick(successfulAdd?: boolean) {
    setError("");
    onClose?.(successfulAdd);
  }

  async function handleApply() {
    if (!selectedPayment) {
      return;
    }
    const paymentItems: ISettleLCPaymentItem[] = [];
    folioIds.forEach((folioId) => {
      const folioPayments = transactions.filter((t) => {
        return (
          t.reservation_id === folioId &&
          t.status !== ReservationPaymentStatus.SETTLED
        );
      });
      folioPayments.forEach((fp) => {
        paymentItems.push({
          lc_payment_id_to_settle: fp.id,
          lc_payments_reservation_id: fp.reservation_id ?? -1,
        });
      });
    });
    const response = await applyPayment({
      payment_id_to_charge: selectedPayment,
      items: paymentItems,
    });
    if (response.error) {
      setError(
        `Error making payment: ${response.error.toString() ?? ""} Please try again.`
      );
    } else if (response.data) {
      setRefreshOnBackdrop?.(true);
      const amount =
        apiAmountToNumber(response.data.amount) -
        apiAmountToNumber(response.data.remaining_amount);
      const messageString = amount
        ? `Payment of $${amount.toFixed(2)} successfully applied!`
        : "Payment successful!";
      const msg = `${messageString} Click below to close.`;
      setSuccessMessage(msg);
    }
  }

  function handleApplyClick() {
    if (successMessage) {
      onClose?.(true);
      return;
    }
    handleApply();
  }

  function handlePaymentSelect(evt: any) {
    const id = +evt.target.value;
    const payment = payments.find((p) => p.id === id);
    if (payment) {
      setStatePayment(payment);
    }
  }

  function handleRowSelection(updatedRows: GridRowSelectionModel) {
    setFolioIds(updatedRows);
  }

  const fullSelectedPayment = payments.find((p) => p.id === selectedPayment);
  if (selectedPayment && payments.length) {
    if (fullSelectedPayment) {
      tablePayments = [fullSelectedPayment];
    }
  }

  if (selectedReservation && transactions.length) {
    transactions = transactions.filter(
      (t) => t.reservation_id === selectedReservation
    );
  }

  function makePaymentLabel(payment: IPaymentResponse) {
    const paymentMethod = methods.find(
      (pm) => pm.id === payment.payment_method_id
    );
    return `${getMethodDetailString(paymentMethod)} - ${currencyString(apiAmountToNumber(payment.remaining_amount))}`;
  }

  function isActionDisabled() {
    if (loading) {
      return true;
    }
    if (!selectedPayment || folioIds.length === 0) {
      return true;
    }
    return false;
  }

  function getActionButtonText() {
    if (successMessage) {
      return "Close";
    }
    if (loading) {
      return "Applying Payment... ";
    }
    return "Apply Payment";
  }

  const paymentOptions: DropdownOption[] = [];
  (account?.payments ?? []).forEach((p) => {
    if (
      p.remaining_amount &&
      p.status === ReservationPaymentStatus.PAID &&
      apiAmountToNumber(p.remaining_amount) > 0
    ) {
      const label = makePaymentLabel(p);
      paymentOptions.push({
        label,
        value: p.id.toString(),
      });
    }
  });

  return (
    <DialogContent>
      <Box textAlign="center">
        {!!paymentOptions.length && (
          <CustomDropdown
            label="Payment"
            options={paymentOptions}
            onChange={handlePaymentSelect}
            defaultValue={""}
            value={selectedPayment?.toString() ?? ""}
            displayEmpty
            size="small"
            renderValue={(value: unknown) => {
              if (!value) {
                return "Select a payment to apply";
              }
              const payment = payments.find((p) => p.id === +value);
              return <>{makePaymentLabel(payment!)}</>;
            }}
          />
        )}
        {paymentOptions.length === 0 && (
          <Box>
            <Label>Payments</Label>
            <Typography
              fontStyle="italic"
              sx={{ mb: 2, fontSize: "0.875rem", color: "grey.800" }}
            >
              There are no funds available from current payments. To add a
              payment close and click &quot;Post Payment&quot;.
            </Typography>
          </Box>
        )}
        {selectedPayment && (
          <Box mt={2}>
            <SimplePaymentsTable
              payments={tablePayments}
              methods={methods}
              headerHeight={ROW_HEIGHT}
              rowHeight={ROW_HEIGHT}
              hideTableFooter
              noHeaderActions
              sxProps={{
                bgcolor: lighten(theme.palette.secondary.main, 0.9),
                "& .MuiDataGrid-columnHeaderRow": {
                  bgcolor: theme.palette.grey[300],
                },
              }}
            />
          </Box>
        )}
      </Box>
      {paymentOptions.length > 0 && (
        <Box textAlign="center" mt={6}>
          <Label>Folios</Label>
          <Typography
            fontStyle="italic"
            sx={{ mb: 2, fontSize: "0.875rem", color: "grey.800" }}
          >
            Select one or more folios to apply the payment to
          </Typography>
          <SimpleFoliosTable
            lcPayments={transactions}
            headerHeight={ROW_HEIGHT}
            rowHeight={ROW_HEIGHT}
            maxHeight={ROW_HEIGHT * 12}
            allowCheckboxSelect={!selectedReservation}
            onRowSelected={handleRowSelection}
            selectedIds={
              selectedReservation != null
                ? ([selectedReservation] as GridRowSelectionModel)
                : folioIds
            }
            rowFilter={(row) => !!(row.balance && row.balance > 0)}
          />
        </Box>
      )}
      <Box mt={2} display="flex" justifyContent="flex-end">
        {!!(selectedPayment && folioIds.length && !successMessage) && (
          <Alert sx={{ width: "fit-content" }} severity="info">
            {`Apply payment of ${currencyString(apiAmountToNumber(fullSelectedPayment?.remaining_amount))} to ${pluralValue(folioIds.length, "Folio", "Folios")} (${folioIds.join(", ")})?`}
          </Alert>
        )}
        {successMessage && (
          <Alert sx={{ width: "fit-content" }} severity="success">
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert sx={{ width: "fit-content" }} severity="error">
            {error}
          </Alert>
        )}
      </Box>
      <DialogActions sx={{ mt: 3, px: 0, display: "flex" }}>
        <Button
          onClick={() => {
            handleCloseClick();
          }}
          color="primary"
          sx={{ mr: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApplyClick}
          variant="contained"
          color="secondary"
          disabled={isActionDisabled()}
        >
          {getActionButtonText()}
        </Button>
      </DialogActions>
    </DialogContent>
  );
};

export default ApplyPaymentView;

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
import SettlementPaymentsTable from "./SettlementPaymentsTable";
import { AccountModalViewProps } from "types/ui/accounting";
import FolioSettlementsTable from "./FolioSettlementsTable";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { DropdownOption } from "components/elements/Dropdown/Dropdown";

import { useDeleteLCPaymentsMutation } from "services/paymentsSlice";

import { getMethodDetailString } from "utils/reservations";
import { currencyString } from "utils/helperFunctions/numbers";
import { ReservationPaymentStatus } from "constants/payments";
import { IDeleteLCPaymentItem, IPaymentResponse } from "types/payments";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { pluralValue } from "utils/helperFunctions/common";
import { apiAmountToNumber } from "utils/dataFormats";

const ROW_HEIGHT = 36;

const UnapplyPaymentView: React.FC<AccountModalViewProps> = ({
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
  const [unsettlePayment, { isLoading: loading }] =
    useDeleteLCPaymentsMutation();
  const [folioIds, setFolioIds] = useState<GridRowSelectionModel>(
    additionalProps?.selectedResId ? [additionalProps.selectedResId] : []
  );

  let transactions = account?.lc_payments ?? [];
  const payments = (account?.payments ?? []).filter((p) =>
    p.remaining_amount == null ? false : p.remaining_amount < p.amount
  );
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
    let paymentItems: IDeleteLCPaymentItem[] = [];
    folioIds.forEach((folioId) => {
      const settledFolioPayments = transactions.filter((t) => {
        const isSettled =
          t.status === ReservationPaymentStatus.SETTLED ||
          t.status === ReservationPaymentStatus.PARTIALLY_SETTLED;
        return t.reservation_id === folioId && isSettled;
      });
      settledFolioPayments.forEach((fp) => {
        const settlementItems = fp.settlements?.reduce((ids, s) => {
          if (s.payment_id === selectedPayment) {
            ids.push({
              lc_settlement_id_to_unsettle: s.id,
            });
          }
          return ids;
        }, [] as IDeleteLCPaymentItem[]);
        if (settlementItems) {
          paymentItems = paymentItems.concat(settlementItems);
        }
      });
    });
    const response = await unsettlePayment({
      items: paymentItems,
    });
    if (response.error) {
      setError(
        `Error unapplying payment: ${response.error.toString() ?? ""} Please try again.`
      );
    } else {
      setRefreshOnBackdrop?.(true);
      const msg = "Unapplying payment successful. Click below to close.";
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
    if (!payment) {
      return "Unknown";
    }
    const paymentMethod = methods.find(
      (pm) => pm.id === payment?.payment_method_id
    );
    return `${getMethodDetailString(paymentMethod)} - ${currencyString(apiAmountToNumber(payment.amount) - apiAmountToNumber(payment.remaining_amount))}`;
  }

  function isActionDisabled() {
    if (successMessage) {
      return false;
    }
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
      return "Unapplying Payment... ";
    }
    return "Unapply Payment";
  }

  const paymentOptions: DropdownOption[] = [];

  if (selectedReservation) {
    let paymentIds: number[] = [];
    const settledFolioPayments = transactions.filter((t) => {
      const isSettled =
        t.status === ReservationPaymentStatus.SETTLED ||
        t.status === ReservationPaymentStatus.PARTIALLY_SETTLED;
      return t.reservation_id === selectedReservation && isSettled;
    });
    settledFolioPayments.forEach((fp) => {
      const settlementIds = fp.settlements?.map((s) => s.payment_id);
      if (settlementIds) {
        paymentIds = paymentIds.concat(settlementIds);
      }
    });
    (account?.payments ?? []).forEach((p) => {
      if (paymentIds.includes(p.id)) {
        const label = makePaymentLabel(p);
        paymentOptions.push({
          label,
          value: p.id.toString(),
        });
      }
    });
  } else {
    (account?.payments ?? []).forEach((p) => {
      if (
        p.status === ReservationPaymentStatus.PAID &&
        (p.remaining_amount ?? p.amount) < p.amount
      ) {
        const label = makePaymentLabel(p);
        paymentOptions.push({
          label,
          value: p.id.toString(),
        });
      }
    });
  }
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
                return "Select a payment to unapply";
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
            <SettlementPaymentsTable
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
            Select one or more folios to unapply the payment from
          </Typography>
          <FolioSettlementsTable
            lcPayments={transactions}
            selectedPayment={fullSelectedPayment ?? undefined}
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
          />
        </Box>
      )}
      <Box mt={2} display="flex" justifyContent="flex-end">
        {!!(selectedPayment && folioIds.length && !successMessage) && (
          <Alert sx={{ width: "fit-content" }} severity="info">
            {`Unapply payment from ${pluralValue(folioIds.length, "Folio", "Folios")} (${folioIds.join(", ")})?`}
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
        {!successMessage && (
          <Button
            onClick={() => {
              handleCloseClick();
            }}
            color="primary"
            sx={{ mr: 3 }}
          >
            Cancel
          </Button>
        )}
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

export default UnapplyPaymentView;

import React, { useState, useEffect } from "react";
import moment from "moment";
import { appConfig } from "config/app.config";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TableContainer,
  TableBody,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { wait } from "utils/common";
import { makeCancelDescription } from "utils/payments";
import {
  useChangePaymentAmountMutation,
  useCancelLCPaymentMutation,
} from "services/paymentsSlice";
import { currencyString } from "utils/helperFunctions/numbers";
import { PaymentRowData } from "types/ui/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";

interface CancelPaymentModalProps {
  open: boolean;
  payment?: PaymentRowData;
  paymentMethods?: IPaymentMethodResponse[];
  onClose: (addSuccess?: boolean) => void;
  refreshData: () => void;
}

const CancelPaymentModal: React.FC<CancelPaymentModalProps> = ({
  open,
  onClose,
  payment,
  paymentMethods,
  refreshData,
}) => {
  const method = paymentMethods?.find(
    (pm) => pm.id === payment?.payment_method_id
  );
  const [loading, setLoading] = useState(false);
  const [cancelPayment] = useChangePaymentAmountMutation();
  const [cancelLCPayment] = useCancelLCPaymentMutation();
  const [error, setError] = useState("");
  const [description, setDescription] = useState(
    makeCancelDescription(payment)
  );

  useEffect(() => {
    if (open && payment && !description) {
      setDescription(makeCancelDescription(payment));
    }
  }, [open, payment]);

  const handleCancelClick = async () => {
    setLoading(true);
    let cancelResponse;
    if (payment?.direct_billing_account_id) {
      cancelResponse = await cancelLCPayment({
        lc_payment_id: payment?.id || -1,
      });
    } else {
      cancelResponse = await cancelPayment({
        payment_id: payment?.id || -1,
        amount: 0,
        description: description,
      });
    }

    if (cancelResponse && !cancelResponse.error) {
      await wait(1000);
      setLoading(false);
      refreshData();
      handleCloseClick();
    } else if (cancelResponse?.error) {
      setError(cancelResponse.error.toString());
      setLoading(false);
    }
  };

  function onDescriptionChange(evt: any) {
    setError("");
    setDescription(evt.target.value);
  }

  function handleCloseClick(successfulCancel?: boolean) {
    setError("");
    setDescription("");
    onClose?.(successfulCancel);
  }

  function getCardName() {
    if (method?.direct_billing_account_id) {
      return `DB - ${method?.direct_billing_account_name ?? "Direct Billing Account"} ${method.direct_billing_account_id}`;
    }
    if (method?.payment_type === PaymentMethodTypesEnum.CASH) {
      return "Cash";
    }
    if (method?.payment_type === PaymentMethodTypesEnum.CHECK) {
      return "Check";
    }
    return `${method ? method.brand.toUpperCase() : "Card Payment"} - ${method?.last4 ?? "XXXX"}`;
  }

  return (
    <Dialog
      open={open}
      onClose={() => handleCloseClick()}
      PaperProps={{ sx: { width: "700px" } }}
    >
      <DialogTitle mb={3}>Cancel Payment</DialogTitle>
      <DialogContent>
        <Box>
          {error && (
            <Alert
              sx={{ mb: 2 }}
              severity="error"
              onClose={() => {
                setError("");
              }}
            >
              {`Error cancelling payment: ${error}.`}
            </Alert>
          )}
          <Box>
            <Typography component="span">{`Cancel this charge of `}</Typography>
            <Typography component="span" fontWeight="bold">
              {currencyString(payment?.payment_amount ?? 0)}
            </Typography>
            <Typography component="span">?</Typography>
          </Box>
          <TableContainer
            sx={{ backgroundColor: "white", borderRadius: "3px" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Payment Used</TableCell>
                  <TableCell align="center">Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {moment(payment?.payment_date || "").format(
                      appConfig.displayDateFormat
                    )}
                  </TableCell>
                  <TableCell>{getCardName()}</TableCell>
                  <TableCell align="center">{payment?.description}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box>
          <TextField
            multiline
            fullWidth
            rows={2}
            label="Description"
            placeholder="Add any notes or a description to the cancellation"
            onChange={onDescriptionChange}
            value={description}
            sx={{ mt: 3 }}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ p: 3, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={() => {
            handleCloseClick();
          }}
          color="primary"
        >
          Close
        </Button>
        <Button
          onClick={handleCancelClick}
          variant="contained"
          disabled={loading}
          color="error"
        >
          {loading ? "Cancelling..." : "Cancel Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelPaymentModal;

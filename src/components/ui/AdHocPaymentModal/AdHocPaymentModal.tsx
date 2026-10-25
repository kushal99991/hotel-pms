import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import CloseIcon from "@mui/icons-material/Close";
import { IPayWithNewSettings } from "../PayWithMethod/PayWithMethod";
import {
  IPaymentMethodResponse,
  IReservationResponse,
} from "types/reservationTypes";
import { PaymentTotalsData } from "../PaymentTotals/PaymentTotals";
import { currencyString } from "utils/helperFunctions/numbers";
import { PayByPaymentSettings } from "types/payments";
import { PaymentCaptureTypeEnum } from "constants/payments";
import PayByMethodOrStripe from "../PayByCardOrStripe/PayByMethodOrStripe";
import {
  hasUsableMethods,
  isActiveMethod,
  isValidMethod,
} from "utils/payments";
import AdHocNoPayment from "./AdHocNoPayment";
import { IFolioResponse } from "types/folios";
import { PaymentParent } from "types/ui/payments";

const basePaySettings: PayByPaymentSettings = {
  // TODO Revisit if this should be deferred by default
  capture_type: PaymentCaptureTypeEnum.IMMEDIATE,
  future_usage: true,
};

interface AdHocPaymentModalProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  message?: string;
  totals: PaymentTotalsData;
  title?: string;
  folios?: IFolioResponse[];
  currentFolioId?: number;
  currentPaymentId?: number;
  reservation?: IReservationResponse;
  paymentMethods?: IPaymentMethodResponse[];
  paymentSettings?: PayByPaymentSettings;
  onPaymentComplete?: () => any;
  onStripePaymentComplete?: () => any;
  payWithNewSettings?: IPayWithNewSettings;
  disableDirectBillPay?: boolean;
  descriptionRequired?: boolean;
  allowFolioSelect?: boolean;
  parent?: PaymentParent;
}

const AdHocPaymentModal: React.FC<AdHocPaymentModalProps> = ({
  open,
  onClose,
  currentFolioId,
  currentPaymentId,
  folios,
  title,
  totals,
  message,
  reservation,
  paymentMethods,
  paymentSettings,
  onPaymentComplete,
  payWithNewSettings,
  onStripePaymentComplete,
  disableDirectBillPay,
  descriptionRequired,
  allowFolioSelect,
  parent,
}) => {
  const [amount, setAmount] = useState("");
  const [showNoMethods, setShowNoMethods] = useState(true);
  const [selectedFolioId, setSelectedFolioId] = useState(-1);
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (Math.floor(totals.balance * 100) === Math.floor(+amount * 100)) {
      return;
    }
    if (totals.balance > 0) {
      setAmount(totals.balance.toFixed(2).toString());
    }
  }, [totals]);

  useEffect(() => {
    if (!paymentMethods || !paymentMethods?.length) {
      return;
    }
    if (paymentMethods?.length && showNoMethods) {
      if (hasUsableMethods(paymentMethods)) {
        setShowNoMethods(false);
      }
    }
  }, [showNoMethods, paymentMethods]);

  function handleClose() {
    setSuccessMessage("");
    setError("");
    onClose?.(!!successMessage);
  }

  function onDescriptionChange(evt: any) {
    setError("");
    setDescription(evt.target.value);
  }

  function onAmountChange(evt: any) {
    setError("");
    setAmount(evt.target.value);
  }

  function handleNoPaymentConfirm() {
    setShowNoMethods(false);
  }

  function getInvalidAmountMessage() {
    const amt = +amount;
    if (Number.isNaN(amt)) {
      return "Amount must be a number";
    }
    if (amt < 0) {
      return "Amount must be greater than 0";
    }
    return "";
  }

  function handleOnComplete() {
    setAmount("");
    setDescription("");
    onPaymentComplete?.();
  }

  function handleOnStripeComplete() {
    setAmount("");
    setDescription("");
    if (onStripePaymentComplete) {
      onStripePaymentComplete();
    } else if (onPaymentComplete) {
      onPaymentComplete?.();
    }
  }

  function makeFolioOptions() {
    const allFolios = reservation?.folios
      ? reservation?.folios
      : (folios ?? []);
    return allFolios.map((f) => ({
      value: f.id.toString(),
      label: `Folio ${f.type}`,
    }));
  }

  function handleFolioChange(evt: any) {
    const value = evt.target.value;
    setError("");
    setSelectedFolioId(+value);
  }

  function getAmountNumber() {
    const amt = +amount;
    if (Number.isNaN(amt)) {
      return 0;
    }
    if (amt < 0) {
      return 0;
    }
    return amt;
  }
  const amountNum = getAmountNumber();
  const folioOptions = allowFolioSelect ? makeFolioOptions() : [];
  const invalidAmountMsg = getInvalidAmountMessage();
  const settings = paymentSettings ?? basePaySettings;
  settings.description = description;
  const disablePayWithNew =
    amountNum <= 0 || (descriptionRequired && !description);
  const disableNewMessage = disablePayWithNew
    ? `Ensure the payment amount is more than 0 ${descriptionRequired && "and a description has been provided "}before paying with a new method`
    : "";
  const usableMethods =
    paymentMethods?.filter(isActiveMethod).filter(isValidMethod) ?? [];
  const hasUsableMethod = usableMethods.length > 0;
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: "600px" } }}
    >
      <DialogTitle>{title ?? "Make a Payment"}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Typography>
          {message ??
            `Process the balance of ${currencyString(totals?.balance ?? 0)} with this card?`}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}{" "}
          </Alert>
        )}
        <Box display="flex" flexDirection="column" mt={message ? 3 : 0}>
          <Box display="flex" alignItems="center" width="238px">
            <Typography fontWeight="bold">Amount: </Typography>
            <TextField
              onChange={onAmountChange}
              error={!!invalidAmountMsg}
              helperText={invalidAmountMsg}
              placeholder="0.00"
              size="small"
              InputProps={{
                sx: { maxWidth: "140px" },
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              FormHelperTextProps={{
                sx: { marginRight: 0, marginLeft: "-18px", textAlign: "right" },
              }}
              sx={{
                ml: 2,
                width: "160px",
                alignItems: "flex-end",
                input: { textAlign: "right" },
              }}
              value={amount}
            />
          </Box>
          <TextField
            fullWidth
            label="Description"
            required={descriptionRequired}
            placeholder={`${descriptionRequired ? "REQUIRED -" : ""} Add any notes or a description to the payment`}
            onChange={onDescriptionChange}
            value={description}
            sx={{ mt: 3 }}
          />
          {allowFolioSelect && (
            <Box my={2}>
              <CustomDropdown
                label={"Folio"}
                placeholder="Choose folio"
                disabled={folioOptions.length < 1}
                options={folioOptions}
                onChange={handleFolioChange}
                value={selectedFolioId > 0 ? selectedFolioId.toString() : ""}
                defaultValue=""
                fullWidth
                aria-label="Select Folio to Post to"
                data-testid="add-folio-select-dropdown"
              />
            </Box>
          )}
        </Box>
        <Box mt={3}>
          {!hasUsableMethod && showNoMethods && (
            <AdHocNoPayment
              amount={amountNum}
              onConfirmClick={handleNoPaymentConfirm}
            />
          )}
          {!showNoMethods && (
            <PayByMethodOrStripe
              hideDirectBill={disableDirectBillPay}
              cardOnly
              parent={parent}
              hidePrimaryMessage={allowFolioSelect}
              descriptionRequired={descriptionRequired}
              currentFolioId={
                allowFolioSelect ? selectedFolioId : currentFolioId
              }
              currentMethodId={currentPaymentId}
              reservation={reservation}
              paymentMethods={paymentMethods ?? []}
              paySettings={settings}
              reservationLoading={false}
              totalsData={{
                subtotal: +amountNum,
                total: +amountNum,
                balance: +amountNum,
              }}
              folios={folios}
              onCompleteClick={handleOnComplete}
              onStripePaymentComplete={handleOnStripeComplete}
              forceLoadingWait={2000}
              payWithNewSettings={
                payWithNewSettings ?? {
                  disabled: disablePayWithNew,
                  message: disableNewMessage,
                }
              }
              hideTotals
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AdHocPaymentModal;

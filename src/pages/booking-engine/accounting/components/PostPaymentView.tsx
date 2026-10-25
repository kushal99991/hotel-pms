import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  DialogActions,
  DialogContent,
  Alert,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Label from "components/elements/Label/Label";
import CardListItem from "components/ui/CardListItem/CardListItem";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useMakePaymentMutation } from "services/paymentsSlice";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { PaymentCaptureTypeEnum } from "constants/payments";
import { wait } from "utils/common";
import { isValidMethod } from "utils/payments";
import { hasUserAddedMethods } from "utils/paymentMethods";
import { AccountModalViewProps } from "types/ui/accounting";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import DBAddMethod from "./DBAddMethod";

const LOADING_WAIT = 2000;

const PostPaymentView: React.FC<AccountModalViewProps> = ({
  onClose,
  onRefresh,
  account,
  accounts,
  paymentMethods,
}) => {
  const theme = useTheme();
  const [error, setError] = useState("");
  const [view, setView] = useState<"pay" | "select">("pay");
  const [createdCardId, setCreatedCardId] = useState<number | null>(null);
  const [forceCard, setForceCard] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [accountToCharge, setAccountToCharge] = useState<number | null>(
    account?.id ?? null
  );
  const [accountError, setAccountError] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<
    IPaymentMethodResponse | undefined
  >(getFallbackMethod(paymentMethods));
  const [invalidAmountMsg, setInvalidAmountMsg] = useState("");
  const [notes, setNotes] = useState("");
  const [makePayment] = useMakePaymentMutation();

  useEffect(() => {
    if (selectedPayment?.id === createdCardId) {
      return;
    }
    if (createdCardId && account?.payment_methods.length) {
      // a new card was added, refer to the original account methods
      // not the list of all available methods (including global)
      const fullMethod = account.payment_methods.find(
        (pm) => pm.id === createdCardId
      );
      if (fullMethod) {
        if (isValidMethod(fullMethod)) {
          setSelectedPayment(fullMethod);
        }
      }
    }
  }, [account, createdCardId, selectedPayment]);

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

  function handlePostClick() {
    if (successMessage) {
      onClose?.(true);
      return;
    }
    handlePost();
  }

  async function handlePost() {
    const amt = +amount;
    if (Number.isNaN(amt)) {
      setInvalidAmountMsg("Valid amount required");
      return;
    } else if (amt === 0 || amt < 0) {
      setInvalidAmountMsg("Amount should be greater than 0");
      return;
    }
    if (!accountToCharge) {
      setError("You must select an account to charge");
      return;
    }
    setLoading(true);
    const response = await makePayment({
      amount: amt,
      payment_method_id: selectedPayment?.id,
      description: notes ?? "",
      direct_billing_account_id: accountToCharge,
      capture_type: PaymentCaptureTypeEnum.IMMEDIATE,
    });
    if (response.error) {
      setError(
        `Error making payment: ${response.error.toString() ?? ""} Please try again.`
      );
      setLoading(false);
    } else if (response.data) {
      await wait(LOADING_WAIT);
      setLoading(false);
      const amount = response.data.amount;
      const messageString = amount
        ? `Payment for $${amount} successfully made!`
        : "Payment successful!";
      const msg = `${messageString} Click below to close.`;
      setSuccessMessage(msg);
    }
  }

  function handleCloseClick(successfulAdd?: boolean) {
    setError("");
    setAmount("");
    setNotes("");
    onClose?.(successfulAdd);
  }

  function handleMethodSelect(selected?: IPaymentMethodResponse) {
    if (selected) {
      setSelectedPayment(selected);
      setView("pay");
    }
  }

  function onAccountChange(evt: any) {
    setAccountError("");
    setAccountToCharge(evt.target.value);
  }

  function onNotesChange(evt: any) {
    setError("");
    setNotes(evt.target.value);
  }

  function onAmountChange(evt: any) {
    setError("");
    setInvalidAmountMsg("");
    setAmount(evt.target.value);
  }

  function handleDifferentCardClick() {
    setCreatedCardId(null);
    setView("select");
  }

  function handleAddCardNoMethods() {
    setView("select");
    setForceCard(true);
  }

  function handleCardAdded(newCard?: IPaymentMethodResponse) {
    setCreatedCardId(newCard?.id ?? null);
  }

  function handleCardAddComplete() {
    setView("pay");
    onRefresh?.();
  }

  function handleCloseAdd() {
    setView("pay");
  }

  function getActionButtonText() {
    if (successMessage) {
      return "Close";
    }
    if (loading) {
      return "Posting... ";
    }
    return "Post Payment";
  }
  const validMethods = (paymentMethods ?? []).filter(isValidMethod);
  const validMethodPresent = validMethods.length > 0;
  const accountId = account?.id;
  const hasAddedMethod = hasUserAddedMethods(validMethods);
  const cashOrCheckMethods = validMethods.filter(
    (m) =>
      m.payment_type === PaymentMethodTypesEnum.CASH ||
      m.payment_type === PaymentMethodTypesEnum.CHECK
  );
  const hasCashOrCheck = cashOrCheckMethods.length > 1;
  return (
    <DialogContent>
      {view === "select" && (
        <DBAddMethod
          accountId={accountId ?? -1}
          onAddSuccess={handleCardAdded}
          onAddComplete={handleCardAddComplete}
          selectedPaymentId={selectedPayment?.id}
          onPaymentSelect={handleMethodSelect}
          onBackClick={handleCloseAdd}
          paymentMethods={paymentMethods ?? []}
          initialView={forceCard ? "add" : undefined}
        />
      )}
      {view === "pay" && (
        <Box>
          <Grid container direction="column">
            {error && (
              <Alert
                sx={{ mb: 2 }}
                severity="error"
                onClose={() => {
                  setError("");
                }}
              >
                {error}
              </Alert>
            )}
            <Box>
              {accounts?.length && !accountId && (
                <CustomDropdown
                  label="Account"
                  placeholder="Select Account"
                  onChange={onAccountChange}
                  name="account"
                  value={accountToCharge}
                  isInvalid={!!accountError}
                  helperText={accountError ?? ""}
                  options={(accounts ?? []).map((a) => ({
                    label: `${a.billing_name} - ${a.id}`,
                    value: a.id.toString(),
                  }))}
                  fullWidth
                  aria-label="Post Payment Accounts"
                  data-testid="post-payment-accounts-dropdown"
                />
              )}
              {!accounts && account && (
                <Box textAlign="center">
                  <Label>Account</Label>
                  <Typography>{account.billing_name}</Typography>
                </Box>
              )}
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Box display="flex" alignItems="center" width="238px">
                <Typography fontWeight="bold">Amount: </Typography>
                <TextField
                  onChange={onAmountChange}
                  error={!!invalidAmountMsg}
                  helperText={invalidAmountMsg}
                  placeholder="0.00"
                  size="small"
                  value={amount}
                  InputProps={{
                    sx: { maxWidth: "140px" },
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  FormHelperTextProps={{
                    sx: { marginRight: 0, textAlign: "right" },
                  }}
                  sx={{
                    ml: 2,
                    width: "160px",
                    alignItems: "flex-end",
                    input: { textAlign: "right" },
                  }}
                />
              </Box>
            </Box>
            <Grid item mt={2}>
              <TextField
                multiline
                fullWidth
                rows={2}
                label="Notes"
                placeholder="Invoice No. / Payment  No. / Notes"
                onChange={onNotesChange}
                value={notes}
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
          <Box mt={2}>
            {!validMethodPresent && (
              <Box sx={{ fontStyle: "italic" }} textAlign="center">
                No payment methods have been added.
                <Box textAlign="center" mt={2}>
                  <Button
                    onClick={handleAddCardNoMethods}
                    variant="outlined"
                    startIcon={<Add />}
                  >
                    Add method
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          {validMethodPresent && selectedPayment && (
            <Grid container justifyContent="space-between">
              <Grid item>
                <CardListItem
                  paymentMethod={selectedPayment}
                  primaryPaymentMap={{}}
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
          )}
          {!hasAddedMethod && !selectedPayment && (
            <Grid mt={3} container direction="column" alignItems="center">
              <Grid item>
                <Typography
                  fontStyle="italic"
                  fontSize="0.875rem"
                  sx={{ color: "disabled" }}
                >
                  No payment methods have been added for this account. To pay
                  with a new card, first add an amount. If you want to add a
                  note, you must add it before clicking &quot;Pay With New
                  Card&quot;
                </Typography>
              </Grid>
              <Grid item mt={2}>
                <Button
                  onClick={handleAddCardNoMethods}
                  variant="contained"
                  color="secondary"
                  disabled={+amount <= 0}
                  startIcon={<Add />}
                >
                  Pay with New Card
                </Button>
              </Grid>
              {hasCashOrCheck && (
                <Grid item mt={2}>
                  <button
                    type="button"
                    onClick={handleDifferentCardClick}
                    style={{
                      textDecoration: "underline",
                      color: theme.palette.secondary.main,
                      fontSize: "0.875rem",
                    }}
                  >
                    Use Cash or Check
                  </button>
                </Grid>
              )}
            </Grid>
          )}
          {successMessage && (
            <Alert
              sx={{ my: 2 }}
              severity="success"
              onClose={() => {
                setSuccessMessage("");
              }}
            >
              {successMessage}
            </Alert>
          )}
          <DialogActions
            sx={{
              mt: 3,
              px: 0,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={() => {
                handleCloseClick();
              }}
              color="primary"
            >
              Cancel
            </Button>
            {selectedPayment && (
              <Button
                onClick={handlePostClick}
                variant="contained"
                disabled={loading || !validMethodPresent}
              >
                {getActionButtonText()}
              </Button>
            )}
          </DialogActions>
        </Box>
      )}
    </DialogContent>
  );
};

export default PostPaymentView;

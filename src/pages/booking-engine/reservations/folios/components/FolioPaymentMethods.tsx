import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Grid,
  Select,
  Typography,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Add, DeleteOutline, StarPurple500 } from "@mui/icons-material";
import { isActiveMethod, isValidMethod } from "utils/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";
import AddPaymentMethod from "components/ui/AddPaymentMethod/AddPaymentMethod";
import { ISimpleFolio } from "types/payments";
import { PaymentParent } from "types/ui/payments";
import CardLogo, {
  sizesFromBrandedHeight,
} from "components/ui/CardLogo/CardLogo";
import { getCardListDetailStrings } from "utils/paymentMethods";

interface FolioPaymentMethodsProps {
  primaryMethod?: IPaymentMethodResponse;
  paymentMethods: IPaymentMethodResponse[];
  parent?: PaymentParent;
  folio: ISimpleFolio;
  selectedPaymentId: number;
  reservationId: number;
  onPaymentSelection?: (pm?: IPaymentMethodResponse) => void;
  onAddSuccess?: () => void;
  onDelete?: (id: number) => void;
  onMakePrimary?: (id: number) => void;
  methodsLoading?: boolean;
  fetchMethods: any;
}

const FolioPaymentMethods: React.FC<FolioPaymentMethodsProps> = ({
  primaryMethod,
  paymentMethods,
  reservationId,
  parent,
  folio,
  selectedPaymentId,
  onPaymentSelection,
  onDelete,
  onMakePrimary,
  onAddSuccess,
  methodsLoading,
  fetchMethods,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardAdded, setCardAdded] = useState(false);

  function hasValidMethod() {
    const primaryValid = primaryMethod
      ? isValidMethod(primaryMethod) && isActiveMethod(primaryMethod)
      : false;
    let valid = primaryValid;
    if (!primaryValid && paymentMethods?.length) {
      const validMethodsFromData = paymentMethods.filter((pm) =>
        isValidMethod(pm)
      );
      valid = !!validMethodsFromData.length;
    }
    return valid;
  }
  function getMethods() {
    if (methodsLoading && !paymentMethods && primaryMethod) {
      if (isValidMethod(primaryMethod)) {
        return [primaryMethod];
      }
      return [];
    }
    if (!methodsLoading && paymentMethods) {
      return paymentMethods.filter((pm) => isValidMethod(pm));
    }
    return [];
  }
  function handleMethodSelect(evt: any) {
    const id = evt?.target?.value ?? -1;
    const selectedMethod = paymentMethods?.find((pm) => pm.id === id);
    onPaymentSelection?.(selectedMethod);
  }
  function handleAddClose() {
    if (cardAdded) {
      onAddSuccess?.();
      fetchMethods({
        reservation_id: reservationId,
      });
    }
    setCardAdded(false);
    setShowAddModal(false);
  }
  function handleAddSuccess() {
    setCardAdded(true);
  }
  function handleAddedContinueClick() {
    handleAddClose();
  }
  function handleDeleteClick(id: number) {
    return () => {
      onDelete?.(id);
    };
  }
  function handlePrimaryClick(id: number) {
    return () => {
      onMakePrimary?.(id);
    };
  }
  const validMethodPresent = hasValidMethod();
  return (
    <Box display="flex" alignItems="center">
      {validMethodPresent && (
        <Box>
          <Select
            defaultValue=""
            value={
              selectedPaymentId > 0
                ? selectedPaymentId.toString()
                : (primaryMethod?.id ?? "")
            }
            sx={{
              height: "38px",
              backgroundColor: "white",
              "& > .MuiInputBase-input": { py: "10px" },
            }}
            onChange={handleMethodSelect}
            renderValue={(selectedId) => {
              const fullMethod = paymentMethods.find(
                (pm) => pm.id === +selectedId
              );
              const { main } = getCardListDetailStrings(fullMethod);
              return (
                <Grid container alignItems="center">
                  <Grid item>
                    <CardLogo
                      isDirectBill={!!fullMethod?.direct_billing_account_id}
                      cardType={(fullMethod?.brand ?? "").toString()}
                      sizes={{
                        ...sizesFromBrandedHeight(24),
                        check: {
                          height: 26,
                        },
                      }}
                      paymentType={fullMethod?.payment_type}
                    />
                  </Grid>
                  <Grid item mx={2}>
                    <Typography
                      fontWeight="bold"
                      fontSize="0.875rem"
                      sx={{ textTransform: "uppercase" }}
                    >
                      {main}
                    </Typography>
                  </Grid>
                  {fullMethod?.id === primaryMethod?.id && (
                    <Chip
                      label="Primary"
                      size="small"
                      sx={{
                        height: "20px",
                        fontSize: "0.75rem",
                        color: "success.light",
                        backgroundColor: "white",
                        borderColor: "success.light",
                        border: "1px solid",
                      }}
                    />
                  )}
                </Grid>
              );
            }}
          >
            {getMethods().map((m) => {
              const { main } = getCardListDetailStrings(m);
              const actionsEnabled = !m.globally_avail;
              return (
                <MenuItem value={m.id} key={m.id}>
                  <Grid item container alignItems="center">
                    <Grid item>
                      <CardLogo
                        cardType={
                          m.direct_billing_account_id ? "" : m.brand?.toString()
                        }
                        sizes={sizesFromBrandedHeight(24)}
                        isDirectBill={!!m.direct_billing_account_id}
                        paymentType={m.payment_type}
                      />
                    </Grid>
                    <Grid item mx={2}>
                      <Typography
                        fontWeight="bold"
                        fontSize="0.875rem"
                        sx={{ textTransform: "uppercase" }}
                      >
                        {main}
                      </Typography>
                    </Grid>
                    {m.id === primaryMethod?.id && (
                      <Chip
                        label="Primary"
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "0.75rem",
                          color: "success.light",
                          backgroundColor: "white",
                          borderColor: "success.light",
                          border: "1px solid",
                        }}
                      />
                    )}
                  </Grid>
                  {actionsEnabled && (
                    <Box pl={1}>
                      {m.id !== primaryMethod?.id && (
                        <Button
                          aria-label="Make method a primary method"
                          onClick={handlePrimaryClick(m.id)}
                          sx={{
                            color: "secondary.main",
                            minWidth: "auto",
                            borderRadius: "50%",
                            padding: "6px",
                            mr: "4px",
                            "&:hover": {
                              color: "white",
                              backgroundColor: "secondary.main",
                            },
                          }}
                        >
                          <StarPurple500 fontSize="inherit" />
                        </Button>
                      )}
                      <Button
                        aria-label="Delete payment method"
                        onClick={handleDeleteClick(m.id)}
                        sx={{
                          color: "error.main",
                          minWidth: "auto",
                          borderRadius: "50%",
                          padding: "6px",
                          "&:hover": {
                            color: "white",
                            backgroundColor: "error.main",
                          },
                        }}
                      >
                        <DeleteOutline fontSize="inherit" />
                      </Button>
                    </Box>
                  )}
                </MenuItem>
              );
            })}
          </Select>
        </Box>
      )}
      {!validMethodPresent && (
        <Box sx={{ fontStyle: "italic" }}>No payment methods added</Box>
      )}
      <Tooltip title={validMethodPresent ? "" : "Add Payment Method"}>
        <Button
          variant="outlined"
          color="primary"
          sx={{ ml: 1, minWidth: 0, px: "6px", backgroundColor: "grey.100" }}
          onClick={() => {
            setShowAddModal(true);
          }}
        >
          <Add />
        </Button>
      </Tooltip>
      <Dialog
        open={showAddModal}
        PaperProps={{ sx: { width: "500px" } }}
        onClose={handleAddClose}
      >
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <AddPaymentMethod
            allowDirectBill
            noHeader
            addCardProps={{
              paymentMethods: paymentMethods ?? [],
              targetFolio: folio,
              targetReservationId: reservationId,
              onComplete: handleAddedContinueClick,
              onCardAdded: handleAddSuccess,
              noHeader: true,
              parent,
            }}
            directBillProps={{
              reservationId: reservationId,
              totalsData: { balance: 0 },
              paymentLabel: "Attach Direct Billing Account",
              onPaymentSuccessClick: handleAddedContinueClick,
              onMethodCreateSuccess: handleAddSuccess,
              parent,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ mx: 2, pb: 3 }}>
          <Button onClick={handleAddClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FolioPaymentMethods;

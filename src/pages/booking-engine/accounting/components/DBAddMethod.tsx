import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, Grid } from "@mui/material";
import AddPaymentMethod from "components/ui/AddPaymentMethod/AddPaymentMethod";
import CardListItem from "components/ui/CardListItem/CardListItem";
import { Add, ArrowBack } from "@mui/icons-material";
import { isValidMethod } from "utils/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";

interface DBAddMethodProps {
  onAddSuccess?: (newCard?: IPaymentMethodResponse) => void;
  onAddComplete?: () => void;
  onPaymentSelect?: (payment?: IPaymentMethodResponse) => void;
  paymentMethods: IPaymentMethodResponse[];
  accountId: number;
  selectedPaymentId?: number;
  onBackClick?: () => void;
  initialView?: "list" | "add";
}

const DBAddMethod: React.FC<DBAddMethodProps> = ({
  onAddSuccess,
  onAddComplete,
  accountId,
  paymentMethods,
  selectedPaymentId,
  onPaymentSelect,
  onBackClick,
  initialView,
}) => {
  const [view, setView] = useState<"list" | "add">(initialView ?? "list");
  const validMethods = paymentMethods?.filter((pm) => isValidMethod(pm));
  const otherMethods = validMethods?.filter(
    (pm) => pm.id !== selectedPaymentId
  );

  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);

  function handlePaymentChange(paymentMethod: IPaymentMethodResponse) {
    return () => {
      onPaymentSelect?.(paymentMethod);
    };
  }

  function handleAddBackClick() {
    setView("list");
  }

  function handleNewClick() {
    setView("add");
  }

  return (
    <Box>
      {view === "list" && (
        <Box>
          <Grid item>
            <IconButton aria-label="back" onClick={onBackClick}>
              <ArrowBack />
            </IconButton>
            Choose a Method to Pay with
          </Grid>
          <Box mt={2}>
            {(otherMethods ?? []).length < 1 && (
              <Box textAlign="center" color="grey.700" px={3}>
                You have no other payment methods available. Click the arrow to
                go back or click below to add a new method.
              </Box>
            )}
            {otherMethods?.map((pm) => {
              const isCashOrCheck =
                pm.payment_type === PaymentMethodTypesEnum.CASH ||
                pm.payment_type === PaymentMethodTypesEnum.CHECK;
              return (
                <Grid
                  container
                  key={`paymentMethod-${pm.id}`}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    "&:first-of-type": {
                      borderTop: "1px solid",
                      borderColor: "grey.500",
                    },
                    borderBottom: "1px solid",
                    borderColor: "grey.500",
                  }}
                >
                  <Grid item>
                    <CardListItem
                      key={pm.id}
                      paymentMethod={pm}
                      primaryPaymentMap={{}}
                    />
                  </Grid>
                  <Grid item display="flex">
                    <Button
                      onClick={handlePaymentChange(pm)}
                      variant="text"
                      color="secondary"
                    >
                      {isCashOrCheck ? "Use this method" : "Use this card"}
                    </Button>
                  </Grid>
                </Grid>
              );
            })}
            <Box textAlign="center" mt={3}>
              <Button
                onClick={handleNewClick}
                variant="outlined"
                startIcon={<Add />}
              >
                Add a new payment method
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      {view === "add" && (
        <AddPaymentMethod
          addCardProps={{
            paymentMethods,
            onComplete: onAddComplete,
            onCardAdded: onAddSuccess,
            onBackClick: handleAddBackClick,
            noHeader: false,
          }}
          dbAccountId={accountId}
        />
      )}
    </Box>
  );
};

export default DBAddMethod;

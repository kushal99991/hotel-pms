import React, { useEffect, useState } from "react";
import { Box, IconButton, Grid } from "@mui/material";
import { ArrowBack, CreditCard, RequestQuote } from "@mui/icons-material";
import AddCard, {
  AddCardProps,
} from "pages/booking-engine/reservations/components/ReservationDetail/components/PaymentMethod/AddCard";
import AddDirectBillPay from "../AddDirectBillPay/AddDirectBillPay";
import { AddDirectBillPayProps } from "types/ui/payments";
import { LCColors } from "theme/Colors";
import MethodTypeListItem from "../MethodTypeListItem/MethodTypeListItem";

export const SUB_VIEWS = {
  ADD_CARD: "ADD_CARD",
  DIRECT_BILL: "DIRECT_BILL",
  SELECTOR: "SELECTOR",
};

interface AddPaymentMethodProps {
  directBillProps?: AddDirectBillPayProps;
  addCardProps?: AddCardProps;
  allowDirectBill?: boolean;
  onBackClick?: () => void;
  noHeader?: boolean;
  dbAccountId?: number;
  selectedView?: "ADD_CARD" | "DIRECT_BILL" | "SELECTOR";
}

const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({
  directBillProps,
  addCardProps,
  allowDirectBill,
  onBackClick,
  noHeader,
  dbAccountId,
  selectedView,
}) => {
  const [currentView, setCurrentView] = useState<string>(
    allowDirectBill ? SUB_VIEWS.SELECTOR : SUB_VIEWS.ADD_CARD
  );

  useEffect(() => {
    if (selectedView && selectedView !== currentView) {
      setCurrentView(selectedView);
    }
  }, [selectedView]);

  function handleCreditClick() {
    setCurrentView(SUB_VIEWS.ADD_CARD);
  }

  function handleDBClick() {
    setCurrentView(SUB_VIEWS.DIRECT_BILL);
  }

  function handleSubViewBackClick() {
    setCurrentView(SUB_VIEWS.SELECTOR);
  }
  return (
    <Box>
      {!noHeader && currentView === SUB_VIEWS.SELECTOR && (
        <Grid container alignItems="center">
          {onBackClick && (
            <Grid item>
              <IconButton aria-label="back" onClick={onBackClick}>
                <ArrowBack />
              </IconButton>
            </Grid>
          )}
          <Grid item>Add Payment Method</Grid>
        </Grid>
      )}
      {currentView === SUB_VIEWS.SELECTOR && (
        <Box display="flex" flexDirection="column" mt={1}>
          <MethodTypeListItem
            onClick={handleCreditClick}
            icon={CreditCard}
            text="Add Credit Card"
            iconColor={LCColors.darkBlue}
          />
          <MethodTypeListItem
            onClick={handleDBClick}
            icon={RequestQuote}
            text="Attach Direct Billing Account"
            iconColor={LCColors.darkRed}
          />
        </Box>
      )}
      {currentView === SUB_VIEWS.ADD_CARD && (
        <Box>
          {allowDirectBill && (
            <Grid container alignItems="center">
              <Grid item>
                <IconButton aria-label="back" onClick={handleSubViewBackClick}>
                  <ArrowBack />
                </IconButton>
              </Grid>
              <Grid item>Select Method to add</Grid>
            </Grid>
          )}
          <AddCard
            dbAccountId={dbAccountId}
            noHeader={addCardProps?.noHeader ?? true}
            paymentMethods={addCardProps?.paymentMethods ?? []}
            {...addCardProps}
          />
        </Box>
      )}
      {currentView === SUB_VIEWS.DIRECT_BILL && (
        <Box>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton aria-label="back" onClick={handleSubViewBackClick}>
                <ArrowBack />
              </IconButton>
            </Grid>
            <Grid item>Select Method to add</Grid>
          </Grid>
          <AddDirectBillPay
            reservationId={directBillProps?.reservationId ?? -1}
            totalsData={directBillProps?.totalsData ?? { balance: 0 }}
            {...directBillProps}
          />
        </Box>
      )}
    </Box>
  );
};

export default AddPaymentMethod;

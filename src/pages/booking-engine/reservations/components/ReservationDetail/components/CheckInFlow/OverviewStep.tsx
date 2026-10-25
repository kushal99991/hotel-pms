import React from "react";
import { Alert, Box, Typography } from "@mui/material";
import { CheckinState } from "types/reservationCheckIn";

interface OverviewStepProps {
  checkInState?: CheckinState;
}

const OverviewStep: React.FC<OverviewStepProps> = ({ checkInState }) => {
  // only need to worry about external items to begin
  const outstandingItems = Object.values(checkInState ?? []).filter(
    (preReq) => !preReq.completed && preReq.external
  );
  const outstandingItemCount = outstandingItems.length;
  function renderOutstandingItemList() {
    if (outstandingItemCount === 1) {
      return outstandingItems[0].message;
    }
    return (
      <ul>
        {outstandingItems.map((i, idx) => (
          <li key={`outstanding-item_${idx}`}>{i.message}</li>
        ))}
      </ul>
    );
  }

  function renderPaymentMessage() {
    const paymentStep = checkInState?.paid;
    if (paymentStep?.completed && !paymentStep.message) {
      return (
        <Alert severity="warning">
          This reservation does not have a card or direct billing account
          attached. If you would like to add a payment method before check in
          click &quot;Edit&quot; in the &quot;Folio&quot; section
        </Alert>
      );
    }
    return null;
  }
  const message =
    outstandingItemCount > 0
      ? "Before you begin the Check-in process, go back and address the following:"
      : "Reservation is ready to begin checkin process";
  return (
    <Box textAlign="center">
      <Typography fontWeight="bold" mb={2}>
        {message}
      </Typography>
      {renderOutstandingItemList()}
      {renderPaymentMessage()}
    </Box>
  );
};

export default OverviewStep;

import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { currencyString } from "utils/helperFunctions/numbers";

interface AdHocNoPaymentProps {
  amount: number;
  onConfirmClick: () => void;
}

const AdHocNoPayment: React.FC<AdHocNoPaymentProps> = ({
  amount,
  onConfirmClick,
}) => {
  return (
    <Box mt={3} textAlign="center">
      <Typography variant="body2" fontStyle="italic" sx={{ color: "dimgray" }}>
        You have no payment methods available. To make a payment with a new
        payment method, enter a non-zero amount, click confirm, and add the
        method details.
      </Typography>
      <Button
        variant="contained"
        onClick={onConfirmClick}
        disabled={amount <= 0}
        sx={{ mt: 2 }}
      >{`Confirm amount of ${currencyString(amount)}`}</Button>
    </Box>
  );
};

export default AdHocNoPayment;

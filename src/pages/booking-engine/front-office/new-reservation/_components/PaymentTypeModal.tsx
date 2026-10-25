import {
  Dialog,
  Box,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import React from "react";
import { PaymentChargeTypeEnum } from "constants/payments";

interface PaymentTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const PaymentTypeModal: React.FC<PaymentTypeModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const formContextMethods = useFormContext();
  const { setValue, control } = formContextMethods;
  const paymentType = useWatch({
    control,
    name: "payment",
  });
  function handleRadioChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value;
    setValue("payment", val);
  }
  const disableCreation =
    paymentType !== PaymentChargeTypeEnum.FULL_PAYMENT &&
    paymentType !== PaymentChargeTypeEnum.PAY_AT_CHECKIN;
  return (
    <Dialog open={open} onClose={onClose}>
      <Box p={4}>
        <Typography variant="h6" mb={2}>
          Before creating the reservation designate how the customer wants to
          pay
        </Typography>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="female"
          name="radio-buttons-group"
          onChange={handleRadioChange}
        >
          <FormControlLabel
            value={PaymentChargeTypeEnum.FULL_PAYMENT}
            control={<Radio />}
            label="Pay in full right now"
          />
          <FormControlLabel
            value={PaymentChargeTypeEnum.PAY_AT_CHECKIN}
            control={<Radio />}
            label="Collect card information and pay later"
          />
        </RadioGroup>
        <Button
          fullWidth
          onClick={onSubmit}
          disabled={disableCreation}
          color="primary"
          variant="contained"
          sx={{ mt: 4 }}
        >
          Create Reservation
        </Button>
      </Box>
    </Dialog>
  );
};

export default PaymentTypeModal;

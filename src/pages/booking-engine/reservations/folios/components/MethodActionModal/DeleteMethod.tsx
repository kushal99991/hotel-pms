import React, { useState } from "react";
import { Alert, Button, Box, DialogActions, Typography } from "@mui/material";
import { useUpdatePaymentMethodMutation } from "services/paymentsSlice";
import { IPaymentMethodResponse } from "types/reservationTypes";

interface DeleteMethodProps {
  paymentMethod?: IPaymentMethodResponse;
  refreshMethods?: () => void;
  onClose?: () => void;
  closeButtonText?: string;
}

const DeleteMethod: React.FC<DeleteMethodProps> = ({
  paymentMethod,
  refreshMethods,
  onClose,
  closeButtonText,
}) => {
  const [deleteError, setDeleteError] = useState("");
  const [updateMethod] = useUpdatePaymentMethodMutation();

  async function handleDelete() {
    const updatePaymentMethodResponse = await updateMethod({
      id: paymentMethod?.id ?? -1,
      future_use: false,
    });
    if (updatePaymentMethodResponse.data) {
      refreshMethods?.();
      onClose?.();
    } else if (updatePaymentMethodResponse.error) {
      setDeleteError(updatePaymentMethodResponse.error.toString());
    }
  }
  function handleCloseClick() {
    setDeleteError("");
    onClose?.();
  }
  return (
    <Box height="100%">
      {deleteError && (
        <Alert
          sx={{ mb: 2 }}
          severity="error"
          onClose={() => {
            setDeleteError("");
          }}
        >
          {`Error deleting payment method: ${deleteError}.`}
        </Alert>
      )}
      <Box mb={2}>
        <Typography>
          Are you sure you want to remove this payment method?
        </Typography>
        <Typography color="error">
          {"(This will remove the method for ALL folios in this reservation.)"}
        </Typography>
      </Box>
      <DialogActions>
        <Button variant="outlined" onClick={handleCloseClick}>
          {closeButtonText ?? "Close"}
        </Button>
        <Button variant="contained" onClick={handleDelete} color="error">
          Remove
        </Button>
      </DialogActions>
    </Box>
  );
};

export default DeleteMethod;

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import TextButton from "./TextButton";

import { IReservationResponse } from "types/reservationTypes";
import { useUpdateReservationMutation } from "services/reservationSlice";

interface SpecialRequestProps {
  reservation: IReservationResponse | null;
  refetchReservation: (() => void) | undefined;
}

const SpecialRequests: React.FC<SpecialRequestProps> = ({
  reservation,
  refetchReservation,
}) => {
  const [updateReservation, { isLoading: reservationUpdating }] =
    useUpdateReservationMutation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [requestText, setRequestText] = useState(
    reservation?.special_requests ?? ""
  );

  useEffect(() => {
    setRequestText(reservation?.special_requests ?? "");
  }, [reservation]);

  const handleEditClick = () => {
    setShowEditModal(!showEditModal);
  };

  const onTextFieldChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setRequestText(evt.target.value);
  };

  const handleCloseModal = () => {
    setRequestText(reservation?.special_requests ?? "");
    setErrorMessage("");
    setShowEditModal(false);
  };

  const handleSaveClick = () => {
    updateReservation({
      id: reservation?.id,
      booking_channel: reservation?.booking_channel ?? "",
      special_requests: requestText,
    }).then((resp) => {
      if (!resp.error) {
        refetchReservation?.();
        setShowEditModal(false);
      } else {
        let errorMessage = "Error saving data. Please try again";
        if (resp.error.message) {
          errorMessage = resp.error.message;
        } else if (resp.error) {
          errorMessage = resp.error as string;
        }
        setErrorMessage(errorMessage);
      }
    });
  };

  return (
    <Box display="flex" justifyContent="space-between">
      <Typography variant="body1">
        {reservation?.special_requests || "No special requests given"}
      </Typography>
      <Box display="flex" alignItems="flex-start" marginTop="-6px">
        <TextButton onClick={handleEditClick}>Edit</TextButton>
      </Box>
      <Dialog
        open={showEditModal}
        PaperProps={{ sx: { minWidth: "400px" } }}
        onClose={handleCloseModal}
      >
        <DialogTitle>Edit Special Request</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            value={requestText}
            onChange={onTextFieldChange}
            inputRef={(input) => input && input.focus()}
            onFocus={(e) =>
              e.currentTarget.setSelectionRange(
                e.currentTarget.value.length,
                e.currentTarget.value.length
              )
            }
            InputProps={{
              sx: { minHeight: "100px", alignItems: "flex-start" },
            }}
            multiline
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button color="primary" variant="outlined" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button color="primary" variant="contained" onClick={handleSaveClick}>
            {reservationUpdating ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpecialRequests;

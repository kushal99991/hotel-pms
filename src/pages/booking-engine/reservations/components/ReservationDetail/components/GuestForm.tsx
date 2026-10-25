import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useWatch, useFormContext } from "react-hook-form";
import FormTextField from "components/forms/FormTextField";
import { useUpdateGuestMutation } from "services/guestSlice";
import { IGuestResponse } from "types/reservationTypes";

interface GuestFormProps {
  guestIndex: number;
  guestData?: IGuestResponse;
  reservationHolderId: number;
  onCancel?: () => void;
  onUpdateSuccess?: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({
  guestIndex,
  guestData,
  reservationHolderId,
  onCancel,
  onUpdateSuccess,
}) => {
  const isReservationHolder = guestData?.id === reservationHolderId;
  const { getValues, setValue, control, getFieldState } = useFormContext();
  const formName = isReservationHolder
    ? "reservationHolder"
    : `guestList.${guestIndex}`;
  const guest = useWatch({
    control,
    name: formName,
  });
  const [updateGuest, { isLoading }] = useUpdateGuestMutation();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSaveGuest() {
    const updatedGuest = getValues(formName);
    const guestFieldState = getFieldState(formName);
    if (guestFieldState.invalid || guestFieldState.error) {
      return;
    }
    const response = await updateGuest({
      id: guest.id,
      first_name: updatedGuest.first_name,
      last_name: updatedGuest.last_name,
      email: updatedGuest.email,
      vip: updatedGuest.vip,
    });
    if (response.error) {
      setErrorMessage(response.error.toString());
    } else if (response.data) {
      const responseGuest = response.data;
      // Use local vip value since API response doesn't include it
      setValue(
        formName,
        {
          ...guest,
          first_name: responseGuest.first_name,
          last_name: responseGuest.last_name,
          email: responseGuest.email,
          vip: updatedGuest.vip,
        },
        { shouldDirty: true, shouldTouch: true, shouldValidate: true }
      );
      onUpdateSuccess?.();
    }
  }

  function handleCancel() {
    setValue(
      formName,
      {
        ...guest,
        first_name: guestData?.first_name,
        last_name: guestData?.last_name,
        email: guestData?.email,
      },
      { shouldValidate: true }
    );
    setErrorMessage("");
    onCancel?.();
  }
  return (
    <Box padding={2}>
      <Box display="flex">
        <Typography variant="h5">
          {isReservationHolder ? "Booker" : `Secondary Guest ${guestIndex + 1}`}
        </Typography>
      </Box>
      {errorMessage && (
        <Alert severity="error">{`${errorMessage}. Please try again`}</Alert>
      )}
      <FormTextField
        name={`${formName}.first_name`}
        label="First Name"
        required
        gridProps={{
          marginTop: 2,
          sm: 12,
        }}
      />
      <FormTextField
        name={`${formName}.last_name`}
        label="Last Name"
        required
        gridProps={{
          marginTop: 3,
          sm: 12,
        }}
      />
      <FormTextField
        name={`${formName}.email`}
        label="Email"
        gridProps={{
          marginTop: 3,
          sm: 12,
        }}
      />
      <Box mt={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(guest?.vip)}
              onChange={(_, checked) =>
                setValue(`${formName}.vip`, checked, {
                  shouldDirty: true,
                  shouldValidate: false,
                })
              }
              size="small"
            />
          }
          label="VIP"
        />
      </Box>
      <Box mt={2.5} display="flex" justifyContent="flex-end">
        <Button
          onClick={handleCancel}
          color="error"
          variant="outlined"
          size="small"
          sx={{ marginRight: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveGuest}
          color="success"
          variant="contained"
          size="small"
        >
          {isLoading ? <CircularProgress /> : "Save"}
        </Button>
      </Box>
    </Box>
  );
};

export default GuestForm;

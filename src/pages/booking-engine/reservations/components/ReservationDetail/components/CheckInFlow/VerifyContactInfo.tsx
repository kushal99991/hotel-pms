import React from "react";
import { Box, Button, Grid, Typography, CircularProgress } from "@mui/material";
import FormTextField from "components/forms/FormTextField";
import { useWatch, useFormContext } from "react-hook-form";
import { IReservationResponse } from "types/reservationTypes";

interface VerifyContactInfoProps {
  editing: boolean;
  loading?: boolean;
  onEditUpdate: (isEditing: boolean) => void;
  onUpdate: () => void;
  reservation?: IReservationResponse;
}

const VerifyContactInfo: React.FC<VerifyContactInfoProps> = ({
  editing,
  onEditUpdate,
  onUpdate,
  loading,
}) => {
  const { control, getFieldState } = useFormContext();
  const firstname = useWatch({
    control,
    name: "first_name",
  });
  const lastname = useWatch({
    control,
    name: "last_name",
  });
  const email = useWatch({
    control,
    name: "email",
  });
  function handleSaveGuest() {
    const firstnameState = getFieldState("first_name");
    const lastnameState = getFieldState("last_name");
    const emailState = getFieldState("email");
    const firstNameFailed = firstnameState.error || firstnameState.invalid;
    const lastNameFailed = lastnameState.error || lastnameState.invalid;
    const emailFailed = emailState.error || emailState.invalid;
    if (firstNameFailed || lastNameFailed || emailFailed) {
      return;
    }
    onUpdate();
  }
  if (editing) {
    return (
      <Box padding={2}>
        <Grid container spacing={2}>
          <FormTextField name="first_name" label="First Name" required />
          <FormTextField name="last_name" label="Last Name" required />
        </Grid>
        <FormTextField
          name="email"
          label="Email"
          required
          gridProps={{
            marginTop: 3,
            sm: 12,
          }}
        />
        <Box mt={2.5} display="flex" justifyContent="flex-end">
          <Button
            onClick={() => onEditUpdate(false)}
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
            {loading ? <CircularProgress /> : "Save"}
          </Button>
        </Box>
      </Box>
    );
  }
  return (
    <Box>
      <Box textAlign="center">
        <Typography fontWeight="bold" mb={2}>
          Verify that the guest&apos;s information is correct using a form of id
        </Typography>
      </Box>
      <Box>
        <Box>
          <Typography
            fontSize="1.2rem"
            fontWeight="bold"
            display="inline-block"
            mr={2}
          >
            Name:{" "}
          </Typography>
          <span
            style={{ fontSize: "1.2rem" }}
          >{`${firstname} ${lastname}`}</span>
        </Box>
        <Box>
          <Typography
            fontSize="1.2rem"
            fontWeight="bold"
            display="inline-block"
            mr={2}
          >
            Email:{" "}
          </Typography>
          <span style={{ fontSize: "1.2rem" }}>{email}</span>
        </Box>
      </Box>
      <Box textAlign="right">
        <Button
          onClick={() => {
            onEditUpdate(true);
          }}
          variant="text"
          color="secondary"
          size="small"
        >
          Update Contact Information
        </Button>
      </Box>
    </Box>
  );
};

export default VerifyContactInfo;

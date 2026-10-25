import React, { useState } from "react";
import { Grid, TextField, Typography, IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changeEmailSchema } from "utils/validations.utils";
import useAuth from "hooks/useAuth";
import { useUpdateUserEmailMutation } from "services/userSlice";
import SecondaryButton from "components/elements/Button/SecondaryButton";

const ChangeEmail: React.FC = () => {
  const { users, onRefreshToken } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(changeEmailSchema),
    defaultValues: {
      email: users?.email || "",
      emailVerify: "",
    },
  });
  const [updateUserEmail, { isLoading }] = useUpdateUserEmailMutation();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdateClick = async (data: {
    email: string;
    emailVerify: string;
  }) => {
    const response = await updateUserEmail({ email: data.email });
    if (response.error) {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      return false;
    }
    // After saving, reset editing state and clear form fields
    setIsEditing(false);
    reset({ email: data.email, emailVerify: "" });
    onRefreshToken(false);
  };

  const email = watch("email");

  return (
    <>
      {isEditing ? (
        <form onSubmit={handleSubmit(handleUpdateClick)}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={3}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email?.message as React.ReactNode}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="emailVerify"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Email"
                    type="email"
                    variant="outlined"
                    error={!!errors.emailVerify}
                    helperText={
                      errors.emailVerify ? errors.emailVerify.message : ""
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <PrimaryButton
                  isLoading={isLoading}
                  loadingText="Loading..."
                  label="Save"
                  type="submit"
                />
                <SecondaryButton
                  label="Cancel"
                  variant="contained"
                  isLoading={false}
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </form>
      ) : (
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs>
            <Typography variant="h6">{email}</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={handleEditClick} color="primary">
              <EditIcon />
            </IconButton>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default ChangeEmail;

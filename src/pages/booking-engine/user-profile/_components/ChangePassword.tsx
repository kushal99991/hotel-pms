import React, { useState } from "react";
import { Grid, Typography, IconButton, Box, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "utils/validations.utils";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import { useChangeUserPasswordMutation } from "services/userSlice";
import useAuth from "hooks/useAuth";
import SecondaryButton from "components/elements/Button/SecondaryButton";

const ChangePassword: React.FC = () => {
  const { onRefreshToken } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setError,
  } = useForm({
    mode: "all",
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      passwordVerify: "",
    },
  });
  const [changeUserPassword, { isLoading }] = useChangeUserPasswordMutation();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdateClick = async (data: {
    oldPassword: string;
    newPassword: string;
    passwordVerify: string;
  }) => {
    const response = await changeUserPassword({
      password: data.oldPassword,
      new_password: data.newPassword,
    });
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
    reset();
    onRefreshToken(false);
  };

  return (
    <>
      {errors?.root && <Alert severity="error">{errors.root.message}</Alert>}
      {isEditing ? (
        <Grid container alignItems="center" gap={2}>
          <Grid item xs={12} md={3}>
            <Controller
              name="oldPassword"
              control={control}
              render={({ field, fieldState: { invalid, error } }) => (
                <CustomTextInput
                  {...field}
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  isInvalid={invalid}
                  helperText={error?.message ?? ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Controller
              name="newPassword"
              control={control}
              render={({ field, fieldState: { invalid, error } }) => (
                <CustomTextInput
                  {...field}
                  fullWidth
                  label="New Password"
                  type="password"
                  variant="outlined"
                  isInvalid={invalid}
                  helperText={error?.message ?? ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Controller
              name="passwordVerify"
              control={control}
              render={({ field, fieldState: { invalid, error } }) => (
                <CustomTextInput
                  {...field}
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  isInvalid={invalid}
                  helperText={error?.message ?? ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <PrimaryButton
                isLoading={isLoading}
                loadingText="Loading..."
                onClick={handleSubmit(handleUpdateClick)}
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
      ) : (
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs>
            <Typography variant="h6">***********</Typography>
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

export default ChangePassword;

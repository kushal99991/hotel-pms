"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useState } from "react";
import { Alert, Box, Grid, styled, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import PermissionCheckboxGroup from "./PermissionCheckboxGroup";
import { addRoleValidationSchema } from "utils/validations.utils";
import { useCreateRoleMutation } from "services/roleSlice";
import { IAddRoleRequest } from "types/authTypes";
import { defaultPermssionList } from "constants/roles";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";

const AddRole: React.FC = () => {
  const Navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createRole, { isLoading: isSubmitLoading }] = useCreateRoleMutation();

  const methods = useForm<IAddRoleRequest>({
    mode: "all",
    resolver: yupResolver(addRoleValidationSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    reset,
  } = methods;

  const onSubmit = useCallback(
    async (data: IAddRoleRequest) => {
      const response = await createRole(data);
      if (response.error) {
        if (typeof response.error?.message === "string") {
          setError("root", {
            type: "manual",
            message: response.error?.message,
          });
        }
        setSuccessMessage(null);
        return false;
      }
      reset();
      setSuccessMessage("Role added successfully!");
      Navigate("/booking-engine/admin/role-management");
    },
    [createRole, reset, Navigate, setError]
  );

  return (
    <MainWrapper>
      <Typography variant="h6" gutterBottom>
        Add Role Permission
      </Typography>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container style={{ height: "100vh" }}>
            <Grid item md={6} p={2}>
              {errors?.root && (
                <Alert severity="error">{errors.root.message}</Alert>
              )}
              {successMessage && (
                <Alert severity="success" data-testid="success-message">
                  {successMessage}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, isDirty, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid || !isDirty}
                        label="Role Name"
                        placeholder="Enter Role Name"
                        onChange={(
                          event: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => onChange(event.target.value)}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "ame-input" }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: "At least one option must be selected" }}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => {
                      // Convert the comma-separated string back to an array for the UI
                      const selectedValues = value ? value.split(",") : [];

                      return (
                        <Box>
                          <PermissionCheckboxGroup
                            label="Role Description"
                            defaultPermissionList={defaultPermssionList}
                            selectedValues={selectedValues}
                            onChange={onChange}
                            error={error}
                          />
                        </Box>
                      );
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PrimaryButton
                      label="Back"
                      buttonStyles={{
                        backgroundColor: "#F5F5F5",
                        color: "#000",
                        fontWeight: "bold",
                      }}
                      isLoading={false}
                      type="button"
                      onClick={() =>
                        Navigate("/booking-engine/admin/role-management")
                      }
                    />
                    <PrimaryButton
                      label="Save"
                      buttonStyles={{
                        backgroundColor: "#32A1AE",
                        color: "#FFFFFF",
                        fontWeight: "bold",
                      }}
                      isLoading={isSubmitLoading}
                      type="submit"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </MainWrapper>
  );
};

export default AddRole;

const MainWrapper = styled(Box)(() => ({
  margin: "15px 0PX",
  borderRadius: "1px",
  border: "1px",
}));

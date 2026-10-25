"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, Grid, styled, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { editRoleValidationSchema } from "utils/validations.utils";
import { useEditRoleMutation, useGetRoleByIdQuery } from "services/roleSlice";
import { IEditRoleRequest } from "types/authTypes";
import { defaultPermssionList } from "constants/roles";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate, useParams } from "react-router-dom";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PermissionCheckboxGroup from "../add/component/PermissionCheckboxGroup";

const EditRole: React.FC = () => {
  const Navigate = useNavigate();
  const params = useParams();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editRole, { isLoading: isSubmitLoading }] = useEditRoleMutation();
  const { data: roleDetails } = useGetRoleByIdQuery({
    id: params?.id as string,
  });

  const methods = useForm<IEditRoleRequest>({
    mode: "all",
    resolver: yupResolver(editRoleValidationSchema),
    defaultValues: {
      name: "",
      description: "",
      id: params?.id,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    reset,
    setValue,
  } = methods;

  useEffect(() => {
    if (roleDetails?.data) {
      setValue("name", roleDetails?.data?.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("description", roleDetails?.data?.description, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [roleDetails, setValue]);

  const onSubmit = useCallback(
    async (data: IEditRoleRequest) => {
      const response = await editRole(data);
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
    [editRole, reset, Navigate, setError]
  );

  return (
    <MainWrapper>
      <Typography variant="h6" gutterBottom>
        Edit Role Permission
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
                        Navigate("/booking-engine/admin/user-management")
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

export default EditRole;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));

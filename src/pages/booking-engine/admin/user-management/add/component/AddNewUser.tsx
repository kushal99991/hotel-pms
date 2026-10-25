"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useState } from "react";
import { Alert, Box, Grid, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { addUserValidationSchema } from "utils/validations.utils";
import { useAddUserMutation } from "services/userSlice";
import { useGetPropertiesQuery } from "services/propertySlice";
import { useRoleQuery } from "services/roleSlice";
import { useGetDepartmentQuery } from "services/departmentSlice";
import { IAddUserRequest, Role, Department } from "types/authTypes";
import { IProperty } from "types/property";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import FormTextField from "components/forms/FormTextField";
import useAuth from "hooks/useAuth";

const AddUser: React.FC = () => {
  const Navigate = useNavigate();
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addUser, { isLoading: isSubmitLoading }] = useAddUserMutation();
  const { data: propertyList } = useGetPropertiesQuery();
  const { data: departmentList } = useGetDepartmentQuery(
    {
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );
  const { data: roleList } = useRoleQuery({});

  const methods = useForm<IAddUserRequest>({
    mode: "all",
    resolver: yupResolver(addUserValidationSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      department: "",
      role: "",
      property: "",
      firstName: "",
      lastName: "",
      isActive: "1",
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
    async (data: IAddUserRequest) => {
      const response = await addUser(data);
      if (response.error) {
        setError("root", {
          type: "manual",
          message: "Error creating user",
        });
        setSuccessMessage(null);
        return false;
      }
      reset();
      setSuccessMessage("User added successfully!");
      Navigate("/booking-engine/admin/user-management");
    },
    [addUser, reset, Navigate, setError]
  );

  const propertyOptionList = (propertyList?.data ?? []).map((a: IProperty) => ({
    label: a.name,
    value: a?.id?.toString() ?? "",
  }));

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Add User
      </Typography>
      <FormProvider {...methods}>
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
              <FormTextField
                name="firstName"
                sm={6}
                label="First Name"
                textFieldProps={{
                  fullWidth: true,
                  placeholder: "Enter First Name",
                  inputProps: { "data-testid": "first-name-input" },
                }}
                required
                gridProps={{ mb: 2 }}
              />
              <FormTextField
                name="lastName"
                sm={6}
                label="Last Name"
                textFieldProps={{
                  fullWidth: true,
                  placeholder: "Enter Last Name",
                  inputProps: { "data-testid": "last-name-input" },
                }}
                required
                gridProps={{ mb: 2 }}
              />
              <FormTextField
                name="userName"
                sm={6}
                label="User Name"
                textFieldProps={{
                  fullWidth: true,
                  placeholder: "Enter User Name",
                  type: "text",
                  inputProps: { "data-testid": "username-input" },
                }}
                required
                gridProps={{ mb: 2 }}
              />
              <FormTextField
                name="email"
                sm={6}
                label="Email"
                textFieldProps={{
                  fullWidth: true,
                  placeholder: "Enter Email",
                  type: "email",
                  inputProps: { "data-testid": "email-input" },
                }}
                required
                gridProps={{ mb: 2 }}
              />
              <Grid item xs={12} md={12}>
                <Controller
                  name="password"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { invalid, error },
                  }) => (
                    <CustomTextInput
                      fullWidth
                      value={value}
                      isInvalid={invalid}
                      label="Password"
                      type="password"
                      placeholder="Enter Password"
                      onChange={(
                        event: React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >
                      ) => onChange(event.target.value)}
                      helperText={error?.message ?? ""}
                      inputProps={{ "data-testid": "password-input" }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <Controller
                  name="department"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { invalid, error },
                  }) => (
                    <CustomDropdown
                      label="Department"
                      placeholder="Select Department"
                      onChange={onChange}
                      value={value}
                      isInvalid={invalid}
                      helperText={error?.message ?? ""}
                      options={(departmentList?.data ?? []).map(
                        (department: Department) => ({
                          label: department?.department_name,
                          value: department?.id?.toString(),
                        })
                      )}
                      fullWidth
                      aria-label="Department"
                      data-testid="department-dropdown"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <Controller
                  name="role"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { invalid, error },
                  }) => (
                    <CustomDropdown
                      label="Role"
                      placeholder="Select Role"
                      onChange={onChange}
                      value={value}
                      isInvalid={invalid}
                      helperText={error?.message ?? ""}
                      options={(roleList ?? []).map((role: Role) => ({
                        label: role?.name,
                        value: role?.id?.toString(),
                      }))}
                      fullWidth
                      aria-label="Role"
                      data-testid="role-dropdown"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <Controller
                  name="property"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { invalid, error },
                  }) => (
                    <CustomDropdown
                      label="Property List"
                      placeholder="Select Property"
                      onChange={onChange}
                      value={value}
                      isInvalid={invalid}
                      helperText={error?.message ?? ""}
                      options={propertyOptionList}
                      fullWidth
                      aria-label="Property"
                      data-testid="property-dropdown"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { invalid, error },
                  }) => (
                    <CustomDropdown
                      label="User Status"
                      placeholder="Select"
                      onChange={onChange}
                      value={value}
                      isInvalid={invalid}
                      helperText={error?.message ?? ""}
                      options={[
                        { label: "Active", value: "1" },
                        { label: "In-Active", value: "2" },
                      ]}
                      fullWidth
                      aria-label="Property"
                      data-testid="status-dropdown"
                    />
                  )}
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
                    data-testid="back-button"
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
                    data-testid="save-button"
                    onClick={handleSubmit(onSubmit)}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default AddUser;

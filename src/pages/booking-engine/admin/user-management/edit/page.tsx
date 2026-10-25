"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  styled,
  Typography,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { updateUserValidationSchema } from "utils/validations.utils";
import {
  useUpdateUserMutation,
  useGetUserByidMutation,
  useUserDepartmentAssignMutation,
  useUserDepartmentRemoveMutation,
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
} from "services/userSlice";
import { useGetPropertiesQuery } from "services/propertySlice";
import { useRoleQuery } from "services/roleSlice";
import { useGetDepartmentQuery } from "services/departmentSlice";
import { Department, IUpdateUserRequest } from "types/authTypes";
import { IProperty } from "types/property";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate, useParams } from "react-router-dom";
import { Stack } from "@mui/system";
import ComboBox, { TComboBoxOptions } from "components/widgets/Form/ComboBox";
import ReservationDetailBox from "pages/booking-engine/reservations/components/ReservationDetail/components/ReservationDetailBox";
import useAuth from "hooks/useAuth";

const EditUser: React.FC = () => {
  const Navigate = useNavigate();
  const params = useParams();
  const { users } = useAuth();

  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );
  const [departmentAccess, setDepartmentAccess] = useState<number[]>([]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updateUser, { isLoading: isSubmitLoading }] = useUpdateUserMutation();
  const [getUserByid, { data: userDetail }] = useGetUserByidMutation();
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
  const [userDepartmentAssign, { isLoading: isAssignDepartmentLoading }] =
    useUserDepartmentAssignMutation();
  const [userDepartmentRemove] = useUserDepartmentRemoveMutation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [assignUserRole] = useAssignUserRoleMutation();
  const [removeUserRole] = useRemoveUserRoleMutation();

  const optionList: TComboBoxOptions[] = useMemo(() => {
    const dataT = (departmentList?.data ?? [])
      .filter(
        (department: Department) =>
          !departmentAccess.includes(Number(department.id))
      )
      .map((department: Department) => ({
        label: department?.department_name,
        id: department.id?.toString() ?? "",
      }));
    if (dataT.length > 0) {
      return [{ label: "Select Department", id: "" }, ...dataT];
    }
    return dataT;
  }, [departmentList, departmentAccess]);

  const selectDepartment = useMemo(() => {
    return optionList.find((a) => a.id === selectedDepartment?.toString());
  }, [optionList, selectedDepartment]);

  useEffect(() => {
    if (params?.id) {
      getUserByid({ id: params.id as string });
    }
  }, [params?.id]);

  useEffect(() => {
    if (userDetail) {
      const DA = userDetail.departments?.map((dept) => dept.id) ?? [];
      setDepartmentAccess(DA);
    }
  }, [userDetail]);

  useEffect(() => {
    const ids = userDetail?.roles?.map((item) => item.id);
    setSelectedIds(ids || []);
  }, [userDetail]);

  const methods = useForm<IUpdateUserRequest>({
    mode: "all",
    resolver: yupResolver(updateUserValidationSchema),
    defaultValues: {
      userName: "",
      email: "",
      property: "",
      firstName: "",
      lastName: "",
      isActive: "",
      id: params?.id?.toString(),
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
    if (userDetail) {
      setValue("userName", userDetail?.userName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("email", userDetail?.email, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("property", userDetail?.defaultPropertyId?.toString(), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("firstName", userDetail?.firstName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("lastName", userDetail?.lastName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("isActive", userDetail.isActive ? "1" : "2", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [userDetail, setValue]);

  const handleAddDepartment = async () => {
    if (selectedDepartment !== null && userDetail) {
      const resp = await userDepartmentAssign({
        user_id: userDetail.id,
        department_id: selectedDepartment,
      }).unwrap();

      if (resp.error) {
        setError("root", {
          type: "manual",
          message: resp.error as string,
        });
        return false;
      }
      setSelectedDepartment(null);
      getUserByid({ id: params.id as string });
      setError("root", {
        type: "manual",
        message: "",
      });
    }
  };

  const handleRemoveDepartment = async (departmentId: number) => {
    if (userDetail) {
      const resp = await userDepartmentRemove({
        user_id: userDetail.id,
        department_id: departmentId,
      }).unwrap();

      if (resp.error) {
        setError("root", {
          type: "manual",
          message: resp.error as string,
        });
        return false;
      }

      setSelectedDepartment(null);
      getUserByid({ id: params.id as string });
      setError("root", {
        type: "manual",
        message: resp.error as string,
      });
    }
  };

  const assignApiCall = async (id: number, isChecked: boolean) => {
    if (isChecked) {
      const data = {
        user: userDetail?.id?.toString() ?? "",
        roles: id.toString(),
      };
      const response = await assignUserRole(data);
      if (response.error) {
        return false;
      }
      getUserByid({ id: params.id as string });
    } else {
      const data = {
        user: userDetail?.id?.toString() ?? "",
        roles: id.toString(),
      };
      const response = await removeUserRole(data);
      if (response.error) {
        return false;
      }
      getUserByid({ id: params.id as string });
    }

    // You can implement your actual API call here, e.g., using fetch or axios
  };

  // Handle checkbox change
  const handleCheckboxChange =
    (id: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;

      // Update the selectedIds state (optional, for UI tracking)
      setSelectedIds((prevSelectedIds) =>
        isChecked
          ? [...prevSelectedIds, id]
          : prevSelectedIds.filter((selectedId) => selectedId !== id)
      );

      // Call the API with the checkbox id and its new state
      assignApiCall(id, isChecked);
    };

  const onSubmit = useCallback(
    async (data: IUpdateUserRequest) => {
      const response = await updateUser(data);
      if (response.error) {
        setError("root", {
          type: "manual",
          message: "Error updating user",
        });
        setSuccessMessage(null);
        return false;
      }
      reset();
      setSuccessMessage("User updated successfully!");
      Navigate("/booking-engine/admin/user-management");
    },
    [updateUser, reset, Navigate, setError]
  );

  const propertyOptionList = (propertyList?.data ?? []).map((a: IProperty) => ({
    label: a.name,
    value: a?.id?.toString() ?? "",
  }));

  return (
    <MainWrapper>
      <Typography variant="h6" gutterBottom>
        Edit User
      </Typography>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container style={{ height: "100vh" }}>
            <Grid item md={6} p={2}>
              {errors?.root?.message && (
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
                    name="userName"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, isDirty, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid || !isDirty}
                        label="User Name"
                        placeholder="Enter User Name"
                        onChange={(
                          event: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => onChange(event.target.value)}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "username-input" }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, isDirty, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid || !isDirty}
                        label="First Name"
                        placeholder="Enter First Name"
                        onChange={(
                          event: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => onChange(event.target.value)}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "firstname-input" }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, isDirty, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid || !isDirty}
                        label="Last Name"
                        placeholder="Enter Last Name"
                        onChange={(
                          event: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => onChange(event.target.value)}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "lastname-input" }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <Controller
                    name="email"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, isDirty, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid || !isDirty}
                        label="Email"
                        placeholder="Enter Email"
                        onChange={(
                          event: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => onChange(event.target.value)}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "email-input" }}
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
                      fieldState: { invalid, isDirty, error },
                    }) => (
                      <CustomDropdown
                        label="Property List"
                        placeholder="Select Property"
                        onChange={onChange}
                        value={value}
                        isInvalid={invalid || !isDirty}
                        helperText={error?.message ?? ""}
                        options={propertyOptionList}
                        fullWidth
                        aria-label="Property"
                        data-testid="property"
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
                      fieldState: { invalid, isDirty, error },
                    }) => (
                      <CustomDropdown
                        label="User Status"
                        placeholder="Select"
                        onChange={onChange}
                        value={value}
                        isInvalid={invalid || !isDirty}
                        helperText={error?.message ?? ""}
                        options={[
                          { label: "Active", value: "1" },
                          { label: "In-Active", value: "2" },
                        ]}
                        fullWidth
                        aria-label="IsActive"
                        data-testid="isActive"
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
                      onClick={() =>
                        Navigate("/booking-engine/admin/user-management")
                      }
                    />
                    <PrimaryButton
                      label="Update"
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
            <Grid item md={6} p={2}>
              <ReservationDetailBox
                label="Department Assignment"
                isLoading={false}
              >
                <Stack
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexDirection="row"
                  gap={2}
                  mb={2}
                >
                  <ComboBox
                    label="Select Department"
                    value={selectDepartment}
                    items={optionList}
                    onChange={(event, selectedOption) =>
                      setSelectedDepartment(Number(selectedOption?.id ?? 0))
                    }
                    width="100%"
                  />
                  <PrimaryButton
                    isLoading={isAssignDepartmentLoading}
                    loadingText="Loading..."
                    label="Assign Department"
                    onClick={handleAddDepartment}
                    disabled={selectDepartment === null}
                    sx={{ textTransform: "initial" }}
                  />
                </Stack>

                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Assigned Departments
                  </Typography>
                  <Stack
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-start"
                    flexDirection="row"
                    flexWrap="wrap"
                    gap={1.5}
                  >
                    {departmentAccess.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        No departments assigned.
                      </Typography>
                    ) : (
                      departmentAccess.map((departmentId) => {
                        const selectedDepartment = (
                          departmentList?.data ?? []
                        ).find((department) => department.id == departmentId);

                        return (
                          <Chip
                            key={departmentId}
                            label={selectedDepartment?.department_name ?? ""}
                            onDelete={() =>
                              handleRemoveDepartment(departmentId)
                            }
                            clickable
                            sx={{
                              padding: "4px 8px",
                              fontSize: "0.875rem",
                              backgroundColor: "#f5f5f5",
                              "& .MuiChip-label": {
                                padding: "0 8px",
                              },
                            }}
                          />
                        );
                      })
                    )}
                  </Stack>
                </Box>
              </ReservationDetailBox>
              <Box sx={{ mb: 2 }} />
              <ReservationDetailBox label="Role Assignment" isLoading={false}>
                <Box
                  display={"grid"}
                  gridTemplateColumns={"repeat(3, 1fr)"}
                  gap={0.25}
                >
                  {roleList?.map((item) => (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onChange={handleCheckboxChange(item.id)}
                        />
                      }
                      label={item.name} // Display checkbox label
                    />
                  ))}
                </Box>
              </ReservationDetailBox>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </MainWrapper>
  );
};

export default EditUser;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));

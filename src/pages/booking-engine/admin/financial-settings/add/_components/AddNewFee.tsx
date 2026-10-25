"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  styled,
  Typography,
} from "@mui/material";
import {
  useAddFeeMutation,
  useAddFeeVersionMutation,
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
} from "services/financeSlice";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import { useNavigate } from "react-router-dom";
import {
  ICreateFeesTypes,
  IFeesTypes,
  IPostingCodeDept,
} from "types/financialSettingTypes";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import { createFeeSchema } from "utils/validations.utils";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import useAuth from "hooks/useAuth";

const AddFee: React.FC = () => {
  const Navigate = useNavigate();
  const { users } = useAuth();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const { data: codeDeptList } = useGetPostcodeDeptListQuery();
  const [addFeeVersion] = useAddFeeVersionMutation();

  const [addFee, { isLoading: isSubmitLoading }] = useAddFeeMutation();
  const methods = useForm<ICreateFeesTypes>({
    mode: "all",
    resolver: yupResolver(createFeeSchema),
    defaultValues: {
      description: "",
      starts_from: undefined,
      name: "",
      rate: "",
      occurrence: "",
      active: true,
      taxable: false,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    reset,
    watch,
  } = methods;

  const departmentId = watch("posting_department");

  useEffect(() => {
    if (departmentId) {
      getPostingcodeList({ id: Number(departmentId) });
    }
  }, [departmentId, getPostingcodeList]);

  const onSubmit = useCallback(
    async (data: IFeesTypes) => {
      const response = await addFee({
        description: data.description,
        starts_from: moment(data.starts_from).format("YYYY-MM-DD"),
        name: data.name,
        rate: data.rate?.toString() || "",
        occurrence: data.occurrence,
        property_id: users?.defaultPropertyId ?? 0,
        active: data.active,
        posting_department: data.posting_department,
        posting_code_id: data.posting_code_id,
        taxable: data.taxable,
      });

      if (response.error) {
        setError(
          "root",
          { message: response.error as string },
          { shouldFocus: true }
        );
        setSuccessMessage(null);
        return false;
      }

      const versionResponse = await addFeeVersion({
        fee_id: response?.data?.id,
        rate: Number(data.rate),
        starts_from: moment(data.starts_from).format("YYYY-MM-DD"),
      });

      if (!versionResponse.error) {
        reset();
        setSuccessMessage("Financial Settings Added Successfully!");
        Navigate("/booking-engine/admin/financial-settings/fee");
      }
    },
    [addFee, reset, Navigate, setError, addFeeVersion]
  );

  return (
    <MainWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container style={{ height: "100vh" }}>
            <Grid item xs={12} md={6} p={2}>
              {errors?.root && (
                <Alert severity="error">{errors.root.message}</Alert>
              )}
              {successMessage && (
                <Alert severity="success" data-testid="success-message">
                  {successMessage}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => {
                      return (
                        <CustomTextInput
                          fullWidth
                          value={value}
                          isInvalid={invalid}
                          label="Name"
                          placeholder="Enter Name"
                          className="mb-7"
                          onChange={(
                            event: React.ChangeEvent<
                              HTMLInputElement | HTMLTextAreaElement
                            >
                          ) => onChange(event.target.value)}
                          helperText={error?.message ?? ""}
                          inputProps={{ "data-testid": "name-input" }}
                        />
                      );
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="rate"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid}
                        label="Rate"
                        placeholder="Enter Rate"
                        className="mb-7"
                        onChange={(
                          event: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => onChange(event.target.value)}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "subject-input" }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box mt={0.5}>
                    <Controller
                      name="description"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, error },
                      }) => (
                        <CustomTextInput
                          fullWidth
                          value={value}
                          isInvalid={invalid}
                          label="Description"
                          placeholder="Enter Description"
                          className="mb-7"
                          onChange={(
                            event: React.ChangeEvent<
                              HTMLInputElement | HTMLTextAreaElement
                            >
                          ) => onChange(event.target.value)}
                          helperText={error?.message ?? ""}
                          inputProps={{ "data-testid": "subject-input" }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="starts_from"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Typography
                          variant="body1"
                          component="label"
                          gutterBottom
                          fontWeight={"bold"}
                        >
                          Starts From
                        </Typography>
                        <DatePicker
                          label="Starts From"
                          value={value ? moment(value) : null}
                          shouldDisableDate={(date) => {
                            const minDate = moment(new Date());
                            return date.isBefore(minDate);
                          }}
                          onChange={(date) => onChange(date?.toDate())} // Convert Dayjs date to JavaScript Date
                          slotProps={{
                            textField: {
                              error: !!error?.message,
                              helperText: error?.message,
                              fullWidth: true,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="occurrence"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <CustomDropdown
                        label="Occurrence"
                        placeholder="Select Type"
                        onChange={onChange}
                        value={value}
                        isInvalid={invalid}
                        helperText={error?.message ?? ""}
                        options={[
                          { label: "PER_NIGHT", value: "PER_NIGHT" },
                          {
                            label: "PER_RESERVATION",
                            value: "PER_RESERVATION",
                          },
                          { label: "PER_ROOM", value: "PER_ROOM" },
                          { label: "PER_PERSON", value: "PER_PERSON" },
                        ]}
                        fullWidth
                        aria-label="Type"
                        data-testid="Type"
                      />
                    )}
                  />
                  <Box display="flex" gap={2} p={2} mt={3}>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={(e) => onChange(e.target.checked)}
                            />
                          }
                          label="Active"
                        />
                      )}
                    />
                    <Controller
                      name="taxable"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={(e) => onChange(e.target.checked)}
                            />
                          }
                          label="Taxable"
                        />
                      )}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Controller
                      name="posting_department"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, error },
                      }) => (
                        <CustomDropdown
                          label="Department"
                          placeholder="Select Posting Code Department"
                          onChange={(event) => {
                            const selectedValue = event.target.value as number; // Extract the string value
                            onChange(selectedValue); // Update React Hook Form state
                          }}
                          value={value}
                          isInvalid={invalid}
                          helperText={error?.message ?? ""}
                          options={(codeDeptList ?? []).map(
                            (department: IPostingCodeDept) => ({
                              label: department?.name,
                              value: department?.id?.toString(),
                            })
                          )}
                          fullWidth
                          aria-label="Type"
                          data-testid="Type"
                        />
                      )}
                    />
                  </Box>
                  <Controller
                    name="posting_code_id"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <div className="mt-2">
                        <CustomDropdown
                          label="Posting Code"
                          placeholder="Select Posting Code"
                          onChange={(event) => {
                            const selectedValue = event.target.value as number; // Extract the string value
                            onChange(selectedValue); // Update React Hook Form state
                          }}
                          value={value}
                          isInvalid={invalid}
                          helperText={error?.message ?? ""}
                          options={(postingCodeList ?? []).map(
                            (department: IPostingCodeDept) => ({
                              label: department?.name,
                              value: department?.id?.toString(),
                            })
                          )}
                          fullWidth
                          aria-label="Type"
                          data-testid="Type"
                        />
                      </div>
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
                        Navigate("/booking-engine/admin/financial-settings/fee")
                      }
                    />
                    <PrimaryButton
                      label="Add Fee"
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

export default AddFee;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));

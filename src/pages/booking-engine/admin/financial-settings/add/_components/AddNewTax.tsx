"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import {
  useAddTaxMutation,
  useAddTaxVersionMutation,
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
} from "services/financeSlice";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { IPostingCodeDept, ITaxTypes } from "types/financialSettingTypes";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import { addRateSchema } from "utils/validations.utils";
import { isAdjustment } from "utils/postingCodes";
import FormTextField from "components/forms/FormTextField";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import useAuth from "hooks/useAuth";
import {
  assignmentTypeOptions,
  occurrenceOptions,
  TaxRateType,
} from "constants/taxes";
import Label from "components/elements/Label/Label";

const AddTax: React.FC = () => {
  const Navigate = useNavigate();
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addTax, { isLoading: isSubmitLoading }] = useAddTaxMutation();
  const [addTaxVersion] = useAddTaxVersionMutation();

  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const { data: codeDeptList } = useGetPostcodeDeptListQuery();

  const methods = useForm<ITaxTypes>({
    mode: "all",
    resolver: yupResolver(addRateSchema),
    defaultValues: {
      description: "",
      starts_from: undefined,
      name: "",
      rate: "",
      type: TaxRateType.PERCENTAGE,
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
  const selectedType = watch("type");
  const isFee = useMemo(() => selectedType === "RATE", [selectedType]);

  useEffect(() => {
    if (departmentId) {
      getPostingcodeList({
        id: Number(departmentId),
        // type: isFee ? "FEE" : "TAX",
      });
    }
  }, [departmentId, getPostingcodeList, isFee]);

  const onSubmit = useCallback(
    async (data: ITaxTypes) => {
      const basePayload = {
        description: data.description,
        name: data.name,
        rate: data.rate,
        starts_from: moment(data.starts_from).format("YYYY-MM-DD"),
        posting_code_id: data.posting_code_id,
        property_id: users?.defaultPropertyId ?? 0,
        active: data.active,
        type: data.type as string,
      };

      const payload = isFee
        ? {
            ...basePayload,
            taxable: data.taxable,
            assignment_type: data.assignment_type,
            occurrence: data.occurrence,
          }
        : basePayload;

      const response = await addTax(payload);

      if (response.error) {
        setError(
          "root",
          { message: response.error as string },
          { shouldFocus: true }
        );
        setSuccessMessage(null);
        return false;
      }

      const versionResponse = await addTaxVersion({
        tax_id: response?.data?.id,
        rate: Number(data.rate),
        starts_from: moment(data.starts_from).format("YYYY-MM-DD"),
      });

      if (!versionResponse.error) {
        reset();
        setSuccessMessage("Financial Settings Added Successfully!");
        Navigate("/booking-engine/admin/financial-settings/tax");
      }
    },
    [
      addTax,
      addTaxVersion,
      reset,
      Navigate,
      setError,
      users?.defaultPropertyId,
      isFee,
    ]
  );
  return (
    <MainWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container>
            <Grid item xs={12} md={6} p={2}>
              {errors?.root && (
                <Alert severity="error">{errors?.root?.message}</Alert>
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
                    render={({ field, fieldState }) => (
                      <CustomTextInput
                        fullWidth
                        label="Name"
                        placeholder="Enter Name"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={fieldState.invalid}
                        helperText={fieldState.error?.message ?? ""}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="rate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <CustomTextInput
                        fullWidth
                        label="Rate"
                        placeholder="Enter Rate"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={fieldState.invalid}
                        helperText={fieldState.error?.message ?? ""}
                      />
                    )}
                  />
                </Grid>

                <FormTextField
                  name="description"
                  label="Description"
                  sm={12}
                  textFieldProps={{
                    fullWidth: true,
                    multiline: true,
                    rows: 6,
                    placeholder: "Enter Description",
                  }}
                />

                <Grid item xs={12} mt={4}>
                  <Box>
                    <Label>Type</Label>
                    <Box display="flex" alignItems="center">
                      <FormControlLabel
                        control={
                          <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value === TaxRateType.PERCENTAGE}
                                onChange={() =>
                                  field.onChange(TaxRateType.PERCENTAGE)
                                }
                              />
                            )}
                          />
                        }
                        label="%"
                      />
                      <FormControlLabel
                        control={
                          <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value === TaxRateType.RATE}
                                onChange={() =>
                                  field.onChange(TaxRateType.RATE)
                                }
                              />
                            )}
                          />
                        }
                        label="$"
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Controller
                      name="posting_department"
                      control={control}
                      render={({ field, fieldState }) => (
                        <CustomDropdown
                          label="Department"
                          placeholder="Select Posting Code Department"
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
                          value={field.value}
                          isInvalid={fieldState.invalid}
                          helperText={fieldState.error?.message ?? ""}
                          options={(codeDeptList ?? []).map(
                            (d: IPostingCodeDept) => ({
                              label: `${d.code} - ${d.name}`,
                              value: d.id.toString(),
                            })
                          )}
                          fullWidth
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Controller
                      name="posting_code_id"
                      control={control}
                      render={({ field, fieldState }) => (
                        <CustomDropdown
                          label="Posting Code"
                          placeholder="Select Posting Code"
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
                          value={field.value}
                          isInvalid={fieldState.invalid}
                          helperText={fieldState.error?.message ?? ""}
                          options={(postingCodeList ?? [])
                            .filter((pc) => !isAdjustment(pc))
                            .map((d: IPostingCodeDept) => ({
                              label: `${d.code} - ${d.name}`,
                              value: d.id.toString(),
                            }))}
                          fullWidth
                        />
                      )}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="starts_from"
                    control={control}
                    render={({ field, fieldState }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Typography fontWeight="bold" gutterBottom>
                          Starts From
                        </Typography>
                        <DatePicker
                          label="Starts From"
                          value={field.value ? moment(field.value) : null}
                          shouldDisableDate={(date) =>
                            date.isBefore(moment().startOf("day"))
                          }
                          onChange={(date) => field.onChange(date?.toDate())}
                          slotProps={{
                            textField: {
                              error: !!fieldState.error,
                              helperText: fieldState.error?.message,
                              fullWidth: true,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Grid>

                {isFee && (
                  <>
                    {/* assignment_type Autocomplete */}
                    <Grid item xs={12} md={6} mt={4}>
                      <Controller
                        name="assignment_type"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            options={assignmentTypeOptions}
                            getOptionLabel={(option) => option.label}
                            value={
                              assignmentTypeOptions.find(
                                (opt) => opt.value === field.value
                              ) || null
                            }
                            onChange={(_, newValue) => {
                              field.onChange(newValue?.value || "");
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Assignment Type"
                                fullWidth
                                error={!!errors.assignment_type}
                                helperText={errors.assignment_type?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    {/* occurrence Autocomplete */}
                    <Grid item xs={12} md={6} mt={2}>
                      <Controller
                        name="occurrence"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            options={occurrenceOptions}
                            getOptionLabel={(option) => option.label}
                            value={
                              occurrenceOptions.find(
                                (opt) => opt.value === field.value
                              ) || null
                            }
                            onChange={(_, newValue) => {
                              field.onChange(newValue?.value || "");
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Occurrence"
                                fullWidth
                                error={!!errors.occurrence}
                                helperText={errors.occurrence?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box p={2} pl={0} pb={0}>
                        <Controller
                          name="taxable"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.checked)
                                  }
                                />
                              }
                              label="Taxable"
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Box p={2} pl={0}>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Active"
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PrimaryButton
                      label="Back"
                      type="button"
                      onClick={() =>
                        Navigate("/booking-engine/admin/financial-settings/tax")
                      }
                      buttonStyles={{
                        backgroundColor: "#F5F5F5",
                        color: "#000",
                        fontWeight: "bold",
                      }}
                    />
                    <PrimaryButton
                      label="Save"
                      type="submit"
                      isLoading={isSubmitLoading}
                      loadingText="Loading..."
                      buttonStyles={{
                        backgroundColor: "#32A1AE",
                        color: "#FFFFFF",
                        fontWeight: "bold",
                      }}
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

export default AddTax;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));

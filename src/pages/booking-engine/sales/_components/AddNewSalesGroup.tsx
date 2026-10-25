import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField, Alert, Autocomplete } from "@mui/material";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { addSalesGroupSchema } from "utils/validations.utils";
import { useNavigate } from "react-router-dom";
import {
  ISalesAccountGroup,
  ISalesAccountGroupRequest,
  IUpdateSalesAccountGroupRequest,
} from "types/salesTypes";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { appConfig } from "config/app.config";
import {
  useCreateSalesAccountGroupMutation,
  useUpdateSalesAccountGroupMutation,
} from "services/salesSlice";
import { groupStatusList, groupTypeList } from "constants/sales";
import AsyncCreatableAutocomplete, {
  IOptionType,
} from "components/elements/AsyCreatableAutoComplete/AsyCreatableAutoComplete";
import SecondaryButton from "components/elements/Button/SecondaryButton";

interface IAddNewSalesGroup {
  salesAccountId?: number | null;
  editGroup: ISalesAccountGroup | null;
  onClose?: () => void;
  onRefresh?: () => void;
}

const AddNewSalesGroup: React.FC<IAddNewSalesGroup> = ({
  salesAccountId,
  onClose,
  onRefresh,
  editGroup,
}) => {
  const navigate = useNavigate();
  const [groupAttributesList, setGroupAttributesList] = useState<IOptionType[]>(
    []
  );
  const [createSalesAccountGroup, { isLoading }] =
    useCreateSalesAccountGroupMutation();
  const [updateSalesAccountGroup, { isLoading: isUpdateLoading }] =
    useUpdateSalesAccountGroupMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const methods = useForm<ISalesAccountGroupRequest>({
    mode: "all",
    resolver: yupResolver(addSalesGroupSchema),
    defaultValues: {
      group_code: "",
      group_name: "",
      group_type: "",
      group_description: "",
      group_status: "",
      group_arrival_date: new Date(),
      group_departure_date: new Date(),
      group_release_date: new Date(),
      group_cutoff_date: new Date(),
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setError,
    reset,
  } = methods;

  useEffect(() => {
    if (editGroup) {
      if (editGroup?.group_attributes) {
        const groupAttributes = (editGroup?.group_attributes ?? []).map(
          (value: string) => ({
            label: value,
            value: value,
          })
        );
        setGroupAttributesList(groupAttributes);
      }
      reset(editGroup);
    }
  }, [editGroup]);

  const onSubmit = useCallback(
    async (data: ISalesAccountGroupRequest) => {
      if (!salesAccountId) return false;
      data.sales_account_id = salesAccountId;
      // Simulate API call logic here
      if (editGroup) {
        const updateDate: IUpdateSalesAccountGroupRequest = {
          ...data,
          group_id: editGroup.id,
        };
        const response = await updateSalesAccountGroup(updateDate);
        if (response.error) {
          setError(
            "root",
            { message: response.error as string },
            { shouldFocus: true }
          );
          return false;
        }
        setSuccessMessage("Group account updated successfully!");
      } else {
        const response = await createSalesAccountGroup(data);
        if (response.error) {
          setError(
            "root",
            { message: response.error as string },
            { shouldFocus: true }
          );
          return false;
        }
        setSuccessMessage("Group account added successfully!");
      }

      reset();
      onRefresh?.();
      onClose?.();
    },
    [navigate, reset, editGroup, salesAccountId]
  );

  const groupTypeOptions = useMemo(() => {
    return groupTypeList;
  }, [groupTypeList]);

  const groupStatusOptions = useMemo(() => {
    return groupStatusList;
  }, [groupStatusList]);

  const today = dayjs();

  return (
    <FormProvider {...methods}>
      <Box>
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errors?.root && (
          <Alert severity="error">{errors.root?.message ?? ""}</Alert>
        )}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={6} mb={2}>
            <Controller
              name="group_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Group Name"
                  fullWidth
                  placeholder="Enter Group Name"
                  error={!!errors.group_name}
                  helperText={errors.group_name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Controller
              name="group_code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Group Code"
                  fullWidth
                  placeholder="Enter Group Code"
                  error={!!errors.group_code}
                  helperText={errors.group_code?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Controller
              name="group_type"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error, invalid },
              }) => {
                const selectedGroupType = groupTypeOptions.find(
                  (c) => c.id === value
                );

                return (
                  <Autocomplete
                    value={selectedGroupType || null}
                    onChange={(_, selectedOption) => {
                      onChange(selectedOption?.id);
                    }}
                    options={groupTypeOptions}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="group_type"
                        label="Group Type"
                        placeholder="Enter Group Type"
                        error={invalid}
                        helperText={error?.message}
                      />
                    )}
                    fullWidth
                  />
                );
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Controller
              name="group_status"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error, invalid },
              }) => {
                const selectedGroupStatus = groupStatusOptions.find(
                  (c) => c.id === value
                );

                return (
                  <Autocomplete
                    value={selectedGroupStatus || null}
                    onChange={(_, selectedOption) => {
                      onChange(selectedOption?.id);
                    }}
                    options={groupStatusOptions}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="group_status"
                        label="Group Status"
                        placeholder="Enter Group Status"
                        error={invalid}
                        helperText={error?.message}
                      />
                    )}
                    fullWidth
                  />
                );
              }}
            />
          </Grid>
          <Grid item xs={12} mb={2}>
            <Controller
              name="group_attributes"
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <AsyncCreatableAutocomplete
                    label="Group Attributes"
                    multiple={true}
                    onChange={(value: string[] | null) => {
                      onChange(value);
                    }}
                    placeholder="Enter Group Attributes"
                    value={value ?? null}
                    options={groupAttributesList}
                  />
                );
              }}
            />
          </Grid>

          <Grid item xs={12} mb={2}>
            <Controller
              name="group_description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Group Description"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Enter Group Description"
                  error={!!errors.group_description}
                  helperText={errors.group_description?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Controller
              name="group_arrival_date"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error, invalid },
              }) => (
                <DatePicker
                  label="Group Arrival Date"
                  value={value ? dayjs(value) : null}
                  format={appConfig.displayDateFormat}
                  onChange={(date) => onChange(date?.toDate())}
                  minDate={today}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: invalid,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Controller
              name="group_departure_date"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error, invalid },
              }) => (
                <DatePicker
                  label="Group Departure Date"
                  value={value ? dayjs(value) : null}
                  format={appConfig.displayDateFormat}
                  onChange={(date) => onChange(date?.toDate())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: invalid,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Controller
              name="group_release_date"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error, invalid },
              }) => (
                <DatePicker
                  label="Group Release Date"
                  value={value ? dayjs(value) : null}
                  format={appConfig.displayDateFormat}
                  onChange={(date) => onChange(date?.toDate())}
                  minDate={today}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: invalid,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Controller
              name="group_cutoff_date"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error, invalid },
              }) => (
                <DatePicker
                  label="Group Cutoff Date"
                  value={value ? dayjs(value) : null}
                  format={appConfig.displayDateFormat}
                  onChange={(date) => onChange(date?.toDate())}
                  minDate={today}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: invalid,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <PrimaryButton
                label={editGroup ? "Update" : "Save"}
                variant="outlined"
                isLoading={isLoading || isUpdateLoading}
                loadingText="Loading..."
                onClick={handleSubmit(onSubmit)}
              />
              <SecondaryButton
                label="Cancel"
                variant="contained"
                isLoading={false}
                onClick={() => onClose?.()}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};

export default AddNewSalesGroup;

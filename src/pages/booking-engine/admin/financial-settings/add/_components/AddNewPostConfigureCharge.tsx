import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useMemo } from "react";
import { Autocomplete, Box, Grid, TextField } from "@mui/material";
import {
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
} from "services/financeSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import { useNavigate } from "react-router-dom";
import { IPostingCodeDept } from "types/financialSettingTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { addPreconfigureChargesSchema } from "utils/validations.utils";
import FormTextField from "components/forms/FormTextField";
import { IAddPreconfigureChargesRequest } from "types/preconfigureChangeTypes";
import { useAddFastChargesMutation } from "services/fastChargeSlice";
import useSnackbar from "hooks/useSnackbar";
import useAuth from "hooks/useAuth";

const AddNewPostConfigureCharge: React.FC = () => {
  const Navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { users } = useAuth();

  const { data: postingCodeDeptList, refetch: getPostingcodeDeptList } =
    useGetPostcodeDeptListQuery();
  const [getPostingcodeListQuery, { data: postingCodes }] =
    useLazyGetPostingcodeListQueryQuery();
  const [addFastCharges, { isLoading }] = useAddFastChargesMutation();

  const methods = useForm<IAddPreconfigureChargesRequest>({
    mode: "all",
    resolver: yupResolver(addPreconfigureChargesSchema),
    defaultValues: {
      name: "",
      amount: 0,
      description: "",
      max_qty: 0,
      posting_code_id: 0,
      posting_code_department_id: 0,
    },
  });

  const { handleSubmit, control, reset, watch } = methods;
  const selectedPostCodeDept = watch("posting_code_department_id");

  useEffect(() => {
    if (selectedPostCodeDept) {
      getPostingcodeListQuery({
        posting_code_department_id: selectedPostCodeDept,
      });
    }
  }, [selectedPostCodeDept]);

  useEffect(() => {
    getPostingcodeDeptList();
  }, []);

  const onSubmit = useCallback(async (data: IAddPreconfigureChargesRequest) => {
    data.property_id = users?.defaultPropertyId;
    const response = await addFastCharges(data);
    if (response.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    reset();
    openSnackbar(`Preconfigure Charge has been added successfully!`, "success");
    setTimeout(() => {
      Navigate("/booking-engine/admin/financial-settings/preconfigured-charge");
    }, 1000);
  }, []);

  const postingCodeDeptOptionList = useMemo(() => {
    return (postingCodeDeptList ?? []).map((department: IPostingCodeDept) => ({
      label: `${department?.code} - ${department?.name}`,
      value: department?.id?.toString(),
    }));
  }, [postingCodeDeptList]);

  const postingCodeOptionList = useMemo(() => {
    return (postingCodes ?? []).map((department: IPostingCodeDept) => ({
      label: `${department?.name}`,
      value: department?.id?.toString(),
    }));
  }, [postingCodes]);

  return (
    <FormProvider {...methods}>
      <Grid container>
        <Grid item xs={12} p={2}>
          <Grid container spacing={2}>
            <FormTextField
              name="name"
              sm={6}
              label="Name"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Name",
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Controller
                  name="posting_code_department_id"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error, invalid },
                  }) => {
                    return (
                      <Autocomplete
                        value={
                          postingCodeDeptOptionList.find(
                            (option) => option.value === value?.toString()
                          ) || null
                        }
                        onChange={(_, selectedOption) => {
                          onChange(selectedOption?.value);
                        }}
                        options={postingCodeDeptOptionList}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="posting_code_department_id"
                            label="Posting Code Department"
                            error={invalid}
                            helperText={error?.message}
                            required={true}
                          />
                        )}
                        fullWidth
                      />
                    );
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Controller
                  name="posting_code_id"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error, invalid },
                  }) => {
                    return (
                      <Autocomplete
                        value={
                          postingCodeOptionList.find(
                            (option) => option.value === value?.toString()
                          ) || null
                        }
                        onChange={(_, selectedOption) => {
                          onChange(selectedOption?.value);
                        }}
                        options={postingCodeOptionList}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="posting_code_id"
                            label="Posting Code"
                            error={invalid}
                            helperText={error?.message}
                            required={true}
                          />
                        )}
                        fullWidth
                      />
                    );
                  }}
                />
              </Box>
            </Grid>
            <FormTextField
              name="amount"
              sm={6}
              label="Amount"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Amount",
                type: "number",
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="max_qty"
              sm={6}
              label="Max Quantity"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Max Quantity",
                type: "number",
              }}
              required
              gridProps={{ mb: 2 }}
            />

            <FormTextField
              name="description"
              sm={12}
              label="Description"
              textFieldProps={{
                fullWidth: true,
                multiline: true,
                rows: 3,
                placeholder: "Enter Description",
              }}
              gridProps={{ mb: 2 }}
            />

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
                    Navigate(
                      "/booking-engine/admin/financial-settings/preconfigured-charge"
                    )
                  }
                />
                <PrimaryButton
                  label="Save"
                  loadingText="Loading...."
                  isLoading={isLoading}
                  onClick={handleSubmit(onSubmit)}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AddNewPostConfigureCharge;

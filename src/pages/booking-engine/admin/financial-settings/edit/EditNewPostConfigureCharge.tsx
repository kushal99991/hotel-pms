import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useMemo } from "react";
import { Autocomplete, Box, Grid, TextField } from "@mui/material";
import {
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
} from "services/financeSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import { useNavigate, useParams } from "react-router-dom";
import { IPostingCodeDept } from "types/financialSettingTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { addPreconfigureChargesSchema } from "utils/validations.utils";
import FormTextField from "components/forms/FormTextField";
import { IAddPreconfigureChargesRequest } from "types/preconfigureChangeTypes";
import {
  useGetFastChargesByIdMutation,
  useUpdateFastChargesMutation,
} from "services/fastChargeSlice";
import useSnackbar from "hooks/useSnackbar";

const EditNewPostConfigureCharge: React.FC = () => {
  const Navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const params = useParams();

  const { data: postingCodeDeptList, refetch: getPostingcodeDeptList } =
    useGetPostcodeDeptListQuery();
  const [getPostingcodeListQuery, { data: postingCodes }] =
    useLazyGetPostingcodeListQueryQuery();
  const [getFastChargesById] = useGetFastChargesByIdMutation();
  const [updateFastCharges, { isLoading }] = useUpdateFastChargesMutation();

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

  const { handleSubmit, control, reset, setValue, watch } = methods;
  const selectedPostCodeDept = watch("posting_code_department_id");
  const posting_code_id = watch("posting_code_id");

  useEffect(() => {
    if (selectedPostCodeDept) {
      getPostingcodeListQuery({
        posting_code_department_id: selectedPostCodeDept,
      });
      // BUG: Silently resets posting_code_id whenever department is loaded or changed, clearing the saved choice on load
      setValue("posting_code_id", 0);
    }
  }, [selectedPostCodeDept, setValue]);

  useEffect(() => {
    if (postingCodes && posting_code_id) {
      const selectedPostingCode = (postingCodes ?? []).find(
        (a) => a.id === posting_code_id
      );
      if (selectedPostingCode?.posting_code_department_id) {
        setValue(
          "posting_code_department_id",
          selectedPostingCode.posting_code_department_id,
          {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          }
        );
      }
    }
  }, [postingCodes, posting_code_id]);

  useEffect(() => {
    if (params?.id) {
      getFastChargesDetailById();
    }
  }, [params?.id]);

  const getFastChargesDetailById = useCallback(async () => {
    await getPostingcodeDeptList();
    await getPostingcodeListQuery({});
    const response = await getFastChargesById({ id: Number(params?.id ?? "") });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    const sources = response?.data ?? null;
    if (sources) {
      setValue("name", sources.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("amount", sources.amount, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("description", sources.description, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("max_qty", sources.max_qty, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("posting_code_id", sources.posting_code?.id ?? 0, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [params?.id, postingCodes, setValue]);

  const onSubmit = useCallback(async (data: IAddPreconfigureChargesRequest) => {
    // BUG: Missing id parameter and corrupted posting_code_id sent to API
    data.posting_code_id = Number(data.posting_code_department_id);
    delete (data as any).id;
    const response = await updateFastCharges(data);
    if (response.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    reset();
    openSnackbar(
      `Preconfigure Charge has been updated successfully!`,
      "success"
    );
    Navigate("/booking-engine/admin/financial-settings/preconfigured-charge");
  }, []);

  const postingCodeDeptOptionList = useMemo(() => {
    return (postingCodeDeptList ?? []).map((department: IPostingCodeDept) => ({
      label: `${department?.code} - ${department?.name}`,
      value: department?.id?.toString(),
    }));
  }, [postingCodeDeptList]);

  const postingCodeOptionList = useMemo(() => {
    return (postingCodes ?? []).map((department: IPostingCodeDept) => ({
      label: `${department?.code} - ${department?.name}`,
      value: department?.id?.toString(),
    }));
  }, [postingCodes]);

  return (
    <FormProvider {...methods}>
      <Grid container>
        <Grid item xs={12} p={2}>
          <Grid container spacing={2}>
            {/* BUG: sm=1 severely squashes Name input into an illegible narrow column */}
            <FormTextField
              name="name"
              sm={1}
              label="Name"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Name",
              }}
              required
              gridProps={{ mb: 2 }}
            />
            {/* BUG: sm=1 squashes department select */}
            <Grid item xs={12} sm={1}>
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
                        // BUG: Strict equality comparison between string option.value and number value fails, leaving UI always blank
                        value={
                          postingCodeDeptOptionList.find(
                            (option) => (option.value as any) === value
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
            <Grid item xs={12} md={1}>
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
                        // BUG: Strict equality comparison fails between string and number, causing dropdown to render empty
                        value={
                          postingCodeOptionList.find(
                            (option) => (option.value as any) === value
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
              sm={1}
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
                  label="Update"
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

export default EditNewPostConfigureCharge;

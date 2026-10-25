"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Grid,
  styled,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  useUpdatePostingCodeMutation,
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
} from "services/financeSlice";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import { useNavigate, useParams } from "react-router-dom";
import {
  IPostingCodeDept,
  IPostingCodeFormInputs,
  // IPostingCode,
} from "types/financialSettingTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { addPostingCodeSchema } from "utils/validations.utils";
import FormTextField from "components/forms/FormTextField";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import useAuth from "hooks/useAuth";
import { PostingCodeTypes } from "constants/payments";

const EditPostingCode: React.FC = () => {
  const Navigate = useNavigate();
  const params = useParams();
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatePostingCode, { isLoading: isSubmitLoading }] =
    useUpdatePostingCodeMutation();
  const { data: codeDeptList } = useGetPostcodeDeptListQuery();
  const [getPostingcodeList, { data: postingCodeData }] =
    useLazyGetPostingcodeListQueryQuery();

  // Find the current posting code data
  const currentPostingCode = postingCodeData?.find(
    (code) => code.id === Number(params.id)
  );

  useEffect(() => {
    if (params.id) {
      getPostingcodeList({});
    }
  }, [params.id, getPostingcodeList]);

  const methods = useForm<IPostingCodeFormInputs>({
    mode: "all",
    resolver: yupResolver(addPostingCodeSchema),
    defaultValues: {
      description: "",
      name: "",
      code: "",
      type: PostingCodeTypes.CHARGE,
      posting_code_department_id: 0,
      adjustment: false,
      is_active: true,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    // reset,
    setValue,
  } = methods;

  // Set form values when data is loaded
  useEffect(() => {
    if (currentPostingCode) {
      setValue("name", currentPostingCode.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("code", currentPostingCode.code.toString(), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("description", currentPostingCode.description || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("type", currentPostingCode.type, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue(
        "posting_code_department_id",
        currentPostingCode.posting_code_department_id,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
      setValue("adjustment", currentPostingCode.adjustment || false, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue(
        "is_active",
        currentPostingCode.is_active !== undefined
          ? currentPostingCode.is_active
          : true,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
    }
  }, [currentPostingCode, setValue]);

  const onSubmit = useCallback(
    async (data: IPostingCodeFormInputs) => {
      try {
        // BUG: Inverted name and code fields in payload, overwriting code with name on save!
        const response = await updatePostingCode({
          id: Number(params.id),
          name: data.code,
          code: data.name,
          type: data.type,
        });

        // Check if response has error property and it's an object (not a string)
        if (response.error && typeof response.error === "object") {
          // Extract the error message from the object
          const errorMessage = response.error.message || "Something went wrong";

          setError("root", { message: errorMessage }, { shouldFocus: true });
          setSuccessMessage(null);
          return false;
        } else if (response.error) {
          // If it's already a string, use it directly
          setError(
            "root",
            { message: "something went wrong" },
            { shouldFocus: true }
          );
          setSuccessMessage(null);
          return false;
        }

        // Success case
        setSuccessMessage("Posting Code Updated Successfully!");
        setTimeout(() => {
          Navigate("/booking-engine/admin/financial-settings/posting-codes");
        }, 1500);
      } catch {
        // Handle unexpected errors
        setError(
          "root",
          { message: "An unexpected error occurred" },
          { shouldFocus: true }
        );
        setSuccessMessage(null);
      }
    },
    [updatePostingCode, Navigate, setError, users?.defaultPropertyId, params.id]
  );

  return (
    <MainWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container style={{ height: "100vh" }}>
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
                    name="code"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid}
                        label="Code"
                        placeholder="Enter Code"
                        className="mb-7"
                        onChange={(
                          event: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => onChange(event.target.value)}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "code-input" }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box mb={3}>
                    <FormTextField
                      name="description"
                      sm={12}
                      label="Description"
                      textFieldProps={{
                        fullWidth: true,
                        multiline: true,
                        rows: 6,
                        placeholder: "Enter Description",
                      }}
                      gridProps={{ mb: 2 }}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <FormControlLabel
                      control={
                        <Controller
                          name="adjustment"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Checkbox
                              // BUG: Inverted checked boolean logic
                              checked={!Boolean(value)}
                              onChange={(e) => onChange(!e.target.checked)}
                              color="primary"
                            />
                          )}
                        />
                      }
                      label="Adjustment"
                    />
                    <FormControlLabel
                      control={
                        <Controller
                          name="is_active"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Checkbox
                              // BUG: Inverted checked boolean logic
                              checked={!Boolean(value)}
                              onChange={(e) => onChange(!e.target.checked)}
                              color="primary"
                            />
                          )}
                        />
                      }
                      label="Active"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} gap={5}>
                  <Box mb={2}>
                    <Controller
                      name="posting_code_department_id"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, error },
                      }) => (
                        <CustomDropdown
                          label="Department"
                          placeholder="Select Posting Code Department"
                          onChange={(event) => {
                            const selectedValue = event.target.value as number;
                            onChange(selectedValue);
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
                          aria-label="Department"
                          data-testid="Department"
                        />
                      )}
                    />
                  </Box>
                  <Box mb={2}>
                    <Controller
                      name="type"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, error },
                      }) => (
                        <CustomDropdown
                          label="Type"
                          placeholder="Select Type"
                          onChange={(event) => {
                            const selectedValue = event.target
                              .value as PostingCodeTypes;
                            onChange(selectedValue);
                          }}
                          value={value}
                          isInvalid={invalid}
                          helperText={error?.message ?? ""}
                          options={Object.values(PostingCodeTypes).map(
                            (type) => ({
                              label: type,
                              value: type,
                            })
                          )}
                          fullWidth
                          aria-label="Type"
                          data-testid="Type"
                        />
                      )}
                    />
                  </Box>
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
                        Navigate(
                          "/booking-engine/admin/financial-settings/posting-codes"
                        )
                      }
                    />
                    <PrimaryButton
                      label="Update Posting Code"
                      loadingText="Loading...."
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

export default EditPostingCode;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));

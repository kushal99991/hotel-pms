"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, Grid, styled } from "@mui/material";
import {
  useGetPostcodeDeptListQuery,
  useUpdatePostcodeDeptMutation,
} from "services/financeSlice";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuth from "hooks/useAuth";

// Create a validation schema for the department form
const editPostcodeDeptSchema = yup.object({
  name: yup.string().required("Name is required"),
  code: yup.string().required("Code is required"),
});

// Define the form input type
interface IPostcodeDeptFormInputs {
  name: string;
  code: string;
}

const EditPostcodeDept: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatePostcodeDept, { isLoading: isSubmitLoading }] =
    useUpdatePostcodeDeptMutation();
  const { data: departmentsList, refetch } = useGetPostcodeDeptListQuery();

  // Find the current department data
  const currentDept = departmentsList?.find(
    (dept) => dept.id === Number(params.id)
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const methods = useForm<IPostcodeDeptFormInputs>({
    mode: "all",
    resolver: yupResolver(editPostcodeDeptSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    setValue,
    reset,
  } = methods;

  // Set form values when data is loaded
  useEffect(() => {
    if (currentDept) {
      setValue("name", currentDept.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("code", currentDept.code.toString(), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [currentDept, setValue]);

  const onSubmit = useCallback(
    async (data: IPostcodeDeptFormInputs) => {
      const response = await updatePostcodeDept({
        id: Number(params.id),
        name: data.name,
        code: Number(data.code),
        property_id: users?.defaultPropertyId ?? 1,
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

      reset();
      setSuccessMessage("Department Updated Successfully!");
      navigate(
        "/booking-engine/admin/financial-settings/posting-code-departments"
      );
    },
    [updatePostcodeDept, reset, navigate, setError, params.id]
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
              <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
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
                          placeholder="Enter Department Name"
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

                <Grid item xs={12}>
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
                        placeholder="Enter Department Code"
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
              </Grid>

              <Box
                display="flex"
                justifyContent="flex-start"
                gap={2}
                marginTop={2}
              >
                <PrimaryButton
                  label="Cancel"
                  onClick={() =>
                    navigate(
                      "/booking-engine/admin/financial-settings/posting-code-departments"
                    )
                  }
                  variant="outlined"
                />
                <PrimaryButton
                  type="submit"
                  label="Save"
                  disabled={isSubmitLoading}
                />
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </MainWrapper>
  );
};

export default EditPostcodeDept;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));

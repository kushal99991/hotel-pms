"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Grid, Skeleton, Typography, styled } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { addEmailTemplateValidationSchema } from "utils/validations.utils";
import {
  useGetEmailTemplateByidMutation,
  useUpdateEmailTemplateMutation,
} from "services/emailTemplateSlice";
import { IAddEmailTemplateRequest } from "types/emailTemplateTypes";
import RichTextEditor from "pages/booking-engine/admin/email-templates/add/_components/RichTextEditor";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";

const EmailTemplateSkeletonLoader: React.FC = () => {
  return (
    <MainWrapper>
      <Title variant="h1">
        <Skeleton width="60%" />
      </Title>
      <Grid container style={{ height: "100vh" }}>
        <Grid item xs={12} md={6} p={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={40} width="30%" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MainWrapper>
  );
};

const EditEmailTemplate: React.FC = () => {
  const Navigate = useNavigate();
  const params = useParams();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [
    getEmailTemplateByid,
    { data: emailTemplateDetail, isLoading: isTemplateDetailLoading },
  ] = useGetEmailTemplateByidMutation();

  const [updateEmailTemplate, { isLoading: isSubmitLoading }] =
    useUpdateEmailTemplateMutation();
  const methods = useForm<IAddEmailTemplateRequest>({
    mode: "all",
    resolver: yupResolver(addEmailTemplateValidationSchema),
    defaultValues: {
      body: "",
      category: "",
      fromAddress: "",
      name: "",
      subject: "",
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    if (params?.id) {
      getEmailTemplateByid({ id: params.id as string });
    }
  }, [params?.id]);

  useEffect(() => {
    if (emailTemplateDetail) {
      setValue("name", emailTemplateDetail?.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("body", emailTemplateDetail?.body, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("category", emailTemplateDetail?.category, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("fromAddress", emailTemplateDetail?.fromAddress, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("subject", emailTemplateDetail?.subject, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [emailTemplateDetail, setValue]);

  const onSubmit = useCallback(
    async (data: IAddEmailTemplateRequest) => {
      data.id = emailTemplateDetail?.id ?? 0;
      const response = await updateEmailTemplate(data);
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
      setSuccessMessage("Email Template Updates successfully!");
      Navigate("/booking-engine/admin/email-templates/list");
    },
    [updateEmailTemplate, reset, Navigate, setError, emailTemplateDetail]
  );

  return (
    <MainWrapper>
      {isTemplateDetailLoading ? (
        <EmailTemplateSkeletonLoader />
      ) : (
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
                        fieldState: { invalid, isDirty, error },
                      }) => {
                        return (
                          <CustomTextInput
                            fullWidth
                            value={value}
                            isInvalid={invalid || !isDirty}
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
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="category"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, isDirty, error },
                      }) => (
                        <CustomDropdown
                          label="Category"
                          placeholder="Select Category"
                          onChange={onChange}
                          value={value}
                          isInvalid={invalid || !isDirty}
                          helperText={error?.message ?? ""}
                          options={[
                            { label: "Confirmation", value: "Confirmation" },
                            { label: "Reminder", value: "Reminder" },
                            { label: "Support", value: "Support" },
                            { label: "Billing", value: "Billing" },
                            { label: "Feedback", value: "Feedback" },
                            { label: "Info", value: "Info" },
                            { label: "Newsletter", value: "Newsletter" },
                            { label: "Holidays", value: "Holidays" },
                            { label: "Other", value: "Other" },
                          ]}
                          fullWidth
                          aria-label="Category"
                          data-testid="category"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="subject"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, isDirty, error },
                      }) => (
                        <CustomTextInput
                          fullWidth
                          value={value}
                          isInvalid={invalid || !isDirty}
                          label="Subject"
                          placeholder="Enter Subject"
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
                    <Controller
                      name="fromAddress"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, isDirty, error },
                      }) => (
                        <CustomTextInput
                          fullWidth
                          isInvalid={invalid || !isDirty}
                          label="From Address"
                          placeholder="Enter From Address"
                          className="mb-7"
                          value={value}
                          onChange={(
                            event: React.ChangeEvent<
                              HTMLInputElement | HTMLTextAreaElement
                            >
                          ) => onChange(event.target.value)}
                          helperText={error?.message ?? ""}
                          inputProps={{ "data-testid": "from-address-input" }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="body"
                      control={control}
                      render={({
                        field: { value, onChange },
                        fieldState: { invalid, isDirty, error },
                      }) => (
                        <RichTextEditor
                          initialData={value}
                          isInvalid={invalid || !isDirty}
                          helperText={error?.message ?? ""}
                          initialLoading={false}
                          onChange={(data: string) => onChange(data)}
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
                        onClick={() => {
                          Navigate(
                            "/booking-engine/admin/email-templates/list"
                          );
                        }}
                      />
                      <PrimaryButton
                        label="Update Template"
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
      )}
    </MainWrapper>
  );
};

export default EditEmailTemplate;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));

const Title = styled(Typography)(() => ({
  fontSize: "30px",
  fontWeight: "700",
  lineHeight: "41px",
  color: "#111111",
  marginBottom: "5px",
  width: "100%",
  "@media (max-width: 780px)": {
    fontSize: "24px",
  },
}));

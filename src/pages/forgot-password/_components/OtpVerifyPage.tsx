import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useCallback } from "react";
import { styled, Box, Typography, Icon, FormHelperText } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { yupResolver } from "@hookform/resolvers/yup";

import { otpVerifySchema } from "utils/validations.utils";
import { useValidateOtpMutation } from "services/authSlice";
import { useSnackbar } from "hooks";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import BackButton from "components/elements/Button/BackButton";

import OTPInput from "./OTPInput";
import { useNavigate } from "react-router-dom";

const OtpVerifyPage: React.FC = () => {
  const Navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [validateOtp, { isLoading }] = useValidateOtpMutation();

  const methods = useForm<{ resetCode: string }>({
    mode: "onChange",
    resolver: yupResolver(otpVerifySchema),
    defaultValues: { resetCode: "" },
  });
  const { handleSubmit, control, setError } = methods;

  const onSubmit = useCallback(
    async (formData: { resetCode: string }) => {
      try {
        const response = await validateOtp(formData);
        const sources = response;
        if (response.error) {
          openSnackbar((response.error as string) ?? "", "error");
          setError(
            "resetCode",
            { message: (response.error as string) ?? "" },
            { shouldFocus: true }
          );
          return false;
        }
        openSnackbar(sources?.data?.message ?? "", "success");
        Navigate(`/reset-password?code=${formData.resetCode}`);
      } catch {
        /** empty error */
      }
    },
    [openSnackbar, Navigate, setError, validateOtp]
  );

  return (
    <BoxWrap>
      <IconButton>
        <EmailIcon />
      </IconButton>
      <Title variant="h1">Otp Verify</Title>
      <form name="otp-verify-form">
        <Controller
          name="resetCode"
          control={control}
          render={({ field: { onChange }, fieldState: { error } }) => {
            return (
              <Box className="mb-4" data-testid="otp-input-box">
                <OTPInput
                  length={8}
                  onChange={(otp: string) => onChange(otp)}
                />
                {error?.message && (
                  <FormHelperText data-testid="otp-error-testid" error>
                    {error.message}
                  </FormHelperText>
                )}
              </Box>
            );
          }}
        />

        <PrimaryButton
          label="Verify Otp"
          fullWidth
          type="submit"
          isLoading={isLoading}
          loadingText="Submiting...."
          onClick={handleSubmit(onSubmit)}
        />
        <BottomLinkBox>
          <BackButton label="Go back" href="/forgot-password" />
        </BottomLinkBox>
      </form>
    </BoxWrap>
  );
};

export default OtpVerifyPage;

// ForgotPasswordEmailIcon
const IconButton = styled(Icon)(() => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "46px",
  height: "46px",
  background: "#E8E8E8",
  borderRadius: "50%",
  marginBottom: "20px",
}));

const BoxWrap = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  height: "100%",
  maxWidth: "424px",
  padding: "0 12px",
}));

const Title = styled(Typography)(() => ({
  fontSize: "30px",
  fontWeight: "700",
  lineHeight: "41px",
  color: "#111111",
  textAlign: "center",
  marginBottom: "5px",
  "@media (max-width: 780px)": {
    fontSize: "24px",
  },
}));

const BottomLinkBox = styled(Box)(() => ({
  textAlign: "center",
  marginTop: "15px",
}));

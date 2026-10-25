import { Controller, useForm } from "react-hook-form";
import React, { useCallback } from "react";
import { Box, styled } from "@mui/material";
import { Email as EmailIcon } from "@mui/icons-material";
import { yupResolver } from "@hookform/resolvers/yup";

import { forgotPasswordSchema } from "utils/validations.utils";
import { useResetPasswordEmailMutation } from "services/authSlice";
import { IForgotPasswordRequest } from "types/authTypes";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import BackButton from "components/elements/Button/BackButton";

interface ForgotPasswordFormProps {
  handleChangeView?: (type: "FORM" | "SUCCESS") => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  handleChangeView,
}) => {
  const methods = useForm<IForgotPasswordRequest>({
    mode: "onChange",
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { handleSubmit, control, setError } = methods;

  const [resetPasswordEmail, { isLoading }] = useResetPasswordEmailMutation();

  const onSubmit = useCallback(
    async (formData: IForgotPasswordRequest) => {
      try {
        const response = await resetPasswordEmail(formData);
        if (response?.error) {
          const message = response?.error?.message ?? "Server Error";
          setError("email", { message: message }, { shouldFocus: true });
          return false;
        }
        handleChangeView?.("SUCCESS");
      } catch {
        /** empty */
      }
    },
    [handleChangeView, resetPasswordEmail, setError]
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      data-testid="login-form"
      className="w-full d-flex flex-column gap-2 mb-7"
    >
      <Controller
        name="email"
        control={control}
        render={({
          field: { onChange },
          fieldState: { invalid, isDirty, error },
        }) => {
          return (
            <CustomTextInput
              fullWidth
              isInvalid={invalid || isDirty}
              label={"Email"}
              placeholder="Enter Email"
              className="mb-7"
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => onChange(event.target.value)}
              helperText={error?.message ?? ""}
              inputProps={{ "data-testid": "email-input" }}
              InputProps={{
                endAdornment: <EmailIcon />,
              }}
            />
          );
        }}
      />
      <PrimaryButton
        label="Submit"
        fullWidth
        type="submit"
        isLoading={isLoading}
        loadingText="Submiting...."
      />
      <BottomLinkBox>
        <BackButton label="Back to login" href="/login" />
      </BottomLinkBox>
    </form>
  );
};

export default ForgotPasswordForm;

const BottomLinkBox = styled(Box)(() => ({
  textAlign: "center",
  marginTop: "30px",
}));

import React, { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { resetPasswordSchema } from "utils/validations.utils";
import { useUpdatePasswordMutation } from "services/authSlice";
import { IResetPasswordRequest } from "types/authTypes";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import { ResetPasswordMessageProps } from "./ResetPasswordSuccess";
import { useLocation } from "react-router-dom";

interface ResetPasswordFormProps {
  handleChangeView?: (
    type: "FORM" | "SUCCESS",
    data: ResetPasswordMessageProps
  ) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  handleChangeView,
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const code = queryParams.get("code");

  const methods = useForm<IResetPasswordRequest>({
    mode: "onChange",
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const { handleSubmit, control, setError } = methods;

  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const onSubmit = useCallback(
    async (formData: IResetPasswordRequest) => {
      try {
        formData.resetCode = code;
        const response = await updatePassword(formData);

        if (response?.error) {
          setError(
            "newPassword",
            { message: response.error as string },
            { shouldFocus: true }
          );
          return false;
        }
        const successData: ResetPasswordMessageProps = {
          type: "success",
          message: "Your password has been successfully updated.",
          title: "Password Changed Successfully!",
        };
        handleChangeView?.("SUCCESS", successData);
      } catch {
        /** empty */
      }
    },
    [code, handleChangeView, setError, updatePassword]
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      data-testid="login-form"
      className="w-full d-flex flex-column gap-2 mb-7"
    >
      <Controller
        name="newPassword"
        control={control}
        render={({
          field: { onChange },
          fieldState: { invalid, isDirty, error },
        }) => {
          return (
            <CustomTextInput
              fullWidth
              isInvalid={invalid || isDirty}
              label={"New Password*"}
              placeholder="Enter New Password*"
              className="mb-7"
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => onChange(event.target.value)}
              helperText={error?.message ?? ""}
              inputProps={{ "data-testid": "new-password-input" }}
              type="password"
            />
          );
        }}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({
          field: { onChange },
          fieldState: { invalid, isDirty, error },
        }) => {
          return (
            <CustomTextInput
              fullWidth
              isInvalid={invalid || isDirty}
              label={"Confirm Password*"}
              placeholder="Enter Confirm Password*"
              className="mb-7"
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => onChange(event.target.value)}
              helperText={error?.message ?? ""}
              inputProps={{ "data-testid": "confirm-password-input" }}
              type="password"
            />
          );
        }}
      />
      <PrimaryButton
        label="Set new Password"
        fullWidth
        type="submit"
        isLoading={isLoading}
        loadingText="Submiting...."
      />
    </form>
  );
};

export default ResetPasswordForm;

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

import { styled } from "@mui/system";
import {
  Box,
  Link,
  Checkbox,
  checkboxClasses,
  FormControlLabel,
  Alert,
} from "@mui/material";
import {
  Email as EmailIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { yupResolver } from "@hookform/resolvers/yup";

import { loginSchema } from "utils/validations.utils";
import { ILoginForm } from "types/authTypes";
import { useAuth } from "hooks";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useLoginMutation } from "services/authSlice";
import Cookies from "js-cookie";
import { appConfig } from "config/app.config";
import { useLazyGetReservationStatusEnumQuery } from "services/statusEnumSlice";
import { useAppDispatch } from "store/hooks";
import { setReservationStatus } from "store/slice/statusList.slice";

const LoginForm: React.FC = () => {
  const { onRefreshToken } = useAuth();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [getReservationStatusEnum] = useLazyGetReservationStatusEnumQuery();
  const tenantFromUrl = appConfig.getTenantFromUrl();
  const savedDomain = tenantFromUrl || appConfig.getCookie("domainName") || "";
  const savedUsername = appConfig.getCookie("Username") || "";
  const savedPassword = appConfig.getCookie("Password") || "";

  const methods = useForm<ILoginForm>({
    mode: "all",
    resolver: yupResolver(loginSchema),
    defaultValues: {
      domain: savedDomain,
      username: savedUsername,
      password: savedPassword,
      rememberMe: false,
    },
  });
  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<ILoginForm> = async (data) => {
    try {
      appConfig.setCookie("domainName", data.domain);
      const response = await login(data);
      if (response?.error) {
        setError(
          "root",
          { message: response?.error?.message ?? (response.error as string) },
          { shouldFocus: true }
        );
        return false;
      }
      const reservationStatusResponse = await getReservationStatusEnum();
      const reservationStatusEnums = reservationStatusResponse?.data ?? [];
      dispatch(setReservationStatus(reservationStatusEnums));
      if (data.rememberMe) {
        appConfig.setCookie("Username", data.username);
        appConfig.setCookie("Password", data.password);
      }
      Cookies.set(appConfig.tokenName, response.data?.access_token, {
        expires: 1,
      });
      Cookies.set(appConfig.domainName, data.domain, {
        expires: 1,
      });
      onRefreshToken();
    } catch {
      /** empty */
    }
  };

  return (
    <Box
      onSubmit={handleSubmit(onSubmit)}
      data-testid="login-form"
      component="form"
      className="w-full d-flex flex-column gap-2 mb-6"
      sx={{ minWidth: "300px" }}
    >
      {errors?.root && <Alert severity="error">{errors.root.message}</Alert>}
      {!tenantFromUrl && (
        <Controller
          name="domain"
          control={control}
          render={({
            field: { onChange, value },
            fieldState: { invalid, error },
          }) => {
            return (
              <CustomTextInput
                fullWidth
                isInvalid={invalid}
                value={value}
                label={"Domain"}
                placeholder="Domain"
                className="mb-7"
                onChange={(
                  event: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement
                  >
                ) => onChange(event.target.value)}
                helperText={error?.message ?? ""}
                inputProps={{ "data-testid": "domain-input" }}
                InputProps={{
                  endAdornment: <LanguageIcon />,
                }}
              />
            );
          }}
        />
      )}
      <Controller
        name="username"
        control={control}
        render={({ field: { onChange }, fieldState: { invalid, error } }) => {
          return (
            <CustomTextInput
              rootSX={{ mt: 4 }}
              fullWidth
              isInvalid={invalid}
              label={"Username"}
              placeholder="Username"
              className="mb-6"
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => onChange(event.target.value)}
              helperText={error?.message ?? ""}
              inputProps={{ "data-testid": "username-input" }}
              InputProps={{
                endAdornment: <EmailIcon />,
              }}
            />
          );
        }}
      />
      <Controller
        name="password"
        control={control}
        render={({ field: { onChange }, fieldState: { invalid, error } }) => {
          return (
            <CustomTextInput
              rootSX={{ mt: 4 }}
              fullWidth
              isInvalid={invalid}
              label={"Password"}
              type="password"
              placeholder="Password"
              className="mb-6"
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => onChange(event.target.value)}
              helperText={error?.message ?? ""}
              inputProps={{ "data-testid": "password-input" }}
            />
          );
        }}
      />
      <MainFullBox className="mb-6">
        <ForgotPasswordLink href="/forgot-password/">
          Forgot Password?
        </ForgotPasswordLink>
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <FormControlLabelMain
              control={<FormControlCheckbox {...field} checked={field.value} />}
              label="Remember me"
            />
          )}
        />
      </MainFullBox>
      <PrimaryButton
        sx={{ mt: 2, display: "flex", mx: "auto" }}
        label="Submit"
        fullWidth
        type="submit"
        isLoading={isLoading}
      />
    </Box>
  );
};

export default LoginForm;

const MainFullBox = styled(Box)(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  marginTop: "1.5rem",
  flexDirection: "column",
}));

const ForgotPasswordLink = styled(Link)(() => ({
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "1",
  color: "#32A1AE",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
}));

// FormControlCheckbox
const FormControlCheckbox = styled(Checkbox)(() => ({
  padding: "0",
  marginRight: "7px",
  [`&.${checkboxClasses.checked}`]: {
    color: "#32A1AE",
  },
}));

const FormControlLabelMain = styled(FormControlLabel)(() => ({
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "1",
  color: "#565656",
  textDecoration: "none",
  margin: "0",
  marginTop: "2rem",
}));

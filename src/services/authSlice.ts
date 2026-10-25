import { createApi } from "@reduxjs/toolkit/query/react";

import {
  transformResetCodeResponse,
  transformWhoAmiResponse,
} from "utils/transform";
import {
  IForgotPasswordRequest,
  IForgotPasswordResponse,
  ILoginForm,
  IPasswordResetCodeResponse,
  IResetPasswordRequest,
  IUserResponse,
} from "types/authTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

const authSlice = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<{ access_token: string }, ILoginForm>({
      query: (credentials) => {
        const formData = new FormData();
        formData.append("username", credentials.username);
        formData.append("password", credentials.password);
        return {
          url: "/auth/login",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            "X-Tenant-ID": credentials.domain,
          },
        };
      },
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<{ access_token: string }>
      ) => response.data,
    }),
    whoAmI: builder.mutation<IUserResponse, void>({
      query: () => ({
        url: "/auth/whoami",
        method: "GET",
      }),
      transformResponse: transformWhoAmiResponse,
    }),
    resetPasswordEmail: builder.mutation<
      IForgotPasswordResponse,
      IForgotPasswordRequest
    >({
      query: (data) => ({
        url: "/user/password/reset/email/",
        method: "POST",
        data,
      }),
    }),
    validateOtp: builder.mutation<
      IPasswordResetCodeResponse,
      { resetCode: string }
    >({
      query: (data) => ({
        url: `/user/password/reset/code/validate?reset_code=${data.resetCode}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: transformResetCodeResponse,
    }),
    updatePassword: builder.mutation<
      IPasswordResetCodeResponse,
      IResetPasswordRequest
    >({
      query: (data) => ({
        url: "/user/password/reset",
        method: "POST",
        data: {
          reset_code: data.resetCode,
          new_password: data.newPassword,
        },
      }),
      transformErrorResponse,
      transformResponse: transformResetCodeResponse,
    }),
  }),
});

export const {
  useResetPasswordEmailMutation,
  useValidateOtpMutation,
  useUpdatePasswordMutation,
  useLoginMutation,
  useWhoAmIMutation,
} = authSlice;
export default authSlice;

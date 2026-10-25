import { AxiosRequestConfig, AxiosError } from "axios";
import { BaseQueryFn } from "@reduxjs/toolkit/query";

import apiClient from "api/axios";
import { ErrorPayload, ErrorResponse, ResponsePayload } from "types/apiTypes";
import { appConfig } from "config/app.config";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
};

export type QueryError = {
  status: number;
  data: ErrorPayload | null;
};

const fetchBaseQuery =
  ({
    baseUrl = appConfig.baseUrl,
  }: {
    baseUrl?: string;
  }): BaseQueryFn<AxiosBaseQueryArgs, unknown, ErrorResponse> =>
  async ({ url, method = "get", data, params, headers }) => {
    try {
      const result = await apiClient({
        url,
        method,
        data,
        params,
        headers,
        baseURL: baseUrl,
      });
      return { data: { data: result.data } };
    } catch (axiosError) {
      const err = axiosError as AxiosError<ErrorPayload>;

      const status = err.response?.status ?? 500;

      let data: ErrorResponse = {
        status: false,
        message: "",
        data: null,
        code: status,
      };
      if (typeof err.response?.data === "object") {
        let message = "";
        if (err.response?.data?.message) {
          message = err.response?.data.message;
        } else if (err.response?.data?.error) {
          message = err.response?.data.error;
        } else if (typeof err.response?.data?.detail === "string") {
          message = err.response?.data.detail;
        }
        data = {
          status: false,
          message,
          data: err.response?.data?.detail ?? null,
          code: status,
        };
      }
      if (typeof err.response?.data === "string") {
        data = {
          status: false,
          message: err.response.data,
          data: null,
          code: status,
        };
      }
      return { error: data };
    }
  };

export const transformResponse = <T>(response: {
  data: ResponsePayload<T>;
}): T => {
  return response.data as T;
};

export const axiosBaseQuery = fetchBaseQuery({ baseUrl: appConfig.baseUrl });
export const baseURL = appConfig.baseUrl;
export const axiosMediaBaseQuery = fetchBaseQuery({
  baseUrl: appConfig.mediaAPI,
});
export const axiosSocketServiceBaseQuery = fetchBaseQuery({
  baseUrl: appConfig.serviceSocketApiUrl,
});

export default axiosBaseQuery;

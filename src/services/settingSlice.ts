import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  // ISetting,
  ICreateSettingRequest,
  ISettingResponse,
  IUpdateSettingRequest,
} from "types/settingTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

export const settingSlice = createApi({
  reducerPath: "settingApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query<ISettingResponse[], { property_id: number }>({
      query: (params) => ({
        url: "/settings/list",
        method: "GET",
        params,
      }),
      transformResponse: (
        response: ResponsePayload<ISettingResponse[]>
      ): ISettingResponse[] => response.data,
      providesTags: ["Settings"],
    }),

    getSettingByKey: builder.query<
      ISettingResponse[],
      { key: string; property_id?: number }
    >({
      query: ({ key, property_id }) => ({
        url: `settings/key/${key}`,
        method: "GET",
        params: {
          property_id: property_id,
        },
      }),
      transformResponse: (
        response: ResponsePayload<ISettingResponse[]>
      ): ISettingResponse[] => response.data,
      providesTags: ["Settings"],
    }),

    getSettingById: builder.query<
      ISettingResponse,
      { id: number; property_id: number }
    >({
      query: (params) => ({
        url: `/settings/${params.id}`,
        method: "GET",
        params: {
          property_id: params.property_id,
        },
      }),
      transformResponse: (
        response: ResponsePayload<ISettingResponse>
      ): ISettingResponse => response.data,
      providesTags: ["Settings"],
    }),

    createSetting: builder.mutation<ISettingResponse, ICreateSettingRequest>({
      query: (data) => ({
        url: "/settings/create",
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<ISettingResponse>
      ): ISettingResponse => response.data,
      transformErrorResponse,
      invalidatesTags: ["Settings"],
    }),

    updateSetting: builder.mutation<ISettingResponse, IUpdateSettingRequest>({
      query: (data) => ({
        url: `/settings/${data.id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<ISettingResponse>
      ): ISettingResponse => response.data,
      transformErrorResponse,
      invalidatesTags: ["Settings"],
    }),

    deleteSetting: builder.mutation<void, { id: number }>({
      query: (params) => ({
        url: `/settings/${params.id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetSettingByKeyQuery,
  useLazyGetSettingByKeyQuery,
  useGetSettingByIdQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
  useDeleteSettingMutation,
} = settingSlice;

export default settingSlice;

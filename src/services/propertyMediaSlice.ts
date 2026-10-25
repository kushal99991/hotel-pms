import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosMediaBaseQuery } from "api/axiosBaseQuery";
import { appConfig } from "config/app.config";
import { ResponsePayload } from "types/apiTypes";
import {
  IMediaS3ContentResponse,
  IPropertyMediaDateResponse,
  IReportMediaItem,
  IReportMediaListResponse,
} from "types/propertyMediaTypes";

import { transformErrorResponse } from "utils/helperFunctions/common";

export const propertyMediaSlice = createApi({
  reducerPath: "propertyMediaApi",
  baseQuery: axiosMediaBaseQuery,
  endpoints: (builder) => ({
    // Fetch property media API
    getMedia: builder.mutation<IMediaS3ContentResponse[], { key: string }>({
      query: ({ key }) => ({
        url: `/list/media?key=${key}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<IPropertyMediaDateResponse>
      ) => response.data.contents,
      transformErrorResponse,
    }),
    // Delete property media API
    deleteMedia: builder.mutation<
      { key: string; message: string; success: boolean },
      { url: string }
    >({
      query: ({ url }) => ({
        url: `/delete/media`,
        method: "POST",
        headers: {
          "x-api-key": appConfig.mediaAPIKey,
        },
        data: { key: url.replace(`${appConfig.mediaPath}/`, "") },
      }),
      transformResponse: (
        response: ResponsePayload<{
          key: string;
          message: string;
          success: boolean;
        }>
      ) => response.data,
      transformErrorResponse,
    }),

    // ✅ New API: Get Report Media from specific bucket and key
    getReportMedia: builder.mutation<
      IReportMediaItem[],
      { bucket: string; key: string }
    >({
      query: ({ bucket, key }) => ({
        url: `/list?bucket=${bucket}&key=${key}`,
        method: "GET",
        headers: {
          "x-api-key": appConfig.mediaAPIKey,
        },
      }),
      transformResponse: (
        response: ResponsePayload<IReportMediaListResponse>
      ) => response.data.results,
      transformErrorResponse,
    }),
  }),
});

export const {
  useDeleteMediaMutation,
  useGetMediaMutation,
  useGetReportMediaMutation,
} = propertyMediaSlice;

export default propertyMediaSlice;

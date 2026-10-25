import { createApi } from "@reduxjs/toolkit/query/react";

import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  INightAuditExecuteStepRequest,
  INightAuditRequest,
  INightAuditResponse,
} from "types/nightAuditTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

const nightAuditSlice = createApi({
  reducerPath: "nightAuditApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getLatestNightAudit: builder.query<
      INightAuditResponse,
      { property_id: number }
    >({
      query: ({ property_id }) => ({
        url: `/night_audits/latest?property_id=${property_id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<INightAuditResponse>) =>
        response.data,
    }),
    getNightAuditList: builder.query<INightAuditResponse[], INightAuditRequest>(
      {
        query: ({ property_id, ...params }) => ({
          url: `/night_audits/?property_id=${property_id}`,
          method: "GET",
          params,
        }),
        transformErrorResponse,
        transformResponse: (response: ResponsePayload<INightAuditResponse[]>) =>
          response.data,
      }
    ),
    nightAuditExecute: builder.mutation<
      INightAuditResponse,
      INightAuditExecuteStepRequest
    >({
      query: (data) => ({
        url: `/night_audits/execute_step`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<INightAuditResponse>) =>
        response.data,
    }),
  }),
});

export const {
  useGetLatestNightAuditQuery,
  useGetNightAuditListQuery,
  useNightAuditExecuteMutation,
} = nightAuditSlice;
export default nightAuditSlice;

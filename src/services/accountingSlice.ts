import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { IAccountReceivables } from "types/accountTypes";
import { ResponsePayload } from "types/apiTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

const accountSlice = createApi({
  reducerPath: "accountApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getAccountReceivables: builder.query<IAccountReceivables[], void>({
      query: () => ({
        url: `/accounting/account_receivables/list`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IAccountReceivables[]>) =>
        response.data,
    }),
    getAccountReceivablesDetail: builder.mutation<
      IAccountReceivables,
      { account_id: number }
    >({
      query: (params) => ({
        url: `/accounting/account_receivables/${params.account_id}`,
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IAccountReceivables>) =>
        response.data,
    }),
  }),
});

export const {
  useGetAccountReceivablesQuery,
  useLazyGetAccountReceivablesQuery,
  useGetAccountReceivablesDetailMutation,
} = accountSlice;
export default accountSlice;

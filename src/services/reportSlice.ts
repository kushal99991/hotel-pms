import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  IReportDailyRevenueRequest,
  IReportDailyRevenueResponse,
} from "types/salesTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

export enum DailyRevenueFilterType {
  DAY = "Today",
  WEEK = "ThisWeek",
  MONTH = "ThisMonth",
  YEAR = "year",
}

const reportSlice = createApi({
  reducerPath: "reportSliceApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getReportDailyRevenue: builder.query<
      IReportDailyRevenueResponse,
      IReportDailyRevenueRequest
    >({
      query: (params) => ({
        url: `/reports/reports/daily-revenue`,
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IReportDailyRevenueResponse>
      ) => response.data,
    }),
  }),
});

export const { useLazyGetReportDailyRevenueQuery } = reportSlice;
export default reportSlice;

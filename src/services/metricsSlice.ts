import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { RoomSummaryResponse } from "types/metricsTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";
import { simpleTransformResponse } from "utils/transform";

const metricsSlice = createApi({
  reducerPath: "metricsSliceApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getRoomSummary: builder.query<RoomSummaryResponse, { property_id: number }>(
      {
        query: (params) => ({
          url: `/metrics/room_summary`,
          method: "GET",
          params,
        }),
        transformErrorResponse,
        transformResponse: simpleTransformResponse,
      }
    ),
  }),
});

export const { useGetRoomSummaryQuery, useLazyGetRoomSummaryQuery } =
  metricsSlice;
export default metricsSlice;

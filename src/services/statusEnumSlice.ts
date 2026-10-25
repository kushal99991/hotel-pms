import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import { IReservationStatusEnum } from "types/settingTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

export const statusEnumSlice = createApi({
  reducerPath: "statusEnumSlice",
  baseQuery: axiosBaseQuery,
  tagTypes: ["enumList"],
  endpoints: (builder) => ({
    getReservationStatusEnum: builder.query<IReservationStatusEnum[], void>({
      query: () => ({
        url: "/reservation/enums",
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IReservationStatusEnum[]>
      ): IReservationStatusEnum[] => response.data,
      providesTags: ["enumList"],
    }),
  }),
});

export const {
  useGetReservationStatusEnumQuery,
  useLazyGetReservationStatusEnumQuery,
} = statusEnumSlice;

export default statusEnumSlice;

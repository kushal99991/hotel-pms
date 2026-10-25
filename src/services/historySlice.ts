import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import { IGetHistoryParams, IHistory } from "types/historyTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

const historySlice = createApi({
  reducerPath: "historyApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getHistoryById: builder.mutation<IHistory[], IGetHistoryParams>({
      query: (params) => {
        // Construct the URL with required and optional parameters
        // let url = `/history/?property_id=${params.property_id}`;

        // // Add optional parameters if they exist
        // if (params.table_id) {
        //   url += `&table_id=${params.table_id}`;
        // }
        // if (params.category) {
        //   url += `&category=${params.category}`;
        // }

        return {
          url: `/history/`,
          method: "GET",
          params,
        };
      },
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IHistory[]>) =>
        response.data,
    }),
  }),
});

export const { useGetHistoryByIdMutation } = historySlice;
export default historySlice;

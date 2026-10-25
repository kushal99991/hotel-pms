import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { simpleTransformResponse } from "utils/transform";
import {
  DeleteInventoryIntervalBody,
  UpdateInventoryIntervalBody,
  GetInventoryParams,
  InventoryItem,
} from "types/inventoryTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

const inventorySlice = createApi({
  reducerPath: "inventorySlice",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryItem[], GetInventoryParams>({
      query: (params) => ({
        url: `/inventory`,
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: simpleTransformResponse,
    }),
    updateInventoryIntervals: builder.mutation<
      string,
      UpdateInventoryIntervalBody
    >({
      query: (data) => ({
        url: `/inventory/intervals`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: simpleTransformResponse,
    }),
    deleteInventoryIntervals: builder.mutation<
      string,
      DeleteInventoryIntervalBody
    >({
      query: (data) => ({
        url: `/inventory/intervals`,
        method: "DELETE",
        data,
      }),
      transformErrorResponse,
      transformResponse: simpleTransformResponse,
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useLazyGetInventoryQuery,
  useDeleteInventoryIntervalsMutation,
  useUpdateInventoryIntervalsMutation,
} = inventorySlice;
export default inventorySlice;

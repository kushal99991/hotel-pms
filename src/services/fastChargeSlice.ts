import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  IAddPreconfigureChargesRequest,
  IPreconfigureCharges,
  IPreconfigureChargesRequest,
} from "types/preconfigureChangeTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

export const fastChargeSlice = createApi({
  reducerPath: "fastChargeApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getFastChargesList: builder.query<
      IPreconfigureCharges[],
      IPreconfigureChargesRequest
    >({
      query: (params) => ({
        url: "/charge_fast_select/",
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IPreconfigureCharges[]>
      ): IPreconfigureCharges[] => response.data,
    }),
    addFastCharges: builder.mutation<
      IPreconfigureCharges,
      IAddPreconfigureChargesRequest
    >({
      query: (data) => ({
        url: "/charge_fast_select/",
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IPreconfigureCharges>
      ): IPreconfigureCharges => response.data,
    }),
    getFastChargesById: builder.mutation<IPreconfigureCharges, { id: number }>({
      query: (params) => ({
        url: `/charge_fast_select/${params.id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IPreconfigureCharges>
      ): IPreconfigureCharges => response.data,
    }),
    updateFastCharges: builder.mutation<
      IPreconfigureCharges,
      IAddPreconfigureChargesRequest
    >({
      query: ({ id, ...data }) => ({
        url: `/charge_fast_select/${id}`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IPreconfigureCharges>
      ): IPreconfigureCharges => response.data,
    }),
    deleteFastCharges: builder.mutation<IPreconfigureCharges, { id: number }>({
      query: ({ id }) => ({
        url: `/charge_fast_select/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IPreconfigureCharges>
      ): IPreconfigureCharges => response.data,
    }),
  }),
});

export const {
  useGetFastChargesListQuery,
  useAddFastChargesMutation,
  useGetFastChargesByIdMutation,
  useUpdateFastChargesMutation,
  useDeleteFastChargesMutation,
} = fastChargeSlice;
export default fastChargeSlice;

import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  IAddServiceRequest,
  IServiceRequest,
  IServiceRequestResponse,
  IUpdateReservationServiceRequest,
} from "types/serviceRequestTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

const serviceRequestSlice = createApi({
  reducerPath: "serviceRequestApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    serviceRequest: builder.query<
      IServiceRequest[],
      { property_id?: number; posting_code_id?: number }
    >({
      query: (params) => ({
        url: `/service_request/`,
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IServiceRequest[]>) =>
        response.data,
    }),
    addServiceRequest: builder.mutation<IServiceRequest, IAddServiceRequest>({
      query: (data) => ({
        url: `/service_request/`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IServiceRequest>) =>
        response.data,
    }),
    getServiceRequestById: builder.mutation<IServiceRequest, { id: number }>({
      query: ({ id }) => ({
        url: `/service_request/${id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IServiceRequest>) =>
        response.data,
    }),
    updateServiceRequest: builder.mutation<IServiceRequest, IAddServiceRequest>(
      {
        query: ({ id, ...rest }) => ({
          url: `/service_request/${id}`,
          method: "PUT",
          data: rest,
        }),
        transformErrorResponse,
        transformResponse: (response: ResponsePayload<IServiceRequest>) =>
          response.data,
      }
    ),
    deleteServiceRequest: builder.mutation<IServiceRequest, { id: number }>({
      query: ({ id }) => ({
        url: `/service_request/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IServiceRequest>) =>
        response.data,
    }),
    getServiceRequestByReservation: builder.query<
      IServiceRequestResponse[],
      { reservation_id?: number; property_id?: number }
    >({
      query: (params) => ({
        url: `/reservation/service_request`,
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IServiceRequestResponse[]>
      ) => response.data,
    }),
    updateServiceRequestByReservation: builder.mutation<
      IServiceRequestResponse,
      IUpdateReservationServiceRequest
    >({
      query: ({ id, ...rest }) => ({
        url: `/reservation/service_request/${id}`,
        method: "PUT",
        data: rest,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IServiceRequestResponse>) =>
        response.data,
    }),
    addServiceRequestByReservation: builder.mutation<
      IServiceRequestResponse,
      IUpdateReservationServiceRequest
    >({
      query: (data) => ({
        url: `/reservation/service_request`,
        method: "POST",
        data: {
          service_request_id: data.service_request_id,
          reservation_id: data.reservation_id,
        },
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IServiceRequestResponse>) =>
        response.data,
    }),
    deleteServiceRequestByReservation: builder.mutation<
      IServiceRequestResponse,
      { id: number }
    >({
      query: ({ id }) => ({
        url: `/reservation/service_request/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IServiceRequestResponse>) =>
        response.data,
    }),
  }),
});

export const {
  useServiceRequestQuery,
  useAddServiceRequestMutation,
  useDeleteServiceRequestMutation,
  useGetServiceRequestByIdMutation,
  useUpdateServiceRequestMutation,

  // Reservation Service Request
  useGetServiceRequestByReservationQuery,
  useUpdateServiceRequestByReservationMutation,
  useAddServiceRequestByReservationMutation,
  useDeleteServiceRequestByReservationMutation,
} = serviceRequestSlice;
export default serviceRequestSlice;

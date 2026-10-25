import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  ICreateMaintenance,
  IMaintenanceEnum,
  IMaintenanceType,
} from "types/maintenanceTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

export const maintenanceSlice = createApi({
  reducerPath: "maintenanceApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getMaintenanceList: builder.mutation<IMaintenanceType[], any>({
      query: (params) => ({
        url: "/maintenance/tickets/list",
        method: "GET",
        params: { ...params },
      }),
      transformResponse: (
        response: ResponsePayload<IMaintenanceType[]>
      ): IMaintenanceType[] => response.data,
    }),
    getMaintenanceEnumList: builder.query<IMaintenanceEnum, void>({
      query: () => ({
        url: "/maintenance/ticket/status/enum/list",
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<IMaintenanceEnum>
      ): IMaintenanceEnum => response.data,
    }),
    createMaintenanceTicket: builder.mutation<any, ICreateMaintenance>({
      query: (request) => ({
        url: `/maintenance/ticket`,
        method: "POST",
        data: request,
      }),
      transformResponse: (response: ResponsePayload<any>): any => response.data,
      transformErrorResponse,
    }),
    getMaintenanceTicketByid: builder.mutation<
      IMaintenanceType,
      { id: string }
    >({
      query: (params) => ({
        url: `/maintenance/ticket/${params.id}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<IMaintenanceType>
      ): IMaintenanceType => response.data,
    }),
    updateMaintenanceTicket: builder.mutation<
      any,
      { key: string; value: string; id: string }
    >({
      query: (params) => ({
        url: `/maintenance/ticket/update/attribute/${params.id}`,
        method: "PUT",
        data: params,
      }),
    }),
    updateMaintenanceDiscussion: builder.mutation<
      any,
      { subject: string; message: string; id: string }
    >({
      query: (params) => ({
        url: `/maintenance/ticket/discussion/${params.id}`,
        method: "PUT",
        data: params,
      }),
    }),
    completeMaintenanceTicket: builder.mutation<
      any,
      { frontdesk_status: string; service_notes: string; id: string }
    >({
      query: (params) => ({
        url: `/maintenance/ticket/complete/${params.id}`,
        method: "PUT",
        data: {
          frontdesk_status: params.frontdesk_status,
          notes: params.service_notes,
        },
      }),
    }),
    assignMaintenanceTicket: builder.mutation<
      any,
      { userId: string; id: string }
    >({
      query: (params) => ({
        url: `/maintenance/ticket/assign/${params.id}`,
        method: "PUT",
        data: { assigned_to: params.userId },
      }),
    }),
  }),
});

export const {
  useGetMaintenanceListMutation,
  useCreateMaintenanceTicketMutation,
  useGetMaintenanceEnumListQuery,
  useGetMaintenanceTicketByidMutation,
  useUpdateMaintenanceTicketMutation,
  useAssignMaintenanceTicketMutation,
  useCompleteMaintenanceTicketMutation,
  useUpdateMaintenanceDiscussionMutation,
} = maintenanceSlice;
export default maintenanceSlice;

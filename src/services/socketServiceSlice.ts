import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosSocketServiceBaseQuery } from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  IMessageAlertRequest,
  ISendNotificationRequest,
  MessageNotification,
  MessageResult,
  UpdateMessageNotification,
} from "types/serviceSocket";

import { transformErrorResponse } from "utils/helperFunctions/common";

export const socketServiceSlice = createApi({
  reducerPath: "socketServiceApi",
  baseQuery: axiosSocketServiceBaseQuery,
  endpoints: (builder) => ({
    getNotificationList: builder.mutation<
      MessageNotification,
      IMessageAlertRequest
    >({
      query: (params) => {
        const query = new URLSearchParams({
          room: params.room ?? "default-org-1-property-1",
          filter: params.filter ?? "",
        }).toString();

        return {
          url: `/api/alerts?${query}`,
          method: "GET",
        };
      },
      transformResponse: (
        response: ResponsePayload<MessageNotification>
      ): MessageNotification => response.data,
      transformErrorResponse,
    }),
    sendNotification: builder.mutation<
      MessageNotification,
      ISendNotificationRequest
    >({
      query: (body) => ({
        url: `/api/alert`,
        method: "POST",
        data: body,
      }),
      transformResponse: (
        response: ResponsePayload<MessageNotification>
      ): MessageNotification => response.data,
      transformErrorResponse,
    }),
    // ✅ Get notification by ID
    getNotificationDetail: builder.query<MessageNotification, string>({
      query: (id) => ({
        url: `/api/alerts/${id}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<MessageNotification>
      ): MessageNotification => response.data,
      transformErrorResponse,
    }),

    // ✅ Update notification by ID (e.g., mark as read)
    updateNotification: builder.mutation<
      MessageResult,
      Partial<ISendNotificationRequest>
    >({
      query: (data) => ({
        url: `/api/alert`,
        method: "PUT",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<UpdateMessageNotification>
      ): MessageResult => response.data.results,
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetNotificationListMutation,
  useSendNotificationMutation,
  useGetNotificationDetailQuery,
  useLazyGetNotificationDetailQuery,
  useUpdateNotificationMutation,
} = socketServiceSlice;

export default socketServiceSlice;

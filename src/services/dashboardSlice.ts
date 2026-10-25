import { createApi } from "@reduxjs/toolkit/query/react";

import {
  transformDashboardResponse,
  transformDashboardResponseObj,
} from "utils/transform";
import {
  GuestStatus,
  GuestStatusList,
  HouseBreakdownType,
  IHouseCountApiParams,
  IResGuestCount,
  IResGuestCountRequest,
  ICompReservation,
  ICompReservationsRequest,
} from "types/bookingDashboardTypes";
import { ResponsePayload } from "types/apiTypes";
import axiosBaseQuery from "api/axiosBaseQuery";

const dashboardSlice = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getHouseCountSummary: builder.mutation<
      GuestStatusList,
      IHouseCountApiParams
    >({
      query: (params) => ({
        url: `/dashboard/metrics/house_count?date=${params.date}&property_id=${params.propertyId}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<GuestStatusList>
      ): GuestStatusList => transformDashboardResponse(response.data),
    }),
    getHouseBreakdownSummary: builder.mutation<
      HouseBreakdownType,
      IHouseCountApiParams
    >({
      query: (params) => ({
        url: `/dashboard/metrics/house-break-down?date=${params.date}&property_id=${params.propertyId}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<HouseBreakdownType>
      ): HouseBreakdownType => response.data,
    }),
    getReservationCount: builder.mutation<
      IResGuestCount[],
      IResGuestCountRequest
    >({
      query: (params) => ({
        url: `/dashboard/metrics/reservation/count?property_id=${params.property_id}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<IResGuestCount[]>
      ): IResGuestCount[] => response.data,
    }),
    getGuestCount: builder.mutation<IResGuestCount[], IResGuestCountRequest>({
      query: (params) => ({
        url: `/dashboard/metrics/guest/count?property_id=${params.property_id}&include_children=${params.include_children ?? false}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<IResGuestCount[]>
      ): IResGuestCount[] => response.data,
    }),
    getRoomGuestReady: builder.mutation<GuestStatus, IHouseCountApiParams>({
      query: (params) => ({
        url: `/dashboard/metrics/rooms/guest_ready?date=${params.date}&property_id=${params.propertyId}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<GuestStatus>
      ): GuestStatus => transformDashboardResponseObj(response.data),
    }),
    getRoomRevenue: builder.mutation<GuestStatus, IHouseCountApiParams>({
      query: (params) => ({
        url: `/dashboard/metrics/rooms/revenue?date=${params.date}&property_id=${params.propertyId}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<GuestStatus>
      ): GuestStatus => transformDashboardResponseObj(response.data),
    }),
    getRoomSold: builder.mutation<GuestStatus, IHouseCountApiParams>({
      query: (params) => ({
        url: `/dashboard/metrics/rooms/sold?date=${params.date}&property_id=${params.propertyId}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<GuestStatus>
      ): GuestStatus => transformDashboardResponseObj(response.data),
    }),
    getCompReservations: builder.mutation<
      ICompReservation[],
      ICompReservationsRequest
    >({
      query: (params) => ({
        url: `/metrics/comp_reservations?property_id=${params.property_id}${
          params.arrival_date ? `&arrival_date=${params.arrival_date}` : ""
        }${params.departure_date ? `&departure_date=${params.departure_date}` : ""}${
          params.date ? `&date=${params.date}` : ""
        }`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<ICompReservation[]>
      ): ICompReservation[] => response.data,
    }),
  }),
});

export const {
  useGetHouseCountSummaryMutation,
  useGetRoomGuestReadyMutation,
  useGetRoomRevenueMutation,
  useGetRoomSoldMutation,
  useGetHouseBreakdownSummaryMutation,
  useGetGuestCountMutation,
  useGetReservationCountMutation,
  useGetCompReservationsMutation,
} = dashboardSlice;
export default dashboardSlice;

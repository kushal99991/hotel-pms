import { createApi } from "@reduxjs/toolkit/query/react";

import {
  simpleTransformResponse,
  transformRoomAssignResponse,
  transGetNewRoomNumberListResponse,
  transGetRoomAmenitiesResponse,
  transGetRoomAvailabilityListResponse,
  transGetRoomNumberListResponse,
} from "utils/transform";
import {
  IGetRoomAvailableRequest,
  IGetRoomListRequest,
  INewRoomNumberList,
  IRoomAvailabilityIdsResponse,
  IRoomAmenitiesCategory,
  IRoomNumberList,
  IRoomNumberListResponse,
} from "types/roomSliceTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import { IRoomAssignRequest } from "types/roomTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";
import {
  ICreateRoomBlockRequest,
  IRoomBlockListRequest,
  IRoomBlockListResponse,
  IUpdateStatusRoom,
} from "types/houseKeeperTypes";
import { ResponsePayload } from "types/apiTypes";

export const roomSlice = createApi({
  reducerPath: "roomApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getRoomAvailabilityList: builder.mutation<
      IRoomAvailabilityIdsResponse[],
      IGetRoomAvailableRequest
    >({
      query: (params) => ({
        url: "/rooms/availability",
        method: "GET",
        params: {
          start_date: params.startDate,
          end_date: params.endDate,
          room_type_ids: params.roomTypeId,
        },
      }),
      transformResponse: transGetRoomAvailabilityListResponse,
    }),
    getRoomList: builder.query<IRoomNumberList[], IGetRoomListRequest>({
      query: (params) => ({
        url: "/rooms/list",
        method: "GET",
        params: { ...params, room_type_id: params?.roomTypeId },
      }),
      transformResponse: transGetRoomNumberListResponse,
    }),
    getRoomListByPropertyId: builder.query<
      INewRoomNumberList[],
      { id: number }
    >({
      query: (params) => ({
        url: `/housekeeping/rooms/suggest/service/${params.id}`,
        method: "GET",
      }),
      transformResponse: transGetNewRoomNumberListResponse,
    }),
    roomAssignReservation: builder.mutation<
      { message: string },
      IRoomAssignRequest
    >({
      query: (request) => ({
        url: `/rooms/assign_room`,
        method: "POST",
        data: {
          reservation_id: request.reservationId,
          start_date: request.startDate,
          end_date: request.endDate,
          room_id: request.roomId,
          old_room_id: request?.old_room_id ?? undefined,
        },
      }),
      transformResponse: transformRoomAssignResponse,
      transformErrorResponse,
    }),
    roomUnassignReservation: builder.mutation<
      { message: string },
      { reservationId: number }
    >({
      query: (request) => ({
        url: `/rooms/unassign_room`,
        method: "POST",
        data: {
          reservation_id: request.reservationId,
        },
      }),
      transformResponse: (response: ResponsePayload<{ message: string }>) =>
        response.data,
      transformErrorResponse,
    }),
    getRoomAmenitiesCategory: builder.query<
      IRoomAmenitiesCategory[],
      { property_id?: number }
    >({
      query: (params) => ({
        url: "/room_types/amenity/category",
        method: "GET",
        params,
      }),
      transformResponse: transGetRoomAmenitiesResponse,
    }),
    updateRoomStatus: builder.mutation<any[], IUpdateStatusRoom>({
      query: (data) => {
        const requestPayload = {
          room_ids: data.id,
          housekeeping_status: data.housekeeping_status,
          frontdesk_status: data.frontdesk_status,
          room_status: data.room_status,
        };
        return {
          url: `/rooms/status`,
          method: "PUT",
          data: requestPayload,
        };
      },
      transformErrorResponse,
    }),
    getRoomBlocksList: builder.query<
      IRoomBlockListResponse[],
      IRoomBlockListRequest
    >({
      query: (params) => ({
        url: `/rooms/room_blocks/list`,
        method: "GET",
        params,
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    createRoomBlock: builder.mutation<
      IRoomBlockListResponse[],
      ICreateRoomBlockRequest
    >({
      query: (data) => ({
        url: `/rooms/room_blocks`,
        method: "PUT",
        data,
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    deleteRoomBlock: builder.mutation<
      IRoomBlockListResponse[],
      ICreateRoomBlockRequest
    >({
      query: (data) => ({
        url: `/rooms/room_blocks`,
        method: "DELETE",
        data,
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetRoomListQuery,
  useLazyGetRoomListQuery,
  useRoomAssignReservationMutation,
  useGetRoomAvailabilityListMutation,
  useGetRoomAmenitiesCategoryQuery,
  useUpdateRoomStatusMutation,
  useGetRoomListByPropertyIdQuery,
  useRoomUnassignReservationMutation,

  // Room Blocks API
  useGetRoomBlocksListQuery,
  useLazyGetRoomBlocksListQuery,
  useCreateRoomBlockMutation,
  useDeleteRoomBlockMutation,
} = roomSlice;
export default roomSlice;

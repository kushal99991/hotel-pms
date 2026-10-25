import { createApi } from "@reduxjs/toolkit/query/react";

import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  IRoomAmenity,
  IRoomAmenityAttachResponse,
  IRoomAmenityRequest,
} from "types/roomAmenitiesTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

export const roomAmenitiesSlice = createApi({
  reducerPath: "roomAmenitiesApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    // Fetch all room amenities
    getRoomAmenities: builder.query<IRoomAmenity[], { property_id?: number }>({
      query: (params) => ({
        url: "/room_types/room_amenities/list",
        method: "GET",
        params,
      }),
      transformResponse: (response: ResponsePayload<IRoomAmenity[]>) =>
        response.data,
      transformErrorResponse,
    }),
    // Fetch a specific room amenity by ID
    getRoomAmenityById: builder.mutation<IRoomAmenity, { id: string }>({
      query: ({ id }) => ({
        url: `/room_types/room_amenities/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ResponsePayload<IRoomAmenity>) =>
        response.data,
      transformErrorResponse,
    }),
    // Add a new room amenity
    addRoomAmenity: builder.mutation<IRoomAmenity, IRoomAmenityRequest>({
      query: (request) => ({
        url: "/room_types/room_amenities",
        method: "POST",
        data: request,
      }),
      transformResponse: (response: ResponsePayload<IRoomAmenity>) =>
        response.data,
      transformErrorResponse,
    }),
    // Update an existing room amenity
    updateRoomAmenity: builder.mutation<
      IRoomAmenity,
      { id: number; request: IRoomAmenityRequest }
    >({
      query: ({ id, request }) => ({
        url: `/room_types/room_amenities/${id}`,
        method: "PUT",
        data: request,
      }),
      transformResponse: (response: ResponsePayload<IRoomAmenity>) =>
        response.data,
      transformErrorResponse,
    }),
    // Delete a room amenity by ID
    deleteRoomAmenity: builder.mutation<ResponsePayload<null>, number>({
      query: (id) => ({
        url: `/room_types/room_amenities/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
    }),
    // Attach a room amenity by ID
    attachRoomAmenity: builder.mutation<
      IRoomAmenityAttachResponse,
      { room_type_id: number; room_amenity_id: number }
    >({
      query: (data) => ({
        url: `/room_types/room_amenity/attach`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IRoomAmenityAttachResponse>
      ): IRoomAmenityAttachResponse => response.data,
    }),
    // Detech a room amenity by ID
    detachRoomAmenity: builder.mutation<
      IRoomAmenityAttachResponse,
      { room_type_id: number; room_amenity_id: number }
    >({
      query: (data) => ({
        url: `/room_types/room_amenity/detach`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IRoomAmenityAttachResponse>
      ): IRoomAmenityAttachResponse => response.data,
    }),
  }),
});

export const {
  useAddRoomAmenityMutation,
  useGetRoomAmenitiesQuery,
  useGetRoomAmenityByIdMutation,
  useUpdateRoomAmenityMutation,
  useDeleteRoomAmenityMutation,

  useAttachRoomAmenityMutation,
  useDetachRoomAmenityMutation,
} = roomAmenitiesSlice;
export default roomAmenitiesSlice;

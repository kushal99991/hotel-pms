import { createApi } from "@reduxjs/toolkit/query/react";

import {
  transformGetRateCodeResponse,
  transformGetRoomTypeAvailabilityResponse,
  transformGetRoomTypesResponse,
  transformInventoryResponse,
  transformRoomTypeByIdResponse,
  transformRoomTypeInventoryResponse,
} from "utils/transform";
import {
  ICreateBulkRoomNumberResponse,
  IGetRoomTypeAvailabilityRequest,
  IGetRoomTypeAvailabilityUpdateResponse,
  IGetRoomTypeRequest,
  IRateCodeResponse,
  IRoomTypeInventory,
  IRoomTypeRequest,
  IRoomTypes,
} from "types/roomTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";
import {
  IRoomAssignResponse,
  IRoomNumberCreateBulkRequest,
} from "types/roomSliceTypes";
import { IInventory } from "types/reservationTypes";

export const roomTypeSlice = createApi({
  reducerPath: "roomTypeApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getRoomTypeAvailability: builder.mutation<
      IGetRoomTypeAvailabilityUpdateResponse,
      IGetRoomTypeAvailabilityRequest
    >({
      query: (params) => {
        const updateParams = {
          start_date: params?.startDate || "",
          end_date: params?.endDate || "",
          room_type_ids: params?.roomTypeIds || "",
          number_of_guests: parseInt(params?.numberOfGuests || "0", 10),
          rate_code: parseInt(params?.rateCode || "0", 10),
          property_id: params.property_id ?? "",
        };
        return {
          url: "/room_types/availability",
          method: "GET",
          params: updateParams,
        };
      },
      transformResponse: transformGetRoomTypeAvailabilityResponse,
    }),
    getRoomTypeByPropertyId: builder.mutation<
      IRoomTypes[],
      IGetRoomTypeRequest
    >({
      query: ({ propertyId }) => ({
        url: `/room_types/${propertyId}`,
        method: "GET",
      }),
      transformResponse: transformGetRoomTypesResponse,
    }),
    getRateCodeByPropertyId: builder.mutation<
      IRateCodeResponse[],
      { propertyId: number; type?: string; active?: boolean }
    >({
      query: ({ propertyId, ...rest }) => ({
        url: `/rates/rate_codes/?property_id=${propertyId}`,
        method: "GET",
        params: rest,
      }),
      transformResponse: transformGetRateCodeResponse,
    }),
    getRoomTypeInventory: builder.mutation<
      IRoomTypeInventory[],
      {
        propertyId: number;
        startDate: string;
        endDate: string;
      }
    >({
      query: ({ propertyId, startDate, endDate }) => ({
        url: `/room_types/${propertyId}/inventory?start_date=${startDate}&end_date=${endDate}`,
        method: "GET",
      }),
      transformResponse: transformRoomTypeInventoryResponse,
    }),
    getInventory: builder.mutation<
      IInventory[],
      {
        property_id: number;
        start_date: string;
        end_date: string;
        rate_code_ids?: string[] | string;
        room_type_ids?: string[] | string;
      }
    >({
      query: ({
        property_id,
        start_date,
        end_date,
        rate_code_ids,
        room_type_ids,
      }) => {
        const params = new URLSearchParams();
        params.append("property_id", String(property_id));
        params.append("start_date", start_date);
        params.append("end_date", end_date);
        // Handle rate_code_ids (string or array)
        if (rate_code_ids) {
          if (Array.isArray(rate_code_ids)) {
            rate_code_ids.forEach((id) => params.append("rate_code_ids", id));
          } else {
            params.append("rate_code_ids", rate_code_ids);
          }
        }
        // Handle room_type_ids (string or array)
        if (room_type_ids) {
          if (Array.isArray(room_type_ids)) {
            room_type_ids.forEach((id) => params.append("room_type_ids", id));
          } else {
            params.append("room_type_ids", room_type_ids);
          }
        }

        return {
          url: `/inventory?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: transformInventoryResponse,
    }),
    addRoomType: builder.mutation<IRoomTypes, IRoomTypeRequest>({
      query: (data) => ({
        url: `/room_types/`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRoomTypes>) =>
        response.data,
    }),
    updateRoomType: builder.mutation<IRoomTypes, IRoomTypeRequest>({
      query: (data) => {
        const { id, ...rest } = data;
        return {
          url: `/room_types/${id}`,
          method: "PUT",
          data: rest,
        };
      },
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRoomTypes>) =>
        response.data,
    }),
    getRoomTypeById: builder.mutation<IRoomTypes, { id: string }>({
      query: (data) => ({
        url: `/room_types/${data.id}/read`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: transformRoomTypeByIdResponse,
    }),
    getRoomTypeGetRoomById: builder.mutation<
      IRoomAssignResponse[],
      { id: string }
    >({
      query: (data) => ({
        url: `/room_types/get/rooms/${data.id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRoomAssignResponse[]>) =>
        response.data,
    }),
    bulkRoomCreate: builder.mutation<
      ICreateBulkRoomNumberResponse,
      IRoomNumberCreateBulkRequest
    >({
      query: ({ data, danger_drop_rooms = false }) => ({
        url: `/room_types/bulk/rooms/create?danger_drop_rooms=${danger_drop_rooms}`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<ICreateBulkRoomNumberResponse>
      ) => response.data,
    }),
    dropRoom: builder.mutation<
      IRoomTypes,
      {
        room_type_id: number;
        room_id: number;
        unassign_planned_rooms_automatically?: boolean;
        force_delete?: boolean;
      }
    >({
      query: (data) => ({
        url: `/room_types/drop/rooms`,
        method: "DELETE",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRoomTypes>) =>
        response.data,
    }),
  }),
});

export const {
  useGetRoomTypeAvailabilityMutation,
  useGetRoomTypeByPropertyIdMutation,
  useGetRateCodeByPropertyIdMutation,
  useGetRoomTypeInventoryMutation,
  useAddRoomTypeMutation,
  useUpdateRoomTypeMutation,
  useGetRoomTypeByIdMutation,
  useGetRoomTypeGetRoomByIdMutation,
  useBulkRoomCreateMutation,
  useDropRoomMutation,
  useGetInventoryMutation,
} = roomTypeSlice;
export default roomTypeSlice;

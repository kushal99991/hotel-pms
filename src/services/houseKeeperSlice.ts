import { createApi } from "@reduxjs/toolkit/query/react";

import {
  transformRoomAssignResponse,
  transGetRoomNumberListResponse,
} from "utils/transform";
import {
  ICustomStatus,
  IHousekeeperBoard,
  ISaveBoard,
  IService,
  IShift,
  ITask,
} from "types/houseKeeperTypes";
import {
  ILostAndFoundItem,
  ICreateLostAndFoundItem,
  ILostAndFoundResponse,
} from "types/lostAndFoundTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";
import { ResponsePayload } from "types/apiTypes";

export const houseKeeperSlice = createApi({
  reducerPath: "houseKeeperApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getHousekeeperList: builder.query<any[], any>({
      query: (params) => ({
        url: "/housekeeping/list",
        method: "GET",
        params: { ...params, room_type_id: params.roomTypeId },
      }),
      transformResponse: transGetRoomNumberListResponse,
    }),
    getHousekeeperEnumsList: builder.query<ICustomStatus, void>({
      query: () => ({
        url: "/housekeeping/enums",
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<ICustomStatus>
      ): ICustomStatus => response.data,
    }),
    getMyTask: builder.query<ITask[], { date?: string; property_id?: number }>({
      query: ({ date, property_id }) => ({
        url: `housekeeping/my/tasks`,
        method: "GET",
        params: {
          property_id,
          ...(date ? { date } : {}),
        },
      }),
      transformResponse: (response: ResponsePayload<ITask[]>): ITask[] =>
        response.data,
    }),
    getServiceCredits: builder.query<
      IService[],
      {
        roomTypeId?: number;
        property_id: number;
      }
    >({
      query: (params) => ({
        url: "/housekeeping/service_credits",
        method: "GET",
        params: {
          ...params,
          room_type_id: params.roomTypeId,
          property_id: params.property_id,
        },
      }),
      transformResponse: (response: ResponsePayload<IService[]>): IService[] =>
        response.data,
    }),
    updateServiceCredits: builder.mutation<
      IService,
      {
        id: number;
        service_type?: string;
        description?: string;
        credits?: number;
        room_type_id?: number;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/housekeeping/service_credits/${id}`,
        method: "PUT",
        data: data,
      }),
      transformResponse: (response: ResponsePayload<IService>): IService =>
        response.data,
      transformErrorResponse,
    }),
    getHousekeepingBoards: builder.query<
      IHousekeeperBoard[],
      {
        property_id: number;
        start_date?: string;
        end_date?: string;
        shift_id?: number;
        include_archived?: boolean;
      }
    >({
      query: (params) => {
        return {
          url: `/housekeeping/boards`,
          method: "GET",
          params: params,
        };
      },
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IHousekeeperBoard[]> | undefined
      ): IHousekeeperBoard[] => response?.data ?? [],
    }),
    updateHousekeepingBoard: builder.mutation<
      IHousekeeperBoard[],
      {
        id: number;
        housekeeper_id: number;
        property_id: number;
        active?: boolean;
        notes?: string;
      }
    >({
      query: (data) => ({
        url: `/housekeeping/boards/${data.id}`,
        method: "PUT",
        data: data,
      }),
      transformErrorResponse,
    }),
    startHousekeepingTask: builder.mutation<
      IHousekeeperBoard[],
      { id: number }
    >({
      query: (data) => ({
        url: `/housekeeping/start/task/${data.id}`,
        method: "PUT",
      }),
      transformErrorResponse,
    }),
    stopHousekeepingTask: builder.mutation<
      IHousekeeperBoard[],
      { id: number; housekeeping_status: string }
    >({
      query: (data) => ({
        url: `/housekeeping/stop/task/${data.id}`,
        method: "PUT",
        data: {
          housekeeping_status: data.housekeeping_status,
        },
      }),
      transformErrorResponse,
    }),
    updateHousekeepingTaskById: builder.mutation<
      void, // Assuming no specific response type, replace `void` with the actual response type if needed
      {
        id: number; // Task ID
        notes?: string; // Optional notes field
        board_id: number; // Mandatory board ID
        room_id?: number; // Optional room ID
        credits?: number; // Optional credits
        service_credit_id?: number;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/housekeeping/housekeeper_tasks/${id}`,
        method: "PUT",
        data: data,
      }),
      transformErrorResponse,
    }),

    deleteHousekeepingTaskById: builder.mutation<
      void, // Assuming no specific response type
      {
        id: number; // Task ID to delete
      }
    >({
      query: ({ id }) => ({
        url: `/housekeeping/housekeeper_tasks/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
    }),

    getHousekeepingShiftList: builder.query<IShift[], { property_id?: number }>(
      {
        query: ({ property_id } = {}) => ({
          url: `/housekeeping/shifts${property_id ? `?property_id=${property_id}` : ""}`,
          method: "GET",
        }),
        transformResponse: (response: ResponsePayload<IShift[]>): IShift[] =>
          response.data,
      }
    ),
    saveBoard: builder.mutation<{ message: string }, ISaveBoard>({
      query: (request) => ({
        url: `/housekeeping/board_with_housekeeper_tasks`,
        method: "POST",
        data: request,
      }),
      transformResponse: transformRoomAssignResponse,
      transformErrorResponse,
    }),

    // Lost & Found APIs
    getLostItems: builder.query<
      ILostAndFoundItem[],
      {
        property_id: number;
        status?: string;
        datetime_found?: string;
        return_date?: string;
        search_text?: string;
      }
    >({
      query: (params) => ({
        url: `/lost_items/`,
        method: "GET",
        params: params,
      }),
      transformResponse: (
        response: ResponsePayload<ILostAndFoundItem[]>
      ): ILostAndFoundItem[] => response.data,
    }),

    getLostItemById: builder.query<
      ILostAndFoundItem,
      { id: number; property_id: number }
    >({
      query: ({ id, property_id }) => ({
        url: `/lost_items/`,
        method: "GET",
        params: { id, property_id },
      }),
      transformResponse: (
        response: ResponsePayload<ILostAndFoundItem | ILostAndFoundItem[]>
      ): ILostAndFoundItem => {
        const data: any = response.data as any;
        return Array.isArray(data)
          ? (data[0] as ILostAndFoundItem)
          : (data as ILostAndFoundItem);
      },
    }),

    createLostItem: builder.mutation<
      ILostAndFoundResponse,
      ICreateLostAndFoundItem
    >({
      query: (data) => ({
        url: `/lost_items/`,
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<ILostAndFoundResponse>
      ): ILostAndFoundResponse => response.data,
      transformErrorResponse,
    }),

    updateLostItem: builder.mutation<
      ILostAndFoundItem,
      { id: number } & Partial<ICreateLostAndFoundItem>
    >({
      query: ({ id, ...data }) => ({
        url: `/lost_items/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<ILostAndFoundItem>
      ): ILostAndFoundItem => response.data,
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetHousekeeperListQuery,
  useSaveBoardMutation,
  useGetHousekeepingBoardsQuery,
  useLazyGetHousekeepingBoardsQuery,
  useGetHousekeepingShiftListQuery,
  useGetServiceCreditsQuery,
  useUpdateHousekeepingBoardMutation,
  useGetHousekeeperEnumsListQuery,
  useGetMyTaskQuery,
  useStartHousekeepingTaskMutation,
  useStopHousekeepingTaskMutation,
  useUpdateHousekeepingTaskByIdMutation,
  useUpdateServiceCreditsMutation,
  useDeleteHousekeepingTaskByIdMutation,
  // Lost & Found hooks
  useGetLostItemsQuery,
  useGetLostItemByIdQuery,
  useCreateLostItemMutation,
  useUpdateLostItemMutation,
} = houseKeeperSlice;
export default houseKeeperSlice;

import { createApi } from "@reduxjs/toolkit/query/react";

import { transformStayDateResponse } from "utils/transform";
import {
  IGuest,
  IGuestStayParams,
  ILinkGuestWithReservationResponse,
  IQuickSearchParams,
  IStayDate,
} from "types/quickSearch";
import { IGuestResponse } from "types/reservationTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import { IAddNewGuestForm } from "types/guestTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";

const guestSlice = createApi({
  reducerPath: "guestApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    quickSearch: builder.query<IStayDate, IQuickSearchParams>({
      query: (params) => {
        const updateParams = {
          property_id: params?.propertyId || "1",
          first_name: params?.firstName || "",
          last_name: params?.lastName || "",
          address: params?.address || "",
          email: params?.email || "",
          phone_number: params?.phoneNumber || "",
          start_date: params?.startDate || "",
          end_date: params?.endDate || "",
          reservation_status: params?.reservationStatus || "",
          reservation_stay_status: params?.reservationStayStatus || "",
        };

        return {
          url: "/guests/lookup",
          method: "GET",
          params: updateParams,
        };
      },
      transformResponse: transformStayDateResponse,
    }),

    fetchGuestsByStayDate: builder.mutation<IStayDate, IGuestStayParams>({
      query: (params) => ({
        url: "/guests/stay_date",
        method: "GET",
        params: {
          property_id: params.propertyId,
          date: params.date,
          status: params?.status?.toLowerCase() ?? undefined,
        },
      }),
      transformResponse: transformStayDateResponse,
    }),

    getGuests: builder.query<IGuest[], void>({
      query: () => ({
        url: "/guests/search",
        method: "GET",
      }),
      transformResponse: (response: ResponsePayload<IGuest[]>) => response.data,
    }),

    createGuests: builder.mutation<IGuest, IAddNewGuestForm>({
      query: (data) => ({
        url: "/guests/",
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IGuest>) => response.data,
    }),

    updateGuest: builder.mutation<IGuestResponse, IGuestResponse>({
      query: ({ id, ...data }) => ({
        url: `/guests/${id}`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IGuestResponse>) =>
        response.data,
    }),

    linkGuestsWithReservationId: builder.mutation<
      ILinkGuestWithReservationResponse,
      { reservation_id: number; guest_id: number }
    >({
      query: ({ reservation_id, ...data }) => ({
        url: `/guests/reservation/${reservation_id}/add_guest`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<ILinkGuestWithReservationResponse>
      ) => response.data,
    }),

    removeGuestsFromReservationId: builder.mutation<
      ILinkGuestWithReservationResponse,
      { reservation_id: number; guest_id: number }
    >({
      query: ({ reservation_id, ...data }) => ({
        url: `/guests/reservation/${reservation_id}/remove_guest`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<ILinkGuestWithReservationResponse>
      ) => response.data,
    }),
  }),
});

export const {
  useQuickSearchQuery,
  useFetchGuestsByStayDateMutation,
  useGetGuestsQuery,
  useCreateGuestsMutation,
  useUpdateGuestMutation,
  useLinkGuestsWithReservationIdMutation,
  useRemoveGuestsFromReservationIdMutation,
} = guestSlice;
export default guestSlice;

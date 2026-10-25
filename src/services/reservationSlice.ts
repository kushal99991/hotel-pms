import { createApi } from "@reduxjs/toolkit/query/react";

import {
  simpleTransformResponse,
  transformGetReservationDetailByIdResponse,
  transformGetReservationListResponse,
  transformReservationUpdateResponse,
} from "utils/transform";
import {
  IReservation,
  IReservationResponse,
  IUpdateReservation,
  IUpdateReservationRequest,
  IGuest,
  IReservationCreationResponse,
  IReservationCommentRequest,
  ICommentResponse,
  IReservationEmailConfirmationRequest,
  IEmailResponse,
  IReservationFilter,
  IPerNightRateUpdateRequest,
  IPerNightRateUpdateResponse,
} from "types/reservationTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import moment from "moment";
import { transformErrorResponse } from "utils/helperFunctions/common";
import { ResponsePayload } from "types/apiTypes";
import { RootState } from "store/store";
import { IReservationStatusEnum } from "types/settingTypes";

export const reservationSlice = createApi({
  reducerPath: "reservationApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    createReservation: builder.mutation<
      IReservationCreationResponse,
      IReservation
    >({
      query: (request) => {
        const reservationRequest: IReservation = request;
        const guestDetail =
          typeof reservationRequest.guestId === "number"
            ? reservationRequest.guestId
            : reservationRequest.guest;
        const data = {
          start_date:
            moment(reservationRequest.startDate).format("YYYY-MM-DD") || "",
          end_date:
            moment(reservationRequest.endDate).format("YYYY-MM-DD") || "",
          prop_id: reservationRequest.propId || 0,
          reservation_holder: guestDetail,
          special_requests: "string",
          reservation_token: reservationRequest.reservationUuid,
          rate_code: reservationRequest.rateCode,
          market_segment: reservationRequest.marketSegment,
          booking_channel: reservationRequest.bookingChannel,
          payment: reservationRequest.payment,
          group_id: reservationRequest.groupId,
          stays: reservationRequest.stays.map((a) => {
            // Remove reservation holder from guests here to preserve form state elsewhere
            const holder = guestDetail;
            const guests = (a.guests ?? []).filter((g) => {
              const sameFirst =
                (g.firstName ?? "").trim().toLowerCase() ===
                (holder?.first_name ?? "").trim().toLowerCase();
              const sameLast =
                (g.lastName ?? "").trim().toLowerCase() ===
                (holder?.last_name ?? "").trim().toLowerCase();
              const gEmail = (g.email ?? "").trim().toLowerCase();
              const hEmail = (holder?.email ?? "").trim().toLowerCase();
              const emailSame =
                gEmail === "" || hEmail === "" || gEmail === hEmail;
              return !(sameFirst && sameLast && emailSame);
            });

            return {
              children_count: a.childrenCount ?? 0,
              adults_count: a.adultCount ?? 1,
              room_type_id: a.roomTypeId,
              no_of_rooms: a.noOfRooms,
              reservation_holder_is_also_guest:
                a.reservation_holder_is_also_guest,
              reservation_holder_is_primary_guest:
                a.reservation_holder_is_primary_guest,
              guests: guests.map((g: IGuest) => ({
                first_name: g.firstName,
                last_name: g.lastName,
                email: g.email,
                primary_guest: g.primaryGuest || false,
              })),
              special_requests: a.specialRequests,
              expected_checkin_time: a.expectedCheckinTime
                ? moment(a.expectedCheckinTime).format("HH:mm:ss")
                : null,
              expected_checkout_time: a.expectedCheckOutTime
                ? moment(a.expectedCheckinTime).format("HH:mm:ss")
                : null,
              ...(a.tax_exemption_id && {
                tax_exemption_id: a.tax_exemption_id,
              }),
              ...(a.custom_rates &&
                Object.keys(a.custom_rates).length > 0 && {
                  custom_rates: Object.entries(a.custom_rates).map(
                    ([date, rate]) => ({
                      date,
                      rate,
                    })
                  ),
                }),
            };
          }),
        };
        return {
          url: "/reservation/",
          method: "POST",
          data,
        };
      },
      transformErrorResponse,
    }),
    getReservationDetailById: builder.mutation<
      IReservationResponse,
      { id: number; propertyId: number }
    >({
      queryFn: async (params, api, _extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const enumList: IReservationStatusEnum[] =
          state.statusList?.reservationStatusList ?? [];
        const result = await baseQuery({
          url: `/reservation/${params.id}/${params.propertyId}`,
          method: "GET",
        });
        if (result.error) {
          return { error: result.error };
        }

        return {
          data: transformGetReservationDetailByIdResponse(
            result.data as ResponsePayload<IReservationResponse>,
            enumList
          ),
        };
      },
      // transformResponse: transformGetReservationDetailByIdResponse,
    }),
    getReservationList: builder.query<
      IReservationResponse[],
      IReservationFilter
    >({
      async queryFn(params, api, _extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const enumList: IReservationStatusEnum[] =
          state.statusList?.reservationStatusList ?? [];

        const filteredParams = Object.fromEntries(
          Object.entries({ ...params }).filter(
            ([_, value]) =>
              value !== undefined && value !== "" && value !== "All"
          )
        );

        const result = await baseQuery({
          url: "/reservation/list",
          method: "GET",
          params: filteredParams,
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: transformGetReservationListResponse(
            result.data as ResponsePayload<IReservationResponse[]>,
            enumList
          ),
        };
      },
    }),
    updateReservation: builder.mutation<
      IUpdateReservation,
      IUpdateReservationRequest
    >({
      query: (request) => ({
        url: `/reservation/${request?.id ?? 0}`,
        method: "PUT",
        data: {
          ...request,
        },
      }),
      transformResponse: transformReservationUpdateResponse,
      transformErrorResponse,
    }),
    updateCheckInReservation: builder.mutation<
      IUpdateReservation,
      { id: number }
    >({
      query: (request) => ({
        url: `/reservation/check_in`,
        method: "POST",
        data: {
          reservation_id: request.id,
        },
      }),
      transformResponse: transformReservationUpdateResponse,
      transformErrorResponse,
    }),
    checkOutReservation: builder.mutation<IUpdateReservation, { id: number }>({
      query: (request) => ({
        url: `/reservation/check_out`,
        method: "POST",
        data: {
          reservation_id: request.id,
        },
      }),
      transformResponse: transformReservationUpdateResponse,
    }),
    addComment: builder.mutation<ICommentResponse, IReservationCommentRequest>({
      query: (data) => ({
        url: `/reservation/comments`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ICommentResponse>) =>
        response.data,
    }),
    updateComment: builder.mutation<
      ICommentResponse,
      { id: number; comment: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/reservation/comments/${id}`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ICommentResponse>) =>
        response.data,
    }),
    deleteComment: builder.mutation<ICommentResponse, { id: number }>({
      query: (request) => ({
        url: `/reservation/comments/${request.id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ICommentResponse>) =>
        response.data,
    }),
    updateRoomType: builder.mutation<
      IReservationResponse,
      {
        reservation_id: number;
        start_date: string;
        room_type: number;
        room_id?: number;
      }
    >({
      query: ({ reservation_id, ...data }) => ({
        url: `/reservation/${reservation_id}/room_type`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: simpleTransformResponse,
    }),
    updateDates: builder.mutation<
      IReservationResponse,
      { reservation_id: number; start_date?: string; end_date?: string }
    >({
      query: ({ reservation_id, ...data }) => ({
        url: `/reservation/${reservation_id}/start_end_dates`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: simpleTransformResponse,
    }),
    sendConfirmationEmail: builder.mutation<
      IEmailResponse,
      IReservationEmailConfirmationRequest
    >({
      query: (data) => ({
        url: `/reservation/send/confirmation/email`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IEmailResponse>) =>
        response.data,
    }),
    cancelReservation: builder.mutation<IUpdateReservation, { id: number }>({
      query: (request) => ({
        url: `/reservation/cancel/${request.id}`,
        method: "POST",
      }),
      transformResponse: transformReservationUpdateResponse,
      transformErrorResponse,
    }),
    renderReservationTemplate: builder.mutation<
      any,
      { reservation_id: number; template_name?: string }
    >({
      query: (data) => ({
        url: `/reservation/render/template`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<any>) => response.data,
    }),
    updatePerNightRates: builder.mutation<
      IPerNightRateUpdateResponse,
      IPerNightRateUpdateRequest
    >({
      query: ({ reservation_id, rates_to_update }) => ({
        url: `/reservation/per_night_rate/${reservation_id}`,
        method: "PUT",
        data: {
          rates_to_update,
        },
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<IPerNightRateUpdateResponse>
      ) => response.data,
    }),
  }),
});

export const {
  useCreateReservationMutation,
  useGetReservationDetailByIdMutation,
  useUpdateReservationMutation,
  useUpdateCheckInReservationMutation,
  useCheckOutReservationMutation,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetReservationListQuery,
  useLazyGetReservationListQuery,
  useUpdateRoomTypeMutation,
  useUpdateDatesMutation,
  useSendConfirmationEmailMutation,
  useCancelReservationMutation,
  useRenderReservationTemplateMutation,
  useUpdatePerNightRatesMutation,
} = reservationSlice;
export default reservationSlice;

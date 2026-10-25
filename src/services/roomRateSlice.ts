import { createApi } from "@reduxjs/toolkit/query/react";

import {
  transformRoomRateDynamicListResponse,
  transformRoomRateDynamicV2ListResponse,
  transformRoomRateListResponse,
} from "utils/transform";
import axiosBaseQuery from "api/axiosBaseQuery";
import {
  IAddRateCodeFormRequest,
  IAttachRuleRequest,
  IBaseRateRequest,
  IDynamicDaywiseDeleteRequest,
  IDynamicDaywiseRequest,
  ILinkRateCodeFormRequest,
  IRateCodeById,
  IRateCodeListResponse,
  IRateDynamicRequest,
  IRateDynamicResponse,
  IRateDynamicV2Response,
  IRatePlanRequest,
  IRatePlanResponse,
  IRatePlanRule,
  IUpdateRateCodeFormRequest,
} from "types/roomRateTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";
import { ResponsePayload } from "types/apiTypes";

export const roomRateSlice = createApi({
  reducerPath: "roomRateApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getRateDynamic: builder.mutation<
      IRateDynamicResponse[],
      IRateDynamicRequest
    >({
      query: (params) => ({
        url: "/rates/",
        method: "GET",
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
          room_type_id: params.room_type_ids,
          property_id: params.property_id,
          rate_code_id: params.rate_code_ids,
        },
      }),
      transformErrorResponse,
      transformResponse: transformRoomRateDynamicListResponse,
    }),
    getRateDynamicV2: builder.mutation<
      IRateDynamicV2Response[],
      IRateDynamicRequest
    >({
      query: (params) => ({
        url: "/rates/v2/",
        method: "GET",
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
          room_type_id: params.room_type_ids,
          property_id: params.property_id,
          rate_code_id: params.rate_code_ids,
        },
      }),
      transformErrorResponse,
      transformResponse: transformRoomRateDynamicV2ListResponse,
    }),
    getBaseRate: builder.mutation<IRateDynamicResponse[], IBaseRateRequest>({
      query: (params) => ({
        url: "/rates/base_rates",
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: transformRoomRateDynamicListResponse,
    }),
    getRatesRateCode: builder.mutation<
      IRateCodeListResponse[],
      { property_id: number; type?: string; active?: boolean }
    >({
      query: (params) => ({
        url: "/rates/rate_codes/",
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: transformRoomRateListResponse,
    }),
    getRatesRateCodebyId: builder.mutation<IRateCodeById, { id: number }>({
      query: (params) => ({
        url: `/rates/rate_codes/${params.id}`,
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRateCodeById>) =>
        response.data,
    }),
    addDynamicDaywise: builder.mutation<
      IRateCodeListResponse[],
      IDynamicDaywiseRequest
    >({
      query: (data) => ({
        url: "/rates/daywise",
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: transformRoomRateListResponse,
    }),
    createRateCode: builder.mutation<
      IRateCodeListResponse,
      IAddRateCodeFormRequest
    >({
      query: (data) => ({
        url: "/rates/rate_codes",
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRateCodeListResponse>) =>
        response.data,
    }),
    updateRateCode: builder.mutation<
      IRateCodeListResponse,
      IUpdateRateCodeFormRequest
    >({
      query: (data) => ({
        url: `/rates/rate_codes/${data.id}`,
        method: "PUT",
        data: data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRateCodeListResponse>) =>
        response.data,
    }),
    linkRateCode: builder.mutation<
      IRateCodeListResponse,
      ILinkRateCodeFormRequest
    >({
      query: (data) => ({
        url: "/rates/",
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRateCodeListResponse>) =>
        response.data,
    }),
    updateRateCodeRate: builder.mutation<
      IRateCodeListResponse,
      ILinkRateCodeFormRequest
    >({
      query: ({ id, ...data }) => ({
        url: `/rates/${id}`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRateCodeListResponse>) =>
        response.data,
    }),
    deletRateCode: builder.mutation<
      IRateCodeListResponse,
      IDynamicDaywiseDeleteRequest
    >({
      query: (data) => ({
        url: `/rates/daywise`,
        method: "DELETE",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRateCodeListResponse>) =>
        response.data,
    }),
    deletRateCodes: builder.mutation<
      IRateCodeListResponse,
      { id: number | null }
    >({
      query: ({ id }) => ({
        url: `/rates/rate_codes/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRateCodeListResponse>) =>
        response.data,
    }),

    getRatePlans: builder.mutation<
      IRatePlanResponse[],
      { property_id: number; id?: number }
    >({
      query: (params) => ({
        url: "/rates/rate_plans/",
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRatePlanResponse[]>) =>
        response.data,
    }),

    createRatePlan: builder.mutation<IRatePlanResponse, IRatePlanRequest>({
      query: (data) => ({
        url: "/rates/rate_plans/",
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRatePlanResponse>) =>
        response.data,
    }),

    attachRule: builder.mutation<IRatePlanResponse, IAttachRuleRequest>({
      query: (data) => ({
        url: "/rates/rate_plans/rules/",
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRatePlanResponse>) =>
        response.data,
    }),

    updateRule: builder.mutation<IRatePlanResponse, IAttachRuleRequest>({
      query: ({ rate_plan_id, ...data }) => ({
        url: `/rates/rate_plans/rules/${rate_plan_id}`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRatePlanResponse>) =>
        response.data,
    }),

    deleteRule: builder.mutation<IRatePlanResponse, { rate_plan_id: number }>({
      query: ({ rate_plan_id }) => ({
        url: `/rates/rate_plans/rules/${rate_plan_id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRatePlanResponse>) =>
        response.data,
    }),

    getRatePlanRulebyId: builder.mutation<
      IRatePlanRule[],
      { rate_plan_id?: number }
    >({
      query: (params) => ({
        url: "/rates/rate_plans/rules/",
        method: "GET",
        params: params.rate_plan_id
          ? { rate_plan_id: params.rate_plan_id }
          : undefined,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRatePlanRule[]>) =>
        response.data,
    }),
    updateRatePlanStatus: builder.mutation<
      IRatePlanResponse,
      { id: number; active: boolean }
    >({
      query: ({ id, active }) => ({
        url: `/rates/rate_plans/${id}`,
        method: "PUT",
        data: { active },
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRatePlanResponse>) =>
        response.data,
    }),
    updateBaseRateByid: builder.mutation<
      IRateDynamicResponse[],
      {
        rate_code_id?: number;
        base_rates: { room_type_id: number; rate: number }[];
      }
    >({
      query: (data) => ({
        url: `/rates/base_rates/bulk-update`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IRateDynamicResponse[]>) =>
        response.data,
    }),
  }),
});

export const {
  useGetRateDynamicMutation,
  useGetRateDynamicV2Mutation,
  useGetRatesRateCodeMutation,
  useGetRatesRateCodebyIdMutation,
  useAddDynamicDaywiseMutation,
  useCreateRateCodeMutation,
  useUpdateRateCodeMutation,
  useUpdateRateCodeRateMutation,
  useLinkRateCodeMutation,
  useGetBaseRateMutation,
  useDeletRateCodeMutation,
  useDeletRateCodesMutation,
  useGetRatePlansMutation,
  useCreateRatePlanMutation,
  useGetRatePlanRulebyIdMutation,
  useAttachRuleMutation,
  useUpdateBaseRateByidMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useUpdateRatePlanStatusMutation,
} = roomRateSlice;
export default roomRateSlice;

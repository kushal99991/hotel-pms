import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { RootState } from "store/store";
import {
  ApplicableTaxParams,
  IAddFeeRequest,
  IAddTaxRequest,
  IFeesTypes,
  IPostingCode,
  IPostingCodeDept,
  ITaxByIDTypes,
  ITaxTypes,
  ITaxTypesRequest,
  IUpdateFeeRequest,
  IUpdateTaxRequest,
  ITaxExemptionOption,
  IGetTaxParams,
  IPostingCodeRequest,
} from "types/financialSettingTypes";
import { ResponsePayload } from "types/apiTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";
import {
  transformPostingcodeDeptListResponse,
  transformPostingcodeListResponse,
} from "utils/transform";

export const financeSlice = createApi({
  reducerPath: "financeApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    addTax: builder.mutation<{ id: number }, IAddTaxRequest>({
      query: (data) => ({
        url: "/taxes/",
        method: "POST",
        data: data,
      }),
      transformResponse: (
        response: ResponsePayload<ITaxTypes>
      ): { id: number } => {
        const taxData = response.data; // Extract the nested `data` object
        return {
          id: Number(taxData.id),
        };
      },
    }),
    addFee: builder.mutation<{ id: number }, IAddFeeRequest>({
      query: (data) => ({
        url: "/fees/",
        method: "POST",
        data: data,
      }),
      transformResponse: (
        response: ResponsePayload<IFeesTypes>
      ): { id: number } => {
        const taxData = response.data; // Extract the nested `data` object
        return {
          id: Number(taxData.id),
        };
      },
    }),

    updateTax: builder.mutation<ITaxTypes[], IUpdateTaxRequest>({
      query: (data) => ({
        url: `/taxes/${data.id}`,
        method: "PUT",
        data: data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ITaxTypes[]>) =>
        response.data,
    }),
    updateFee: builder.mutation<IFeesTypes[], IUpdateFeeRequest>({
      query: (data) => ({
        url: `/fees/${data.id}`,
        method: "PUT",
        data: data,
      }),
    }),

    getTaxList: builder.query<ITaxTypes[], ITaxTypesRequest>({
      query: (params) => ({
        url: `/taxes/?property_id=${params?.property_id}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<ITaxTypes[]>
      ): ITaxTypes[] => response.data,
    }),
    getPostcodeDeptList: builder.query<IPostingCodeDept[], void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        const state = api.getState() as RootState;
        const propertyId = state.auth?.user?.defaultPropertyId ?? 1;
        const params: { property_id?: number } = {
          property_id: propertyId,
        };

        const result = await baseQuery({
          url: `/posting_code/departments/`,
          method: "GET",
          params,
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: transformPostingcodeDeptListResponse(
            result.data as ResponsePayload<IPostingCodeDept[]>
          ),
        };
      },
    }),
    addPostcodeDept: builder.mutation<
      IPostingCodeDept,
      { name: string; code: number; property_id: number }
    >({
      query: (data) => ({
        url: "/posting_code/departments/",
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<IPostingCodeDept>
      ): IPostingCodeDept => response.data,
      transformErrorResponse,
    }),
    updatePostcodeDept: builder.mutation<
      IPostingCodeDept,
      { id: number; name: string; code: number; property_id: number }
    >({
      query: (data) => ({
        url: `/posting_code/departments/${data.id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<IPostingCodeDept>
      ): IPostingCodeDept => response.data,
      transformErrorResponse,
    }),
    deletePostcodeDept: builder.mutation<any, { id: number }>({
      query: (params) => ({
        url: `/posting_code/departments/${params.id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
    }),
    getPostingcodeListQuery: builder.query<IPostingCode[], IPostingCodeRequest>(
      {
        async queryFn(params, api, _extraOptions, baseQuery) {
          const state = api.getState() as RootState;
          const propertyId = state.auth?.user?.defaultPropertyId ?? 1;
          const { id, ...rest } = params;
          const queryParams: IPostingCodeRequest = {
            ...rest,
            ...(id && { posting_code_department_id: id }),
            property_id: propertyId,
          };
          const result = await baseQuery({
            url: "/posting_code/posting_codes/",
            method: "GET",
            params: queryParams,
          });

          if (result.error) {
            return { error: result.error };
          }
          return {
            data: transformPostingcodeListResponse(
              result.data as ResponsePayload<IPostingCode[]>
            ),
          };
        },
      }
    ),
    addPostingCode: builder.mutation<
      any,
      {
        name: string;
        code: string | number;
        adjustment: boolean;
        posting_code_department_id: number;
        description?: string;
        type: string;
        property_id: number;
      }
    >({
      query: (data) => ({
        url: "/posting_code/posting_codes/",
        method: "POST",
        data: { posting_code: data },
      }),
      transformErrorResponse,
      transformResponse: (response: any) => {
        return {
          data: response.data,
          message: response.message,
          success: response.success,
        };
      },
    }),
    updatePostingCode: builder.mutation<
      any,
      {
        id: number;
        name: string;
        code: string | number;
        adjustment: boolean;
        posting_code_department_id: number;
        description?: string;
        type: string;
        property_id: number;
        is_active?: boolean;
      }
    >({
      query: (data) => ({
        url: `/posting_code/posting_codes/${data.id}`,
        method: "PUT",
        data: data,
      }),
      transformResponse: (response: any) => {
        return {
          data: response.data,
          message: response.message,
          success: response.success,
        };
      },
      transformErrorResponse,
    }),

    getFeesList: builder.query<IFeesTypes[], { property_id: number }>({
      query: (params) => ({
        url: `/fees/?property_id=${params.property_id}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<IFeesTypes[]>
      ): IFeesTypes[] => response.data,
    }),
    getTax: builder.query<ITaxTypes[], IGetTaxParams>({
      query: (params) => ({
        url: `/taxes/?${new URLSearchParams(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]))).toString()}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<ITaxTypes[]>
      ): ITaxTypes[] => response.data,
    }),
    getTaxByid: builder.mutation<
      ITaxByIDTypes[],
      { id: string; property_id: number }
    >({
      query: (params) => ({
        url: `/taxes/?property_id=${params.property_id}&id=${params.id}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<ITaxByIDTypes[]>
      ): ITaxByIDTypes[] => response.data,
    }),
    getFeesByid: builder.mutation<
      IFeesTypes[],
      { id: string; property_id: number }
    >({
      query: (params) => ({
        url: `/fees/?property_id=${params.property_id}&id=${params.id}`,
        method: "GET",
      }),
      transformResponse: (
        response: ResponsePayload<IFeesTypes[]>
      ): IFeesTypes[] => response.data,
    }),
    deleteTaxByid: builder.mutation<ITaxTypes, { id: number }>({
      query: (params) => ({
        url: `/taxes/${params.id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<ITaxTypes>): ITaxTypes =>
        response.data,
      transformErrorResponse,
    }),
    deleteTaxVersion: builder.mutation<ITaxTypes, { id: number }>({
      query: (params) => ({
        url: `/taxes/versions/${params.id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<ITaxTypes>): ITaxTypes =>
        response.data,
      transformErrorResponse,
    }),
    deleteFeeVersion: builder.mutation<IFeesTypes, { id: number }>({
      query: (params) => ({
        url: `/fees/versions/${params.id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<IFeesTypes>): IFeesTypes =>
        response.data,
      transformErrorResponse,
    }),
    attachTax: builder.mutation<
      ITaxTypes,
      { tax_id: string; property_id: string }
    >({
      query: (data) => ({
        url: `/taxes/attach?tax_id=${data.tax_id}&property_id=${data.property_id}`,
        method: "POST",
      }),
      transformErrorResponse,
    }),
    detachTax: builder.mutation<
      ITaxTypes,
      { tax_id: string; property_id: string }
    >({
      query: (data) => ({
        url: `/taxes/detach/${data.tax_id}?property_id=${data.property_id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
    }),
    getPropertyTax: builder.query<ITaxTypes[], ApplicableTaxParams>({
      query: (params) => ({
        url: `/taxes/applicable-taxes/${params.property_id}/${params.rate_code_id}/${params.date}${params.posting_code_id ? `?posting_code_id=${params.posting_code_id}` : ""}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (
        response: ResponsePayload<ITaxTypes[]>
      ): ITaxTypes[] => response.data,
    }),
    addTaxVersion: builder.mutation<
      ITaxTypes,
      { tax_id: number; rate: number; starts_from: string }
    >({
      query: (data) => ({
        url: "/taxes/versions",
        method: "POST",
        data: data,
      }),
      transformErrorResponse,
    }),
    addFeeVersion: builder.mutation<
      IFeesTypes,
      { fee_id: number; rate: number; starts_from: string }
    >({
      query: (data) => ({
        url: "/fees/versions",
        method: "POST",
        data: data,
      }),
      transformErrorResponse,
    }),

    attachPostingCodeDepartmentToTax: builder.mutation<
      ITaxTypes, // Replace with the actual response type
      { tax_id: number; posting_code_dept_id: number }
    >({
      query: (data) => ({
        url: "/taxes/posting_code/departments",
        method: "POST",
        data: data,
      }),
      transformErrorResponse,
    }),
    includePostingCodeToTax: builder.mutation<
      ITaxTypes, // Replace with the actual response type
      { tax_id: number; posting_code_id: number }
    >({
      query: (data) => ({
        url: "/taxes/posting_code/include",
        method: "POST",
        data: data,
      }),
      transformErrorResponse,
    }),
    excludePostingCodeToTax: builder.mutation<
      ITaxTypes, // Replace with the actual response type
      { tax_id: number; posting_code_id: number }
    >({
      query: (data) => ({
        url: "/taxes/posting_code/exclude",
        method: "POST",
        data: data,
      }),
      transformErrorResponse,
    }),

    attachPostingCodeDepartmentToFee: builder.mutation<
      IFeesTypes, // Replace with the actual response type
      { fee_id: number; posting_code_dept_id: number }
    >({
      query: (data) => ({
        url: "/fees/posting_code/departments",
        method: "POST",
        data: data,
      }),
      transformErrorResponse,
    }),
    includePostingCodeToFee: builder.mutation<
      IFeesTypes, // Replace with the actual response type
      { fee_id: number; posting_code_id: number }
    >({
      query: (data) => ({
        url: "/fees/posting_code/include",
        method: "POST",
        data: data,
      }),
      transformErrorResponse,
    }),
    excludePostingCodeToFee: builder.mutation<
      IFeesTypes, // Replace with the actual response type
      { fee_id: number; posting_code_id: number }
    >({
      query: (data) => ({
        url: "/fees/posting_code/exclude",
        method: "POST",
        data: data,
      }),
      transformErrorResponse,
    }),

    updateTaxVersion: builder.mutation<
      ITaxTypes,
      { id: number; tax_id: number; rate: number; starts_from: string }
    >({
      query: (data) => ({
        url: `/taxes/versions/${data.id}`,
        method: "PUT",
        data: data,
      }),
      transformErrorResponse,
    }),
    updateFeesVersion: builder.mutation<
      IFeesTypes,
      { id: number; fee_id: number; rate: number; starts_from: string }
    >({
      query: (data) => ({
        url: `/fees/versions/${data.id}`,
        method: "PUT",
        data: data,
      }),
      transformErrorResponse,
    }),
    deleteFeeByid: builder.mutation<IFeesTypes, { id: number }>({
      query: (params) => ({
        url: `/fees/${params.id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<IFeesTypes>): IFeesTypes =>
        response.data,
      transformErrorResponse,
    }),
    deletePostingCodeDepartmentFromTax: builder.mutation<
      ITaxTypes, // Replace with the actual response type
      { posting_code_department_id: number; tax_id: number }
    >({
      query: (params) => ({
        url: `/taxes/posting_code/departments/${params.posting_code_department_id}/${params.tax_id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<ITaxTypes>): ITaxTypes =>
        response.data,
      transformErrorResponse,
    }),
    deletePostingCodeIncludeFromTax: builder.mutation<
      ITaxTypes, // Replace with the actual response type
      { posting_code_id: number; tax_id: number }
    >({
      query: (params) => ({
        url: `/taxes/posting_code/include/${params.posting_code_id}/${params.tax_id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<ITaxTypes>): ITaxTypes =>
        response.data,
      transformErrorResponse,
    }),
    deletePostingCodeExcludeFromTax: builder.mutation<
      ITaxTypes, // Replace with the actual response type
      { posting_code_id: number; tax_id: number }
    >({
      query: (params) => ({
        url: `/taxes/posting_code/exclude/${params.posting_code_id}/${params.tax_id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<ITaxTypes>): ITaxTypes =>
        response.data,
      transformErrorResponse,
    }),

    deletePostingCodeDepartmentFromFee: builder.mutation<
      IFeesTypes, // Replace with the actual response type
      { posting_code_department_id: number; fee_id: number }
    >({
      query: (params) => ({
        url: `/fees/posting_code/departments/${params.posting_code_department_id}/${params.fee_id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<IFeesTypes>): IFeesTypes =>
        response.data,
      transformErrorResponse,
    }),

    deletePostingCodeIncludeFromFee: builder.mutation<
      IFeesTypes, // Replace with the actual response type
      { posting_code_id: number; fee_id: number }
    >({
      query: (params) => ({
        url: `/fees/posting_code/include/${params.posting_code_id}/${params.fee_id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<IFeesTypes>): IFeesTypes =>
        response.data,
      transformErrorResponse,
    }),

    deletePostingCodeExcludeFromFee: builder.mutation<
      IFeesTypes, // Replace with the actual response type
      { posting_code_id: number; fee_id: number }
    >({
      query: (params) => ({
        url: `/fees/posting_code/exclude/${params.posting_code_id}/${params.fee_id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ResponsePayload<IFeesTypes>): IFeesTypes =>
        response.data,
      transformErrorResponse,
    }),
    getTaxExemptionList: builder.query<
      ITaxExemptionOption[],
      { id?: number; property_id?: number }
    >({
      query: (params) => ({
        url: "/taxes/tax_exemptions/list",
        method: "GET",
        params: params,
      }),
      transformResponse: (response: ResponsePayload<ITaxExemptionOption[]>) =>
        response.data,
    }),
  }),
});

export const {
  useAddTaxMutation,
  useAddFeeMutation,
  useUpdateFeeMutation,
  useGetFeesByidMutation,
  useDeleteFeeByidMutation,
  useUpdateTaxMutation,
  useGetTaxListQuery,
  useLazyGetTaxListQuery,
  useGetFeesListQuery,
  useGetTaxByidMutation,
  useGetTaxQuery,
  useLazyGetTaxQuery,
  useDeleteTaxByidMutation,

  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
  // useGetPostingcodeListMutation,
  useAddPostingCodeMutation,
  useUpdatePostingCodeMutation,
  useAddTaxVersionMutation,
  useUpdateTaxVersionMutation,
  useDeleteTaxVersionMutation,
  useAddFeeVersionMutation,
  useUpdateFeesVersionMutation,
  useDeleteFeeVersionMutation,

  useAttachPostingCodeDepartmentToFeeMutation,
  useDeletePostingCodeDepartmentFromFeeMutation,
  useDeletePostingCodeExcludeFromFeeMutation,
  useDeletePostingCodeIncludeFromFeeMutation,
  useExcludePostingCodeToFeeMutation,
  useIncludePostingCodeToFeeMutation,

  useAttachPostingCodeDepartmentToTaxMutation,
  useDeletePostingCodeDepartmentFromTaxMutation,
  useDeletePostingCodeExcludeFromTaxMutation,
  useExcludePostingCodeToTaxMutation,
  useIncludePostingCodeToTaxMutation,
  useDeletePostingCodeIncludeFromTaxMutation,

  useAttachTaxMutation,
  useDetachTaxMutation,
  useGetPropertyTaxQuery,
  useLazyGetPropertyTaxQuery,

  useAddPostcodeDeptMutation,
  useUpdatePostcodeDeptMutation,
  useDeletePostcodeDeptMutation,
  useGetTaxExemptionListQuery,
  useLazyGetTaxExemptionListQuery,
} = financeSlice;
export default financeSlice;

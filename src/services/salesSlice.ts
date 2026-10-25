import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";
import {
  IAccountRequest,
  ISalesAccountGroup,
  ISalesAccountGroupRequest,
  ISalesContract,
  ISalesGroupDetail,
  ISalesGroupListItem,
  IUpdateSalesAccountGroupRequest,
} from "types/salesTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";
import { ICreateRentalSpaceRequest } from "types/rentalSpaceTypes";
export type KeyValuePairType = {
  id: number | string;
  key: string;
  value: string | number | boolean;
};

const salesSlice = createApi({
  reducerPath: "salesApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    salesAccounts: builder.query<ISalesContract[], { property_id: number }>({
      query: (params) => ({
        url: `/sales/contacts/list/?property_id=${params.property_id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ISalesContract[]>) =>
        response.data,
    }),
    updateAccountAttr: builder.mutation<void, KeyValuePairType>({
      query: ({ id, key, value }) => ({
        url: `/sales/account/attribute/${id}`,
        method: "PUT",
        data: { key, value },
      }),
    }),
    createContactAccount: builder.mutation<void, IAccountRequest>({
      query: (data) => ({
        url: `/sales/contacts/`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
    }),
    deletedAccount: builder.mutation<void, { account_id: number }>({
      query: (data) => ({
        url: `/sales/account/${data.account_id}`,
        method: "DELETE",
      }),
      transformErrorResponse,
    }),
    salesAccountDetail: builder.query<ISalesContract, { id: string }>({
      query: (data) => ({
        url: `/sales/account/${data.id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ISalesContract>) =>
        response.data,
    }),
    salesAccountGroupList: builder.query<ISalesAccountGroup[], { id: string }>({
      query: (data) => ({
        url: `/sales/group/list/${data.id}?limit=100&offset=0`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ISalesAccountGroup[]>) =>
        response.data,
    }),
    salesGroupList: builder.query<
      ISalesGroupListItem[],
      { property_id: number }
    >({
      query: (params) => ({
        url: `/sales/group/list/?property_id=${params.property_id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: { data: ISalesGroupListItem[] }) =>
        response.data,
    }),
    salesGroupDetail: builder.query<ISalesGroupDetail, { group_id: number }>({
      query: (params) => ({
        url: `/sales/group/${params.group_id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: { data: ISalesGroupDetail }) =>
        response.data,
    }),
    createSalesAccountGroup: builder.mutation<
      ISalesAccountGroup,
      ISalesAccountGroupRequest
    >({
      query: (data) => ({
        url: `/sales/group`,
        method: "POST",
        data,
      }),
      transformResponse: (response: ResponsePayload<ISalesAccountGroup>) =>
        response.data,
    }),
    updateSalesAccountGroup: builder.mutation<
      ISalesAccountGroup,
      IUpdateSalesAccountGroupRequest
    >({
      query: (data) => {
        const { group_id, ...rest } = data;
        return {
          url: `/sales/group/${group_id}`,
          method: "PUT",
          data: rest,
        };
      },
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ISalesAccountGroup>) =>
        response.data,
    }),
    createConferenceRoom: builder.mutation<
      { message: string },
      ICreateRentalSpaceRequest
    >({
      query: (data) => ({
        url: `/rooms/conference_room`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<{ message: string }>) =>
        response.data,
    }),
    getSalesContact: builder.query<ISalesContract, { id: number }>({
      query: (params) => ({
        url: `/sales/contacts/${params.id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<ISalesContract>) =>
        response.data,
    }),
    updateContactAccount: builder.mutation<
      void,
      IAccountRequest & { id: number }
    >({
      query: (data) => {
        const { id, ...rest } = data;
        return {
          url: `/sales/contacts/${id}`,
          method: "PUT",
          data: rest,
        };
      },
      transformErrorResponse,
    }),
  }),
});

export const {
  useSalesAccountsQuery,
  useUpdateAccountAttrMutation,
  useCreateContactAccountMutation,
  useDeletedAccountMutation,
  useSalesAccountDetailQuery,
  useSalesAccountGroupListQuery,
  useSalesGroupListQuery,
  useSalesGroupDetailQuery,
  useCreateSalesAccountGroupMutation,
  useUpdateSalesAccountGroupMutation,
  useCreateConferenceRoomMutation,
  useGetSalesContactQuery,
  useUpdateContactAccountMutation,
} = salesSlice;
export default salesSlice;

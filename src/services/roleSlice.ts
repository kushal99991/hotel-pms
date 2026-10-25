import { createApi } from "@reduxjs/toolkit/query/react";
import {
  IAddRoleRequest,
  IAddRoleResponse,
  IEditRoleRequest,
} from "types/authTypes";
import { transformRoleListResponse } from "utils/transform";
import { Role } from "types/authTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";

const roleSlice = createApi({
  reducerPath: "roleApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    role: builder.query<Role[], { limit?: number; offset?: number }>({
      query: (params) => ({
        url: `/user/roles?limit=${params?.limit || 100}&offset=${params?.offset || 0}`,
        method: "GET",
      }),
      transformResponse: transformRoleListResponse,
    }),
    getRoleById: builder.query<
      ResponsePayload<IAddRoleRequest>,
      { id: string }
    >({
      query: (params) => ({
        url: `/user/roles/${params?.id}`,
        method: "GET",
      }),
    }),
    createRole: builder.mutation<IAddRoleResponse, IAddRoleRequest>({
      query: (data) => ({
        url: `/user/role/create`,
        method: "POST",
        data,
      }),
    }),
    editRole: builder.mutation<IAddRoleResponse, IEditRoleRequest>({
      query: (data) => ({
        url: `/user/roles/update`,
        method: "PUT",
        data,
      }),
    }),
  }),
});

export const {
  useRoleQuery,
  useCreateRoleMutation,
  useEditRoleMutation,
  useGetRoleByIdQuery,
} = roleSlice;
export default roleSlice;

import { createApi } from "@reduxjs/toolkit/query/react";

import {
  transformUserByIdResponse,
  transformUserListResponse,
} from "utils/transform";
import {
  IAddUserRequest,
  IUserResponse,
  IUpdateUserRequest,
  IAddRoleAssignRequest,
  IUpdateUserDetail,
  IPropertyAssignResponse,
} from "types/authTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";
import { ResponsePayload } from "types/apiTypes";

const userSlice = createApi({
  reducerPath: "userApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    users: builder.query<IUserResponse[], void>({
      query: () => ({
        url: "/user/index/",
        method: "GET",
      }),
      transformResponse: transformUserListResponse,
    }),
    getUserByid: builder.mutation<IUserResponse, { id: string }>({
      query: (params) => ({
        url: `/user/?pk=${params.id}`,
        method: "GET",
      }),
      transformResponse: transformUserByIdResponse,
    }),
    addUser: builder.mutation<IUserResponse, IAddUserRequest>({
      query: (request) => {
        const addUserRequest: IAddUserRequest = request;
        const data = {
          email: addUserRequest.email || "",
          user_name: addUserRequest.userName || "",
          first_name: addUserRequest.firstName || "",
          last_name: addUserRequest.lastName || "",
          is_active: addUserRequest.isActive == "1" ? true : false,
          default_property_id: Number(addUserRequest.property) || 0,
          role_id: Number(addUserRequest.role) || "",
          department_id: Number(addUserRequest.department) || "",
          password: addUserRequest.password || "",
        };
        return {
          url: "/user/create",
          method: "POST",
          data,
        };
      },
    }),
    assignUserRole: builder.mutation<
      IAddRoleAssignRequest,
      IAddRoleAssignRequest
    >({
      query: (request) => {
        const addUserRequest: IAddRoleAssignRequest = request;
        const data = {
          user_id: addUserRequest?.user || 0,
          role_id: addUserRequest?.roles || 1,
        };
        return {
          url: `/user/role/assign`,
          method: "POST",
          data,
        };
      },
    }),
    removeUserRole: builder.mutation<
      IAddRoleAssignRequest,
      IAddRoleAssignRequest
    >({
      query: (request) => {
        const addUserRequest: IAddRoleAssignRequest = request;
        const data = {
          user_id: addUserRequest?.user || 0,
          role_id: addUserRequest?.roles || 1,
        };
        return {
          url: "/user/role/remove",
          method: "DELETE",
          data,
        };
      },
    }),
    updateUser: builder.mutation<IUserResponse, IUpdateUserRequest>({
      query: (request) => {
        const addUserRequest: IUpdateUserRequest = request;
        const data = {
          email: addUserRequest.email || "",
          user_name: addUserRequest.userName || "",
          first_name: addUserRequest.firstName || "",
          default_property_id: Number(addUserRequest.property) || 0,
          last_name: addUserRequest.lastName || "",
          is_active: addUserRequest.isActive == "1" ? true : false,
        };
        return {
          url: `/user/update?id=${request.id}`,
          method: "PUT",
          data,
        };
      },
      transformErrorResponse,
    }),
    updateUserName: builder.mutation<IUserResponse, IUpdateUserDetail>({
      query: (data) => ({
        url: `/profile/update/name`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
    }),
    updateUserStatus: builder.mutation<IUserResponse, { value: string }>({
      query: (data) => ({
        url: `/profile/status`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
    }),
    updateUserImage: builder.mutation<IUserResponse, { path: string }>({
      query: (data) => ({
        url: `/profile/image`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
    }),
    updateUserEmail: builder.mutation<IUserResponse, { email: string }>({
      query: (data) => ({
        url: `/profile/update/email`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
    }),
    changeUserPassword: builder.mutation<
      IUserResponse,
      { password: string; new_password: string }
    >({
      query: (data) => ({
        url: `/profile/update/password`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
    }),
    updateUserAttr: builder.mutation<
      IUserResponse,
      { id: number | string; data: { key: string; value: any } }
    >({
      query: ({ id, data }) => ({
        url: `user/update/attribute?id=${id}`,
        method: "PUT",
        data,
      }),
    }),
    userPropertyAssign: builder.mutation<
      IPropertyAssignResponse,
      { user_id: number; property_id: number; action: string }
    >({
      query: (data) => ({
        url: `user/property/assign?user_id=${data.user_id}&property_id=${data.property_id}&action=${data.action}`,
        method: "PUT",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IPropertyAssignResponse>) =>
        response.data,
    }),
    userDepartmentAssign: builder.mutation<
      IPropertyAssignResponse,
      { user_id: number; department_id: number }
    >({
      query: (data) => ({
        url: `/user/department/assign`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IPropertyAssignResponse>) =>
        response.data,
    }),
    userDepartmentRemove: builder.mutation<
      IPropertyAssignResponse,
      { user_id: number; department_id: number }
    >({
      query: (data) => ({
        url: `/user/department/remove`,
        method: "DELETE",
        data,
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IPropertyAssignResponse>) =>
        response.data,
    }),
  }),
});

export const {
  useUsersQuery,
  useAddUserMutation,
  useGetUserByidMutation,
  useUpdateUserMutation,
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
  useUpdateUserNameMutation,
  useUpdateUserStatusMutation,
  useUpdateUserImageMutation,
  useUpdateUserEmailMutation,
  useChangeUserPasswordMutation,
  useUpdateUserAttrMutation,
  useUserPropertyAssignMutation,
  useUserDepartmentAssignMutation,
  useUserDepartmentRemoveMutation,
} = userSlice;
export default userSlice;

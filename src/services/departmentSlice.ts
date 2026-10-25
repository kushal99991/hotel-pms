import { createApi } from "@reduxjs/toolkit/query/react";

// import { transformRoleListResponse } from "utils/transform";
import { Department, IDepartmentRequest } from "types/authTypes";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";

const departmentSlice = createApi({
  reducerPath: "departmentApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getDepartment: builder.query<
      ResponsePayload<Department[]>,
      IDepartmentRequest
    >({
      query: (params) => ({
        url: `/department/`,
        method: "GET",
        params,
      }),
      //   transformResponse: transformRoleListResponse,
    }),
    getDepartmentById: builder.query<
      ResponsePayload<Department>,
      { id: string; default_property_id?: number }
    >({
      query: (params) => ({
        url: `/department/${params?.id}${params.default_property_id ? `?default_property_id=${params.default_property_id}` : ""}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDepartmentQuery, useGetDepartmentByIdQuery } =
  departmentSlice;
export default departmentSlice;

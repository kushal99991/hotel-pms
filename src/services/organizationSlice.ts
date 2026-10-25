import { createApi } from "@reduxjs/toolkit/query/react";
import { transformOrganizationDetailResponse } from "utils/transform";
import { IOraganizationRequest, IOrg, IOrgLogo } from "types/org";
import axiosBaseQuery from "api/axiosBaseQuery";

const orgSlice = createApi({
  reducerPath: "organizationApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getOrgById: builder.query<IOrg, { id: string }>({
      query: ({ id }) => ({
        url: `user/org/${id}`,
        method: "GET",
      }),
      transformResponse: transformOrganizationDetailResponse,
    }),
    updateOrgById: builder.mutation<IOrg, IOraganizationRequest>({
      query: ({ id, data }) => {
        return {
          url: `org/${id}`,
          method: "PUT",
          data,
        };
      },
    }),
    updateOrgLogo: builder.mutation<
      IOrgLogo,
      { id: number | string; data: { key: string; value: any } }
    >({
      query: ({ id, data }) => ({
        url: `org/update/attribute/${id}`,
        method: "PUT",
        data,
      }),
    }),
  }),
});

export const {
  useGetOrgByIdQuery,
  useUpdateOrgLogoMutation,
  useUpdateOrgByIdMutation,
} = orgSlice;
export default orgSlice;

import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { simpleTransformResponse } from "utils/transform";
import { transformErrorResponse } from "utils/helperFunctions/common";
import {
  GetPostingCodeDepartmentGroupsResponse,
  IGetPostingCodeDepartmentGroupsParams,
} from "types/postingCodeTypes";
import { PaymentRouting } from "types/paymentRoutingTypes";
import { FolioTypes } from "constants/folios";

interface PaymentRoutingUpdateBody {
  posting_code_department_group_id: number;
  reservation_id?: number | null;
  sales_group_id?: number | null;
  folio_type?: FolioTypes;
}

const postingCodeSlice = createApi({
  reducerPath: "postingCodeSlice",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getPostingCodeDepartmentGroups: builder.query<
      GetPostingCodeDepartmentGroupsResponse,
      IGetPostingCodeDepartmentGroupsParams
    >({
      query: (params) => ({
        url: `/posting_code/departments/groups`,
        method: "GET",
        params,
      }),
      transformErrorResponse,
      transformResponse: simpleTransformResponse,
    }),
    updatePaymentRoutingDeptTargetGroup: builder.mutation<
      PaymentRouting,
      PaymentRoutingUpdateBody
    >({
      query: (body) => ({
        url: `/payments/payment_routing/dept_target_group`,
        method: "POST",
        data: body,
      }),
      transformErrorResponse,
      transformResponse: simpleTransformResponse,
    }),
  }),
});

export const {
  useGetPostingCodeDepartmentGroupsQuery,
  useLazyGetPostingCodeDepartmentGroupsQuery,
  useUpdatePaymentRoutingDeptTargetGroupMutation,
} = postingCodeSlice;
export default postingCodeSlice;

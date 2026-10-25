import { createApi } from "@reduxjs/toolkit/query/react";

import {
  transGetEmailTemplateByIdResponse,
  transGetEmailTemplateListResponse,
  transGetEmailTemplateTagListResponse,
} from "utils/transform";
import {
  EmailTemplate,
  EmailTemplateResponse,
  EmailTemplateTag,
  IAddEmailTemplateRequest,
} from "types/emailTemplateTypes";
import axiosBaseQuery from "api/axiosBaseQuery";

export const emailTemplateSlice = createApi({
  reducerPath: "emailTemplateApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    addEmailTemplate: builder.mutation<
      EmailTemplateResponse[],
      IAddEmailTemplateRequest
    >({
      query: (data) => ({
        url: "/templates/",
        method: "POST",
        data: {
          name: data.name,
          subject: data.subject,
          category: data.category,
          from_address: data.fromAddress,
          body: data.body,
        },
      }),
    }),
    getEmailTemplateTagList: builder.query<EmailTemplateTag[], void>({
      query: () => ({
        url: "/templates/tags",
        method: "GET",
      }),
      transformResponse: transGetEmailTemplateTagListResponse,
    }),
    getEmailTemplateList: builder.query<EmailTemplate[], void>({
      query: () => ({
        url: "/templates/",
        method: "GET",
      }),
      transformResponse: transGetEmailTemplateListResponse,
    }),
    getEmailTemplateByid: builder.mutation<EmailTemplate, { id: string }>({
      query: (params) => ({
        url: `/templates/${params.id}`,
        method: "GET",
      }),
      transformResponse: transGetEmailTemplateByIdResponse,
    }),
    updateEmailTemplate: builder.mutation<
      EmailTemplate,
      IAddEmailTemplateRequest
    >({
      query: (data) => {
        return {
          url: `/templates/${data.id}`,
          method: "PUT",
          data: {
            name: data.name,
            subject: data.subject,
            category: data.category,
            from_address: data.fromAddress,
            body: data.body,
          },
        };
      },
      transformResponse: transGetEmailTemplateByIdResponse,
    }),
  }),
});

export const {
  useAddEmailTemplateMutation,
  useGetEmailTemplateTagListQuery,
  useGetEmailTemplateListQuery,
  useGetEmailTemplateByidMutation,
  useUpdateEmailTemplateMutation,
} = emailTemplateSlice;
export default emailTemplateSlice;

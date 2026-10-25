import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { ResponsePayload } from "types/apiTypes";

import {
  IAddPropertyAmenitiesRequest,
  IAmenityAssignedProperty,
  IProperty,
  IPropertyAmenity,
  IPropertyAmenityCategory,
  IPropertyBaseValues,
  IPropertyLogo,
  IPropertyRequest,
  TAmendPropertyAmenityLink,
  TAmendPropertyAmenityRequest,
} from "types/property";
import {
  IAddPropertyMediaRequest,
  IAddPropertyMediaResponse,
  IPropertyDeleteMediaResponse,
  IPropertyMediaResponse,
} from "types/propertyMediaTypes";
import { transformErrorResponse } from "utils/helperFunctions/common";
import {
  transformAddPropertyAmenityResponse,
  transformAddPropertyResponse,
  transformEditPropertyAmenityResponse,
  transformPropertyAmenityCategoryResponse,
  transformPropertyAmenityResponse,
  transformPropertyMediaResponse,
} from "utils/transform";

export const propertySlice = createApi({
  reducerPath: "propertySlice",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getProperties: builder.query<ResponsePayload<IProperty[]>, void>({
      query: () => ({
        url: "/property/",
        method: "GET",
      }),
    }),
    getProperty: builder.query<IProperty, { id: string }>({
      query: ({ id }) => ({
        url: `/property/${id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: (response: ResponsePayload<IProperty>) =>
        response.data,
    }),
    addProperties: builder.mutation<IProperty, IPropertyRequest>({
      query: (data) => ({
        url: `/property/`,
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: transformAddPropertyResponse,
    }),
    updatePropertyById: builder.mutation<
      IPropertyBaseValues,
      { id: number | string; data: IPropertyBaseValues }
    >({
      query: ({ id, data }) => ({
        url: `property/${id}`,
        method: "PUT",
        data,
      }),
    }),

    updateLogo: builder.mutation<
      IPropertyLogo,
      { id: number | string; data: { key: string; value: any } }
    >({
      query: ({ id, data }) => ({
        url: `property/update/attribute?id=${id}`,
        method: "PUT",
        data,
      }),
    }),

    updateCancellationPolicy: builder.mutation<
      { data: any },
      { id: number | string; data: { key: string; value: any } }
    >({
      query: ({ id, data }) => ({
        url: `property/update/attribute?id=${id}`,
        method: "PUT",
        data,
      }),
    }),

    // Property Amenities API
    getPropertyAmenities: builder.query<IAmenityAssignedProperty[], void>({
      query: () => ({
        url: "/property/amenities/list",
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: transformPropertyAmenityResponse,
    }),
    getPropertyAmenitiesById: builder.query<
      IAmenityAssignedProperty[],
      TAmendPropertyAmenityRequest
    >({
      query: (data) => ({
        url: `/property/${data.propertyId}/amenities`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: transformPropertyAmenityResponse,
    }),
    propertyAmenitiesToPropertyLink: builder.mutation<
      ResponsePayload<TAmendPropertyAmenityLink>,
      TAmendPropertyAmenityRequest
    >({
      query: (payload) => ({
        url: `/property/amenity/link`,
        method: "POST",
        data: {
          property_id: payload.propertyId,
          property_amenity_id: payload.propertyAmenityId ?? 0,
        },
      }),
      transformErrorResponse,
    }),
    propertyAmenitiesToPropertyUnLink: builder.mutation<
      ResponsePayload<TAmendPropertyAmenityLink>,
      TAmendPropertyAmenityRequest
    >({
      query: (payload) => ({
        url: `/property/amenity/unlink/${payload.propertyId}/${payload.propertyAmenityId}`,
        method: "DELETE",
      }),
      transformErrorResponse,
    }),
    addPropertyAmenities: builder.mutation<
      IAmenityAssignedProperty,
      IAddPropertyAmenitiesRequest
    >({
      query: (data) => ({
        url: "/property/amenity",
        method: "POST",
        data,
      }),
      transformErrorResponse,
      transformResponse: transformAddPropertyAmenityResponse,
    }),
    getPropertyAmenitiesByid: builder.mutation<
      IPropertyAmenity,
      { id: string }
    >({
      query: (data) => ({
        url: `/property/amenity/${data.id}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: transformEditPropertyAmenityResponse,
    }),
    updatePropertyAmenities: builder.mutation<
      IPropertyAmenity,
      IAddPropertyAmenitiesRequest
    >({
      query: (data) => ({
        url: `/property/amenity/${data?.id}`,
        method: "PUT",
        data,
      }),
      transformErrorResponse,
      transformResponse: transformEditPropertyAmenityResponse,
    }),
    getPropertyAmenitiesCategory: builder.query<
      IPropertyAmenityCategory[],
      void
    >({
      query: () => ({
        url: "/property/amenities/categories",
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: transformPropertyAmenityCategoryResponse,
    }),

    // Property Media API
    getPropertiesMedia: builder.query<
      IPropertyMediaResponse[],
      { propertyId: number }
    >({
      query: (params) => ({
        url: `/property/media/${params.propertyId}`,
        method: "GET",
      }),
      transformErrorResponse,
      transformResponse: transformPropertyMediaResponse,
    }),
    addPropertyMedia: builder.mutation<
      IAddPropertyMediaResponse,
      IAddPropertyMediaRequest
    >({
      query: (data) => ({
        url: `/property/media`,
        method: "POST",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<IAddPropertyMediaResponse>
      ) => response.data,
      transformErrorResponse,
    }),
    deletePropertyMedia: builder.mutation<
      IPropertyDeleteMediaResponse,
      { media_id: number }
    >({
      query: (data) => ({
        url: `/property/media/${data.media_id}`,
        method: "DELETE",
        data,
      }),
      transformResponse: (
        response: ResponsePayload<IPropertyDeleteMediaResponse>
      ) => response.data,
      transformErrorResponse,
    }),
    updatePropertyMedia: builder.mutation<
      IAddPropertyMediaResponse,
      IAddPropertyMediaRequest
    >({
      query: ({ media_id, ...rest }) => ({
        url: `/property/media/${media_id}`,
        method: "PUT",
        data: rest,
      }),
      transformResponse: (
        response: ResponsePayload<IAddPropertyMediaResponse>
      ) => response.data,
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useLazyGetPropertyQuery,
  useUpdatePropertyByIdMutation,
  useUpdateCancellationPolicyMutation,
  useUpdateLogoMutation,
  useAddPropertiesMutation,

  // Property Amenities API
  useGetPropertyAmenitiesQuery,
  useGetPropertyAmenitiesByIdQuery,
  usePropertyAmenitiesToPropertyLinkMutation,
  usePropertyAmenitiesToPropertyUnLinkMutation,
  useAddPropertyAmenitiesMutation,
  useGetPropertyAmenitiesByidMutation,
  useUpdatePropertyAmenitiesMutation,
  useGetPropertyAmenitiesCategoryQuery,

  // Property Media API
  useGetPropertiesMediaQuery,
  useAddPropertyMediaMutation,
  useDeletePropertyMediaMutation,
  useUpdatePropertyMediaMutation,
} = propertySlice;

export default propertySlice;

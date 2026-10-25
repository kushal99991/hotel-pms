import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "api/axiosBaseQuery";
import { transformErrorResponse } from "utils/helperFunctions/common";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { simpleTransformResponse } from "utils/transform";
import {
  ICalculatedCharge,
  ICalculatedChargeParams,
  IGetChargesParams,
  IMakeChargeBody,
  IMakeFolioResponse,
  IMakePaymentBody,
  IMakePaymentResponse,
  IPaymentResponse,
  ISimpleFolio,
  IGetPaymentParams,
  IRefundPaymentBody,
  IPaymentAndPaymentMethodBody,
  IUpdateFolioBody,
  IUpdateAmountBody,
  DirectBillingAccount,
  CreateMethodBody,
  IDirectBillingAccountRequest,
  IDirectBillingAccountResponse,
  IAddDirectBillingAccountRequest,
  IDirectBillingAccountCreditLimitResponse,
  ISettleLCPaymentBody,
  ICreateInvoiceBody,
  InvoiceResponse,
  IDeleteLCPaymentBody,
} from "types/payments";
import { IChargeResponse, IMoveChargeBody } from "types/charges";

const paymentsSlice = createApi({
  reducerPath: "paymentMethodApi",
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    createPaymentMethod: builder.mutation<
      IPaymentMethodResponse,
      CreateMethodBody
    >({
      query: (body) => {
        return {
          url: "/payments/payment_method",
          method: "POST",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    createPaymentAndPaymentMethod: builder.mutation<
      IMakePaymentResponse,
      IPaymentAndPaymentMethodBody
    >({
      query: (body) => {
        return {
          url: "/payments/payment_and_payment_method",
          method: "POST",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    updatePaymentMethod: builder.mutation<
      IPaymentMethodResponse,
      { id: number; future_use: boolean }
    >({
      query: (params) => {
        return {
          url: `/payments/payment_methods/${params.id}`,
          method: "PUT",
          data: {
            future_use: params.future_use,
          },
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getPaymentMethods: builder.query<
      IPaymentMethodResponse[],
      {
        guest_id?: number;
        reservation_id?: number;
        type?: string;
        globally_available?: boolean;
        direct_billing_account_id?: number;
      }
    >({
      query: (params) => ({
        url: "/payments/payment_methods",
        method: "GET",
        params: { ...params },
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getPayments: builder.query<IPaymentResponse[], IGetPaymentParams>({
      query: (params) => ({
        url: "/payments/",
        method: "GET",
        params: { ...params },
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getCharges: builder.query<ICalculatedCharge, ICalculatedChargeParams>({
      query: (params) => ({
        url: "/payments/calculate_charges",
        method: "GET",
        params: { ...params },
      }),
      transformResponse: simpleTransformResponse,
    }),
    getChargesByParams: builder.query<IChargeResponse[], IGetChargesParams>({
      query: (params) => ({
        url: "/payments/charges",
        method: "GET",
        params: { ...params },
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    makeCharge: builder.mutation<IChargeResponse, IMakeChargeBody>({
      query: (body) => {
        return {
          url: "/payments/charges",
          method: "POST",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    deleteCharge: builder.mutation<string, { charge_id: number }>({
      query: (params) => {
        return {
          url: `/payments/charges/${params.charge_id}`,
          method: "DELETE",
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    settleLCPayment: builder.mutation<IPaymentResponse, ISettleLCPaymentBody>({
      query: (body) => {
        return {
          url: "/payments/settle_lc_payments",
          method: "POST",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    deleteLCPayments: builder.mutation<string, IDeleteLCPaymentBody>({
      query: (body) => {
        return {
          url: "/payments/delete_lc_payments",
          method: "DELETE",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    makePayment: builder.mutation<IMakePaymentResponse, IMakePaymentBody>({
      query: (body) => {
        return {
          url: "/payments/payment",
          method: "POST",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    changePaymentAmount: builder.mutation<
      IPaymentResponse[],
      IUpdateAmountBody
    >({
      query: (body) => {
        return {
          url: `/payments/${body.payment_id}/authorization_amount`,
          method: "PUT",
          data: {
            new_amount: body.amount,
            description: body.description,
            increase_by: body.increase_by,
          },
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    refundPayment: builder.mutation<IPaymentResponse, IRefundPaymentBody>({
      query: (body) => {
        return {
          url: `/payments/${body.paymentId}/issue_refund`,
          method: "PUT",
          data: {
            amount: body.amount,
            description: body.description,
            reason: body.reason,
          },
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getFolios: builder.query<
      ISimpleFolio[],
      { reservation_id?: number; sales_group_id?: number }
    >({
      query: (params) => ({
        url: "/payments/folios",
        method: "GET",
        params: { ...params },
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    moveChargeToFolio: builder.mutation<IChargeResponse, IMoveChargeBody>({
      query: (body) => {
        return {
          url: "/payments/move_charge_to_another_folio",
          method: "POST",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    makeFolio: builder.mutation<
      IMakeFolioResponse,
      { type: string; reservation_id: number }
    >({
      query: (body) => {
        return {
          url: "/payments/folios",
          method: "POST",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    updateFolio: builder.mutation<IMakeFolioResponse, IUpdateFolioBody>({
      query: (params) => {
        return {
          url: `/payments/folios/${params.folio_id}`,
          method: "PUT",
          data: {
            type: params.type,
            reservation_id: params.reservation_id,
            primary_payment_method_id: params.primary_payment_method_id,
          },
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getDBAccount: builder.query<
      DirectBillingAccount[],
      { id?: number; guest_id?: number; property_id?: number }
    >({
      query: (params) => ({
        url: "/payments/direct_billing_account",
        method: "GET",
        params: { ...params },
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    // ✅ NEW: Create Direct Billing Account
    createDirectBillingAccount: builder.mutation<
      IDirectBillingAccountResponse,
      IAddDirectBillingAccountRequest
    >({
      query: (body) => ({
        url: "/payments/direct_billing_account",
        method: "POST",
        data: body,
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    editDBAccount: builder.mutation<
      IDirectBillingAccountResponse,
      { id: number; body: IAddDirectBillingAccountRequest }
    >({
      query: (params) => ({
        url: `/payments/direct_billing_account/${params.id}`,
        method: "PUT",
        data: params.body,
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getDirectBillingAccount: builder.query<
      IDirectBillingAccountResponse[],
      IDirectBillingAccountRequest
    >({
      query: (params) => ({
        url: "/payments/direct_billing_account",
        method: "GET",
        params: params,
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getDirectBillingAccountCreditLimit: builder.query<
      IDirectBillingAccountCreditLimitResponse,
      { account_id: string }
    >({
      query: (params) => ({
        url: `/payments/direct_billing_account/${params.account_id}/credit_limit`,
        method: "GET",
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getDirectBillingAccountAging: builder.query<
      {
        aging: number;
      },
      { account_id: string }
    >({
      query: (params) => ({
        url: `/payments/direct_billing_account/${params.account_id}/aging`,
        method: "GET",
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getDirectBillingAccountBalance: builder.query<
      {
        balance: number;
      },
      { account_id: string }
    >({
      query: (params) => ({
        url: `/payments/direct_billing_account/${params.account_id}/balance`,
        method: "GET",
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    createInvoice: builder.mutation<InvoiceResponse, ICreateInvoiceBody>({
      query: (body) => ({
        url: "/payments/direct_billing_account/invoice",
        method: "POST",
        data: body,
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getInvoice: builder.query<InvoiceResponse, { invoice_id: number }>({
      query: (params) => ({
        url: `/payments/direct_billing_account/${params.invoice_id}`,
        method: "GET",
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    getInvoiceList: builder.query<
      InvoiceResponse[],
      { property_id: number; direct_billing_account_id: number }
    >({
      query: (params) => ({
        url: `/payments/direct_billing_account/invoice/list`,
        method: "GET",
        params: params,
      }),
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
    cancelLCPayment: builder.mutation<
      IPaymentResponse,
      { lc_payment_id: number; description?: string }
    >({
      query: (body) => {
        return {
          url: `/payments/cancel_lc_payment`,
          method: "PUT",
          data: body,
        };
      },
      transformResponse: simpleTransformResponse,
      transformErrorResponse,
    }),
  }),
});

export const {
  useCreatePaymentMethodMutation,
  useCreatePaymentAndPaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useLazyGetPaymentMethodsQuery,
  useGetChargesQuery,
  useLazyGetChargesQuery,
  useGetChargesByParamsQuery,
  useLazyGetChargesByParamsQuery,
  useMakeChargeMutation,
  useGetFoliosQuery,
  useLazyGetFoliosQuery,
  useMakeFolioMutation,
  useUpdateFolioMutation,
  useMakePaymentMutation,
  useChangePaymentAmountMutation,
  useRefundPaymentMutation,
  useGetPaymentsQuery,
  useLazyGetPaymentsQuery,
  useMoveChargeToFolioMutation,
  useDeleteChargeMutation,
  useGetDBAccountQuery,
  useCreateDirectBillingAccountMutation,
  useEditDBAccountMutation,
  useLazyGetDirectBillingAccountQuery,
  useLazyGetDirectBillingAccountCreditLimitQuery,
  useLazyGetDirectBillingAccountAgingQuery,
  useLazyGetDirectBillingAccountBalanceQuery,
  useCreateInvoiceMutation,
  useGetInvoiceQuery,
  useLazyGetInvoiceListQuery,
  useCancelLCPaymentMutation,
  useSettleLCPaymentMutation,
  useDeleteLCPaymentsMutation,
} = paymentsSlice;
export default paymentsSlice;

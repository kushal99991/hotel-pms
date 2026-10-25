import { IChargeResponse } from "./charges";
import { IPaymentMethodResponse } from "./reservationTypes";
import {
  PaymentCaptureTypeEnum,
  PaymentMethodType,
  PaymentRefundReasonEnum,
  ReservationPaymentStatus,
} from "constants/payments";
import { PaymentProccessorsEnum } from "constants/paymentProcessors";
import { IFolioResponse } from "./folios";
import { CreateInvoiceMethod } from "constants/accounting";

export interface PayByPaymentSettings {
  capture_type: PaymentCaptureTypeEnum;
  description?: string;
  descriptionPrefix?: string;
  future_usage?: boolean;
  folio_type?: FolioTypes;
  make_primary_method?: boolean;
  direct_billing_account_id?: number;
}

export interface CreateMethodBody {
  reservation_id?: number;
  sales_group_id?: number;
  folio_id?: number;
  direct_billing_account_id?: number;
  guest_id?: number;
  payment_type?: PaymentMethodType;
}

interface ProcessorResponse {
  id: string;
  PAYMENT_PROCESSOR: PaymentProccessorsEnum;
  amount: number;
  object: string;
  metadata: {
    reservations: string;
    transaction_type: string;
    reservation_holder_id: string;
  };
  client_secret: string;
  setup_future_use: string;
  status: string;
}

interface IPaymentSettlementResponse {
  amount_settled: number;
  id: number;
  lc_payment_id: number;
  payment_id: number;
  status: ReservationPaymentStatus;
  settled_by: {
    amount: number;
    description?: string;
    id: number;
    payment_date: string;
    payment_method_id: number;
    status: ReservationPaymentStatus;
  };
}

interface IPaymentResponse {
  id: number;
  amount: string;
  amount_needed_to_settle?: string;
  charges: IChargeResponse[];
  created_at: DateTime;
  description: string;
  direct_billing_account_id?: number;
  direct_billing_account_name?: string;
  last_four?: number;
  folio_id: number;
  folio_primary_method?: string | null;
  payment_date: string;
  payment_method?: IPaymentMethod | null;
  pp_response: ProcessorResponse;
  status: ReservationPaymentStatus;
  property_id: number;
  refunds: {
    id: number;
    amount: string;
    description: string;
    status: string;
    reason: string;
    updated_at: string;
    pp_response: ProcessorResponse;
  }[];
  payment_method_id: number;
  remaining_amount?: string;
  settlements?: IPaymentSettlementResponse[];
  reservation_id?: number;
  reservation?: {
    id: number;
    start_date: string;
    end_date: string;
    property_id: number;
    current_room_info?: {
      id: number;
      room_number: number;
    };
    planned_room?: {
      id: number;
      room_number: number;
    };
    guest: {
      id: number;
      first_name: string;
      last_name: string;
    };
    current_room_info?: {
      id: number;
      room_number: string;
    };
    planned_room?: {
      id: number;
      room_number: string;
    };
  };
  settlements?: {
    id: number;
    payment_id: number;
    lc_payment_id: number;
    amount_settled: string;
    settled_by: {
      id: number;
      amount: string;
      status: string;
      payment_date: string;
      description: string;
      payment_method_id: number;
    };
  }[];
}

interface ITax {
  id: number;
  name: string;
  rate: string;
  amount: string;
  description: string;
  starts_from: string;
  posting_code_id: number;
  posting_code_code: number;
  posting_code_name: string;
}

interface ISimpleFee {
  id: number;
  name: string;
  rate: string;
  amount: string;
  description: string;
  starts_from: string;
  posting_code_id: number;
  posting_code_code: number;
  posting_code_name: string;
}

interface IGetChargesParams {
  less_than?: number;
  greater_than?: number;
  equal_to?: number;
  charge_id?: number;
  reservation_id?: number;
  folio_id?: number;
  posting_code_id?: number;
  posting_dept_code_id?: number;
  posting_code?: number;
  posting_dept_code?: number;
}

interface ICalculatedChargeParams {
  reservation_id: number;
  start_date: string;
  end_date: string;
}

interface ICalculatedCharge {
  per_night: {
    [key: string]: {
      amount: string;
      posting_code_id: number;
      posting_code_code: number;
      posting_code_name: string;
      taxes: ITax[];
      fees: IFee[];
    };
  };
  per_reservation: ISimpleFee[];
  total: string;
}

interface IMakeChargeBody {
  posting_code_id: number;
  amount: number;
  description?: string;
  date: string;
  parent_charge_id?: number;
  folio_id?: number;
  reservation_id?: number;
  direct_billing_account_id?: number;
  attach_default_taxes?: boolean;
  attach_detault_fees?: boolean;
}

interface IMakePaymentBody {
  capture_type?: PaymentCaptureTypeEnum;
  amount?: number;
  payment_method_id?: number;
  reservation_id?: number;
  description?: string;
  folio_id?: number;
  folio_primary_method?: boolean;
  direct_billing_account_id?: number;
}

interface ISettleLCPaymentItem {
  lc_payment_id_to_settle: number;
  lc_payments_reservation_id: number;
}

interface ISettleLCPaymentBody {
  payment_id_to_charge: number;
  items: ISettleLCPaymentItem[];
}

interface IDeleteLCPaymentItem {
  lc_settlement_id_to_unsettle: number;
}

interface IDeleteLCPaymentBody {
  items: IDeleteLCPaymentItem[];
}

interface IUpdateAmountBody {
  amount?: number;
  increase_by?: number;
  description?: string;
  payment_id: number;
}

interface IRefundPaymentBody {
  paymentId: number;
  amount: number;
  description: string;
  reason: PaymentRefundReasonEnum;
}

interface IPaymentProviderResponse {
  PAYMENT_PROCESSOR: PaymentProccessorsEnum;
  id: string;
  amount: number;
  object: string;
  metadata: {
    reservations: string;
    transaction_type: string;
    reservation_holder_id: string;
  };
  client_secret: string;
  setup_future_use: string;
  status: string;
}

interface IMakePaymentResponse {
  amount: number;
  status: string;
  payment_date: string;
  description: string;
  reservation_id: number;
  payment_method_id: number;
  id: nummber;
  charges: [
    {
      posting_code_id: number;
      amount: number;
      description: string;
      date: string;
      parent_charge_id: number;
      folio_id: number;
      reservation_id: number;
      id: number;
      posting_code: {
        name: string;
        code: number;
        posting_code_department_id: number;
        description: string;
        id: number;
        department: {
          name: string;
          code: number;
          id: number;
        };
      };
    },
  ];
  pp_response: IPaymentProviderResponse;
}

interface SimpleIntent {
  client_secret: string;
  amount: number;
  object?: string;
}

interface ISimpleFolio {
  type: string;
  reservation_id: number;
  id: number;
  primary_payment_method: IPaymentMethodResponse | null;
}

interface IMakeFolioResponse {
  id: number;
  primary_payment_method: IPaymentMethodResponse | null;
  reservation_id: number;
  type: string;
}

interface IUpdateFolioBody {
  folio_id: number;
  type?: string;
  reservation_id: number;
  primary_payment_method_id?: number;
}

type IPaymentMethodResponseOrUndef = IPaymentMethodResponse | undefined;

interface IGetPaymentParams {
  less_than?: number;
  greater_tham?: number;
  equal_to?: number;
  payment_id?: number;
  reservation_id?: number;
  folio_id?: number;
  property_id?: number;
}

interface IPaymentAndPaymentMethodBody {
  capture_type: PaymentCaptureTypeEnum;
  amount: number;
  reservation_id?: number;
  description?: string;
  future_usage: boolean;
  folio_id: number;
  folio_primary_method?: boolean;
}

interface DirectBillingAccount {
  property_id: number;
  guest_id: number;
  billing_name: string;
  billing_phone: string;
  billing_phone_ext?: string;
  billing_fax?: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  credit_limit: number;
  id: number;
  payment_methods: IPaymentMethodResponse[];
}

export interface IAddDirectBillingAccountRequest {
  property_id?: number | undefined;
  guest_id: number;
  credit_limit: number;
  billing_name: string;
  billing_phone: string;
  billing_phone_ext?: string;
  billing_fax?: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
}

export interface IDirectBillingAccountRequest {
  property_id?: number;
  guest_id?: number;
  id?: number;
}
export interface IPaymentMethod {
  pp_customer_id: string;
  pp_method_id: string;
  future_use: boolean;
  last4: string;
  exp_month: number;
  exp_year: number;
  country: string;
  brand: string;
  id: number;
  card_holder: number;
  created_at: string;
  updated_at: string;
  direct_billing_account_id: number;
  pp_response: Record<string, any>; // Or define a proper type if the response structure is known
  payment_type: string;
  status: string;
}

export interface ILCPayments {
  amount: string;
  amount_needed_to_settle: string;
  charges: [];
  created_at: string;
  description: string;
  direct_billing_account_id: number;
  id: number;
  payment_date: string;
  payment_method_id: number;
  pp_response: ProcessorResponse;
  remaining_amount?: string;
  settlements?: IPaymentSettlementResponse[];
  folio_id: number;
  property_id: number;
  refunds: {
    id: number;
    amount: string;
    description: string;
    status: string;
    reason: string;
    updated_at: string;
    pp_response: ProcessorResponse;
  }[];
  reservation?: {
    end_date?: string;
    guest?: {
      id: number;
      first_name: string;
      last_name: string;
    };
    start_date: string;
    end_date: string;
    property_id: number;
  };
  reservation_id?: number;
  status: string;
}

export interface IDirectBillingAccountResponse {
  id: number;
  property_id: number;
  guest_id: number;
  billing_name: string;
  billing_phone: string;
  billing_phone_ext: string;
  billing_fax: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  credit_limit: number;
  folios: IFolioResponse[];
  payment_methods: IPaymentMethodResponse[];
  lc_payments: ILCPayments[];
  charges?: IChargeResponse[];
  payments: IPaymentResponse[];
  credit_limit_with_unsettled_payments?: number;
}

export interface IDirectBillingAccountCreditLimitResponse {
  credit_limit: number;
}

export interface ICreateInvoiceBody {
  direct_billing_account_id: number;
  generation_method: CreateInvoiceMethod;
  start_date?: string;
  end_date?: string;
  folio_ids?: number[];
}

export interface InvoiceResponse {
  id: number;
  direct_billing_account_id: 0;
  generation_method: string;
  status: string;
  start_date: string;
  end_date: string;
  folios: IFolioResponse[];
  path: string;
  created_at?: string;
}

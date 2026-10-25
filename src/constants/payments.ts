import { IPaymentResponse, SimpleIntent } from "types/payments";

export enum NewPaymentOptions {
  CARD = "CARD",
  DIRECT_BILL = "DIRECT_BILL",
}

export enum PostingCodeTypes {
  TAX = "TAX",
  CHARGE = "CHARGE",
  FEE = "FEE",
  ADJUSTMENT_TAX = "ADJUSTMENT_TAX",
  ADJUSTMENT_FEE = "ADJUSTMENT_FEE",
  ADJUSTMENT_CHARGE = "ADJUSTMENT_CHARGE",
}

export enum PaymentChargeTypeEnum {
  NO_PAYMENT = "NO_PAYMENT",
  PAY_IN_ADVANCE = "PAY_IN_ADVANCE",
  PAY_AT_CHECKIN = "PAY_AT_CHECKIN",
  FULL_PAYMENT = "FULL_PAYMENT",
  THREE_DAYS_TAX_FEE_20PERCENT = "THREE_DAYS_TAX_FEE_20PERCENT",
}

export enum PaymentMethodType {
  RESERVATION = "RESERVATION",
  DIRECT_BILLING_ACCOUNT = "DIRECT_BILLING_ACCOUNT",
  LC_LEVEL = "LC_LEVEL",
  SALES_GROUP = "SALES_GROUP",
}

export enum ReservationPaymentStatus {
  INITIATED = "INITIATED",
  DUE = "DUE",
  PENDING = "PENDING",
  PAID = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  CREDITED = "CREDITED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
  DISPUTED = "DISPUTED",
  AUTHORIZATION_REQUIRED = "AUTHORIZATION_REQUIRED",
  AUTHORIZED = "AUTHORIZED",
  EXPIRED = "EXPIRED",
  CHARGEBACK = "CHARGEBACK",
  NOT_APPLICABLE = "NOT_APPLICABLE",
  SETTLED = "SETTLED",
  PARTIALLY_SETTLED = "PARTIALLY_SETTLED",
}

export enum PaymentCaptureTypeEnum {
  IMMEDIATE = "IMMEDIATE",
  DEFERRED = "DEFERRED",
}

export enum StripeCardBrand {
  amex = "amex",
  visa = "visa",
  mastercard = "mastercard",
  discover = "discover",
}

export enum StripeIntentEnum {
  PAYMENT = "payment_intent",
  SETUP = "setup_intent",
}

export enum PaymentRefundReasonEnum {
  DUPLICATE = "DUPLICATE",
  FRAUDULENT = "FRAUDULENT",
  REQUESTED_BY_CUSTOMER = "REQUESTED_BY_CUSTOMER",
  OTHER = "OTHER",
}

export enum PaymentDescriptions {
  INCIDENTALS = "INCIDENTALS",
  SETTLE_AT_CHECKOUT = "SETTLE_AT_CHECKOUT",
  SETTLE_AT_CANCEL = "SETTLE_TO_CANCEL",
}

export enum PaymentMethodStatusEnum {
  INITIATED = "INITIATED",
  AUTHORIZED = "AUTHORIZED",
}

export const defaultIntent: SimpleIntent = {
  client_secret: "",
  amount: 0,
};

const processedStatuses = [
  ReservationPaymentStatus.PAID,
  ReservationPaymentStatus.AUTHORIZED,
  ReservationPaymentStatus.DISPUTED,
  ReservationPaymentStatus.PARTIALLY_REFUNDED,
  ReservationPaymentStatus.CREDITED,
];
const unprocessedStatuses = [
  ReservationPaymentStatus.DUE,
  ReservationPaymentStatus.INITIATED,
  ReservationPaymentStatus.PENDING,
  ReservationPaymentStatus.AUTHORIZATION_REQUIRED,
];
export function paymentCompleted(payment?: IPaymentResponse) {
  if (!payment?.status) {
    return false;
  }

  return processedStatuses.includes(payment.status);
}

export function paymentNotProcessed(payment?: IPaymentResponse) {
  if (!payment?.status) {
    return false;
  }

  return unprocessedStatuses.includes(payment.status);
}

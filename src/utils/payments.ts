import {
  ReservationPaymentStatus,
  StripeIntentEnum,
  PaymentMethodStatusEnum,
} from "constants/payments";
import { PaymentProccessorsEnum } from "constants/paymentProcessors";
import { IFolioResponse } from "types/folios";
import {
  IPaymentMethodResponseOrUndef,
  IPaymentResponse,
  PayByPaymentSettings,
} from "types/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { currencyString } from "utils/helperFunctions/numbers";
import { needsPaymentMethod } from "./paymentProcessers";
import { PaymentMethodDisplayValues, PaymentParent } from "types/ui/payments";
import { StripeCardBrand } from "constants/payments";
import { PaymentRowData } from "types/ui/payments";
import { IChargeResponse } from "types/charges";
import { getMoment } from "./helperFunctions/common";
import { apiAmountToNumber } from "./dataFormats";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { getCardListDetailStrings } from "./paymentMethods";
import { toCapitalCase } from "./helperFunctions/capitalCase";
import { PaymentParentEnum } from "constants/ui/payments";

export function paymentApiIdFromParent(
  parent?: PaymentParent,
  idKeyOverrides?: Partial<Record<PaymentParentEnum, string>>
) {
  if (!parent) {
    return {};
  }
  let idKey = "";
  if (parent.type === PaymentParentEnum.RESERVATION) {
    idKey = idKeyOverrides?.[PaymentParentEnum.RESERVATION] ?? "reservation_id";
  } else if (parent.type === PaymentParentEnum.DBA) {
    idKey =
      idKeyOverrides?.[PaymentParentEnum.DBA] ?? "direct_billing_account_id";
  } else if (parent.type === PaymentParentEnum.SALES_GROUP) {
    idKey = idKeyOverrides?.[PaymentParentEnum.SALES_GROUP] ?? "sales_group_id";
  }
  if (idKey) {
    return { [idKey]: parent.id };
  }
  return {};
}

export function isValidMethod(paymentMethod: IPaymentMethodResponse): boolean {
  if (paymentMethod.globally_avail) {
    return true;
  }
  if (
    paymentMethod.direct_billing_account_id &&
    paymentMethod.status === PaymentMethodStatusEnum.AUTHORIZED
  ) {
    return true;
  }
  const last4Set = !!paymentMethod.last4;
  const cardHolderSet = !!paymentMethod.card_holder;
  return last4Set && cardHolderSet;
}

export function isActiveMethod(paymentMethod: IPaymentMethodResponse): boolean {
  return paymentMethod.future_use ?? false;
}

export function hasUsableMethods(
  paymentMethods?: IPaymentMethodResponse[]
): boolean {
  if (!paymentMethods || !paymentMethods?.length) {
    return false;
  }
  const usableMethods =
    paymentMethods?.filter(isActiveMethod).filter(isValidMethod) ?? [];
  return !!usableMethods.length;
}

export function usableMethodsFromMethods(
  paymentMethods?: IPaymentMethodResponse[]
): IPaymentMethodResponse[] {
  if (!paymentMethods || !paymentMethods?.length) {
    return [];
  }
  return paymentMethods.filter(isActiveMethod).filter(isValidMethod);
}

export function primaryMethodsFromFolios(folios: IFolioResponse[]) {
  return folios.reduce((agg: any, f: IFolioResponse) => {
    if (!f.primary_payment_method?.id) {
      return agg;
    }
    if (agg[f.primary_payment_method.id]) {
      agg[f.primary_payment_method.id].folios.push(f.type);
    } else {
      agg[f.primary_payment_method.id] = {
        folios: [f.type],
      };
    }
    return agg;
  }, {});
}

export function paymentMethodNeedsCard(
  paymentReponse?: IPaymentMethodResponse
) {
  if (!paymentReponse) {
    return false;
  }
  const paymentProviderResponse = paymentReponse.pp_response;
  if (!paymentProviderResponse) {
    return false;
  }
  return paymentProviderResponse?.status === "requires_payment_method";
}

export function stripePaymentIntentDuePresent(
  paymentReponse?: IPaymentResponse
) {
  if (!paymentReponse) {
    return false;
  }
  const paymentProviderResponse = paymentReponse.pp_response;
  if (!paymentProviderResponse) {
    return false;
  }
  const type = paymentProviderResponse.PAYMENT_PROCESSOR;
  if (type === PaymentProccessorsEnum.STRIPE) {
    return (
      paymentProviderResponse?.object === StripeIntentEnum.PAYMENT &&
      paymentReponse.status === ReservationPaymentStatus.DUE
    );
  }
  return false;
}

export function getFirstInvalidMethod(
  methods: IPaymentMethodResponse[]
): IPaymentMethodResponseOrUndef {
  if (methods.length < 1) {
    return undefined;
  }
  const invalidMethods = methods.filter((p) => !isValidMethod(p));
  if (invalidMethods.length < 1) {
    return undefined;
  }
  return invalidMethods[0];
}

export function getFirstValidMethod(
  methods: IPaymentMethodResponse[]
): IPaymentMethodResponseOrUndef {
  if (methods.length < 1) {
    return undefined;
  }
  const validMethods = methods.filter((p) => isValidMethod(p));
  if (validMethods.length < 1) {
    return undefined;
  }
  return validMethods[0];
}

export function methodsHaveValidMethod(
  paymentMethods?: IPaymentMethodResponse[]
) {
  if (!paymentMethods) {
    return false;
  }
  const hasPaymentMethods = !!paymentMethods.length;
  const validMethods = paymentMethods?.filter((pm) => isValidMethod(pm));
  const hasValidMethod = validMethods.length > 0;
  return hasPaymentMethods && hasValidMethod;
}

export function makeCancelDescription(payment?: PaymentRowData) {
  if (!payment) {
    return "";
  }
  let amt = apiAmountToNumber(payment?.amount);
  if (!amt) {
    amt = apiAmountToNumber(payment?.payment_amount);
  }
  return `CANCELLED payment${payment.description ? ` for ${payment.description}` : ""} of ${currencyString(amt)}`;
}

export function paymentRequiresMethod(payment?: IPaymentResponse): boolean {
  if (!payment?.pp_response) {
    return false;
  }
  return needsPaymentMethod(payment.pp_response);
}

export function paymentMethodDisplayVals(
  method?: IPaymentMethodResponse,
  useBrandNameFromData?: boolean
): PaymentMethodDisplayValues {
  if (!method) {
    return {
      name: "",
      number: "",
    };
  }
  if (
    method.payment_type !== PaymentMethodTypesEnum.LC_LEVEL &&
    method.payment_type !== PaymentMethodTypesEnum.CREDIT_DEBIT_CARD
  ) {
    return {
      name: getCardListDetailStrings(method).main,
      number: "",
    };
  }
  let nameFromCard = method.brand;
  if (nameFromCard && !useBrandNameFromData) {
    nameFromCard =
      method.brand === StripeCardBrand.amex ? "American Express" : method.brand;
  }
  const accountName = method.direct_billing_account_name
    ? `DB - ${method.direct_billing_account_name}`
    : "Direct Bill Account";
  const cardName = method.direct_billing_account_id
    ? accountName
    : nameFromCard;
  const cardNumber = method.direct_billing_account_id ?? `*${method.last4}`;
  return {
    name: cardName,
    number: cardNumber.toString(),
  };
}

export function chargeDateTimeFromCreation(charge: IChargeResponse): string {
  const createdAtParts = charge.created_at.split("T");
  if (createdAtParts.length < 2) {
    // there was no time attached to this datetime string
    return `${charge.date}T00:00:00`;
  }
  const timeString = createdAtParts[1];
  return `${charge.date}T${timeString}Z`;
}

export function chargeCreatedTime(charge: IChargeResponse): string {
  // as of now the back end is not denoting that
  if (!charge.created_at.includes("Z")) {
    return `${charge.created_at}Z`;
  }
  return charge.created_at;
}

export function paymentCreatedTime(payment: IPaymentResponse): string {
  if (!payment.payment_date.includes("Z")) {
    return `${payment.payment_date}Z`;
  }
  return payment.payment_date;
}

export function isFutureCharge(charge: IChargeResponse, tz: string): boolean {
  // date currently has no time, initialize to midnight property time
  const chargeDate = getMoment(`${charge.date}T00:00:00`, tz, true);
  const chargeCreationDate = getMoment(chargeCreatedTime(charge), tz);
  if (chargeDate.isAfter(chargeCreationDate, "day")) {
    return true;
  }
  return false;
}

export function descriptionFromSettings(paySettings?: PayByPaymentSettings) {
  if (!paySettings) {
    return "";
  }
  if (!paySettings.description && !paySettings.descriptionPrefix) {
    return "";
  }
  const prefixString = paySettings.description
    ? `${paySettings.descriptionPrefix} - `
    : paySettings.descriptionPrefix;
  return `${paySettings.descriptionPrefix ? prefixString : ""}${paySettings.description ?? ""}`;
}

export function displayCardBrand(brand: string): string {
  if (brand === StripeCardBrand.amex) {
    return "American Express";
  }
  return toCapitalCase(brand);
}

export function displayPaymentType(type: string): string {
  let display = type.toString();
  switch (type) {
    case PaymentMethodTypesEnum.ACH_WIRE_TRANSFER:
      display = "ACH / Wire Transfer";
      break;
    case PaymentMethodTypesEnum.CASH:
      display = "Cash";
      break;
    case PaymentMethodTypesEnum.CHECK:
      display = "Check";
      break;
    case PaymentMethodTypesEnum.PERSONAL_CHECK:
      display = "Personal Check";
      break;
    case PaymentMethodTypesEnum.TRAVELERS_CHECK:
      display = "Travelers Check";
      break;
    case PaymentMethodTypesEnum.CASHIER_CHECK:
      display = "Cashier Check";
      break;
    case PaymentMethodTypesEnum.CORPORATE_CHECK:
      display = "Corporate Check";
      break;
    case PaymentMethodTypesEnum.LC_LEVEL:
      display = "Direct Bill";
      break;
    default:
      display = type;
  }
  return display;
}
